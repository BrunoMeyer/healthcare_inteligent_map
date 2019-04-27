var GOOGLE_MAP_KEY = "YOUR_KEY";

function loadScript() {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = "https://maps.googleapis.com/maps/api/js?key="+GOOGLE_MAP_KEY
                +"&libraries=places&libraries=drawing&callback=initMap"
  document.body.appendChild(script);
}

window.onload = loadScript;