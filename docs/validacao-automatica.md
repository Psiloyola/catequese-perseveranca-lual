# Validação automática do site

O workflow verifica o projeto antes que alterações quebradas cheguem ao
GitHub Pages.

## Quando executa

- em todo `push` para `main`;
- em toda pull request;
- manualmente pela aba **Actions**.

## Verificações

- sintaxe de `assets/js/app.js`;
- validade de `data/content.json`;
- validade de `data/mural.json`;
- campos e limite de 400 caracteres das mensagens;
- blocos obrigatórios do conteúdo;
- IDs duplicados no `index.html`;
- seções principais;
- arquivos locais citados no HTML, CSS e JSON;
- flag `galeria.liberada`;
- galeria liberada sem fotos nem vídeo em destaque;
- arquivo, capa e textos obrigatórios do vídeo do Lual;
- link público HTTP(S) do álbum completo;
- vídeos maiores que o limite seguro para o GitHub;
- fichas completas dos santos e URLs das fontes;
- sete missões com IDs únicos;
- datas da jornada;
- quatro grupos e exatamente 17 hábitos de fé com IDs únicos;
- limite de três escolhas e crédito da reflexão;
- imagens excessivamente grandes.

## Executar localmente

```powershell
node --check assets/js/app.js
```

```powershell
node scripts/validate-site.mjs
```

Erros encerram a validação com falha. Avisos aparecem no relatório, mas não
interrompem o workflow.
