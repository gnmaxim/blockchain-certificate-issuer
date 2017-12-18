pragma solidity ^0.4.18;
/* https://github.com/raineorshine/solgraph */


contract Certificate {
    address public certOwner;
    address public issuer;
    address public issuerOwner;
    uint256 public blockId;

    function Certificate() public {
        issuer = msg.sender;
        issuerOwner = tx.origin;
    }

    function eatYourself() public pure returns (string) {
        return "asd";
    }
}
