# Publicação no GitHub Pages

## 1. Teste local

Abra o site pelo Live Server e valide:

- Menu no celular;
- Foto principal e carrossel;
- Troca dos vídeos no player;
- Mural e rolagem horizontal;
- Console sem erros vermelhos.

## 2. Commit e push

Execute no terminal do VS Code:

```powershell
git status; git add .; git commit -m "feat: adiciona galeria, vídeos e mural em destaque"; git push origin main
```

## 3. Ativar o Pages

No GitHub:

```text
Settings
→ Pages
→ Build and deployment
→ Source: Deploy from a branch
→ Branch: main
→ Folder: / (root)
→ Save
```

## 4. Endereço público

```text
https://psiloyola.github.io/catequese-perseveranca-lual/
```

Alterações futuras no conteúdo não modificam essa URL e não quebram o QR Code.
