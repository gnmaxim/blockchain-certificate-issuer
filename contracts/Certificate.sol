pragma solidity ^0.4.18;
/* https://github.com/raineorshine/solgraph */

contract Certificate {
    /* Certificate Issuer data */
    address public issuer;
    address public issuerOwner;

    /* Some Certificate Owner data */
    uint256 public ownerId;
    string public ownerInfo;

    uint public productId;
    uint date;

    /* Constructor */
    function Certificate(uint id, string info, uint product) public {
        issuer = msg.sender;
        issuerOwner = tx.origin;

        ownerId = id;
        ownerInfo = info;

        productId = product;
        date = block.timestamp;
    }
}
