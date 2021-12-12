abi = [
	{
		"inputs": [],
		"name": "buyPichu",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "buyPikachu",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "buyRaichu",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bool",
				"name": "enable",
				"type": "bool"
			}
		],
		"name": "enableSuperPowerfulDragon",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "ref",
				"type": "address"
			}
		],
		"name": "hatchEggs",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "seedMarket",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "sellEggs",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "percentage",
				"type": "uint256"
			}
		],
		"name": "withdrawAdminMoney",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "activated",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "eth",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "contractBalance",
				"type": "uint256"
			}
		],
		"name": "calculateEggBuy",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "eth",
				"type": "uint256"
			}
		],
		"name": "calculateEggBuy",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "eggs",
				"type": "uint256"
			}
		],
		"name": "calculateEggSell",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "eggs",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "eth",
				"type": "uint256"
			}
		],
		"name": "calculateEggSell",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "percentage",
				"type": "uint256"
			}
		],
		"name": "calculatePercentage",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "rt",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "rs",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "bs",
				"type": "uint256"
			}
		],
		"name": "calculateTrade",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "cashedOut",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "CEO_FEE",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "ceoAddress",
		"outputs": [
			{
				"internalType": "address payable",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "ceoEtherBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "contractStarted",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "devFee",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "EGGS_TO_HATCH_1Pikachu",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "adr",
				"type": "address"
			}
		],
		"name": "getEggsSinceLastHatch",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getEggsToHatchPichu",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getMyEggs",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getMyPikachu",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getMyPichu",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getMyRaichu",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "hatchingSpeed",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "Pikachus",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "isSuperPowerfulDragonEnabled",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "lastHatch",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "lastPrice",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "marketEggs",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "Pichus",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "referrals",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "snatchedOn",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "superPowerfulDragonOwner",
		"outputs": [
			{
				"internalType": "address payable",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "Raichu",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "userHatchRate",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "userReferralEggs",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

var _marketEggs = 0;
var _myPichu = 0;
var _myPikachu = 0;
var _myRaichu = 0;
var _myEggs = 0;
var _normalDragonPrice = 0;

var _balance = 0;

async function initContract() {
  if (!this.contract) {
    this.contract = await new web3.eth.Contract(abi, "0x2667d1d061b00792bDA891e4CfE9CFc655C9E5Fd");
  }

  return this.contract;
}

async function populateUserAddress() {
  const accounts = await web3.eth.getAccounts();
  this.userAddress = accounts[0];
}


function getMarketEggs() {
  this.contract.methods.marketEggs().call({ from: this.userAddress }).then((result, err) => {
    if (!err) {
    //   console.log("Market total eggs ", result);
      _marketEggs = result;
    }
  });
}

function getMyPikachu() {
  this.contract.methods.getMyPikachu().call({ from: this.userAddress }).then((result, err) => {
    if (!err) {
      _myPikachu = result/eggstohatch1;
    }
  });
}

function getMyPichu() {
	this.contract.methods.getMyPichu().call({ from: this.userAddress }).then((result, err) => {
	  if (!err) {
		_myPichu = result/eggstohatch1;
	  }
	});
  }

function getMyRaichu() {
  this.contract.methods.getMyRaichu().call({ from: this.userAddress }).then((result, err) => {
    if (!err) {
      _myRaichu = result/eggstohatch1;
    }
  });
}

function lastHatch(callback){
  this.contract.methods.lastHatch(this.userAddress).call({from:this.userAddress}).then(result => {
      callback(result);
  }).catch((err) => {
      console.log(err)
  });
}

function getMyEggs() {
  this.contract.methods.getMyEggs().call({ from: this.userAddress }).then((result, err) => {
     console.log("1"+result);
    if (!err) {
    //   console.log("My eggs ", result);
		_myEggs = result/eggstohatch1;
    }
  });
}

function getNumberOfDragons(eth, callback) {
  this.contract.methods.calculateEggBuy(String(eth)).call({ from: this.userAddress }).then((result, err) => {
    if (!err) {
    //   console.log(result);
      callback(result);
    }
  });
}

function getPikachuSellPrice(eggs, callback) {
  if (eggs == 0) return;
  this.contract.methods.calculateEggSell(String(parseInt(eggs))).call({ from: this.userAddress }).then((result, err) => {
    if (!err) {
	//   console.log("sell price ", web3.utils.fromWei(result, "ether"));
	  callback(web3.utils.fromWei(result, "ether"));
    }
  });
}



/////////////////////////////

function throwError() {
  var x = document.getElementById("snackbar");
  x.children[1].innerHTML = "Unable to complete operation.";
  x.className = "show";
  setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
}

function isUndefined(obj) {
  if (typeof obj == 'undefined') {
    throwError();
    return true;
  }
  return false;
}


function buyPichu(eth, callback) {
  this.contract.methods.buyPichu().send({ value: eth, from: this.userAddress }).then((result, err) => {
    if (!err) {
    //   console.log('Got paid Dragon');
      callback();
    } else {
      throwError();
      displayTransactionErrorMessage();

    }
  }).catch(() => displayTransactionErrorMessage());
  displayTransactionSubmittedMessage();
}

function buyPikachu(eth, callback) {
  this.contract.methods.buyPikachu().send({ value: eth, from: this.userAddress }).then((result, err) => {
    if (!err) {
    //   console.log('Got Ice Dragon ', eth);
      callback();
    } else {
      throwError();
      displayTransactionErrorMessage();
    }
  }).catch(() => displayTransactionErrorMessage());;
  displayTransactionSubmittedMessage();
}

function buyRaichu(eth, callback) {
	this.contract.methods.buyRaichu().send({ value: eth, from: this.userAddress }).then((result, err) => {
	  if (!err) {
		// console.log('Got Ultra Dragon ', eth);
		callback();
	  } else {
      throwError();
      displayTransactionErrorMessage();
    }
	}).catch(() => displayTransactionErrorMessage());;

  displayTransactionSubmittedMessage();
  }

function hatchEggs(ref, callback) {
  this.contract.methods.hatchEggs(ref ? ref : this.userAddress).send({ from: this.userAddress }).then((result, err) => {
    if (!err) {
      callback();
    } else {
      throwError();
      displayTransactionErrorMessage();
    }
  }).catch(() => displayTransactionErrorMessage());;
  displayTransactionSubmittedMessage();
}

function sellEggs(callback) {
  this.contract.methods.sellEggs().send({ from: this.userAddress }).then((result, err) => {
    if (!err) {
      callback();
    } else {
      throwError();
      displayTransactionErrorMessage();
    }
  }).catch(() => displayTransactionErrorMessage());;

  displayTransactionSubmittedMessage();
}


function getBalance() {
  this.contract.methods.getBalance().call().then((result, err) => {
    // console.log(typeof result)
    if (!err) {
    //   console.log(result);
      _balance = parseFloat(result);
    } else throwError();
  });
}
