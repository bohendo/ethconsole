// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.7.0;

interface IUniV2Router {
    function quote(uint amountA, uint reserveA, uint reserveB) external pure returns (uint amountB);
}
