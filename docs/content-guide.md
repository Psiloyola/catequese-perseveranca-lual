# Guia rápido de atualização

O conteúdo geral é atualizado em `data/content.json`. As mensagens aprovadas
ficam isoladas em `data/mural.json`.

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

Coloque as imagens em `assets/images/santos/` e preencha os campos `imagem` e
`textoAlternativo` de cada santo. Os campos `virtude` e `inspiracao` alimentam
os destaques do card. Use `posicaoImagem`, por exemplo `"50% 24%"`, para ajustar
o enquadramento sem editar o arquivo original.

O bloco `detalhes` alimenta a ficha aberta pelo botão “Conheça sua história”.
Preencha nascimento, morte, reconhecimento, símbolos, curiosidades e fonte. O
modelo completo está em `docs/cards-santos.md`.

## Pequenos hábitos de fé

A seção exibida depois das Missões da Semana é carregada do bloco `habitosFe`.
Os 17 hábitos ficam distribuídos em quatro grupos. Cada item precisa de um `id`
único e de um `texto` preenchido.

O participante pode escolher até três hábitos. A seleção fica salva somente no
navegador por meio da chave definida em `habitosFe.storageKey`. Para alterar os
textos ou os grupos, edite apenas `data/content.json`. Consulte o modelo e as
regras em `docs/habitos-fe.md`.

## Mural

Preencha `mural.linkFormulario`, em `data/content.json`, com o link público do
Microsoft Forms. Enquanto estiver vazio, o botão exibirá `Formulário em breve`.

Somente mensagens aprovadas devem ser adicionadas ao array `mensagens` de
`data/mural.json`:

```json
{
  "nome": "Maria",
  "funcao": "Catequista",
  "mensagem": "Mensagem aprovada pela organização.",
  "destaque": false
}
```

O campo `funcao` é opcional. O campo `destaque` também é opcional e deve ser
usado em poucas mensagens. Cada texto pode ter no máximo 400 caracteres.

## Próximo encontro

Atualize o objeto `proximoEncontro` no JSON.
