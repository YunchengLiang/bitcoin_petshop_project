DonationApp = {
    web3Provider: null,
    contracts: {},
    account: '0x0',

    init: async function() {
        return await DonationApp.initWeb3();
    },

    initWeb3: async function() {
        if (window.ethereum) {
          DonationApp.web3Provider = window.ethereum;
            try {
                await window.ethereum.enable();
            } catch (error) {
                console.error("User denied account access")
        }
      }
      else if (window.web3) {
        DonationApp.web3Provider = window.web3.currentProvider;
      }
      else {
        DonationApp.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
      web3 = new Web3(DonationApp.web3Provider);
      return DonationApp.initContract();
    },

    initContract: function() {
      $.getJSON('SendMeEther.json', function(data) {
        var DonationArtifact = data;
        DonationApp.contracts.SendMeEther = TruffleContract(DonationArtifact);
        DonationApp.contracts.SendMeEther.setProvider(DonationApp.web3Provider);
        // Use our contract to update contract information
        return DonationApp.render();
      });
    },

    render: function() {
      web3.eth.getCoinbase(function(err, account) {
        if (err === null) {
          DonationApp.account = account;
          $("#accountAddress").html("Address: " + account);
          web3.eth.getBalance(account, function(err, balance) {
            if (err === null) {
              $("#accountBalance").html("Balance: " + web3.fromWei(balance, "Ether") + " ETH");
            }
          })
        }
      })
    },

    sendDonation: function(event) {
      web3.eth.getAccounts(function(err, accounts) {
        if (err) {
          console.log(error);
        }
        var account = accounts[0];
        var newString = $('#newString').val();

        DonationApp.contracts.SendMeEther.deployed().then(function(instance) {
          return instance.receiveEther({from: account,value: window.web3.toWei(newString, 'ether')})
          .then(function(){DonationApp.render();});
      })
      })
    }
};

$(function() {
  $(window).load(function() {
    DonationApp.init();
  });
});