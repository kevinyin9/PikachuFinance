var modal;
var modalContent;
var lastNumEggs = -1
var lastNumShrimp = -1
var lastSecondsUntilFull = 100
lastHatchTime = new Date().getTime() / 100;
var eggstohatch1 = 86400.0;
var lastUpdate = new Date().getTime();

window.addEventListener('load', async function () {
  if (window.ethereum) {
    window.web3 = new Web3(ethereum);
  } else if (window.web3) {
    window.web3 = new Web3(web3.currentProvider);
  }
  try {
    await ethereum.enable() // Request access
    await initContract();
    await populateUserAddress()
    main()
  } catch (error) {
    // User denied account access...
    console.error(error)
  }
})

async function checkForBinanceChain() {

  try {
    await BinanceChain.enable()
    await initContract();
    await populateUserAddress()
    setTimeout(function () {
      main();
    }, 1000);
  } catch (error) {
    // User denied account access...
    console.error(error)
  }
}

function main() {
  modal = document.getElementById('myModal');
  modalContent = document.getElementById('modal-internal')
  //   console.log('test');
  controlLoop();
  controlLoopFaster();
  setRef();
}
function controlLoop() {
  refreshData();
  setTimeout(controlLoop, 1500);
}
function controlLoopFaster() {
  liveUpdateEggs();
  setTimeout(controlLoopFaster, 30);
}

function updatedProductionCount() {
  var productiondoc = document.getElementById('production');
  var production_count = formatEggs((_myPichu * 60 * 60) + (_myPikachu * 1 * 60 * 60 * 10) + _myRaichu * 1 * 60 * 60 * 25);
  productiondoc.textContent = production_count;
}

function updateDragonCount() {
  document.getElementById("numdragon").innerHTML = formatEggs(_myPichu * eggstohatch1);
}

function updatePikachuCount() {
  var not = document.getElementById("pikachuNotBought");
  var bought = document.getElementById("pikachuBought");
  if (_myPikachu > 0) {
    bought.style.display = "block";
    not.style.display = "none";
    document.getElementById("numdragonice").innerHTML = formatEggs(_myPikachu * eggstohatch1);;
  } else {
    not.style.display = "block";
    bought.style.display = "none";
  }
}

function updateRaichuCount() {
  var not = document.getElementById("raichuNotBought");
  var bought = document.getElementById("raichuBought");
  if (_myRaichu > 0) {
    bought.style.display = "block";
    not.style.display = "none";
    document.getElementById("numdragonultra").innerHTML = formatEggs(_myRaichu * eggstohatch1);
  } else {
    not.style.display = "block";
    bought.style.display = "none";
  }
}




function updateBNB_per_hour() {
	var bnbperhrdoc = document.getElementById('bnbperhr');
	
  const eggs1 = _marketEggs / 10;
  getPikachuSellPrice(eggs1, function (price) {
    const ethPrice1 = price - (price * 2) / 100;
    const sellFor1 = eggs1/ethPrice1;
	
	const production1 = formatEggs((_myPichu * 60 * 60) + (_myPikachu * 1 * 60 * 60 * 10) + _myRaichu * 1 * 60 * 60 * 25);
	
	const bnb_per_hr = production1/formatEggs(sellFor1);
	
	bnbperhrdoc.textContent = roundLikePHP(bnb_per_hr, 6) + " BNB/hr";
  });
	
	
	
	
	
	
	
	
}



function updateSellForText() {
  var sellsforexampledoc = document.getElementById('sellsforexample');
  
  const eggs = _marketEggs / 10;
  getPikachuSellPrice(eggs, function (price) {
    const ethPrice = price - (price * 2) / 100;
    const sellFor = eggs/ethPrice;
	sellsforexampledoc.textContent = "1 BNB = " + formatEggs(sellFor) + "  eggs";
  });
  

}


function roundLikePHP(num, dec){
  var num_sign = num >= 0 ? 1 : -1;
  return parseFloat((Math.round((num * Math.pow(10, dec)) + (num_sign * 0.0001)) / Math.pow(10, dec)).toFixed(dec));
}


