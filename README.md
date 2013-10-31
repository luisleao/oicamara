"oi câmara"
===========

Desenvolvido no 1º Hackathon da Câmara Federal em 29/10/2013

![screenshot](https://raw.github.com/luisleao/oicamara/master/docs/screen_0.png)


#Descrição do aplicativo
Este aplicativo é uma plataforma interativa focada em acessibilidade para fala de informações baseadas em dados abertos.
Entendemos que o formato e a forma de acesso aos dados abertos representa a vontade política de incluir a participação cidadã do processo legislativo. Mais do que nunca, pensar em acessibilidade e nas diversas possibilidades de tornar as informações acessíveis e compreensíveis para a população deve fazer parte dessa vontade.

Com este aplicativo quero demostrar como fazer isso, utilizando as tecnologias de reconhecimento de fala para que qualquer pessoa possa saber informações da Câmara Federal.

Além disso, este aplicativo pode ser remixado com poucas alterações e para utilizar outras informações.


Você pode utilizá-lo de duas formas:
*como uma instalação interativa, focada em acessibilidade
*como um aplicativo interativo

Este é um aplicativo Chrome (Chrome Packaged App)!
Para distribuí-lo, publique o código fonte (pasta webapp compactada) na [https://chrome.google.com/webstore/developer/dashboard](Chrome Web Store). Você também pode adicionar manualmente o através do link "chrome://extensions", desde que o "modo de desenvolvedor" esteja ativo.



#Como foi desenvolvivo?
A API de reconhecimento de voz (Web Speech API), documentada no w3c em https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html foi implementada no navegador Google Chrome e disponibilizada ao público no início de 2013. Ela representa uma mudança no modelo de uso do reconhecimento de voz em sites web, permitindo o uso totalmente através de javascript, sem vínculo com a interface. Assim, novas possibilidades surgiram, como demonstrado nesse aplicativo.

Desde então, tenho estudado formas de uso dessa API, integrando inclusive com automação residencial (apresentação "oi casa" realizada no Meetup de Front-End dia 26/08/2013 do Google Developers Group, capítulo São Paulo, na qual sou um dos coordenadores).

O código do "oi casa" pode ser acessado em https://github.com/luisleao/oicasa


##O que mudou?
A principal diferença do "oi casa" para o "oi câmara" é a forma como foi implementada a lista de comandos, agora baseada em expressões regulares e com uma função de callback que é acionada quando uma das funções valida a transcrição encontrada. Além disso, Não há necessidade de falar o comando de ativação "oi câmara" para executar os comandos raiz, mas lembre-se de que é importante criar um comando com mais de uma palavra para que não ocorra. 

Outra diferença importante é que o sistema agora ignora as transcrição enquanto estiver falando algum texto. Isso significa que o próprio sistema não vai se retroalimentar e gerar falsos pedidos.


##Os dados da Câmara Federal
Nesse primeiro momento utilizamos os dados da Câmara Federal para essa instalação. Ele consulta, na versão beta, a pauta do plenário e a presença dos parlamentares em uma determinada data.

Ainda tenho previsto a implementação da tramitação por dia, além da consulta do regimento interno.

Como um aplicativo acessível, seria importante conseguir incluir o streaming da Rádio Câmara para exibir o áudio da plenária (quando alguma estiver em andamento).




#Quero remixar este aplicativo e utilizar outros dados
No arquivo main.js você pode editar a variável "comandos", ela é um dicionário que segue o modelo abaixo.

```
	{
		"nome": "NOME DO COMANDO A SER EXECUTADO",
		"alias": [/oi câmara/g, new RegExp("artigo\\s([\\d]*)º?\\sdo\\sregimento")], //expressões regulares
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


```
	falar(TEXTO, callback); //para texto simples - até 100 caracteres.
	falar_mais(ARRAY_DE_STRINGS, callback); //textos longos.

	divide_texto_em_100(TEXTO_LONGO); //retorna um array com as palavras separadas em grupos de até 100 caracteres
	plural_ou_nenhum(NUMERO, STRING_SINGULAR, STRING_PLURAL, STRING_ZERO) //para escrever textos com variação de número
```





Para retomar o reconhecimento de voz, utilize os comandos abaixo





#tecnologias utilizadas
webspeech API: padrão aberto para implementação de reconhecimento de voz, documentado no w3c













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

