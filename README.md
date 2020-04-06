# peaceBox
![Production deploy](https://github.com/peaceBox/peaceBox/workflows/Production%20deploy/badge.svg)
## 開発環境
- `development`branchからbranch切って開発してください。
- VSCodeで開発する場合、`/client`　または `/server`のいずれかのディレクトリをワークスペースとして開いてください。eslintの設定が`/server`と`/client`に分けてあります。

### Requirement
- Node.js 10.x

### client側の開発

開発するときは、

(clientディレクトリ内にいる想定です)
```zsh
% yarn install
% yarn dev
```
でnuxtを起動します。

実際に生成されるページをみたいときは、
```zsh
% yarn generate:deploy
```
すると`dist`ディレクトリに生成されます。

### server側の開発


### ディレクトリ構成
```
(repository root)  
├── LICENCE ...MITライセンス  
├── README.md ...これ  
├── client...ブラウザ側の部分。S3から静的hostingする  
│  ├── (Some files)  
│  └── src  
│     ├── components...コンポーネント類はここに置く  
│     └── pages ...ここがnuxtにbuildされます  
│  
├── docs...使う時があれば使う  
└── server...サーバ側の部分。 Lambdaで動かす  
   ├── (some files)
   └── handler.js...関数の初めはこれが実行される
```

## CI/CD周り
`master` branchにpushすると、`/server`がAWS Lambdaに、`/client` がAWS S3にそれぞれbuild,deployされます。

### manual deploy

#### Client
```zsh
% aws s3 sync ./client/dist/ s3://peacebox-frontend --delete
```
#### Server
(serverlessをglobalにインストールしておいてください)
```zsh
sls deploy
```
