/*  MIT License

	Copyright (c) 2019 Bruno Henrique Meyer

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/

var globalMap;
globalPoints = [];
function createArea(conjunto){
  // Construct the polygon.
  var plg = new google.maps.Polygon({
    paths: conjunto,
    strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "rgb("+Math.floor(Math.random()*255)+","+
                      Math.floor(Math.random()*255)+","+
                      Math.floor(Math.random()*255)+")",
    fillOpacity: 0.35
  });
  plg.setMap(globalMap);
  globalMap.setCenter(globalPoints[0]);
  writeUserData(globalPoints);
}

users = [];
var areaNames = {
  get : function (attr){
    if(areaNames[attr] != undefined){
      return areaNames[attr][0];
    }
    return 0;
  }
};

var microAreas = [];

// For each line specified, 
function populeMap(spreadsheet){
  for(var i in spreadsheet){
    
    var microArea = spreadsheet[i][1];
    var rua = spreadsheet[i][7];
    var numero = spreadsheet[i][8];
    var nome = spreadsheet[i][4];
    var classificacao = spreadsheet[i][3];
    var programa = spreadsheet[i][2];
    var area = spreadsheet[i][1];
    var ativo = spreadsheet[i][14] == "ATIVO";
    
    if(!microAreas.includes(microArea)){
      microAreas.push(microArea);
    }
    
    users.push(
      {
        microArea:microArea,
        rua:rua,
        numero:numero,
        nome:nome,
        classificacao:classificacao.replace("\"",""),
        programa:programa.replace("\"",""),
        area:area,
        ativo:ativo,
        marker:null
      }
    );

    // If the area counters has at least one element, increment its counter
    // Otherwise initialize it an empty list
    areaNames[area] = [areaNames.get(area)+1,[]];
    
  }
}  

// Find each user that have some specifc characteristic (column value)
function searchUsers(characteristic,characteristic_name){
  var numUsers = 0;

  // Verify if the search ignore "ativos" and not "ativos" 
  var ativos = $("#inputAtivos:checked").length == 1;
  var inativos = $("#inputInativos:checked").length == 1;
  for(var i in users){
    if(
      users[i][characteristic_name] == characteristic &&
      (
        (users[i].ativo==true && ativos==true) ||
        (users[i].ativo==false && inativos==true)
      )
    ){
      userMarker(i,users[i].area);
      numUsers++;
    }
  }
}

function userMarker(idPessoa,area){
  addMarkerToMap(users[idPessoa].rua +" "+users[idPessoa].numero,
                  areaNames[area][0] == parseInt(idPessoa)+1,areaNames[area],
                  idPessoa,
                  area);
}
  
var cores = ["red","green","blue","purple",
              "yellow","black","orange","pink","white"];

// Format of marker ploted into map
function pinSymbol(color) {
  return {
    path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z M -2,-30 a 2,2 0 1,1 4,0 2,2 0 1,1 -4,0',
    fillColor: color,
    fillOpacity: 1,
    strokeColor: '#000',
    strokeWeight: 2,
    scale: 1,
  };
}


function addMarkerToMap(address, ultimo, conjuntoArea, idPessoa, area){
  function createMarker(lat_long){

    // Add an marker into map and it event click
    // One marker was related with an address
    // When a marker was clicked, it show every user that is related with
    // it address
    var cor = cores[microAreas.indexOf(users[idPessoa].microArea)];
    conjuntoArea[1].push(lat_long);

    // Set the screen center into the new marker
    // TODO: This may be confuse when a bunch of markers is loaded
    //       Then, the center must be set only when all markers was ploted
    globalMap.setCenter(lat_long);

    var marker = new google.maps.Marker({
      map: globalMap,
      position: lat_long,
      icon: pinSymbol( cor )
    });
    
    (function(marker, idPessoa) {
      // add click event
      // Open an popup with the information of all users located in some
      // address (marker)
      google.maps.event.addListener(marker, 'click', function() {
        
        var allContent = "";
        for(i in users){
          // People related to added marker
          var user_1_address = users[idPessoa].rua +" "+users[idPessoa].numero;

          // Verify if it have the same address than another user into dataset
          var user_2_address = users[i].rua +" "+users[i].numero;
          if(user_1_address == user_2_address){
            allContent+=users[i].nome+": <u><i>"+
                        users[i].programa+"</i>: <b>"+
                        users[i].classificacao+"</b></u><br>";
          }
        }
        
        infowindow = new google.maps.InfoWindow({
          content: allContent
        });
        infowindow.open(map, marker);
      });
    })(marker, idPessoa);
    
    // if(conjuntoArea[1].length == conjuntoArea[0]){
      //console.log(conjuntoArea);
      //~ createArea(conjuntoArea[1]);
    // }

    users[idPessoa].marker = marker;
  }
  
  var geocoder = new google.maps.Geocoder();
  
  // If an address was computed to collect it geocode, then there is two ways
  // to do this:
  
  // First:  Collect it from the local storage. When the page was inittialized,
  //         The firebase was accessed to collect the "cache" of address and
  //         store the date into local storage
  // Second: Ask it geocode to google maps. It has a high cost and must be
  //         evited 
  if(localStorage.getItem(address) != null){
    // It is in local storage
    createMarker(JSON.parse(localStorage.getItem(address)));
  }
  else{
    // Search it into google map
    geocoder.geocode({'address': address+" curitiba"}, function(results, status) {
      // If the geocode was finded
      if (status === 'OK') {
        // Create it marker and store into localstorage
        // Also, store it into firebase
        createMarker(results[0].geometry.location);
        localStorage.setItem(address,
                             JSON.stringify(results[0].geometry.location)); 
        writeUserData(localStorage);
      }
      
      // Sometimes, the error was caused by over query limit 
      if(status == "OVER_QUERY_LIMIT"){
        setTimeout(
          "userMarker("+idPessoa+",'"+area+"');"
          ,1000
        );
      }
      
      
    });
  }
}


var toAddMarker = false;
function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -33.866, lng: 151.196},
    zoom: 11,
    draggableCursor: 'grab'
  });
  globalMap = map;

  // Set map center
  // TODO: Load it from local storage (and save into it) or from firebase
  map.setCenter(new google.maps.LatLng(-25.5136773,-49.3135051));
  
  var DEFAULT_CURSOR = map.get("draggableCursor");

  // Add event to tool of add put markers (circles) into map
  // TODO: Store it marker into local storage
  $("#addMarker").click(function(){
    toAddMarker = !toAddMarker;
    if(!toAddMarker){
      map.set('draggableCursor', "grab");
      $("#addMarker").css("outline-width",0);
    }
    else{
      map.set('draggableCursor', "crosshair");
      $("#addMarker").css("outline-width",1);
    }
  });
  
  function pinSymbolFeatures(color) {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#000',
      strokeWeight: 2,
      scale: 7,
    };
  }


  // When click into map, if the marker tool was enabled, then add
  // a circle marker into map
  google.maps.event.addListener(map, 'click', function(event) {
    if(!toAddMarker) return;
    var lat_long = event.latLng;
    var marker = new google.maps.Marker({
      map: globalMap,
      position: lat_long,
      icon: pinSymbolFeatures($("#colorPicker").val())
    });
    
    // When the right click was used, it will destroy the marker
    google.maps.event.addListener(marker, 'rightclick',  function(mouseEvent) {
      if(!toAddMarker) return;
      this.setMap(null);
    });
  });
  


  // Tool used to dray polygons into map
  // TODO: Preserve it into local storage
  var drawingManager = new google.maps.drawing.DrawingManager({
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.BOTTOM_CENTER,
      drawingModes: ['polygon']
    },
  });
  
  // Add right click destroy event into it
  drawingManager.setMap(map);
  google.maps.event.addListener(drawingManager, 'polygoncomplete', function(poly) {
    google.maps.event.addListener(poly,  'rightclick',  function(mouseEvent) {
      if(!toAddMarker)
        return;
      this.setMap(null);
    });
  });
}


// Define an random user id to firebase
var userId = 2;

// Load the firebase cache (addresses geocodes and anothers informations)
// into localStorage
var dados = firebase.database().ref('/cache/').once('value').then(
  function(snapshot) {
    var newLS = JSON.parse(snapshot.val().data);
    for(x in newLS){
    localStorage[x] = newLS[x];
  }
});