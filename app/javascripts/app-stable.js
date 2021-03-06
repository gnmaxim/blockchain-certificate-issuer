// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
// import { default as Web3} from 'web3';
// var Web3 = require('web3');

var web3 = new Web3(Web3.givenProvider || "ws://localhost:8546");
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


window.App = {
    start: function() {
        var self = this;

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
        });

        self.buyCertificate();
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

            // Obtaining the receipt
            var receipt;
            // issuer.issueCertificate.sendTransaction({from: account, gas: 210000}).then(function(ret) {
            // https://gist.github.com/xavierlepretre/88682e871f4ad07be4534ae560692ee6
            issuer.issueCertificate.sendTransaction({from: account, gas: 500000})
            .once('transactionHash', function(hash){ console.log(hash); })
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
