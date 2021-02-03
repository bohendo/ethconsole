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

    function getBalance(
      address pair
    )
        public
        view
        returns (uint ethBal)
    {
        uint liqTokenSupply = IUniswapPair(pair).totalSupply();
        uint liqTokenBal = IUniswapPair(pair).balanceOf(address(this));
        address token0 = IUniswapPair(pair).token0(); // store locally to save gas
        uint wethReserve;
        uint tokenReserve;
        if (token0 == WETH) {
            (wethReserve, tokenReserve,) = IUniswapPair(pair).getReserves();
        } else {
            (tokenReserve, wethReserve,) = IUniswapPair(pair).getReserves();
        }
        uint wethBal = liqTokenBal.mul(wethReserve).div(liqTokenSupply);
        uint tokenBal = liqTokenBal.mul(tokenReserve).div(liqTokenSupply);
        uint swappedEth = UniswapLibrary.getAmountOut(tokenBal, tokenReserve, wethReserve);
        ethBal = swappedEth + uint(wethBal);
    }

    function getBalances(
      address[4] memory pairs
    )
        public
        view
        returns (uint ethBal)
    {
        ethBal = 0;
        for (uint i; i < pairs.length; i++) {
            uint pairEthBal = getBalance(pairs[i]);
            ethBal = ethBal.add(pairEthBal);
        }
    }

    function rebalance(
        address[4] memory pairs,
        uint[4] memory targetAllocations,
        uint[4] memory safetyLimits
    )
        public
    {
        // TODO: assert than given arrays are all of the same length?
        address[4] memory toAllocatePairs;
        uint[4] memory toAllocateAmounts;
        uint[4] memory ethBalances;
        uint[4] memory pairPercentWads;
        // Get the current % allocation to each pair
        uint totalEthBalance = getBalances(pairs);
        for (uint i; i < pairs.length; i++) {
            ethBalances[i] = getBalance(pairs[i]);
            pairPercentWads[i] = (ethBalances[i].mul(1e18)).div(totalEthBalance);
        }
        // Liquidate any pairs that contain more eth than the target allocations
        for (uint i; i < pairs.length; i++) {
            // mul percentage int by 1e18/100 to convert to percentWad
            uint targetAllocationPercentWad = targetAllocations[i].mul(1e16);
            if (pairPercentWads[i] < targetAllocationPercentWad) {
              toAllocatePairs[i] = pairs[i];
              toAllocateAmounts[i] = ethBalances[i].mul(
                targetAllocationPercentWad - pairPercentWads[i]
              ).div(1e18);
            } else if (pairPercentWads[i] > targetAllocationPercentWad) {
              toAllocatePairs[i] = address(0);
              uint toLiq = ethBalances[i].mul(
                pairPercentWads[i] - targetAllocationPercentWad
              ).div(1e18);
              liquidate(pairs[i], toLiq, safetyLimits[i]);
            }
        }
        // Allocate to any pairs that contain less eth than the target allocations
        for (uint i; i < toAllocatePairs.length; i++) {
          if (toAllocatePairs[i] == address(0)) {
            continue;
          }
          // TODO: what safetyLimit do we actually want to use here?
          allocate(toAllocatePairs[i], toAllocateAmounts[i], safetyLimits[i]);
        }
    }

    function allocate(
      address pair,
      uint amount,
      uint minToken
    )
        public
        payable
    {
        require(amount > 0, "LiquidityManager: ZERO_ALLOCATION");
        // TODO: deposit ETH into WETH if called externally
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
        IUniswapPair(pair).mint(address(this));
    }

    function liquidate(
      address pair,
      uint amount,
      uint minEth
    )
        public
    {
        uint wethBefore = IERC20(WETH).balanceOf(address(this));
        address token0 = IUniswapPair(pair).token0(); // store locally to save gas
        uint ethBal = getBalance(pair);
        require(ethBal >= amount, "LiquidityManager: INSUFFICIENT_LIQUIDITY");
        // Burn liqidity tokens to retrieve weth & tokens
        uint liqTokensToBurn = ethBal.mul(
            IUniswapPair(pair).balanceOf(address(this))
        ).div(amount);
        IUniswapPair(pair).transfer(pair, liqTokensToBurn);
        IUniswapPair(pair).burn(address(this));
        // Gather info required to swap
        address tokenAddress;
        uint tokenReserve;
        uint wethReserve;
        if (token0 == WETH) {
            (wethReserve, tokenReserve,) = IUniswapPair(pair).getReserves();
            tokenAddress = IUniswapPair(pair).token1();
        } else {
            (tokenReserve, wethReserve,) = IUniswapPair(pair).getReserves();
            tokenAddress = token0;
        }
        uint tokenBal = IERC20(tokenAddress).balanceOf(address(this));
        uint wethAmountOut = UniswapLibrary.getAmountOut(tokenBal, tokenReserve, wethReserve);
        // Swap all received tokens for weth
        IERC20(tokenAddress).transfer(pair, tokenBal);
        if (token0 == WETH) {
          IUniswapPair(pair).swap(wethAmountOut, 0, address(this), new bytes(0));
        } else {
          IUniswapPair(pair).swap(0, wethAmountOut, address(this), new bytes(0));
        }
        uint wethAfter = IERC20(WETH).balanceOf(address(this));
        require(
          wethAfter.sub(wethBefore) >= minEth,
          "LiquidityManager: INSUFFICIENT_ETH_RECEIVED"
        );
        // TODO: send weth to msg.sender if called externally
    }

    function deposit(
        address[4] memory pairs,
        uint[4] memory allocationRatios,
        uint[4] memory minTokens
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

    function withdraw(
        address[4] memory pairs,
        uint[4] memory liquidationAmounts,
        uint[4] memory minEth
    )
        public
        payable
    {
        // TODO: assert than given arrays are all of the same length
        for (uint i; i < pairs.length; i++) {
            liquidate(
              pairs[i],
              liquidationAmounts[i].mul(msg.value).div(100), // ETH value to be invested in this pair
              minEth[i]
            );
        }
        // return any WETH that was generated during liquidation
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
        require(amt > 0, "LiquidityManager: FANCY_MATH_RETURNED_ZERO");
    }

}
