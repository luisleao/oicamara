
var active = true;
var comando_ativo = false;


var NOME = "";


var video = document.getElementById("video");


var audio_ativo = new Audio();
var audio_inativo = new Audio();

audio_ativo.src = "media/ativo.mp3";
audio_inativo.src = "media/inativo.mp3";



video.addEventListener('ended', function(){
  this.currentTime = 0;
  this.pause();
  //TODO: retornar para interface inicial
});




var comando_on = function() {
  comando_ativo = true;
  //TODO: indicativo visual ON
  audio_ativo.currentTime = 0;
  audio_ativo.play();

  $("body").addClass("ativo");
};

var comando_off = function(nao_inicia) {
  comando_ativo = false;
  $("body").removeClass("ativo");
  //TODO: indicativo visual OFF
  if (!nao_inicia) inicia_comandos();
};






var stop_tudo = function() {

  if (!audio_ativo.paused) audio_ativo.pause();
  if (!audio_inativo.paused) audio_inativo.pause();

  if (!video.paused) video.pause();

}


var limpar_timers = function(){
}


var play_video = function(src) {
  video.src = src;
  video.currentTime = 0;
  video.play();
}




var validaData = function(dia, mes, ano) {
  if (!dia > 0 && dia < 31)
    return false;

  return true;
  //validar data completa

}

var formatDate = function(date) {
  var date_array = date.toLocaleDateString().split("/");
  return date_array[1] + "/" + date_array[0] + "/" + date_array[2];
}


function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}



/* * * * * * * * * * * * * * * * * * * *  CONFIGURANDO RELOGIOS  * * * * * * * * * * * * * * * * * * * */


var set_relogio = function(){
  var d = new Date();
  var data_hora = d.getHours() + ":" + pad(d.getMinutes(), 2);
  $(".relogio.current").text(data_hora);
};


setInterval(set_relogio, 1000);
  


var selecao_data;
var selecao_data_mes;
var selecao_data_dia;


var regex_mes = [new RegExp("(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)")];
var regex_dia = [new RegExp("(primeiro)"), new RegExp("([12]?[0-9]|3[0-1])")];

/* * * * * * * * * * * * * * * * * * * *  CONFIGURANDO WEBSPEECH  * * * * * * * * * * * * * * * * * * * */

lang = "pt-BR";



var comandos_atuais = [];

var tags = {};

