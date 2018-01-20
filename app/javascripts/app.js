// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Global consts
const MIN_CONFIRMS = 24;
const PREFIX = '0x';


// Estimate gas contract with parameters https://ethereum.stackexchange.com/questions/11053/how-to-estimate-gas-at-contract-creation-deployment-to-private-ethereum-blockcha
var Web3 = require('web3');
var SmartContracts = require('solc-loader!./../../contracts/Issuer.sol');

// Ropsten test-net provider
// var provider = 'https://ropsten.infura.io/eKV4yUUa3h0PawPo1GEQ';
// web3 = new Web3(new Web3.providers.HttpProvider(provider));
// Ropsten test-net account
// var account = '0x18ee6f47ab374776a7e42c4ff7bf8f8b7e319a98';
// var privateKey = 'f885e068b2c4db0e0aedd3442aa7456e8168274bce8321eff94a2d389377aaff';
// var issuerAddr = '0x2a8189E396a415e149F2C941B3672925fA511487';

// Main-net provider
var provider = 'https://mainnet.infura.io/eKV4yUUa3h0PawPo1GEQ';
web3 = new Web3(new Web3.providers.HttpProvider(provider));
// Main-net account (small amount for testing, DO NOT store privateKey as plain text)
var account = '0xA7B08842354d75e14c5871445E39191BD3a7CB73';
var privateKey = '21f9494695e101298ba29c1d439d640148988f100d103562fd453bf7b424572a';
var issuerAddr = '0x05040201c2B783402c1258b65b9178E0De456A69';

var balance;
var issuerInstance;


