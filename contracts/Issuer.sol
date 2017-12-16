pragma solidity ^0.4.11;

import "./Certificate.sol";


contract Issuer {
    struct certificateData {
        uint blockTime;
    }

    event LogNewCertificate(address certificate);

    address public owner;
    mapping(address => certificateData) public issuedCerts;
    address[] public certificates;

    function Issuer() public {
        owner = msg.sender;
    }

    function issueCertificate() public returns (address certificate) {
        /* Prepare data for certificate that has to be issued */
        certificateData memory newCertData;

        newCertData.blockTime = block.timestamp;

        /* Deploy on the Blockchain */
        Certificate newCert = new Certificate();
        LogNewCertificate(newCert);

        /* tmp */
        certificates.push(newCert);

        /* Map data to the deployed certificate's address */
        issuedCerts[newCert] = newCertData;

        return newCert;
    }

    function getPizzas() public constant returns (address[]) {
        return certificates;
    }
}
