pragma solidity ^0.4.11;

import "./Certificate.sol";


contract Issuer {
    event LogNewCertificate(address certificate);

    address public owner;
    address[] public certificates;

    modifier onlyOwner {
        if (msg.sender != owner)
            revert();
        _;
    }

    function Issuer() public {
        owner = msg.sender;
    }

    function issueCertificate(uint id, string info, uint product)
        public onlyOwner returns (address certificate)
    {
        /* Deploy on the Blockchain */
        Certificate newCert = new Certificate(id, info, product);

        /* Launch an event to capture cert address externally */
        LogNewCertificate(newCert);

        /* Save address on the Issuer storage (blockchain) */
        certificates.push(newCert);

        return newCert;
    }

    function getCertificates() public constant returns (address[]) {
        return certificates;
    }

    function getTotalCertificates() public constant returns (uint) {
        return certificates.length;
    }
}
