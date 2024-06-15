// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Airdrop {
    IERC20 public token;
    uint256 public amountPerUser;
    uint256 public startClaimBlock;
    uint256 public endClaimBlock;
    bool public isClaimable;

    event Airdropped(address indexed user, uint256 amount);
    event ClaimPeriodSet(uint256 startBlock, uint256 endBlock);
    event ClaimableStatusSet(bool status);

    constructor(address tokenAddress, uint256 _amountPerUser) {
        token = IERC20(tokenAddress);
        amountPerUser = _amountPerUser;
    }

    modifier onlyDuringClaimPeriod() {
        require(block.number >= startClaimBlock, "Claim period has not started yet");
        require(block.number <= endClaimBlock, "Claim period has ended");
        _;
    }

    function setClaimPeriod(uint256 _startClaimBlock, uint256 _endClaimBlock) public {
        require(_startClaimBlock < _endClaimBlock, "Start block must be less than end block");
        startClaimBlock = _startClaimBlock;
        endClaimBlock = _endClaimBlock;

        emit ClaimPeriodSet(_startClaimBlock, _endClaimBlock);
    }

    function setClaimableStatus(bool status) public {
        isClaimable = status;

        emit ClaimableStatusSet(status);
    }

    function claim() public onlyDuringClaimPeriod {
        require(isClaimable, "Claiming is currently not allowed");
        require(token.balanceOf(address(this)) >= amountPerUser, "Not enough tokens in contract");

        token.transfer(msg.sender, amountPerUser);

        emit Airdropped(msg.sender, amountPerUser);
    }

    function depositTokens(uint256 amount) public {
        token.transferFrom(msg.sender, address(this), amount);
    }
}
