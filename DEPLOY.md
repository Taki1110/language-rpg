# 語源の旅人 - GitHub公開用設定

## .gitignore

```
.DS_Store
Thumbs.db
*.log
node_modules/
.env
```

## GitHub Pagesで公開する場合

1. このリポジトリをGitHubにプッシュ
2. Settings > Pages を開く
3. Sourceを「Deploy from a branch」に設定
4. Branchを「main」、フォルダを「/ (root)」に設定
5. Saveをクリック

数分後に `https://[username].github.io/language_rpg_v2/` でアクセス可能になります。

## ローカルでテスト

```bash
npm install
npm start
```

ブラウザで `http://localhost:3000` を開く
