# Mural do Lual

## Objetivo

O mural reúne mensagens identificadas de fé, carinho, gratidão e
encorajamento. O envio é feito pelo Microsoft Forms e a publicação continua
manual: nenhuma resposta do formulário entra automaticamente no site.

## Fluxo de publicação

1. A pessoa envia a mensagem pelo formulário.
2. A organização confere identificação e conteúdo.
3. Uma mensagem aprovada é adicionada em `data/content.json`.
4. O site apresenta somente os itens presentes em `mural.mensagens`.

## Como adicionar uma mensagem

No arquivo `data/content.json`, localize:

```json
"mural": {
  "mensagens": []
}
```

Adicione itens neste formato:

```json
"mensagens": [
  {
    "nome": "Letícia Araújo",
    "mensagem": "Que tudo o que vivemos continue iluminando nossa caminhada.",
    "destaque": true
  },
  {
    "nome": "Lucas Vicente",
    "mensagem": "Que nossa amizade nos ajude a permanecer firmes na fé."
  }
]
```

O campo `destaque` é opcional. Use `true` em poucas mensagens para deixá-las
um pouco maiores no carrossel.

Também é possível manter uma mensagem no arquivo sem publicá-la:

```json
{
  "nome": "Nome da pessoa",
  "mensagem": "Texto em revisão.",
  "publicada": false
}
```

## Melhorias incluídas

- remoção do texto repetido “Mensagem aprovada” em cada cartão;
- contador “Mensagem X de Y”;
- indicadores clicáveis;
- botões anterior e próximo com estado desabilitado;
- parte do próximo cartão visível no celular;
- orientação “Deslize para ver as próximas mensagens” somente em telas pequenas;
- acessibilidade com posição do item e navegação por teclado;
- link real do Microsoft Forms presente também no HTML como contingência;
- mensagens fictícias removidas do conteúdo de produção.
