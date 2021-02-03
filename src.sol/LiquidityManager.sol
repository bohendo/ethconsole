// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "./interfaces/IWETH.sol";
import "./interfaces/IUniswapRouter.sol";
import "./interfaces/IUniswapPair.sol";
import "./lib/SafeMath.sol";
import "./lib/Math.sol";
import "./lib/TransferHelper.sol";

import "./uniswap/library.sol";


contract LiquidityManager {
    using SafeMath for uint;

    address WETH;

    // TODO: set ownership to msg.sender
    constructor(address _WETH) {
        WETH = _WETH;
    }

    function getBalance (
      address pair
    )
        public
        returns (uint ethBal)
    {
        (uint112 reserve0, uint112 reserve1,) = IUniswapPair(pair).getReserves();
        uint liqTokenSupply = IUniswapPair(pair).totalSupply();
        uint liqTokens = IUniswapPair(pair).balanceOf(address(this));
        uint amount0 = liqTokenSupply.mul(reserve0) / liqTokenSupply;
        uint amount1 = liqTokenSupply.mul(reserve1) / liqTokenSupply;
        address token0 = IUniswapPair(pair).token0(); // store locally to save gas
        if (token0 == WETH) {
            uint swappedEth = UniswapLibrary.getAmountOut(amount1, reserve1, reserve0);
            ethBal = swappedEth + uint(amount0);
        } else {
            uint swappedEth = UniswapLibrary.getAmountOut(amount0, reserve0, reserve1);
            ethBal = swappedEth + amount1;
        }
    }

    function allocate (
      address pair,
      uint amount,
      uint minToken
    )
        public
        payable
    {
        address token0 = IUniswapPair(pair).token0(); // store locally to save gas
        address tokenAddress;
        uint n; // ETH value to be swapped for tokens
        uint tokenAmountOut;
        uint tokenReserve;
        uint wethReserve;

        // swap weth for token
        if (token0 == WETH) {
            (wethReserve, tokenReserve,) = IUniswapPair(pair).getReserves();
            n = _exactSwapAmount(wethReserve, amount);
            tokenAddress = IUniswapPair(pair).token1();
            // swap weth for tokens
            TransferHelper.safeTransfer(WETH, pair, n);
            tokenAmountOut = UniswapLibrary.getAmountOut(n, wethReserve, tokenReserve);
            require(tokenAmountOut >= minToken, "Liquidity Manager: TOO_FEW_TOKENS");
            IUniswapPair(pair).swap(0, tokenAmountOut, address(this), new bytes(0));

        } else {
            (tokenReserve, wethReserve,) = IUniswapPair(pair).getReserves();
            n = _exactSwapAmount(wethReserve, amount);
            tokenAddress = token0;
            // swap weth for tokens
            TransferHelper.safeTransfer(WETH, pair, n);
            tokenAmountOut = UniswapLibrary.getAmountOut(n, wethReserve, tokenReserve);
            require(tokenAmountOut >= minToken, "Liquidity Manager: TOO_FEW_TOKENS");
            IUniswapPair(pair).swap(tokenAmountOut, 0, address(this), new bytes(0));
        }

        // add liquidity
        TransferHelper.safeTransfer(WETH, pair, amount-n);
        TransferHelper.safeTransfer(tokenAddress, pair, tokenAmountOut);
        IUniswapPair(pair).mint(msg.sender);
    }

    function deposit (
        address[] memory pairs,
        uint[] memory allocationRatios,
        uint[] memory minTokens
    )
        public
        payable
    {
        IWETH(WETH).deposit{value: msg.value}();

        // TODO: assert than given arrays are all of the same length

        for (uint i; i < pairs.length; i++) {
            allocate(
              pairs[i],
              allocationRatios[i].mul(msg.value).div(100), // ETH value to be invested in this pair
              minTokens[i]
            );
        }

        // Return any WETH dust that's leftover
        uint balance = IERC20(WETH).balanceOf(address(this));
        if (balance > 0) {
          IWETH(WETH).transfer(msg.sender, balance);
        }
    }

    ////////////////////////////////////////
    // Internal Helper Functions

    // calculate amount of WETH to swap for token to add to pool
    function _exactSwapAmount(uint wethReserve, uint s) private pure returns (uint amt) {
        uint b = wethReserve.mul(1997);
        uint c = wethReserve.mul(3988000).mul(s);
        uint a = wethReserve.mul(wethReserve).mul(3988009);
        amt = ((Math.sqrt(a.add(c))).sub(b)).div(1994);
        require(amt > 0, "FancyMath: RETURNED_ZERO :(");
    }

}
