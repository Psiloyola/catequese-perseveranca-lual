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
- botão “Conheça sua história”, que abre uma ficha completa;
- nascimento, morte e canonização ou beatificação;
- símbolos da vida, curiosidades e uma fonte de referência.

Os cards formam uma coleção horizontal com rolagem por gesto, setas, teclado e
indicadores. No celular aparece um card com uma parte do próximo; no tablet,
dois; e em telas maiores, três. A ficha completa abre sobre a página, pode ser
fechada pelo botão, pela tecla `Esc` ou por um toque fora do painel e mantém a
navegação por teclado. As imagens devem ficar em
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
  "frase": "Todos nascem como originais, mas muitos morrem como fotocópias.",
  "resumo": "Um jovem apaixonado pela Eucaristia, que usou seus talentos para evangelizar.",
  "inspiracao": "Coloque seus talentos a serviço do Evangelho.",
  "detalhes": {
    "nascimento": "3 de maio de 1991 — Londres, Inglaterra",
    "morte": "12 de outubro de 2006 — Monza, Itália",
    "reconhecimento": {
      "titulo": "Canonização",
      "data": "7 de setembro de 2025"
    },
    "simbolos": [
      "Computador",
      "Eucaristia",
      "Terço",
      "Tênis e mochila"
    ],
    "curiosidades": [
      "Criou um site e uma exposição digital sobre milagres eucarísticos.",
      "Participava diariamente da Santa Missa."
    ],
    "fonte": {
      "rotulo": "Biografia no Vatican News",
      "url": "https://www.vaticannews.va/pt/igreja/news/2025-07/canonizacao-carlo-acutis-momento-historico-no-brasil-7-setembro.html"
    }
  }
}
```

Use `posicaoImagem` para manter o rosto bem enquadrado dentro do recorte padrão.
O primeiro valor controla a posição horizontal e o segundo, a vertical.

O validador exige que todos os campos da ficha estejam preenchidos e que a
fonte use uma URL `http` ou `https` válida.
