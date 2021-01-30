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
    uint ratioConstant = 100000;

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
            uint wethReserve;
            uint tokenReserve;
            uint lastTimeStamp;
            address tokenAddress;
            uint tokenAmountOut;

            TransferHelper.safeApprove(_WETH, pairs[i], type(uint256).max);

            // Total value to be invested in pair i
            uint s = allocationRatios[i].mul(msg.value).div(100);
            uint n;

            // swap weth for token
            if ( IUniswapPair(pairs[i]).token0() == _WETH) {
                (wethReserve, tokenReserve, lastTimeStamp) = IUniswapPair(pairs[i]).getReserves();
                n = _exactSwapAmount(wethReserve, s);
                // Transfer weth for swap
                TransferHelper.safeTransfer(_WETH, pairs[i], n);
                tokenAmountOut = UniswapLibrary.getAmountOut(n, wethReserve, tokenReserve);
                require(tokenAmountOut >= minTokensReceived[i], "Liquidity Manager: TOO_FEW_TOKENS");
                IUniswapPair(pairs[i]).swap(0, tokenAmountOut, address(this), new bytes(0));
                tokenAddress = IUniswapPair(pairs[i]).token1();
                TransferHelper.safeApprove(tokenAddress, pairs[i], type(uint256).max);

            } else {
                (tokenReserve, wethReserve, lastTimeStamp) = IUniswapPair(pairs[i]).getReserves();
                n = _exactSwapAmount(wethReserve, s);
                // Transfer weth for swap
                TransferHelper.safeTransfer(_WETH, pairs[i], n);
                tokenAmountOut = UniswapLibrary.getAmountOut(n, wethReserve, tokenReserve);
                require(tokenAmountOut >= minTokensReceived[i], "Liquidity Manager: TOO_FEW_TOKENS");
                IUniswapPair(pairs[i]).swap(tokenAmountOut, 0, address(this), new bytes(0));
                tokenAddress = IUniswapPair(pairs[i]).token0();
                TransferHelper.safeApprove(tokenAddress, pairs[i], type(uint256).max);
            }

            // add liquidity
            TransferHelper.safeTransfer(_WETH, pairs[i], s-n);
            TransferHelper.safeTransfer(tokenAddress, pairs[i], tokenAmountOut);
            IUniswapPair(pairs[i]).mint(msg.sender);
        }

        uint balance = IERC20(_WETH).balanceOf(address(this));
        if (balance > 0) TransferHelper.safeTransfer(_WETH, msg.sender, balance);
    }

    // calculate amount of WETH to swap for token to add to pool
    function _exactSwapAmount(uint wethReserve, uint s) private pure returns (uint amt) {
        uint b = wethReserve.mul(1997);
        uint c = wethReserve.mul(3988000).mul(s);
        uint a = wethReserve.mul(wethReserve).mul(3988009);
        amt = ((Math.sqrt(a.add(c))).sub(b)).div(1994);
    }

}
