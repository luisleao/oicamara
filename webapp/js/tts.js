/*

Copyright 2013 Luis Leao All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/



// caso seja necessario variar uma palavra conforme número
var plural_ou_nenhum = function(number, singular, plural, nenhum) {
  switch(number) {
    case 0: return nenhum;
    case 1: return singular;
    default: return plural;
  }
}

// a Translate.TTS possui limite de 100 caracteres. Dividir texto em blocos.
var divide_texto_em_100 = function(texto) {
  if (texto.length <= 100)
    return [texto];

  resultado = []; texto_100 = "";
  texto_array = texto.split(" ");

  for (var idx in texto_array) {
    if (texto_100.length + texto_array[idx].length > 100) {
      resultado.push(texto_100);
      texto_100 = "";
    }
    texto_100 += texto_array[idx] + " ";
  }
  if (texto_100 != "")
    resultado.push(texto_100);

  return resultado;

}



// funcao para falar um array de textos
var falar_mais = function(texto_array, callback) {
  if (!texto_array || !texto_array.length || texto_array.length == 0) {
    if (callback)
      callback();
    return;
  }

  var texto = texto_array.shift().replace(" PEC ", " PÉQUI ").replace(" art. ", " artigo ");;

  falar(texto, function(){ falar_mais(texto_array, callback); });
}



// funcao principal de fala
var falar = function(texto, callback) {
  falando = true;
  last_talk = Date.now();

  recognition.stop();

  console.log("FALANDO: ", texto);

  var audio_especial = new Audio();
  audio_especial.addEventListener('ended', function(){

    if (!recognizing)
      recognition.start();

    falando = false;
    if (callback) { 
      callback();
    } else {
      comando_off();
    }
  });


  audio_especial.src = "http://translate.google.com.br/translate_tts?ie=UTF-8&tl=pt&total="+texto.length+"&q=" + texto;
  audio_especial.playbackRate = 2; //1.7;
  audio_especial.play();

}