function updateEggNumber(eggs) {
  var allnumeggs = document.getElementsByClassName('numeggs');

  for (var i = 0; i < allnumeggs.length; i++) {
    if (allnumeggs[i]) {
      allnumeggs[i].textContent = translateQuantity(eggs, 2);
    }
  }
  document.getElementById("hatchdragonquantity").innerHTML = parseInt(translateQuantity(eggs, 2));
}

function updateDragonButton() {
  var pichu = document.getElementById("buyPichu");
  var pichuInput = document.getElementById("buyPichuInput");
  //   console.log("My Eggs  =" + _myEggs);

  pichu.style.display = "inline-block";
  pichuInput.style.display = "inline-block";
  var eth = parseFloat(pichuInput.value) * 1000000 * 1000000 * 1000000;

  getNumberOfDragons(eth, function (dragons) {
    // alert(eth, amount);
    dragons = dragons;
    pichu.innerHTML = "Buy " + formatDragons(dragons) + " Pichus <br> for " + parseFloat(pichuInput.value).toFixed(4) + " BNB";
  });
}

function buyPichuInput() {
  var eth = parseFloat(document.getElementById("buyPichuInput").value) * 1000000 * 1000000 * 1000000;
  buyPichu(eth, displayTransactionCompletedMessage);
}

function buyPikachuInput() {
  var eth = parseFloat(document.getElementById("buyPikachuInput").value) * 1000000 * 1000000 * 1000000;
  buyPikachu(eth, displayTransactionCompletedMessage);
}

function buyRaichuInput() {
  var eth = parseFloat(document.getElementById("buyRaichuInput").value) * 1000000 * 1000000 * 1000000;
  buyRaichu(eth, displayTransactionCompletedMessage);
}

function updatePikachuPrice() {
  var eth = document.getElementById("buyPikachuInput").value;
  var eth = parseFloat(eth) * 1000000 * 1000000 * 1000000
  getNumberOfDragons(eth, function (dragons) {
    dragons = dragons;
    document.getElementById("buyPikachu").innerHTML = "Buy " + formatDragons(dragons / 8) + " Pikachus <br>for " + parseFloat(document.getElementById("buyPikachuInput").value).toFixed(2) + " BNB";
  });
}

function updateRaichuPrice() {
  var eth = document.getElementById("buyRaichuInput").value;
  var eth = parseFloat(eth) * 1000000 * 1000000 * 1000000
  getNumberOfDragons(eth, function (dragons) {
    dragons = dragons;
    document.getElementById("buyRaichu").innerHTML = "Buy " + formatDragons(dragons / 20) + " Raichus <br>for " + parseFloat(document.getElementById("buyRaichuInput").value).toFixed(2) + " BNB";
  });
}

function refreshData() {
  //   console.log("refreshData")
  getMarketEggs();
  getMyRaichu();
  getMyPikachu();
  getMyPichu();
  getMyEggs();
  getBalance();

  updateDragonCount(); //Pichu
  updatedProductionCount();
  updateSellPrice();
  
  updateBNB_per_hour()

  updatePikachuCount();
  updateRaichuCount();

  updateSellForText();
  
  
  const d = (_myPichu + _myPikachu * 10 + _myRaichu * 25);
  if (d === 0) {
    updateEggNumber(formatEggs(_myEggs));
  }

  updateDragonButton();
  updatePikachuPrice();
  updateRaichuPrice();

  setRef();
  lastHatch(v => lastHatchTime = v);

}

function hatchEggs1() {
  ref = getQueryVariable('ref')
  if (!ref || ref == web3.eth.accounts[0]) {
    ref = 0
  }
  //   console.log('hatcheggs ref ', ref)
  hatchEggs(ref, displayTransactionCompletedMessage())
}

function liveUpdateEggs() {
  const d = (_myPichu + _myPikachu * 10 + _myRaichu * 25);
  if (lastSecondsUntilFull > 1 && _myEggs >= 0 && d > 0 && eggstohatch1 > 0) {
    const secondsPassed = new Date().getTime()/1000 - lastHatchTime;
    updateEggNumber(formatEggs(d * secondsPassed))
  }
}

function updateSellPrice() {
  var eggstoselldoc = document.getElementById('sellprice');
  getPikachuSellPrice(_myEggs , function (price) {
    const ethPrice = price - (price * 2) / 100;
    eggstoselldoc.textContent = formatEthValue(ethPrice);
  });
}

