// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Get contract Solidity code
var issuer_sol = require('raw-loader!./../../contracts/Issuer.sol');
var certificate_sol = require('raw-loader!./../../contracts/Certificate.sol');

var SmartContracts = require('solc-loader!./../../contracts/Certificate.sol');

var Web3 = require('web3');
web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

// TEMPORARY TRUFFLE CODE
import { default as contract } from 'truffle-contract'
// Import contract artifacts to turn them into usable abstractions
import issuer_artifacts from '../../build/contracts/Issuer.json'
import certificate_artifacts from '../../build/contracts/Certificate.json'
// Usable abstractions
var Issuer = contract(issuer_artifacts);
var Certificate = contract(certificate_artifacts);

// Global
var accounts;
var account;

var issuerInstance;

window.App = {
    start: function() {
        var self = this;

        console.log('ASDASDASD: ', SmartContracts);

        // Bootstrap the contracts abstraction for Use.
        Issuer.setProvider(web3.currentProvider);
        Certificate.setProvider(web3.currentProvider);

        // Get the initial account balance so it can be displayed.
        web3.eth.getAccounts(function(err, accs) {
            if (err != null) {
                alert("There was an error fetching your accounts.");
                return;
            }

            if (accs.length == 0) {
                alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
                return;
            }

            accounts = accs;
            account = accounts[0];

            console.log(account);
        });

        self.deployIssuer();
        // self.buyCertificate();
    },

    deployIssuer: function() {
        issuerInstance = new web3.eth.Contract(JSON.parse('[{"constant":true,"inputs":[],"name":"issuerOwner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"issuer","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"eatYourself","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"certOwner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"blockId","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]'));

        console.log(issuerInstance);
        var a = '0xb6680c2f8C14782098B1e06E63c9e94d76913C94';

        issuerInstance.deploy({data: '6060604052341561000f57600080fd5b33600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555032600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550610322806100a06000396000f30060606040526004361061006d576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806314390cc1146100725780631d143848146100c75780634c27a9561461011c578063643133d5146101aa5780637a992dac146101ff575b600080fd5b341561007d57600080fd5b610085610228565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34156100d257600080fd5b6100da61024e565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b341561012757600080fd5b61012f610274565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101561016f578082015181840152602081019050610154565b50505050905090810190601f16801561019c5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34156101b557600080fd5b6101bd6102b7565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b341561020a57600080fd5b6102126102dc565b6040518082815260200191505060405180910390f35b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b61027c6102e2565b6040805190810160405280600381526020017f6173640000000000000000000000000000000000000000000000000000000000815250905090565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60035481565b6020604051908101604052806000815250905600a165627a7a72305820f9f1d9432f1eac36899c2196b4f908124e3f018fcc6970d702590cffd0893ec60029'})
        .send({ from: a, gas: 500000},
            function(error, transactionHash) { console.log(transactionHash); })
        .on('error', function(error) { console.log(error); })
        .on('transactionHash', function(transactionHash) { console.log(transactionHash); })
        .on('receipt', function(receipt) { console.log(receipt.contractAddress); })
        .on('confirmation', function(confirmationNumber, receipt) { console.log(confirmationNumber); })
        .then(function(newInstance){
            console.log(newInstance);

            newInstance.methods.getPizzas().call({from: a}, function(err, res) { console.log(res) });
        });
    },

    setStatus: function(message) {
        var status = document.getElementById("status");
        status.innerHTML = message;

        return;
    },

    estimateCompensation: function() {

        return;
    },

    buyCertificate: function() {
        /*
            1. Get blockId of the compensated block CO2 block;
            2. Break down blockId 1===>N chunkId
            3. Group blockId, chunkId(s), clientInfo
        */

        /*
            HUGE TO DO:
                - FIX GAS ESTIMATIONS
                - INVESTIGATE MANUAL Account unlocking, no metamask
        */
        Issuer.deployed().then(function(instance) {
            var issuer = instance;
            console.log(issuer);
            // Obtaining the receipt
            var receipt;
            // issuer.issueCertificate.sendTransaction({from: account, gas: 210000}).then(function(ret) {
            // https://gist.github.com/xavierlepretre/88682e871f4ad07be4534ae560692ee6
            issuer.methods.issueCertificate().send({from: account, gas: 500000})
            .once('transactionHash', function(hash){ console.log(hash); })
            .once('receipt', function(receipt){ console.log(receipt); })
            .on('confirmation', function(confNumber, receipt){ console.log(confNumber); })
            .on('error', function(error){ console.log(error); })
            .then(function(ret) {
                receipt = ret;
                console.log(receipt);

                web3.eth.getTransactionReceipt(ret.tx, function(err, tx) {
                    console.log(tx);
                });

                // // Events generated by new contract deployment
                // const logNewCertificate = receipt.logs[0];
                // // The parameters of that event
                // const newCertAddress = logNewCertificate.args.certificate;
                //
                // var certInstance = Certificate.at(newCertAddress);
                // certInstance.eatYourself.call().then(function(res) {
                //     console.log(newCertAddress, res);
                // });
            });

            issuer.getPizzas.call().then(function(res) {
                console.log(res);
            });

            var certInstance = Certificate.at('0x511e8a5d9b84ccf02280a3bcf20d55653d5e3489');
            certInstance.issuer().then(function(res) {
                console.log('issuer', res);
            });
            certInstance.issuerOwner().then(function(res) {
                console.log('issuerOwner', res);
            });
        });

        return;
    },

  refreshBalance: function() {
    var self = this;

    var meta;
    MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.getBalance.call(account, {from: account});
    }).then(function(value) {
      var balance_element = document.getElementById("balance");
      balance_element.innerHTML = value.valueOf();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting balance; see log.");
    });
  },

  sendCoin: function() {
    var self = this;

    var amount = parseInt(document.getElementById("amount").value);
    var receiver = document.getElementById("receiver").value;

    this.setStatus("Initiating transaction... (please wait)");

    var meta;
    MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.sendCoin(receiver, amount, {from: account});
    }).then(function() {
      self.setStatus("Transaction complete!");
      self.refreshBalance();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });
  }
};

window.addEventListener('load', function() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
        // Use Mist/MetaMask's provider
        window.web3 = new Web3(web3.currentProvider);
    } else {
        console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"));
    }

    App.start();
});
