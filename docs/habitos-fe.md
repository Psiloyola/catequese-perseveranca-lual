# Pequenos hábitos, uma fé perseverante

A seção aparece depois das Missões da Semana e antes do mural. Ela transforma
os 17 hábitos em conteúdo real do site, legível por leitores de tela e fácil de
editar, em vez de usar uma imagem com texto.

## Experiência do participante

- quatro grupos expansíveis organizam os 17 hábitos;
- somente um grupo permanece aberto por vez;
- cada participante pode escolher até três hábitos para começar;
- ao chegar a três escolhas, os demais ficam temporariamente indisponíveis;
- basta desmarcar uma escolha ou usar “Limpar escolhas” para trocar;
- as escolhas ficam salvas somente naquele navegador e aparelho;
- nenhuma informação é enviada para formulário ou servidor.

## Conteúdo editável

O conteúdo fica em `data/content.json`, no bloco `habitosFe`:

```json
{
  "habitosFe": {
    "titulo": "Pequenos hábitos, uma fé perseverante",
    "limiteSelecao": 3,
    "storageKey": "psiloyola.habitos-fe.2026",
    "grupos": [
      {
        "id": "gestos-dia",
        "titulo": "Gestos de cada dia",
        "descricao": "Hábitos simples que ajudam a lembrar de Deus.",
        "itens": [
          {
            "id": "sinal-da-cruz",
            "texto": "Fazer o sinal da cruz ao sair de casa."
          }
        ]
      }
    ]
  }
}
```

O projeto valida exatamente quatro grupos, 17 itens e o limite de três
escolhas. Os IDs devem conter apenas letras minúsculas, números e hífens.

## Simulação local

Para visualizar a seção liberada no Live Server:

```text
?siteData=2026-08-09T12:00:00-03:00
```

Exemplo:

```text
http://127.0.0.1:5500/?siteData=2026-08-09T12:00:00-03:00
```

## Crédito

O rodapé da seção mantém um crédito discreto para a reflexão compartilhada por
`@iararocchas`. O nome e a URL também são editáveis no bloco `credito`.