function buyEggs2() {
  var ethtospenddoc = document.getElementById('ethtospend')
  weitospend = web3.toWei(ethtospenddoc.value, 'ether')
  buyEggs(weitospend, function () {
    displayTransactionCompletedMessage();
  });
}


function formatEggs(eggs) {
  return translateQuantity(eggs / eggstohatch1, 2);
}

const formatDragons = eggs => translateQuantity(eggs/eggstohatch1, 2)


function translateQuantity(quantity, precision) {
  quantity = Number(quantity)
  finalquantity = quantity
  modifier = ''
  if (precision == undefined) {
    precision = 0
    if (quantity < 10000) {
      precision = 1
    }
    if (quantity < 1000) {
      precision = 2
    }
    if (quantity < 100) {
      precision = 3
    }
    if (quantity < 10) {
      precision = 4
    }
  }
  //console.log('??quantity ',typeof quantity)
  if (quantity > 1000000) {
    modifier = 'M'
    finalquantity = quantity / 1000000
  }
  if (quantity > 1000000000) {
    modifier = 'B'
    finalquantity = quantity / 1000000000
  }
  if (quantity > 1000000000000) {
    modifier = 'T'
    finalquantity = quantity / 1000000000000
  }
  if (precision == 0) {
    finalquantity = Math.floor(finalquantity)
  }
  return finalquantity.toFixed(precision) + modifier;
}

function removeModal() {
  modalContent.innerHTML = ""
  modal.style.display = "none";
}

function displayTransactionSubmittedMessage() {
  displayModalMessage("Waiting for transaction to complete", 3000000)
}

function displayTransactionCompletedMessage() {
  document.getElementById("snackbar").children[0].style.display = "none";
  displayModalMessage("Transaction Completed", 3000)
}

function displayTransactionErrorMessage() {
  document.getElementById("snackbar").children[0].style.display = "none";
  displayModalMessage("Transaction Declined", 3000)
}

function displayModalMessage(message, t) {
  // modal.style.display = "block";
  // modalContent.textContent=message;
  // setTimeout(removeModal,3000)

  var x = document.getElementById("snackbar");
  x.children[1].innerHTML = message;
  x.className = "show";
  setTimeout(function () {
    x.className = x.className.replace("show", "");
    document.getElementById("snackbar").children[0].style.display = "inline-block";
  }, t);
}


function formatEthValue(ethstr) {
  return parseFloat(parseFloat(ethstr).toFixed(5));
}

function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) { return pair[1]; }
  }
  return (false);
}

function copyRef() {
  document.getElementById("copytextthing").value = document.getElementById("playerreflink").innerHTML;
  var copyText = document.getElementById("copytextthing");
  copyText.style.display = "block"
  copyText.select();
  document.execCommand("Copy");
  copyText.style.display = "none"
  displayModalMessage("Copied link to clipboard")
}

function secondsToString(seconds) {
  seconds = Math.max(seconds, 0)
  var numdays = Math.floor(seconds / 86400);

  var numhours = Math.floor((seconds % 86400) / 3600);

  var numminutes = Math.floor(((seconds % 86400) % 3600) / 60);

  var numseconds = ((seconds % 86400) % 3600) % 60;
  var endstr = ""
  //if(numdays>0){
  //    endstr+=numdays + " days "
  //}

  return numhours + "h " + numminutes + "m "//+numseconds+"s";
}


function disableButtons() {
  var allnumshrimp = document.getElementsByClassName('btn-lg')
  for (var i = 0; i < allnumshrimp.length; i++) {
    if (allnumshrimp[i]) {
      allnumshrimp[i].style.display = "none"
    }
  }
}


function enableButtons() {
  var allnumshrimp = document.getElementsByClassName('btn-lg')
  for (var i = 0; i < allnumshrimp.length; i++) {
    if (allnumshrimp[i]) {
      allnumshrimp[i].style.display = "inline-block"
    }
  }
}

function setRef() {
  console.log("set ref called");
  document.getElementById("playerreflink").innerHTML = 'http://YoshiEgg.Finance/?ref=' + this.userAddress;
}
