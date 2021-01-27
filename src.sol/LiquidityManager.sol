// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.7.0;

import "./interfaces/IWETH.sol";
import "./interfaces/IUniV2Router.sol";
import "./lib/SafeMath.sol";

contract LiquidityManager {
    using SafeMath for uint;

    address public WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address uniV2Router = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;

    mapping(string => address) public pairs;

    address public WETH_UNI = 0xd3d2e2692501a5c9ca623199d38826e513033a17;
    address public WETH_AAVE = 0xdfc14d2af169b0d36c4eff567ada9b2e0cae044f;
    address public WETH_COMP = 0xcffdded873554f362ac02f8fb1f02e5ada10516f;
    address public WETH_YFI = 0x2fdbadf3c4d5a8666bc06645b8358ab803996e28;

    function initPosition(
        string[] calldata tokens,
        uint[] calldata ratios
    ) public
      payable
    {
        IWETH(WETH).deposit{value: msg.value}();

        for (uint i; i < tokens.length; i++) {

            //
            uint s = ratios[i].mul(msg.value);
        }

    }
}
