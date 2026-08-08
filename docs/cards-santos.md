# Cards dos Santos Jovens

Os cards ficam disponíveis em todos os estados do site: antes do Lual, no dia
do evento e depois do encontro.

Cada card é carregado de `data/content.json` e apresenta:

- imagem do santo;
- nome;
- frase de destaque;
- resumo curto;
- link opcional para conhecer sua história.

O layout mostra um card por linha no celular, dois no tablet e três em telas
maiores. As imagens devem ficar em `assets/images/santos/` e usar caminhos
relativos à raiz do site, por exemplo:

```json
"imagem": "assets/images/santos/carlo-acutis.webp"
```
