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

    constructor(
        address _WETH,
        address[4] memory pairs,
        uint[4] memory allocationRatios,
        uint[4] memory minTokensReceived
    )
        payable
    {
        IWETH(_WETH).deposit{value: msg.value}();

        for (uint i; i < pairs.length; i++) {
            address pair = pairs[i];
            address token0 = IUniswapPair(pair).token0(); // store locally to save gas
            address tokenAddress;
            uint n; // ETH value to be swapped for tokens
            uint s = allocationRatios[i].mul(msg.value).div(100); // ETH value to be invested
            uint tokenAmountOut;
            uint tokenReserve;
            uint wethReserve;

            // swap weth for token
            if (token0  == _WETH) {
                (wethReserve, tokenReserve,) = IUniswapPair(pair).getReserves();
                n = _exactSwapAmount(wethReserve, s);
                tokenAddress = IUniswapPair(pair).token1();
                // swap weth for tokens
                TransferHelper.safeTransfer(_WETH, pair, n);
                tokenAmountOut = UniswapLibrary.getAmountOut(n, wethReserve, tokenReserve);
                require(tokenAmountOut >= minTokensReceived[i], "Liquidity Manager: TOO_FEW_TOKENS");
                IUniswapPair(pair).swap(0, tokenAmountOut, address(this), new bytes(0));

            } else {
                (tokenReserve, wethReserve,) = IUniswapPair(pair).getReserves();
                n = _exactSwapAmount(wethReserve, s);
                tokenAddress = token0;
                // swap weth for tokens
                TransferHelper.safeTransfer(_WETH, pair, n);
                tokenAmountOut = UniswapLibrary.getAmountOut(n, wethReserve, tokenReserve);
                require(tokenAmountOut >= minTokensReceived[i], "Liquidity Manager: TOO_FEW_TOKENS");
                IUniswapPair(pair).swap(tokenAmountOut, 0, address(this), new bytes(0));
            }

            // add liquidity
            TransferHelper.safeTransfer(_WETH, pair, s-n);
            TransferHelper.safeTransfer(tokenAddress, pair, tokenAmountOut);
            IUniswapPair(pair).mint(msg.sender);
        }

        // Return any WETH dust that's leftover
        uint balance = IERC20(_WETH).balanceOf(address(this));
        if (balance > 0) {
          IWETH(_WETH).withdraw(balance);
        }
        selfdestruct(msg.sender);
    }

    // calculate amount of WETH to swap for token to add to pool
    function _exactSwapAmount(uint wethReserve, uint s) private pure returns (uint amt) {
        uint b = wethReserve.mul(1997);
        uint c = wethReserve.mul(3988000).mul(s);
        uint a = wethReserve.mul(wethReserve).mul(3988009);
        amt = ((Math.sqrt(a.add(c))).sub(b)).div(1994);
        require(amt > 0, "FancyMath: RETURNED_ZERO :(");
    }

}
