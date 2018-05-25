var modal
var modalContent
var lastNumEggs=-1
var lastNumShrimp=-1
var lastSecondsUntilFull=100
lastHatchTime=0
var eggstohatch1=864
var lastUpdate=new Date().getTime()
var modalID=0
function main(){
    console.log('test')
    modal = document.getElementById('myModal');
    modalContent=document.getElementById('modal-internal')
    controlLoop()
    controlLoopFaster()
}
function controlLoop(){
    refreshData()
    setTimeout(controlLoop,2500)
}
function controlLoopFaster(){
    liveUpdateEggs()
    console.log('clf')
    setTimeout(controlLoopFaster,30)
}
function refreshData(){
    
    for(var i=0;i<10;i++){
        getAdText(i,function(index,text){
            console.log('textwas ',index,text)
            var adTextdoc=document.getElementById('adHyperlink'+index)
            text=text.substring(0,128)
            adTextdoc.textContent=onlyLetters(text)
        });
    }
    for(var i=0;i<10;i++){
        getAdUrl(i,function(index,text){
            text=onlyurl(text)
            console.log('urlwas ',index,text+"^")
            var adTextdoc=document.getElementById('adHyperlink'+index)
            //console.log('validurl ',validurlsimple(text))
            //if(onlyurl(text)){
                adTextdoc.href="http://"+text
            //}
        });
    }
    for(var i=0;i<10;i++){
        getAdPrice(i,function(index,text){
            //console.log('adprice ',index,text)
            var adTextdoc=document.getElementById('adEthPrice'+index)
            adTextdoc.textContent=weiToDisplay(text)
        });
    }
    //adEthPrice6
    var sellsforexampledoc=document.getElementById('sellsforexample')
    marketEggs(function(eggs){
        eggs=eggs/10
        calculateEggSell(eggs,function(wei){
            devFee(wei,function(fee){
                console.log('examplesellprice ',wei)
                sellsforexampledoc.textContent='('+formatEggs(eggs)+' eggs would sell for '+formatEthValue(web3.fromWei(wei-fee,'ether'))+')'
            });
        });
    });
    lastHatch(web3.eth.accounts[0],function(lh){
        lastHatchTime=lh
    });
    EGGS_TO_HATCH_1SHRIMP(function(eggs){
        eggstohatch1=eggs
    });
    getMyEggs(function(eggs){
        if(lastNumEggs!=eggs){
            lastNumEggs=eggs
            lastUpdate=new Date().getTime()
            updateEggNumber(eggs/eggstohatch1)//formatEggs(eggs))

        }
        var timeuntilfulldoc=document.getElementById('timeuntilfull')
        secondsuntilfull=eggstohatch1-eggs/lastNumShrimp
        console.log('secondsuntilfull ',secondsuntilfull,eggstohatch1,eggs,lastNumShrimp)
        lastSecondsUntilFull=secondsuntilfull
        timeuntilfulldoc.textContent=secondsToString(secondsuntilfull)
        if(lastNumShrimp==0){
            timeuntilfulldoc.textContent='?'
        }
    });
    getMyShrimp(function(shrimp){
        lastNumShrimp=shrimp
        var gfsdoc=document.getElementById('getfreeshrimp')
        if(shrimp>0){
            gfsdoc.style.display="none"
        }
        else{
            gfsdoc.style.display="inline-block"
        }
        var allnumshrimp=document.getElementsByClassName('numshrimp')
        for(var i=0;i<allnumshrimp.length;i++){
            if(allnumshrimp[i]){
                allnumshrimp[i].textContent=translateQuantity(shrimp)
            }
        }
        var productiondoc=document.getElementById('production')
        productiondoc.textContent=formatEggs(lastNumShrimp*60*60)
    });
    updateBuyPrice()
    updateSellPrice()
    var prldoc=document.getElementById('playerreflink')
    prldoc.textContent=window.location.origin+"?ref="+web3.eth.accounts[0]
    var copyText = document.getElementById("copytextthing");
    copyText.value=prldoc.textContent
}
function purchaseAd(){
    getAdPrice(modalID,function(index,price){
        adtextdoc=document.getElementById('adInputText')
        adurldoc=document.getElementById('adInputUrl')
        url=adurldoc.value
        url=url.replace("http://","").replace("https://","").replace("http://www.","").replace("https://www.","")
        console.log('purchaseadvalues ',price,adtextdoc.value,adurldoc.value,validurlsimple(url))
        if(onlyLetters(adtextdoc.value)!=adtextdoc.value){
            alert('Numbers, letters and punctuation only in ad text')
            return
        }
        if(onlyurl(url)!=url){
            alert('invalid url')
            return
        }
        buyAd(index,adtextdoc.value,url,price,function(){
            displayTransactionMessage()
            removeModal2()
        });
    });
}
function setmid(number){
    //console.log('set modal id ',number)
    modalID=number
    getAdPrice(modalID,function(index,text){
        //console.log('adprice ',index,text)
        var adTextdoc=document.getElementById('adEthPriceConfirm')
        adTextdoc.textContent=weiToDisplay(text)
    });
}
function updateEggNumber(eggs){
    var hatchshrimpquantitydoc=document.getElementById('hatchshrimpquantity')
    hatchshrimpquantitydoc.textContent=translateQuantity(eggs,0)
    var allnumeggs=document.getElementsByClassName('numeggs')
    for(var i=0;i<allnumeggs.length;i++){
        if(allnumeggs[i]){
            allnumeggs[i].textContent=translateQuantity(eggs)
        }
    }
}
function hatchEggs1(){
    ref=getQueryVariable('ref')
    if(!ref || ref==web3.eth.accounts[0]){
        ref=0
    }
    console.log('hatcheggs ref ',ref)
    hatchEggs(ref,displayTransactionMessage())
}
function liveUpdateEggs(){
    if(lastSecondsUntilFull>1 && lastNumEggs>=0 && lastNumShrimp>0 && eggstohatch1>0){
        currentTime=new Date().getTime()
        if(currentTime/1000-lastHatchTime>eggstohatch1){
            return;
        }
        difference=(currentTime-lastUpdate)/1000
        additionalEggs=Math.floor(difference*lastNumShrimp)
        updateEggNumber((lastNumEggs+additionalEggs)/eggstohatch1)//formatEggs(lastNumEggs+additionalEggs))
    }
}
function updateSellPrice(){
    var eggstoselldoc=document.getElementById('sellprice')
    //eggstoselldoc.textContent='?'
   getMyEggs(function(eggs){
        calculateEggSell(eggs,function(wei){
            devFee(wei,function(fee){
                console.log('sellprice ',wei)
                eggstoselldoc.textContent=formatEthValue(web3.fromWei(wei-fee,'ether'))
            });
        });
   });
}

