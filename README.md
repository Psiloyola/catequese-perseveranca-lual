# Lual da Perseverança

Site estático do 1º Lual da Perseverança da Paróquia Santo Inácio de Loyola.

## Recursos da versão atual

- Identidade visual oficial do Lual;
- Página responsiva com prioridade para celulares;
- Foto principal com carrossel horizontal de registros;
- Player principal do YouTube com seletor horizontal de vídeos;
- Santos, missão e próximo encontro carregados pelo JSON;
- Mural moderado com chamada para participação;
- Publicação compatível com GitHub Pages;
- QR Code permanente enquanto a URL do repositório permanecer a mesma.

## Executar localmente

Abra o projeto no VS Code e use o Live Server. O site precisa ser servido por HTTP para que `data/content.json` seja carregado corretamente.

## Conteúdo editável

Textos, links, santos, fotos, vídeos, mensagens e próximo encontro ficam em:

```text
data/content.json
```

## Identidade visual

Os elementos decorativos ficam em:

```text
assets/images/identity/
```

Paleta oficial:

- Verde Noite: `#052B24`
- Verde Floresta: `#0E473C`
- Dourado Luz: `#D9A441`
- Dourado Queimado: `#B9822E`
- Marfim Quente: `#F5EAD7`
- Branco Suave: `#FFF8EF`
- Laranja Fogueira: `#E47B2C`

## Publicar no GitHub Pages

No repositório, acesse `Settings → Pages` e configure:

```text
Source: Deploy from a branch
Branch: main
Folder: / (root)
```

A URL esperada é:

```text
https://psiloyola.github.io/catequese-perseveranca-lual/
```
