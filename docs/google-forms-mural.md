# Google Forms — Mural do Lual

## Título

Mural do 1º Lual da Perseverança

## Descrição

Escreva uma mensagem de fé, carinho, gratidão ou encorajamento para o nosso Mural do Lual. Todas as mensagens serão identificadas e revisadas pela organização antes de serem publicadas no site. Não inclua telefone, endereço, perfil de rede social ou outras informações pessoais.

## Perguntas

1. **Nome que aparecerá no mural** — Resposta curta, obrigatória.
2. **Mensagem** — Parágrafo, obrigatório, limite de 400 caracteres.
3. **Autorização para publicação** — Caixas de seleção, obrigatória, com a opção: `Autorizo que meu nome e minha mensagem sejam publicados no Mural do Lual após a revisão da organização.`
4. **Ciência da moderação** — Caixas de seleção, obrigatória, com a opção: `Entendo que a mensagem poderá ser corrigida, não publicada ou removida caso não esteja de acordo com a proposta do Lual.`

## Configurações

- Não coletar endereços de e-mail.
- Não limitar a uma resposta.
- Não permitir edição após o envio.
- Não mostrar resumo das respostas aos participantes.
- Mensagem de confirmação: `Sua mensagem foi recebida! Ela será revisada pela organização antes de aparecer no Mural do Lual. Obrigado por deixar sua luz acesa conosco.`

## Planilha

Vincule as respostas ao Google Sheets e acrescente as colunas:

- Status
- Observação da moderação
- Data de publicação

Use os status: `Pendente`, `Aprovada`, `Não aprovada` e `Publicada`.

## Colocar o link no site

No arquivo `data/content.json`, preencha:

```json
"linkFormulario": "COLE_AQUI_O_LINK_PUBLICO_DO_FORMULARIO"
```
