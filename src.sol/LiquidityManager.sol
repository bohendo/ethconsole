// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "./interfaces/IWETH.sol";
import "./interfaces/IUniswapRouter.sol";
import "./interfaces/IUniswapPair.sol";
import "./lib/SafeMath.sol";
import "./lib/Math.sol";

contract LiquidityManager {
    using SafeMath for uint;
    uint ratioConstant = 100000;

    /*
    address WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address uniV2Router = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address WETH_UNI = 0xd3d2e2692501a5c9ca623199d38826e513033a17;
    address WETH_AAVE = 0xdfc14d2af169b0d36c4eff567ada9b2e0cae044f;
    address WETH_COMP = 0xcffdded873554f362ac02f8fb1f02e5ada10516f;
    address WETH_YFI = 0x2fdbadf3c4d5a8666bc06645b8358ab803996e28;
    */

    constructor(
        address _WETH,
        address[4] memory pairs,
        uint[4] memory investRatios,
        uint[4] memory safetyRatios
    )
      payable
    {

        IWETH(_WETH).deposit{value: msg.value}();

        for (uint i; i < pairs.length; i++) {

            uint wethReserve;
            uint tokenReserve;
            uint lastTimeStamp;
            bool token0isWeth;

            // Total value to be invested in pair i
            uint s = investRatios[i].mul(msg.value);

            // get Token and WETH reserves
            if ( IUniswapPair(pairs[i]).token0() == _WETH) {
                (wethReserve, tokenReserve, lastTimeStamp) = IUniswapPair(pairs[i]).getReserves();
                token0isWeth = true;
            } else {
                (tokenReserve, wethReserve, lastTimeStamp) = IUniswapPair(pairs[i]).getReserves();
                token0isWeth = false;
            }

            uint minRatio = safetyRatios[i].mul(99).div(100);
            uint maxRatio = safetyRatios[i].mul(101).div(100);
            uint currentRatio = wethReserve.mul(ratioConstant).div(tokenReserve);
            require(currentRatio >= minRatio);
            require(currentRatio <= maxRatio);

            uint b = wethReserve.mul(1997);
            uint c = wethReserve.mul(3988000).mul(s);
            uint a = wethReserve.mul(wethReserve).mul(3988009);


            uint n = ((Math.sqrt(a.add(c))).sub(b)).div(1994);

            // Swap weth for tokens
            if (token0isWeth) {
                IUniswapPair(pairs[i]).swap(0, n, msg.sender, new bytes(0));
            } else {
                IUniswapPair(pairs[i]).swap(n, 0, msg.sender, new bytes(0));
            }
        }

    }
}