function updateBuyPrice(){
    var eggstobuydoc=document.getElementById('eggstobuy')
    //eggstobuydoc.textContent='?'
    var ethtospenddoc=document.getElementById('ethtospend')
    weitospend=web3.toWei(ethtospenddoc.value,'ether')
    calculateEggBuySimple(weitospend,function(eggs){
        devFee(eggs,function(fee){
            eggstobuydoc.textContent=formatEggs(eggs-fee)
        });
    });
}
function buyEggs2(){
    var ethtospenddoc=document.getElementById('ethtospend')
    weitospend=web3.toWei(ethtospenddoc.value,'ether')
    buyEggs(weitospend,function(){
        displayTransactionMessage();
    });
}
function formatEggs(eggs){
    return translateQuantity(eggs/eggstohatch1)
}
function translateQuantity(quantity,precision){
    quantity=Number(quantity)
    finalquantity=quantity
    modifier=''

    //console.log('??quantity ',typeof quantity)
    if(quantity>1000000){
        modifier='M'
        finalquantity=quantity/1000000
    }
    if(quantity>1000000000){
        modifier='B'
        finalquantity=quantity/1000000000
    }
    if(quantity>1000000000000){
        modifier='T'
        finalquantity=quantity/1000000000000
    }
    if(precision == undefined){
        precision=0
        if(finalquantity<10000){
            precision=1
        }
        if(finalquantity<1000){
            precision=2
        }
        if(finalquantity<100){
            precision=3
        }
        if(finalquantity<10){
            precision=4
        }
    }
    if(precision==0){
        finalquantity=Math.floor(finalquantity)
    }
    return finalquantity.toFixed(precision)+modifier;
}
function removeModal2(){
    $('#adModal').modal('toggle');
}
function removeModal(){
        modalContent.innerHTML=""
        modal.style.display = "none";
}
function displayTransactionMessage(){
    displayModalMessage("Transaction Submitted")
}
function displayModalMessage(message){
    modal.style.display = "block";
    modalContent.textContent=message;
    setTimeout(removeModal,3000)
}
function weiToDisplay(ethprice){
    return formatEthValue(web3.fromWei(ethprice,'ether'))
}
function formatEthValue(ethstr){
    return parseFloat(parseFloat(ethstr).toFixed(5));
}
function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}

