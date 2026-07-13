# Guia rápido de atualização

Toda alteração frequente deve ser feita em `data/content.json`.

## Fotos

A primeira foto do array `galeria.fotos` aparece como destaque. Todas as fotos também aparecem no carrossel horizontal.

Na versão definitiva, coloque as imagens em:

```text
assets/images/gallery/
```

Exemplo:

```json
{
  "imagem": "assets/images/gallery/foto-01.webp",
  "textoAlternativo": "Catequizandos reunidos durante o Lual",
  "legenda": "Uma noite de encontro, oração e amizade."
}
```

Preencha `galeria.linkAlbum` para exibir o botão do álbum completo.

## Vídeos

Os vídeos tocam dentro do site. Adicione os itens em `videos.itens` usando somente o ID do vídeo do YouTube:

```json
{
  "titulo": "Minha Essência",
  "artista": "Thiago Brado",
  "categoria": "Música",
  "descricao": "Texto curto sobre a música.",
  "youtubeId": "bklas0_vUg4"
}
```

O ID é a parte localizada depois de `watch?v=` na URL do YouTube.

## Santos

Coloque as imagens em `assets/images/saints/` e preencha o campo `imagem` de cada santo.

## Mural

Preencha `mural.linkFormulario` com o link público do Google Forms. Enquanto estiver vazio, o botão exibirá `Formulário em breve`.

Somente mensagens aprovadas devem ser adicionadas ao array `mural.mensagens`:

```json
{
  "nome": "Maria",
  "mensagem": "Mensagem aprovada pela organização."
}
```

## Próximo encontro

Atualize o objeto `proximoEncontro` no JSON.
