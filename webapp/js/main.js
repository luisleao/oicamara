
var active = true;
var comando_ativo = false;
var falando = false;


var last_talk = null;





var audio_ativo = new Audio();
var audio_inativo = new Audio();

audio_ativo.src = "media/ativo.mp3";
audio_inativo.src = "media/inativo.mp3";






var comando_on = function() {
  // indicativo visual ON
  comando_ativo = true;
  audio_ativo.currentTime = 0;
  audio_ativo.play();

  $("body").addClass("ativo");
};

var comando_off = function(nao_inicia) {
  // indicativo visual OFF
  comando_ativo = false;
  $("body").removeClass("ativo");
  if (!nao_inicia) inicia_comandos();
};




var COMANDO_ATIVACAO = "Diga, oi câmara, para ouvir as opções possíveis.";






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
  $(".relogio").text(data_hora);


  // força retomar o reconhecimento de voz
  if (!falando && !recognizing || (last_talk && Date.now() - last_talk > 10000)) {
    falando = false; last_talk = null;
    console.log("REINICIANDO RECONHECIMENTO!");
    inicia_comandos();
    recognition.start();
  }

};

// intervalo para relogio na tela e verificacao de erros no TTS
setInterval(set_relogio, 1000);


var selecao_data;
var selecao_data_mes;
var selecao_data_dia;


var regex_mes = [new RegExp("(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)")];
var regex_dia = [new RegExp("(primeiro)"), new RegExp("(\\d{1,2})")]; //([12]?[0-9]|3[0-1])




/* * * * * * * * * * * * * * * * * * * *  CONFIGURANDO WEBSPEECH  * * * * * * * * * * * * * * * * * * * */

lang = "pt-BR";



var comandos_atuais = [];

var tags = {};