function copyRef() {
  var copyText = document.getElementById("copytextthing");
  copyText.style.display="block"
  copyText.select();
  document.execCommand("Copy");
  copyText.style.display="none"
  displayModalMessage("copied link to clipboard")
  //alert("Copied the text: " + copyText.value);
}

function secondsToString(seconds)
{
    seconds=Math.max(seconds,0)
    var numdays = Math.floor(seconds / 86400);

    var numhours = Math.floor((seconds % 86400) / 3600);

    var numminutes = Math.floor(((seconds % 86400) % 3600) / 60);

    var numseconds = ((seconds % 86400) % 3600) % 60;
    var endstr=""
    //if(numdays>0){
    //    endstr+=numdays + " days "
    //}
    
    return numhours + "h " + numminutes + "m "//+numseconds+"s";
}
function disableButtons(){
    var allnumshrimp=document.getElementsByClassName('btn-lg')
    for(var i=0;i<allnumshrimp.length;i++){
        if(allnumshrimp[i]){
            allnumshrimp[i].style.display="none"
        }
    }
    var allnumshrimp=document.getElementsByClassName('btn-md')
    for(var i=0;i<allnumshrimp.length;i++){
        if(allnumshrimp[i]){
            allnumshrimp[i].style.display="none"
        }
    }
}
function enableButtons(){
    var allnumshrimp=document.getElementsByClassName('btn-lg')
    for(var i=0;i<allnumshrimp.length;i++){
        if(allnumshrimp[i]){
            allnumshrimp[i].style.display="inline-block"
        }
    }
        var allnumshrimp=document.getElementsByClassName('btn-md')
    for(var i=0;i<allnumshrimp.length;i++){
        if(allnumshrimp[i]){
            allnumshrimp[i].style.display="inline-block"
        }
    }
}
function onlyLetters(text){
    return text.replace(/[^0-9a-zA-Z\s\.!?,]/gi, '')
}
function checkOnlyLetters(str){
    var pattern=new RegExp('^[0-9a-zA-Z\s\.!?,]*$')
      if(!pattern.test(str)) {
        return false;
      } else {
        return true;
      }
}
function onlyurl(str){
     return str.replace(/[^0-9a-zA-Z\.?&\/\+#=\-_:]/gi, '')
}
function validurlsimple(str){
    var pattern=new RegExp('^[a-z0-9\.?&\/\+#=\-_:]*$')
      if(!pattern.test(str)) {
        return false;
      } else {
        return true;
      }
}
function ValidURL(str) {
  var pattern = new RegExp('^(https?:\/\/)?'+ // protocol
    '((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|'+ // domain name
    '((\d{1,3}\.){3}\d{1,3}))'+ // OR ip (v4) address
    '(\:\d+)?(\/[-a-z\d%_.~+]*)*'+ // port and path
    '(\?[;&a-z\d%_.~+=-]*)?'+ // query string
    '(\#[-a-z\d_]*)?$','i'); // fragment locater
  if(!pattern.test(str)) {
    alert("Please enter a valid URL.");
    return false;
  } else {
    return true;
  }
}
function callbackClosure(i, callback) { 
    return function() {
        return callback(i); 
    } 
} 
web3.version.getNetwork((err, netId) => {
    
    if(netId!="1"){
        displayModalMessage("Please switch to Ethereum Mainnet "+netId)
        disableButtons()
    }
    /*
  switch (netId) {
    case "1":
      console.log('This is mainnet')
      break
    case "2":
      console.log('This is the deprecated Morden test network.')
      break
    case "3":
      console.log('This is the ropsten test network.')
      break
    default:
      console.log('This is an unknown network.')
      
  }*/
})
