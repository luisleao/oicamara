"oi câmara"
===========

Desenvolvido no [**1º Hackathon da Câmara Federal**](http://www2.camara.leg.br/responsabilidade-social/edulegislativa/hackathon/hackathon-maratona-hacker) em 29/10/2013

![screenshot](https://raw.github.com/luisleao/oicamara/master/docs/screen_0.png)


#Descrição do aplicativo
Este aplicativo é uma **plataforma interativa focada em acessibilidade** das informações baseadas em dados abertos, a ser a utilizado por pessoas com visão comprometida.

Entendemos que o formato e a **forma de acesso aos dados abertos representa a vontade política** de incluir a participação cidadã do processo legislativo. Mais do que nunca, pensar em acessibilidade e nas diversas possibilidades de tornar as informações acessíveis e compreensíveis para a população deve fazer parte dessa vontade.

Com este aplicativo quero demostrar como fazer isso, utilizando as tecnologias de **reconhecimento de fala** para que qualquer pessoa possa saber informações da Câmara Federal.

Além disso, este aplicativo pode ser remixado com poucas alterações e para utilizar outras informações.


Você pode utilizá-lo de duas formas:
- como uma instalação interativa, focada em acessibilidade
- como um aplicativo interativo

Este é um aplicativo Chrome (Chrome Packaged App)!
Para distribuí-lo, publique o código fonte (pasta webapp compactada) na [Chrome Web Store](https://chrome.google.com/webstore/developer/dashboard). Você também pode adicionar manualmente o através do link "chrome://extensions", desde que o "modo de desenvolvedor" esteja ativo.


Como foi desenvolvivo?
----------------------

A **API de reconhecimento de voz** (*Web Speech API*), [documentada no w3c](https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html) foi implementada no navegador Google Chrome (a partir da versão 25) e disponibilizada ao público no início de 2013. Ela representa uma mudança no modelo de uso do reconhecimento de voz em sites web, permitindo o uso totalmente através de javascript, sem vínculo com a interface. Assim, novas possibilidades surgiram, como demonstrado nesse aplicativo.

Para exemplos de uso dessa API acesse http://updates.html5rocks.com/2013/01/Voice-Driven-Web-Apps-Introduction-to-the-Web-Speech-API

Desde então, tenho estudado formas de uso dessa API, integrando inclusive com **automação residencial** (apresentação "oi casa" realizada no Meetup de Front-End dia 26/08/2013 do [Google Developers Group, capítulo São Paulo](https://developers.google.com/groups/chapter/102774871279745079139/), na qual sou um dos coordenadores).

O código do "oi casa" pode ser acessado em https://github.com/luisleao/oicasa


##O que mudou?
A principal diferença do "oi casa" para o "oi câmara" é a forma como foi implementada a lista de comandos, agora baseada em expressões regulares e com uma função de *callback*, que é acionada quando uma das funções valida a transcrição encontrada. Ele permite também criar comandos hierárquicos (por exemplo: pedir confirmações ou informações complementares). Além disso, não há necessidade de falar o comando de ativação "oi câmara" para executar os comandos raiz (ele funciona como um comando de ajuda e quando acionado indica que o usuário deve falar um dos comandos previstos), mas lembre-se de que é importante criar um comando com mais de uma palavra para que não ocorra reconhecimentos indevidos. 

Outra diferença importante é que o sistema agora ignora as transcrição enquanto estiver falando algum texto. Isso significa que o próprio sistema não vai se retroalimentar e gerar falsos comandos.


##Os dados da Câmara Federal
Nesse primeiro momento utilizamos os [dados da Câmara Federal](http://www2.camara.leg.br/transparencia/dados-abertos) para essa instalação.
Ele consulta, na versão beta, a **pauta do plenário**, a **presença dos parlamentares** em uma determinada data, além de **curiosidades sobre a casa**.

Acreditamos que mais informações podem ser adicionadas, relacionadas ao processo legislativo e cotas parlamentares, mas isso significará 

Ainda tenho previsto a implementação da tramitação por dia, além da consulta do regimento interno.



Quero remixar este aplicativo e utilizar outros dados
-----------------------------------------------------


Baixe este repositório e altera os arquivos "main.js". Nele você pode editar a variável "comandos", ela é um dicionário e cada chave segue o modelo abaixo.

```javascript
{
	"nome": "NOME DO COMANDO A SER EXECUTADO",
	"alias": [/oi câmara/g, new RegExp("artigo\\s([\\d]**)º?\\sdo\\sregimento")], //expressões regulares
	"action": function(texto, tag, regex_result) {
		
		//texto = texto encontrado
		//tag = expressão regular que validou o texto
		//regex_result = último valor da matrix de resultado da expressão regular (se tiver usado grupos)

		//... insira aqui seu código de retorno

	}
}
```


Crie quantos itens desejar e não esqueça de incluí-los na função "inicia_comandos". Ela funciona como a raiz de comandos da sua aplicação e contém as principais palavras-chave que serão acionadas ao receber as transcrições da API de reconhecimento de voz.

Se quiser que seja falado algum texto utilize uma das funções conforme a seguir:


```javascript
falar(TEXTO, callback); //para texto simples - até 100 caracteres.
falar_mais(ARRAY_DE_STRINGS, callback); //textos longos.

divide_texto_em_100(TEXTO_LONGO); //retorna um array com as palavras separadas em grupos de até 100 caracteres
plural_ou_nenhum(NUMERO, STRING_SINGULAR, STRING_PLURAL, STRING_ZERO) //para escrever textos com variação de número
```

Para retomar o reconhecimento de voz, utilize os comandos abaixo
```javascript
inicia_comandos(); //para reativar a lista de comandos disponíveis
comando_on(); //ativa a repeção imediata de comandos, tocando um aviso sonoro e indicar para o usuário que ele deve falar um comando IMEDIATAMENTE
comando_off(); //desativa a recepção de comandos

```


##Dicas de acessibilidade
- lembre-se de adicionar a mensagem final "Diga, oi câmara, para ouvir as opções possíveis.". Ela indica que o comando foi finalizado e que ele está no início do programa e pode solicitar um novo comando.
- ao criar comandos com hierarquia, sempre que possível indique a informação do passo anterior. Para que ele lembre o que falou e complemente a informação necessária para o comando.
- não crie níveis muito completos!





#tecnologias utilizadas
- webspeech API: padrão aberto para implementação de reconhecimento de voz, documentado no w3c
- chrome packaged app: para criação de um aplicativo web, com funcionalidades de aplicativo nativo
- google translate TTS: (API não documentada)







LICENSE
=======

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