var comandos = {


  "oi_camara": {
    "nome": "Comando inicial",
    "alias": [/oi câmara/g, /oi câmera/g], //"oi câmara", "oi câmera",
    "action": function() {

      falar("Qual informação você gostaria de saber sobre a câmara? Processo legislativo ou curiosidades?", function() {

        inicia_comandos();
        comandos_atuais.push(comandos["processo_legislativo"]);
        comandos_atuais.push(comandos["curiosidades"]);
        comandos_atuais.push(comandos["cancelar"]);
        comando_on();
      
      });

    }
  },


  "cancelar": {
    "nome": "Cancelar comando",
    "alias": [/cancelar/g, /cancela/g, /não/g], //"cancelar", "cancela"
    "action": function() {
      comando_off();
    }
  },



 "processo_legislativo": {
    "nome": "Processo Legislativo",
    "alias": [/processo legislativo/g, /processo/g, /legislativo/g], 
    "action": function(texto, tag, index) {

      falar("Para o processo legislativo você quer quais informações?", function(){
        falar("Você pode saber sobre andamento dos projetos de lei, presença dos deputados ou pauta do plenário.", function(){

          inicia_comandos();
          comandos_atuais.push(comandos["projetos_de_lei"]);
          comandos_atuais.push(comandos["presenca_deputados"]);
          comandos_atuais.push(comandos["pauta_plenario"]);
          comando_on();

        });
      });

    }
 },

 "projetos_de_lei":{
    "nome": "projetos_de_lei",
    "alias": [/projeto de lei/g, /projetos de lei/g], 
    "action": function() {

      falar("Vou falar sobre o andamento dos projetos de lei...");
      inicia_comandos();

    }
 },

 "presenca_deputados":{
    "nome": "presenca_deputados",
    "alias": [/presença dos deputados/g,/presença/g], 
    "action": function() {
      selecao_data = selecao_data_mes = selecao_data_dia = null;
      falar("Você quer a presença dos deputados de hoje, ontem ou de qual mês?", function(){
        inicia_comandos();
        comandos_atuais.push(comandos["presenca_hojeontem"]);
        comandos_atuais.push(comandos["presenca_mes"]);
        comandos_atuais.push(comandos["cancelar"]);
        comando_on();

      });
      inicia_comandos();

    }
 },


 "presenca_hojeontem": {
  "nome": "presenca_hojeontem",
  "alias": [new RegExp("(hoje|ontem)")],
  "action": function(texto, tag, regex_result) {
    var data = new Date();
    switch(regex_result) {
      case "ontem": data.setDate(data.getDate() - 1); break;
    }

     carrega_presenca(data); 
  }
 },

 "presenca_mes": {
    "nome": "presenca_mes",
    "alias": regex_mes, 
    "action": function(texto, tag, regex_result) {

      //console.log("texto, tag, regex");
      //console.log(texto, tag, regex);
      //console.log(regex.exec(texto));
      //var mes = regex_result[0];

      //console.log(mes);

      selecao_data_mes = regex_result;
      falar("Qual dia do mês de " + regex_result + "?", function(){
        inicia_comandos();
        comandos_atuais.push(comandos["presenca_dia"]);
        comandos_atuais.push(comandos["cancelar"]);
        comando_on();
      });

/*
      falar("Você quer a presença dos deputados em qual mês?", function(){
        inicia_comandos();
        comandos_atuais.push(comandos["presenca_mes"]);
        comandos_atuais.push(comandos["cancelar"]);
        comando_on();

      });
*/

    }
 },

 "presenca_dia": {
    "nome": "presenca_dia",
    "alias": regex_dia, 
    "action": function(texto, tag, regex_result) {


      var dia = parseInt(regex_result);
      selecao_data_dia = dia;
     
      var mes;
      switch(selecao_data_mes) {
        case "janeiro": mes = 0; break;
        case "fevereiro": mes = 1; break;
        case "março": mes = 2; break;
        case "abril": mes = 3; break;
        case "maio": mes = 4; break;
        case "junho": mes = 5; break;
        case "julho": mes = 6; break;
        case "agosto": mes = 7; break;
        case "setembro": mes = 8; break;
        case "outubro": mes = 9; break;
        case "novembro": mes = 10; break;
        case "dezembro": mes = 11; break;
      }


      console.log(dia, mes);
      var data = new Date(new Date().getFullYear(), mes, dia);
      carrega_presenca(data);

/*
      if (validaData(dia, mes, new Date().getFullYear())) {
      } else {
        falar("Não entendi o dia corretamente. Qual dia você quer do mês de "+selecao_data_mes+"?", function(){
          inicia_comandos();
          comandos_atuais.push(comandos["presenca_dia"]);
          comandos_atuais.push(comandos["cancelar"]);
          comando_on();

        })
      }
*/

    }
 },


 "pauta_plenario":{
    "nome": "pauta_plenario",
    "alias": [/pauta do plenário/g, /pauta/g, /plenário/g, /plenária/g], 
    "action": function(texto, tag, index) {

      falar("Vou falar sobre a pauta do plenário. Você quer saber sobre a pauta de hoje?");
      inicia_comandos();

    }
 },



 "curiosidades": {
    "nome": "curiosidades",
    "alias": [/curiosidade/g], 
    "action": function(texto, tag, index) {

      falar("Existe uma passagem secreta no salão negro. Pergunta pro Pedro que ele sabe.");

    }
 },


 "horas": {
    "nome": "Horas do Dia",
    "alias": [/sim/g,/quantas horas/g, /que horas são/g], //"quantas horas", "que horas são"
    "action": function(texto, tag, index) {

      var d = new Date();
      var data_hora = d.getHours() + " horas, " + d.getMinutes() + " minutos e " + d.getSeconds() + " segundos. ";
      var data_hora = d.getHours() + " horas e " + d.getMinutes() + " minutos.";
      console.log(data_hora);

      falar("São " + data_hora);

    }
  },


  "tempo": {
    "nome": "Tempo",
    "alias": [/tempo em/g], //"tempo em"
    "action": function(texto, tag, index) {

      var dados = texto.split(tag);
      window.ultima_cidade = dados[dados.length-1];

      $.getJSON("http://api.openweathermap.org/data/2.5/weather?lang=pt&units=metric&q="+window.ultima_cidade+",%20BR", function(data){

        if (!data.main) {
          falar("não encontrei a cidade " + window.ultima_cidade + ". Desculpe.");
          window.ultima_cidade = null;
          return;
        }
        var tempo = Math.round(data.main.temp);
        var status = data.weather[0].description;
        var cidade = data.name;

        falar(tempo+" gráus em "+cidade+", com "+status+".");
      });
    }
  },


  "lista_presenca": {
    "nome": "Lista de presença",
    "alias": [/lista de presença/g], //"lista de presença"
    "action": function(texto, tag, index) {







    }
  },

};



