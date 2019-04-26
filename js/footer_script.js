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

// Create the mapa and structures of software with the spreedsheet data
function analyseSpreedsheetData(data){
  var lines = data.split("\n");
    
  // For each line, verify if it is valid (ignore all header)
  for(var l = 0; l < lines.length; l++){
    lines[l] = lines[l].split(";");
    
    var emptyOnLine = false;
    for(var i in lines[l]){
      if(lines[l][i] == ""){
        emptyOnLine = true;
        break;
      }
    }
    
    if(lines[l].length == 1 || emptyOnLine){
      lines.splice(l,1);
      l--;
    }
  }

  // Ignore the columns names
  // TODO: Check if the order of columns
  lines.splice(0,1); // Header

  populeMap(lines);
  

  // Add an search field with autocomplete
  // It will search users by different types of column values
  // and add the correspondent markers into map
  var input = document.getElementById("search");
  var awesomplete = new Awesomplete(input);
  
  
  awesomplete.replace = function(text){
    this.input.value = text;
    
    var valor = document.getElementById("search").value;
    resetMap();
    
    searchUsers(valor,"programa");  
    searchUsers(valor,"classificacao");  
    searchUsers(valor,"nome");

    this.close();
  };
  
  var auxHashClassificacao = {};
  for(var i in users){
    if(!(users[i].classificacao in auxHashClassificacao)){
      auxHashClassificacao[users[i].classificacao] = true;
    }
  }
  var classificacoes = [];
  for(var classificacao in auxHashClassificacao){
    classificacoes.push(classificacao);
  }

  var auxHashNome = {};
  for(var i in users){
    if(!(users[i].nome in auxHashNome)){
      auxHashNome[users[i].nome] = true;
    }
  }

  var nomes = [];
  for(var nome in auxHashNome){
    nomes.push(nome);
  }
  
  
  
  var auxHashPrograma = {};
  for(var i in users){
    if(!(users[i].programa in auxHashPrograma)){
      auxHashPrograma[users[i].programa] = true;
    }
  }

  var programas = [];
  for(var programa in auxHashPrograma){
    programas.push(programa);
  }
  awesomplete.list = classificacoes.concat(nomes).concat(programas);

  // End of autocomplete configuration
}


initReader("inputFile", analyseSpreedsheetData);

function resetMap(){
  for(var i in users){
    if(users[i].marker != null){
      users[i].marker.setMap(null);
      users[i].marker = null;
    }
  }
}