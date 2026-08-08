# Cards dos Santos Jovens

Os cards ficam disponíveis em todos os estados do site: antes do Lual, no dia
do evento e depois do encontro.

Cada card é carregado de `data/content.json` e apresenta:

- imagem do santo;
- texto alternativo da imagem;
- posição de enquadramento;
- nome;
- virtude em destaque;
- frase de destaque;
- resumo curto;
- proposta prática em “Para viver hoje”;
- link opcional para conhecer sua história.

Os cards formam uma coleção horizontal com rolagem por gesto, setas, teclado e
indicadores. No celular aparece um card com uma parte do próximo; no tablet,
dois; e em telas maiores, três. As imagens devem ficar em
`assets/images/santos/` e usar caminhos relativos à raiz do site, por exemplo:

```json
"imagem": "assets/images/santos/carlo-acutis.webp"
```

Exemplo completo:

```json
{
  "nome": "São Carlo Acutis",
  "imagem": "assets/images/santos/carlo-acutis.webp",
  "textoAlternativo": "Retrato de São Carlo Acutis",
  "posicaoImagem": "50% 24%",
  "virtude": "Eucaristia e missão digital",
  "frase": "Não eu, mas Deus.",
  "resumo": "Um jovem apaixonado pela Eucaristia, que usou seus talentos para evangelizar.",
  "inspiracao": "Coloque seus talentos a serviço do Evangelho.",
  "link": ""
}
```

Use `posicaoImagem` para manter o rosto bem enquadrado dentro do recorte padrão.
O primeiro valor controla a posição horizontal e o segundo, a vertical.