var limpa_comandos = function(){
  comandos_atuais = [];
};


var inicia_comandos = function(){
  limpa_comandos();
  comandos_atuais.push(comandos["oi_camara"]);
  comandos_atuais.push(comandos["presenca_deputados"]);


}


// gerar tabela de tags (utilizadas para encontrar os comandos)
/*
for (var idx in comandos) {
  var comando = comandos[idx];

  for (var idx_alias in comando.alias) {
    var tag = comando.alias[idx_alias];
    if (!tags[tag]) {
      tags[tag] = idx;
    }
  }
}

*/





function executar_comando(texto) {

    for (var idx in comandos_atuais) {
      var comando = comandos_atuais[idx];
      for (var idx_alias in comando.alias) {
        var alias = comando.alias[idx_alias];
        console.log(alias);
        if (alias.test(texto)) {
          //if (comando_ativo || !comando.need_comando_ativo) {
            comando_off(false);
            regex_result = alias.exec(texto);
            console.log("COMANDO: " + comando.nome);
            comando.action(texto, comando, regex_result && regex_result.length > 0 ? regex_result[0]: regex_result);
            return true;
          //}
        }
      }
    }

    return false;


/*


    for (var tag in tags) {
      var index = texto.indexOf(tag) ;
      if (index != -1) {
        //achou comando!
        var comando = comandos[tags[tag]];
        if (comando_ativo || !comando.need_comando_ativo) {
          console.log("COMANDO: " + comando.nome);
          comando.action(texto, tag, index);
          return true;
        }
      }
    }

*/
/*

          case "me chama de":
          case "me chamam de":
          case "chamar de":

            NOME = args.substring(args.indexOf(comando)+comando.length+1).trim();
            console.log("novo nome ", NOME);

            if (NOME == "filho da puta") {
              falar("nem precisa pedir.");

            } else {
              console.log(args);
              falar("tudo bem.");
            }
            return;
            break;


          case "não me chama de nada":
          case "não me chame de nada":
            NOME = "";
            falar("melhor assim do que perder o respeito, né?");
            return;
            break;





          case "até mais":
          case "tchau":
          case "tiau":
            falar("tô indo nessa, galera. Qualquer dúvida pode perguntar pro Leão!");
            window.slidedeck.loadSlide(slides.indexOf("duvidas")+1);
            return;
            break;



*/


}



function falar(texto, callback) {
  //acender luz azul
  //set_lamp_state(LAMPADA_LUMINARIA, true, 55000, 255, 255, "none"); //45000

  console.log("AUDIO: ", texto);

  var audio_especial = new Audio();
  audio_especial.addEventListener('ended', function(){
    if (callback) { 
      callback();
    } else {
      //apagar luzes
      comando_off();
    }
  });

  //http://translate.google.com.br/translate_tts?ie=UTF-8&q=teste&tl=pt-BR&total=1&idx=0&textlen=5

  audio_especial.src = "http://translate.google.com.br/translate_tts?ie=UTF-8&tl=pt&total="+texto.length+"&q=" + texto;
  console.log(audio_especial.src);
  audio_especial.play();

}


var recognizing = false;
var ignore_onend = false;



var recognition = new webkitSpeechRecognition();

recognition.continuous = true;
recognition.interimResults = false;
recognition.lang = "pt-BR";
recognition.maxAlternatives = 3;


recognition.onstart = function() {
  recognizing = true;
  console.log("reconhecendo...");
};