window.App = {
    start: async function() {
        var self = this;

        web3.eth.accounts.wallet.add(PREFIX + privateKey);
        var htmlAccount = document.getElementById('account');
        htmlAccount.innerHTML = account;

        issuerInstance = self.getIssuerInstance();
        issuerInstance.options.address = issuerAddr;

        self.getDeployedCerts();

        self.HTMLupdateIssuerAddr();
        self.HTMLupdateBalance();
        self.HTMLupdateTotalCerts();

        return;
    },

    getIssuerInstance: function () {
        // Extract ABI and Bytecode from the compiled solidity code
        var issuerAbi = SmartContracts["Issuer.sol:Issuer"].abi;
        var issuerBytecode = SmartContracts["Issuer.sol:Issuer"].bytecode;

        // New contract instance with all its properties, as specified in ABI
        return new web3.eth.Contract(issuerAbi, {data: issuerBytecode});
    },

    getCertificateInstance: function () {
        var certAbi = SmartContracts["Certificate.sol:Certificate"].abi;
        var certBytecode = SmartContracts["Certificate.sol:Certificate"].bytecode;

        return new web3.eth.Contract(certAbi, {data: certBytecode});
    },

    deployIssuer: async function() {
        var self = this;
        issuerInstance = self.getIssuerInstance();

        // Get gas price and estime the gas limit
        var wei;
        var gasLimit;
        var txFee;

        await web3.eth.getGasPrice()
            .then(function(res) { wei = res });
        await web3.eth.estimateGas({data: PREFIX.concat(issuerInstance.options.data)})
            .then(function(res) { gasLimit = res });

        // A third of reccomended gas price will be used, with some delay
        wei = Math.round(wei / 3);

        // Add 10% to estimated gas, in case the real computation requires slightly more
        gasLimit = Math.round(gasLimit * 1.1);

        txFee = web3.utils.fromWei(web3.utils.toBN(gasLimit * wei), 'ether')

        console.log('Predicted gas price:', wei);
        console.log('Predicted gas limit:', gasLimit);
        console.log('Predicted tx fee:', txFee);

        // Deploy the issuer instance
        issuerInstance.deploy({ data: PREFIX.concat(issuerInstance.options.data) })
            .send({ from: account, gas: 800000, gasPrice: 21000000000 },
                function(error, txHash) { console.log(txHash); })
            .on('transactionHash', function(transactionHash) { console.log(transactionHash); })
            .on('confirmation', function(confirmationNumber, receipt) {})
            .on('receipt', function(receipt) {
                issuerAddr = receipt.contractAddress;
                issuerInstance.options.address = issuerAddr;
                self.HTMLupdateIssuerAddr();
            })
            .on('error', function(error) { console.log(error); })
            .then(function(ret) {
                // newInstance.methods.getTotalCertificates().call({from: account}, function(err, res) { console.log(res) });

                console.log(ret);

                self.HTMLupdateBalance();
                self.HTMLupdateTotalCerts();

                return ret;
            });

        return issuerInstance;
    },

    setStatus: function(message) {
        var status = document.getElementById("status");
        status.innerHTML = message;

        return;
    },

    newCertificate: async function() {
        var self = this;
        var issuerInstance = self.getIssuerInstance();
        issuerInstance.options.address = issuerAddr;

        var txTable = document.getElementById('tableCerts');
        var row;

        var wei;
        var gasLimit;
        var txFee;
        var transactionHash;

        // Estimate gas limit and reccomended gas price
        await web3.eth.getGasPrice()
            .then(function(res) { wei = 40000000000 });
        await issuerInstance.methods.issueCertificate(1, 'prova', 2).estimateGas({from: account})
            .then(function(res) { gasLimit = res });

        // A third of reccomended gas price will be used, with some delay
        // wei = Math.round(wei / 3);

        // Add 10% to estimated gas, in case the real computation requires slightly more
        gasLimit = Math.round(gasLimit * 1.1);

        txFee = web3.utils.fromWei(web3.utils.toBN(gasLimit * wei), 'ether');

        console.log('Predicted gas price:', wei);
        console.log('Predicted gas limit:', gasLimit);
        console.log('Predicted tx fee:', txFee);

        issuerInstance.methods.issueCertificate(1, 'prova', 2)
            .send({ from: account, gas: gasLimit, gasPrice: wei })
            .once('transactionHash', function(txHash) {
                row = txTable.insertRow(1);
                row.insertCell(0);
                row.insertCell(0);
                var cell = row.insertCell(0);
                row.cells[0].innerHTML = txHash;
            })
            .once('receipt', function(receipt) {
                // Update dashboard number of deployed certs when it's done
                issuerInstance.methods.getTotalCertificates().call().then(function(res) {
                    var nrCerts = document.getElementById('nrCerts');
                    nrCerts.innerHTML = res;
                });
            })
            .on('confirmation', function(confNumber, receipt) {
                row.cells[2].innerHTML = confNumber;
                if (confNumber >= MIN_CONFIRMS)
                    row.cells[2].innerHTML = 'Full';
            })
            .on('error', function(error) { console.log(error); })
            .then(function(receipt) {
                var newCertAddr = receipt.events.LogNewCertificate.returnValues.certificate;
                row.cells[1].innerHTML = newCertAddr;

                self.HTMLupdateBalance();

                return newCertAddr;
            });

        return;
    },

    getDeployedCerts: function() {
        var self = this;

        issuerInstance.methods.getCertificates().call().then(function(res) {
            console.log(res);

            self.viewDeployedCert(res[0])
        });

        return;
    },

    viewDeployedCert: function(certAddr) {
        var self = this;

        var cert = self.getCertificateInstance();
        cert.options.address = certAddr;

        cert.methods.ownerId().call().then(function(ret) {
            console.log(ret);
        });

        return;
    },

    HTMLupdateIssuerAddr: function() {
        var self = this;

        var htmlIssuerAddress = document.getElementById('issuerAddress');
        if(issuerAddr == null) {
            htmlIssuerAddress.innerHTML = 'deploy a new Issuer';
            console.log('Issuer undefined');
        } else {
            htmlIssuerAddress.innerHTML = issuerAddr;
            console.log('Issuer contract address:', issuerAddr);
        }

        return;
    },

    HTMLupdateTotalCerts: function() {
        issuerInstance.methods.getTotalCertificates().call().then(function(res) {
            var nrCerts = document.getElementById('nrCerts');
            console.log(res);
            nrCerts.innerHTML = res;
        });

        return;
    },

    HTMLupdateBalance: function() {
        web3.eth.getBalance(account).then(function(res) {
            balance = web3.utils.fromWei(res, 'ether');
            var htmlBalance = document.getElementById('balance');
            htmlBalance.innerHTML = balance;
        });

        return;
    }
};

window.addEventListener('load', function() {
    App.start();
});

// const threads = require('threads');
// const config  = threads.config;
// const spawn   = threads.spawn;

// web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

// await web3.eth.getAccounts(function(err, accs) {
//     if (err != null) {
//         alert("There was an error fetching your accounts.");
//         return;
//     }
//
//     if (accs.length == 0) {
//         alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
//         return;
//     }
//
//     accounts = accs;
//     account = accounts[0];
//
//     self.HTMLupdateBalance();
//
//     var htmlAccount = document.getElementById('account');
//     htmlAccount.innerHTML = account;
//
//     console.log('Issuer account:', account);
// });

// createAccount: async function() {
//     var something = web3.eth.accounts.create(web3.utils.randomHex(32));
//     console.log(something);
//
//     return;
// },

// 4 wei 0xdaf81e873b3e2bd9216ce51538bf7a63fb2be943e177a66b53eaabf05234d62d - 8m
// 9 wei - 16m
