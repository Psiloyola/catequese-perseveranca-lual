# Estados automáticos do site

Este commit adapta o conteúdo do site conforme a data do 1º Lual da Perseverança.

## Estados configurados

### Antes do evento

Até 7 de agosto de 2026:

- apresenta o Lual como um encontro que está chegando;
- mostra contagem regressiva;
- mantém a seção dos santos disponível;
- bloqueia fotos, vídeos, pequenos hábitos e mural com uma mensagem de prévia;
- mantém a Jornada das Missões informando que começará depois do Lual.

### Site fechado no dia do evento

Em 8 de agosto de 2026, da meia-noite até as 22h:

- oculta a navegação e todas as seções do site;
- mostra uma tela exclusiva do Lual com mensagem de acolhida;
- exibe uma contagem regressiva com horas, minutos e segundos;
- informa que a abertura acontece às 22h, no horário de Brasília;
- mantém o conteúdo carregado e pronto para a liberação automática.

### Depois do evento

A partir de 8 de agosto de 2026, às 22h, no horário de Brasília:

- remove automaticamente a tela de espera, sem exigir nova publicação;
- libera automaticamente vídeos, mural, missões e pequenos hábitos de fé;
- mantém as fotos bloqueadas até a liberação manual no `content.json`;
- muda a chamada principal para “Reviver o Lual”;
- direciona para a missão do dia;
- mantém a Jornada das Missões funcionando normalmente.

## Fuso horário

A configuração utiliza `America/Sao_Paulo` e datas com deslocamento `-03:00`.

## Simulação local

A simulação funciona somente em `localhost` e `127.0.0.1`.

Antes do evento:

```text
?siteData=2026-08-07T12:00:00-03:00
```

Dia do evento:

```text
?siteData=2026-08-08T12:00:00-03:00
```

Dez segundos antes da abertura:

```text
?siteData=2026-08-08T21:59:50-03:00
```

Exatamente no horário da abertura:

```text
?siteData=2026-08-08T22:00:00-03:00
```

Depois do evento:

```text
?siteData=2026-08-08T22:30:00-03:00
```

O parâmetro antigo `missaoData` continua aceito para não quebrar os testes da Jornada das Missões.

## Texto da tela fechada

Os textos exibidos antes das 22h ficam no bloco:

```text
estadosSite.acessoFechado
```

O horário de abertura é controlado por:

```text
estadosSite.inicioPosEvento
```

## Limite do bloqueio

O GitHub Pages publica arquivos estáticos. A tela fechada impede o acesso
normal pelo navegador e pelo QR Code, mas não funciona como autenticação:
os arquivos continuam tecnicamente públicos no repositório. Para este evento,
ela foi pensada como uma liberação programada para os visitantes comuns.


## Liberação manual das fotos

A publicação das fotos é independente da data do evento.

No arquivo `data/content.json`, localize:

```json
"galeria": {
  "liberada": false
}
```

Enquanto estiver `false`:

- nenhuma foto será carregada;
- a seção mostrará “Fotos em preparação”;
- o link do álbum completo ficará oculto;
- o botão principal do site levará o visitante para as músicas.

Depois de preparar as fotos e o álbum, altere somente para:

```json
"galeria": {
  "liberada": true
}
```

Antes de liberar, preencha também:

```json
"linkAlbum": "LINK_PUBLICO_DO_ALBUM",
"fotos": [
  {
    "imagem": "assets/images/gallery/01-acolhida.webp",
    "textoAlternativo": "Jovens reunidos durante a acolhida do Lual",
    "legenda": "Uma noite de fé, amizade e oração."
  }
]
```

Recomendação: use o Google Drive para o álbum completo e mantenha as fotos
selecionadas para o site em `assets/images/gallery/`. Links comuns de
compartilhamento do Drive não funcionam de forma confiável diretamente dentro
da tag de imagem do site.