var comandos = {


  "oi_camara": {
    "nome": "Comando inicial",
    "alias": [/oi câmara/g, /oi câmera/g], //"oi câmara", "oi câmera",
    "action": function(texto, tag, regex_result) {

      var textos = [
        "Qual informação você gostaria de saber sobre a câmara?",
        "Projetos de lei, presença dos deputados ou pauta do plenário.",
        "Se quiser ouvir informações sobre tempo, diga por exemplo, tempo em brasília.",
      ];

      falar_mais(textos, function() {

        inicia_comandos();
        comandos_atuais.unshift(comandos["cancelar"]);
        comando_on();
      
      });

    }
  },


  "cancelar": {
    "nome": "Cancelar comando",
    "alias": [/cancelar/g, /cancela/g, /não/g], //"cancelar", "cancela"
    "action": function(texto, tag, regex_result) {
      comando_off();
      falar(COMANDO_ATIVACAO);
    }
  },


 /* ************************************************************************************************************************ */
 /* ESPECIAIS */

 "extrato_legislativo": {
    "nome": "Extrato Legislativo",
    "alias": [/extrato legislativo/g, /estrato legislativa/g, /estrato legislativo/g, /estrato legislativa/g],
    "action": function(texto, tag, regex_result) {
      falar_mais(["Aguarde. Solicitei a impressão do extrato legislativo...", COMANDO_ATIVACAO], function(){
        inicia_comandos();
      });
    }
 },


 "leitura_artigo_regimento": {
    "nome": "Extrato Legislativo",
    "alias": [new RegExp("artigo\\s([\\d]*)º?\\sdo\\sregimento")],
    "action": function(texto, tag, regex_result) {

      var texto = [];
      if (regex_result > 282) {
        texto.push("O regimento interno da Câmara possui apenas 282 artigos.");
        texto.push("De qualquer forma, esta função ainda não foi implementada");
      } else {
        texto.push("Não consigo ler o artigo "+regex_result+"º do regimento.");
        texto.push("Esta função ainda não foi implementada");
      }
      texto.push(COMANDO_ATIVACAO);

      falar_mais(texto, function(){
        inicia_comandos();
      });
    }
 },


 /* ************************************************************************************************************************ */


 "processo_legislativo": {
    "nome": "Processo Legislativo",
    "alias": [/processo legislativo/g, /processo/g, /legislativo/g], 
    "action": function(texto, tag, regex_result) {

      falar("Para o processo legislativo você quer quais informações?", function(){
        falar("Você pode saber sobre andamento dos projetos de lei, presença dos deputados ou pauta do plenário.", function(){

          inicia_comandos();
          comandos_atuais.unshift(comandos["projetos_de_lei"]);
          comandos_atuais.unshift(comandos["presenca_deputados"]);
          comandos_atuais.unshift(comandos["pauta_plenario"]);
          comando_on();

        });
      });

    }
 },

 "projetos_de_lei":{
    "nome": "projetos_de_lei",
    "alias": [/projeto de lei/g, /projetos de lei/g], 
    "action": function() {

      var textos = [
        "Na versão beta, esta função ainda não foi implementada.",
        COMANDO_ATIVACAO
      ];
      falar_mais(textos, function(){
        inicia_comandos();
      });

    }
 },



 /* ************************************************************************************************************************ */



 "presenca_deputados":{
    "nome": "presenca_deputados",
    "alias": [/presença dos deputados/g,/presença/g], 
    "action": function() {
      selecao_data = selecao_data_mes = selecao_data_dia = null;
      falar("Você quer a presença dos deputados de hoje, ontem ou de qual mês?", function(){
        inicia_comandos();
        comandos_atuais.unshift(comandos["presenca_hojeontem"]);
        comandos_atuais.unshift(comandos["presenca_mes"]);
        comandos_atuais.unshift(comandos["cancelar"]);
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

      selecao_data_mes = regex_result;
      falar("Qual dia do mês de " + regex_result + "?", function(){
        inicia_comandos();
        comandos_atuais.unshift(comandos["presenca_dia"]);
        comandos_atuais.unshift(comandos["cancelar"]);
        comando_on();
      });

    }
 },

 "presenca_dia": {
    "nome": "presenca_dia",
    "alias": regex_dia, 
    "action": function(texto, tag, regex_result) {

      if (regex_result == "primeiro")
        regex_result = 1;

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

    }
 },


 /* ************************************************************************************************************************ */



 "pauta_plenario":{
    "nome": "pauta_plenario",
    "alias": [/pauta do plenário/g, /pauta da plenária/g, /pauta/g, /plenário/g, /plenária/g], 
    "action": function(texto, tag, regex_result) {

      falar("Vou falar sobre a pauta do plenário. Você quer saber sobre a pauta de hoje, ontem ou de qual mês?", function(){
        inicia_comandos();
        comandos_atuais.unshift(comandos["pauta_hojeontem"]);
        comandos_atuais.unshift(comandos["pauta_mes"]);
        comandos_atuais.unshift(comandos["cancelar"]);
        comando_on();
      });
      inicia_comandos();

    }
 },


 "pauta_hojeontem": {
  "nome": "pauta_hojeontem",
  "alias": [new RegExp("(hoje|ontem)")],
  "action": function(texto, tag, regex_result) {
    var data = new Date();
    switch(regex_result) {
      case "ontem": data.setDate(data.getDate() - 1); break;
    }

    carrega_pauta(data); 
  }
 },

 "pauta_mes": {
    "nome": "pauta_mes",
    "alias": regex_mes, 
    "action": function(texto, tag, regex_result) {

      selecao_data_mes = regex_result;
      falar("Qual dia do mês de " + regex_result + "?", function(){
        inicia_comandos();
        comandos_atuais.unshift(comandos["pauta_dia"]);
        comandos_atuais.unshift(comandos["cancelar"]);
        comando_on();
      });

    }
 },

 "pauta_dia": {
    "nome": "pauta_dia",
    "alias": regex_dia, 
    "action": function(texto, tag, regex_result) {

      if (regex_result == "primeiro")
        regex_result = 1;

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
      carrega_pauta(data);

    }
 },









 /* ************************************************************************************************************************ */


 "curiosidades": {
    "nome": "curiosidades",
    "alias": [/curiosidade/g, /curiozidade/g], 
    "action": function(texto, tag, regex_result) {

      var idx = Math.floor((Math.random()*curiosidades.length));
      falar_mais(divide_texto_em_100(curiosidades[idx]), function(){

        falar("Você gostaria de ouvir mais uma curiosidade ou quer retornar?", function(){
          inicia_comandos();
          comandos_atuais.unshift({
            "nome": "mais_uma_curiosidade",
            "alias": [/sim/g, /quero/g, /mais uma/g],
            "action": function() {
              comandos["curiosidades"].action()
            }
          });
          
          comandos_atuais.unshift({
            "nome": "retornar_oicamara",
            "alias": [/não/g, /retornar/g],
            "action": function(){
              comandos["oi_camara"].action()
            }
          });

          comando_on();
        });

      });

    }
 },



 /* ************************************************************************************************************************ */


 "horas": {
    "nome": "Horas do Dia",
    "alias": [/quantas horas/g, /que horas são/g, /oras/g], //"quantas horas", "que horas são"
    "action": function(texto, tag, regex_result) {

      var d = new Date();
      var data_hora = d.getHours() + " horas, " + d.getMinutes() + " minutos e " + d.getSeconds() + " segundos. ";
      var data_hora = d.getHours() + " horas e " + d.getMinutes() + " minutos.";
      console.log(data_hora);

      falar("São " + data_hora + ". " + COMANDO_ATIVACAO);

    }
  },


  "tempo": {
    "nome": "Tempo",
    "alias": [new RegExp("tempo em ([\\W\\w]*)")], //"tempo em"
    "action": function(texto, tag, regex_result) {

      //var dados = regex_result; //texto.split(tag);
      window.ultima_cidade = regex_result; //dados[dados.length-1];

      var url = "http://api.openweathermap.org/data/2.5/weather?lang=pt&units=metric&q="+encodeURI(window.ultima_cidade)+",%20BR";
      console.log(url);
      $.getJSON(url, function(data){

        if (!data.main) {
          falar("não encontrei a cidade " + window.ultima_cidade + ". Desculpe.");
          window.ultima_cidade = null;
          return;
        }
        var tempo = Math.round(data.main.temp);
        var status = data.weather[0].description;
        var cidade = data.name != "" ? data.name : window.ultima_cidade;

        falar("em "+cidade+", " +tempo+" gráus com "+status+". " + COMANDO_ATIVACAO);
      });
    }
  },



};



var limpa_comandos = function(){
  comandos_atuais = [];
};


var inicia_comandos = function(){
  limpa_comandos();
  comandos_atuais.unshift(comandos["oi_camara"]);

  comandos_atuais.unshift(comandos["projetos_de_lei"]);
  comandos_atuais.unshift(comandos["presenca_deputados"]);
  comandos_atuais.unshift(comandos["pauta_plenario"]);
  comandos_atuais.unshift(comandos["extrato_legislativo"]);
  comandos_atuais.unshift(comandos["leitura_artigo_regimento"]);
  comandos_atuais.unshift(comandos["curiosidades"]);


  comandos_atuais.unshift(comandos["horas"]);
  comandos_atuais.unshift(comandos["tempo"]);

}








function executar_comando(texto) {

    for (var idx in comandos_atuais) {
      var comando = comandos_atuais[idx];
      for (var idx_alias in comando.alias) {
        var alias = comando.alias[idx_alias];
        //console.log(alias);
        if (alias.test(texto)) {
          //if (comando_ativo || !comando.need_comando_ativo) {
            comando_off(false);
            regex_result = alias.exec(texto);
            comando.action(texto, comando, regex_result && regex_result.length > 0 ? regex_result[1]: regex_result);
            return true;
          //}
        }
      }
    }

    return false;

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

  if (comando_ativo) { 
    //comando_off(true);
    //audio_inativo.currentTime = 0;
    //audio_inativo.play();
  }

  /*
  tratamento de erros de reconhecimento, se necessario
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
  //if (ignore_onend) {
  //  return;
  //}
  //recognition.start();

};

recognition.onresult = function(event) {

  if (falando) {
    console.log("detectou alguma coisa mas ainda está falando há " + (Date.now() - last_talk));
    return;
  }
  console.log("Detectei alguma coisa", event.results);

  // verificar comandos aqui
  for (var i = event.resultIndex; i < event.results.length; ++i) {
    var r = event.results[i];
    for (var j = 0; j< r.length; j++) {
      //console.log(i, j, r[j])
      if (executar_comando(r[j].transcript.trim()))
        return;

    }

    /*
    if (comando_ativo) {
      audio_inativo.currentTime = 0;
      audio_inativo.play();
    }
    comando_off();
    */

  }
  if (comando_ativo) {
    falar("não entendi o que você disse. " + COMANDO_ATIVACAO);
  }


};




/* ************************************************************************************************************************ */
// inicialização do sistema acontece aqui!
falar(COMANDO_ATIVACAO, function(){
  $("body").css("opacity", 1);
  inicia_comandos();
  recognition.start();
});
/* ************************************************************************************************************************ */
















var carrega_pauta = function(data) {
  selecao_data = data;

  console.log(data);

  falar("Aguarde... Estou verificando a pauta do plenário no dia " + formatDate(selecao_data), function(){
  
    var data = formatDate(selecao_data);
    var ID_ORGAO = "180";

    var url = "http://www.camara.gov.br/SitCamaraWS/Orgaos.asmx/ObterPauta?IDOrgao="+ID_ORGAO+"&datIni="+data+"&datFim="+data+"";
    console.log(url);

    $.get(url, function(xml){

      window.pauta = JSON.parse(xml2json(xml, ""));

      //var texto_detalhe = [];
      window.texto_detalhe = [];

      if (!pauta.pauta.reuniao) {
        texto_detalhe.push("não encontrei nenhum registro de pauta.");
        texto_detalhe.push("Lembre-se que normalmente, a plenária se reúne de segunda a sexta.");

      } else {
        pauta = pauta.pauta;
        var data = pauta["@dataInicial"];

        texto_detalhe.push("A pauta do dia "+data+" possui "+plural_ou_nenhum(pauta.reuniao.length, pauta.reuniao.length + " reunião", pauta.reuniao.length+" reuniões", "nenhuma reunião"))

        for (idx_reuniao in pauta.reuniao) {

          var reuniao = pauta.reuniao[idx_reuniao];

          if (reuniao.estado.trim().toLowerCase() == "em andamento") {
            texto_detalhe.push(" desde as " + reuniao.horario + " temos " + reuniao.tipo.trim() + " " + reuniao.estado.trim() );
          } else {
            texto_detalhe.push("as " + reuniao.horario + " tivemos " + reuniao.tipo.trim() + " " + reuniao.estado.trim());
          }



          if (reuniao.proposicoes && reuniao.proposicoes) {

            var proposicao = null;
            var total_proposicoes = 0;
            if ($.isArray(reuniao.proposicoes.proposicao)) {
              //tem varias proposicoes
              var proposicoes = reuniao.proposicoes.length ? reuniao.proposicoes : reuniao.proposicoes.proposicao;

              total_proposicoes = proposicoes.length;
              var idx_proposicao = Math.floor((Math.random()*proposicoes.length));
              proposicao = proposicoes[idx_proposicao];
              console.log("VARIAS PROPOSICOES - ESCOLHI:", proposicao);


            } else {
              //tem apenas uma proposicao
              total_proposicoes = 1;
              proposicao = reuniao.proposicoes.proposicao;
              console.log("UMA PROPOSICAO", proposicao);
            }

            if (reuniao.estado.trim().toLowerCase() != "cancelada") {
              texto_detalhe.push("nesta sessão " + plural_ou_nenhum(total_proposicoes, "foi discutida", "foram discutidas", "não foi discutida") + " " +
                plural_ou_nenhum(total_proposicoes, total_proposicoes, total_proposicoes, "nenhuma") + " " +
                plural_ou_nenhum(total_proposicoes, "proposição", "proposições", "proposição"));
            } else {
              texto_detalhe.push("nesta sessão " + plural_ou_nenhum(total_proposicoes, "deveria ser discutido", "deveriam ser discutidos", "não foi discutida") + " " +
                plural_ou_nenhum(total_proposicoes, total_proposicoes, total_proposicoes, "nenhuma") + " " +
                plural_ou_nenhum(total_proposicoes, "proposição", "proposições", "proposição"));
            }


            if (proposicao) {
              texto_detalhe.push(
                plural_ou_nenhum(
                  total_proposicoes, "a ", "por exemplo a ", "")
                  + proposicao.sigla.replace("/", " de "));
              texto_detalhe = texto_detalhe.concat(divide_texto_em_100("com a seguinte ementa: " + proposicao.ementa));
              //console.log(texto_detalhe);
            }

          } else {
            texto_detalhe.push("nenhuma proposição encontrada para essa sessão.");
          }

        }


      }

      texto_detalhe.push("Esta foi a pauta do dia. " + COMANDO_ATIVACAO); // "Que outra informação você gostaria de saber sobre a câmara? Processo legislativo ou curiosidades?")

      falar_mais(texto_detalhe, function(){
        inicia_comandos();
        //comando_on();
      });

    });


  });  

};






var carrega_presenca = function(data) {
  //$.parseXML
  selecao_data = data;

  falar("Aguarde... Estou verificando a presença no dia " + formatDate(selecao_data), function(){


    var numLegislatura = "54";
    var data = formatDate(selecao_data);
    var url = "http://www.camara.gov.br/SitCamaraWS/sessoesreunioes.asmx/ListarPresencasDia?data="+data+"&numLegislatura="+numLegislatura+"&numMatriculaParlamentar=&siglaPartido=&siglaUF=";
    $.get(url, function(xml){
      console.log("carregou");
      window.presenca = JSON.parse(xml2json(xml, ""));

      if (!presenca.dia) {
        falar_mais(["não encontrei nenhum registro de presença.", "Lembre-se que normalmente, a plenária se reúne de segunda a sexta."], function(){
          inicia_comandos();
        });
        return;
      }

      total_presentes = 0;
      total_presenca_partido = {};
      total_presenca_estado = {};

      parlamentares_presentes = [];
      parlamentares_ausentes = [];



      for (idx_parlamentar in presenca.dia.parlamentares.parlamentar) {
        var parlamentar = presenca.dia.parlamentares.parlamentar[idx_parlamentar];

        var nome_parlamentar = parlamentar.nomeParlamentar.replace("-", " do partido ").replace("/", " ");
        if (!total_presenca_partido[parlamentar.siglaPartido]) 
          total_presenca_partido[parlamentar.siglaPartido] = { "presentes": 0, "ausentes": 0 };

        if (!total_presenca_estado[parlamentar.siglaUF]) 
          total_presenca_estado[parlamentar.siglaUF] = { "presentes": 0, "ausentes": 0};

        if (parlamentar.descricaoFrequenciaDia == "Presença") {
          total_presentes++;

          total_presenca_partido[parlamentar.siglaPartido]["presentes"]++;
          total_presenca_estado[parlamentar.siglaUF]["presentes"]++;

          parlamentares_presentes.push(nome_parlamentar);

        } else {

          total_presenca_partido[parlamentar.siglaPartido]["ausentes"]++;
          total_presenca_estado[parlamentar.siglaUF]["ausentes"]++;

          parlamentares_ausentes.push(nome_parlamentar);

        }
      }



      console.log(total_presenca_partido, total_presenca_estado, parlamentares_presentes, parlamentares_ausentes);


      switch(total_presentes) {
        case 0: total_presentes = "nenhum parlamentar presente."; break;
        case 1: total_presentes = total_presentes + " parlamentar presente"; break;
        default:
          total_presentes = total_presentes + " parlamentares presentes";
      }



      var texto_detalhe = [];

      texto_detalhe.push("No dia " + presenca.dia.data + " tivemos " + presenca.dia.qtdeSessoesDia + " sessões, com " + total_presentes);

      if (parlamentares_presentes.length > 0) {
        parlamentar_presente = parlamentares_presentes[Math.floor((Math.random()*parlamentares_presentes.length))];
        texto_detalhe.push("entre os presentes estava o deputado " + parlamentar_presente);
      }
      if (parlamentares_ausentes.length > 0) {
        parlamentar_ausente = parlamentares_ausentes[Math.floor((Math.random()*parlamentares_ausentes.length))];
        texto_detalhe.push("entre os ausentes estava o deputado " + parlamentar_ausente);
      }


      falar_mais(texto_detalhe, function(){
        inicia_comandos();
        falar("Esta foi a lista de presença. " + COMANDO_ATIVACAO);
      });




    });


  });



};
