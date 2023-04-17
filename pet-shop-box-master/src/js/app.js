App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init: async function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);
	petTemplate.find('.pet-owner').text(data[i].owner);
	petTemplate.find(".btn-return").attr("data-id", data[i].id);
        petTemplate.find(".btn-send").attr("data-id", data[i].id);

        petsRow.append(petTemplate.html());
      }
    });
    return await App.initWeb3();
  },

 
  initWeb3: async function() {

    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        console.error("User denied account access")
      }
    }
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }

    web3 = new Web3(App.web3Provider);

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      const account = accounts[0];
      App.account = accounts[0]

    });

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Adoption.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);
    
      // Set the provider for our contract
      App.contracts.Adoption.setProvider(App.web3Provider);

     // update info after user made a vote.
      App.listenForEvents();

      // Use our contract to retrieve and mark the adopted pets
      return App.markAdopted();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
    $(document).on('click', '.btn-send', App.handleSend);
    $(document).on("click", ".btn-return", App.handleReturn);
  },

  // Listen for events from the contract
  listenForEvents: function() {
      App.contracts.Adoption.deployed().then(function(instance) {
        instance.votedEvent({}, {
          fromBlock: 0,
          toBlock: 'latest'
        }).watch(function(error, event) {
          App.markAdopted();
        });
      });
  },


  markAdopted: function(adopters, account) {
    var adoptionInstance;
    var clients = new Set();

    var content = $("#content");
    content.hide();
    $('#voteDropList').hide();
    $("#loader").show();
    $('#clientsAdoptedNum').text("Total number of clients: " + clients.size)

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;
      return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {


      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
      account=accounts[0];
      for (i = 0; i < adopters.length; i++) {
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(i).find(".btn-adopt").prop("disabled", true);
	  $(".panel-pet").eq(i).find(".btn-return").removeProp("disabled").addClass("btn-danger");
          $(".panel-pet").eq(i).find(".adopter-address").html(adopters[i]);

	  if (adopters[i] == account) {
              $('.panel-pet').eq(i).find('.pet-owner').text('You');
              $('.panel-pet').eq(i).find('.btn-send').attr('disabled', false);
            } else {
              $('.panel-pet').eq(i).find('.pet-owner').text('Someone Else'); }
          }		
       }                  


    });  

   

      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
            
           // show the candidate pets ballot option 
              var candArray = [];
              for (var i = 1; i <= 16; i++) { 
                  candArray.push(adoptionInstance.candidates(i));
              }

              Promise.all(candArray).then(function(values) {
                  var candidatesResults = $("#candidatesResults");
                  candidatesResults.empty();

                  var candidatesSelect = $('#candidatesSelect');
                  candidatesSelect.empty();

                for (var i = 0; i < 16; i++) { 
                  var id = values[i][0];
                  var name = values[i][1];
                  var voteCount = values[i][2];

                  if (voteCount.toNumber()>0) {
                      // Render candidate Result only if the vote is non-zero.
                      var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
                      candidatesResults.append(candidateTemplate);
                  }

                  // show candidate ballot option
                  var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
                  candidatesSelect.append(candidateOption);
                  }
              });

                // show the voting components.
                content.show();
                // check if user voted already.
                adoptionInstance.voters(accounts[0]).then(function(hasVoted) {
                  if (hasVoted) {
                      $("#voteDropList").hide();
                      $("#hasVoted").show();
                  } else {
                      $("#voteDropList").show();
                  }
                  $("#loader").hide();
                }).catch(function(error) {
                  console.warn(error);
                });    
      
         });  

	$("#clientsAdoptedNum").text("Total number of clients: " + clients.size)
                 
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  markReturned: function (adopters) {
    var adoptionInstance;

    App.contracts.Adoption.deployed()
      .then(function (instance) {
        adoptionInstance = instance;

        return adoptionInstance.getAdopters.call();
      })
      .then(function (adopters) {
        for (i = 0; i < adopters.length; i++) {
          if (adopters[i] == "0x0000000000000000000000000000000000000000") {
            $(".panel-pet").eq(i).find(".btn-adopt").removeProp("disabled");
            $(".panel-pet").eq(i).find(".btn-return").prop("disabled", true).removeClass("btn-danger");
            $(".panel-pet").eq(i).find(".adopter-address").html("");
	    $('.panel-pet').eq(i).find('.btn-send').attr('disabled', true);
            $('.panel-pet').eq(i).find('.pet-owner').text('None');
          }
        }
      })
      .catch(function (err) {
        console.log(err.message);
      });
  },

 
  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var adoptionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
    
      var account = accounts[0];
    
      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;
    
        // Execute adopt as a transaction by sending account
        return adoptionInstance.adopt(petId, {from: account});
      }).then(function(result) {
        return App.markAdopted();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },  

  // handle the voting process when user click the vote button.
  castVote: function() {


  web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }

    account=accounts[0];
    // the candidate petID
    var candidateId = $('#candidatesSelect').val();

    App.contracts.Adoption.deployed().then(function(instance) {
      return instance.vote(candidateId, { from: account });
    }).then(function(result) {
      // Wait for votes to update
      $('#voteDropList').hide();
      $("#loader").show();


   });

    }).catch(function(err) {
      console.error(err);
    });
  },


  handleSend: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));
    var sendAddress = $('.panel-pet').eq(petId).find('.input-send-address').val();
    
    var adoptionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      console.log(account);
      console.log(sendAddress);

      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;

        // Execute adopt as a transaction by sending account
        return adoptionInstance.sendPet(petId, sendAddress, {from: account});
      }).then(function(result) {
        console.log("Sent Pet!");
        return App.markAdopted();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

 handleReturn: function (event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data("id"));

    var returningInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed()
        .then(function (instance) {
          returningInstance = instance;

          // Execute return as a transaction by sending account
          return returningInstance.returnAnimal(petId, { from: account });
        })
        .then(function () {
          return App.markReturned();
        })
        .catch(function (err) {
          console.log(err.message);
        });
    });
  },


};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
