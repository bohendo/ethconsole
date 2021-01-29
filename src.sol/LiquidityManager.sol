// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "./interfaces/IWETH.sol";
import "./interfaces/IUniswapRouter.sol";
import "./interfaces/IUniswapPair.sol";
import "./lib/SafeMath.sol";
import "./lib/Math.sol";
import "./lib/TransferHelper.sol";

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
            address tokenAddress;

            //IWETH(_WETH).approve(pairs[i], type(uint256).max);
            TransferHelper.safeApprove(_WETH, pairs[i], type(uint256).max);

            // Total value to be invested in pair i
            uint s = investRatios[i].mul(msg.value).div(100);
            uint n;

            // swap weth for token
            if ( IUniswapPair(pairs[i]).token0() == _WETH) {
                (wethReserve, tokenReserve, lastTimeStamp) = IUniswapPair(pairs[i]).getReserves();
                _safetyCheckForPoolRatio(safetyRatios[i], wethReserve, tokenReserve);
                n = _exactSwapAmount(wethReserve, s);
                IUniswapPair(pairs[i]).swap(0, n, msg.sender, new bytes(0));
                //IERC20(IUniswapPair(pairs[i]).token1()).approve(pairs[i], type(uint256).max);
                tokenAddress = IUniswapPair(pairs[i]).token1();
                TransferHelper.safeApprove(tokenAddress, pairs[i], type(uint256).max);
            } else {
                (tokenReserve, wethReserve, lastTimeStamp) = IUniswapPair(pairs[i]).getReserves();
                _safetyCheckForPoolRatio(safetyRatios[i], wethReserve, tokenReserve);
                n = _exactSwapAmount(wethReserve, s);
                IUniswapPair(pairs[i]).swap(n, 0, msg.sender, new bytes(0));
                //IERC20(IUniswapPair(pairs[i]).token0()).approve(pairs[i], type(uint256).max);
                tokenAddress = IUniswapPair(pairs[i]).token0();
                TransferHelper.safeApprove(tokenAddress, pairs[i], type(uint256).max);
            }

            // add liquidity
            TransferHelper.safeTransferFrom(_WETH, address(this), pairs[i], s-n);
            TransferHelper.safeTransferFrom(tokenAddress, address(this), pairs[i], n);
            IUniswapPair(pairs[i]).mint(msg.sender);
        }

        uint balance = IERC20(_WETH).balanceOf(address(this));
        if (balance > 0) TransferHelper.safeTransfer(_WETH, msg.sender, balance);


    }

    // safety check to prevent sandwitch attack
    function _safetyCheckForPoolRatio(uint safetyRatio, uint wethReserve, uint tokenReserve) private view {
        uint minRatio = safetyRatio.mul(99).div(100);
        uint maxRatio = safetyRatio.mul(101).div(100);
        uint currentRatio = wethReserve.mul(ratioConstant).div(tokenReserve);
        require(currentRatio >= minRatio);
        require(currentRatio <= maxRatio);
    }

    // calculate amount of WETH to swap for token to add to pool
    function _exactSwapAmount(uint wethReserve, uint s) private pure returns (uint amt) {
        uint b = wethReserve.mul(1997);
        uint c = wethReserve.mul(3988000).mul(s);
        uint a = wethReserve.mul(wethReserve).mul(3988009);

        amt = ((Math.sqrt(a.add(c))).sub(b)).div(1994);
    }
}