recognition.onerror = function(event) {
  console.log("ERRO!", event.error);
  

  if (comando_ativo) { //event.error == "no-speech" && 

    //TODO: repetir ultimo comando
    //comando_off(true);

    //audio_inativo.currentTime = 0;
    //audio_inativo.play();
  }

  /*
  if (event.error == 'no-speech') {
    start_img.src = 'mic.gif';
    showInfo('info_no_speech');
    ignore_onend = true;
  }
  if (event.error == 'audio-capture') {
    start_img.src = 'mic.gif';
    showInfo('info_no_microphone');
    ignore_onend = true;
  }
  if (event.error == 'not-allowed') {
    if (event.timeStamp - start_timestamp < 100) {
      showInfo('info_blocked');
    } else {
      showInfo('info_denied');
    }
    ignore_onend = true;
  }
  */

};

recognition.onend = function() {
  console.log("onEND!");


  recognizing = false;
  if (ignore_onend) {
    return;
  }

  recognition.start();

};

recognition.onresult = function(event) {

  // verificar comandos aqui
  for (var i = event.resultIndex; i < event.results.length; ++i) {
    var r = event.results[i];
    for (var j = 0; j< r.length; j++) {
      console.log(i, j, r[j])


      if (executar_comando(r[j].transcript.trim()))
        return;

      /*
      //TODO: MUDAR!!!
      for (indice in comandos) {
        var comando = comandos[indice];

        if (r[j].transcript.indexOf(comando)!= -1) {
          console.log("COMANDO: " + comando);
          executar_comando(comando, );
          return;

        }
      }
      */

    }


    /*
    if (comando_ativo) {
      audio_inativo.currentTime = 0;
      audio_inativo.play();
    }
    comando_off();
    */

  }

  falar("não entendi o que você disse.");


};




inicia_comandos();
recognition.start();



//carrega_presenca(new Date());


var carrega_presenca = function(data) {
  //$.parseXML
  selecao_data = data;

  falar("Aguarde... Estou verificando a presença do dia " + formatDate(selecao_data), function(){


    var numLegislatura = "54";
    var data = formatDate(selecao_data);
    var url = "http://www.camara.gov.br/SitCamaraWS/sessoesreunioes.asmx/ListarPresencasDia?data="+data+"&numLegislatura="+numLegislatura+"&numMatriculaParlamentar=&siglaPartido=&siglaUF=";
    $.get(url, function(xml){
      console.log("carregou");
      window.presenca = JSON.parse(xml2json(xml, ""));

      if (!presenca.dia) {
        falar("não encontrei nenhum registro de presença.");
        inicia_comandos();
        return;
      }

      total_presentes = 0;
      total_presenca_partido = {};
      total_presenca_estado = {};




      for (idx_parlamentar in presenca.dia.parlamentares.parlamentar) {
        var parlamentar = presenca.dia.parlamentares.parlamentar[idx_parlamentar];
        if (!total_presenca_partido[parlamentar.siglaPartido]) 
          total_presenca_partido[parlamentar.siglaPartido] = { "presentes": 0, "ausentes": 0 };

        if (!total_presenca_estado[parlamentar.siglaUF]) 
          total_presenca_estado[parlamentar.siglaUF] = { "presentes": 0, "ausentes": 0};




        if (parlamentar.descricaoFrequenciaDia == "Presença") {
          total_presentes++;

          total_presenca_partido[parlamentar.siglaPartido]["presente"]++;
          total_presenca_estado[parlamentar.siglaUF]["presente"]++;

        } else {

          total_presenca_partido[parlamentar.siglaPartido]["ausentes"]++;
          total_presenca_estado[parlamentar.siglaUF]["ausentes"]++;

        }
      }


      console.log(total_presenca_partido, total_presenca_estado);


      switch(total_presentes) {
        case 0: total_presentes = "nenhum parlamentar presente."; break;
        case 1: total_presentes = total_presentes + " parlamentar presente"; break;
        default:
          total_presentes = total_presentes + " parlamentares presentes";
      }


      falar("No dia " + presenca.dia.data + " tivemos " + presenca.dia.qtdeSessoesDia + " sessões, com " + total_presentes);

      inicia_comandos();

    });


  });






};
