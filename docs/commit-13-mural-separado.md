# Commit 13 — Mural separado

## Alterações

- criado `data/mural.json` exclusivamente para os depoimentos;
- adicionada a primeira mensagem, assinada por Danilo como catequista;
- mantidas as configurações do mural em `data/content.json`;
- adaptado o site para carregar os dois arquivos separadamente;
- uma falha no mural não impede o restante do conteúdo de aparecer;
- incluída validação de nome, mensagem, função, publicação, destaque e limite
  de 400 caracteres;
- atualizada a documentação de manutenção do mural.

## Commit sugerido

```text
feat: separa mensagens do mural e adiciona primeiro depoimento
```
