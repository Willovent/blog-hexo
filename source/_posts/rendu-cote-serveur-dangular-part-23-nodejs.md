---
title: "Rendu côté serveur d'Angular Part 2/3 Node.js"
date: '2017-09-12T22:00:00.000Z'
lang: fr
---
Cet article est le deuxième d'une série de 3 traitant du sujet du rendu
serveur d'une application Angular. Dans cette partie, nous nous
intéresserons à la mise en place avec un serveur Node.JS. La partie
précédente concernait la théorie et est disponible
[ici](../../posts/Angular/rendu-cote-serveur-d-angular-part-1-3). La partie
suivante traitera de la mise en place avec un serveur ASP.NET Core.

Comme vu dans l'article précédent, afin de mettre en place le rendu
coté serveur d'une application Angular, il faut commencer par créer un
module spécifique pour le serveur. Ensuite il faut mettre en place le
serveur en lui même et enfin effectuer la configuration de sa
compilation.

Pour cette mise en place on va considérer un projet classique généré
depuis la CLI Angular.

Création du module serveur
--------------------------

Ce module nécessite la dépendance @angular/platform-server qui n'est
pas installée par défaut dans un projet créé avec la CLI Angular, il est
donc nécessaire de l'ajouter:

``` powershell
npm install --save-dev @angular/platform-server
```

 

L'étape suivante est de créer un module qui importe le module principal
de l'application ainsi que le module ServerModule. Le bootstrap de
l'application doit être le même que dans le module principal de
l'application. Le fichier associé est créé au même niveau que le
fichier app.module.ts et est nommé app.server.module.ts. Son contenu est
le suivant pour une application basée sur la CLI Angular : 

``` javascript
import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { AppComponent } from './app.component';
import { AppModule } from './app.module';
@NgModule({
  imports: [
          ServerModule,
          AppModule
  ],
  bootstrap: [
          AppComponent
  ]
})
export class AppServerModule {}
```

 

Il faut également modifier le module principal de l'application pour
lui signaler qu'il devra s'attacher à un DOM existant lors de son
bootstrapping (le DOM généré par le serveur). Pour cela il suffit
d'appeler la méthode withServerTransition sur l'import au
BrowserModule. Cette méthode prend en paramètre un objet avec une
propriété appId. Cette propriété sera utilisée par le serveur ET le
client afin de se synchroniser une fois le client boostrappé.

``` javascript
import …

@NgModule({
  declarations: […],
  imports: [
    BrowserModule.withServerTransition({appId : "pomme-app"}),
    …
  ],
  providers: […],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

 

 L'application est maintenant prête à être exécutée par un serveur
Node.JS, on peut donc passer à la suite.

Configuration de la Compilation AOT
-----------------------------------

Le serveur Node.JS aura besoin des fichiers générés lors de la
compilation AOT (Ahead Of Time). En effet celui-ci doit se servir d'une
factory de modules qui n'est générée que lors de cette compilation.
Plus d'informations sur le sujet sont disponibles sur [la documentation
officielle](https://angular.io/guide/aot-compiler). Comme expliqué dans
cette documentation, on va créer un fichier tsconfig pour générer les
fichiers aot. Pour cela, le plus simple est de copier le fichier
 tsconfig.json à la racine du projet et de le nommer
tsconfig.server.json. Dans ce fichier, ll faut ajouter un noeud
"files" et le faire pointer sur le fichier app.server.module.ts : 

``` json
  "files": [
    "src/app/app.server.module.ts"
  ]
```

 

Il faut également ajouter un noeud "angularCompilerOptions". Celui-ci
doit contenir une propriété "genDir" pointant vers la destination des
fichiers AOT et une propriété "entryModule" pointant vers le module
serveur. La syntaxe de cette dernière propriété est la suivante:
*chemin/vers/le/fichier\#NomDeLaClasse.* Dans notre cas ce noeud est
donc le suivant : 

``` json
  "angularCompilerOptions": {
    "genDir": "src/aot",
    "entryModule": "./src/app/app.server.module#AppServerModule"
  }
```

 

Avec ces deux entrées supplémentaires, le fichier tsconfig.server.json
doit donc ressembler à celà : 

``` json
{
  "compileOnSave": false,
  "compilerOptions": {
    "outDir": "./dist/out-tsc",
    "baseUrl": "src",
    "sourceMap": true,
    "declaration": false,
    "moduleResolution": "node",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "target": "es5",
    "typeRoots": [
      "node_modules/@types"
    ],
    "lib": [
      "es2016",
      "dom"
    ]
  },
  "files": [
    "src/app/app.server.module.ts"
  ],
  "angularCompilerOptions": {
    "genDir": "src/aot",
    "entryModule": "./src/app/app.server.module#AppServerModule"
  }
}
```

 

A ce stade, il est possible de générer les fichiers de la compilation
AOT en utilisant ngc, le compilateur angular utilisé par la CLI. Pour
cela il suffit d'exécuter la commande suivante : 

``` powershell
.\node_modules\.bin\ngc -p .\tsconfig.server.json
```

 

Ainsi les fichiers sont créés, cela permettera d'avoir l'intellisense
lors de la création du serveur. Les fichiers AOT seront générés en
mémoire lors la compilation webpack, l'utilisation de ngc ici permet
simplement de valider la configuration du tsconfig.server.json et
apporter plus de confort au développement.

Création du serveur Node.JS
---------------------------

 Il est maintenant temps de créer le serveur en lui-même. La première
étape est d'ajouter ses dépendances. Pour le serveur en lui-même, seul
express et ses definitions de type suffisent : 

``` powershell
npm install express @types/express --save-dev
```

 

Afin de compiler le serveur, il faudra webpack, son loader de fichiers
et les outils Angular spécifique à webpack : 

``` powershell
npm install webpack raw-loader @ngtools/webpack --save-dev
```

 

On peut maintenant créer un fichier main.server.ts au même niveau que le
fichier main.ts du projet. C'est ce fichier qui fera office de serveur
Node.JS. Dans ce fichier, la première chose à faire est d'activer le
mode de production d'Angular : 

``` javascript
import { enableProdMode } from '@angular/core';
import 'zone.js';

enableProdMode();
```

 

On importe également zone.js car ce paquet est nécessaire au
fonctionnement d'Angular afin de lui fournir un contexte d'exécution
asynchrone.

Ensuite il faut récupérer la référence à express et créer une nouvelle
application. Express est le serveur web Node.JS dont nous allons nous
servir.

``` javascript
import * as express from 'express';

const app = express();
```

 

Afin que ce même serveur puisse également servir à retourner les
fichiers nécessaires à l'exécution de l'application Angular, il faut
ajouter un middleware de fichier statique :

``` javascript
app.use(express.static('.', { index: false }));
```

l'objet {index : false} permet de préciser que l'url racine "/" ne
doit pas retourner un fichier index.html, en effet on veut gérer nous
même cette route. 

 

Enfin on peut lancer le serveur express sur un port quelconque.

``` javascript
app.listen(8000, () => {
  console.log('listening...');
});
```

 

A ce stade, nous avons simplement créé un serveur de fichiers statiques.
Il faut ensuite créer un moteur de modèles express. Ce genre de moteur
prend une vue (html dans ce cas) et des paramètres en entrée et fournit
une vue html interprétée en sortie.

Pour créer un moteur, il faut appeler la méthode engine sur
l'application express. Cette méthode prend en paramètre le type des
fichiers d'entrées (ici html) et une fonction devant effectuer la
transformation.

``` javascript
app.engine('html', ngEngine);
```

 

Reste à définir le moteur en lui-même. Pour cela il suffit d'écrire une
méthode prenant 3 paramètres. Le premier correspond au chemin vers le
fichier html demandé. Le second paramètre est un objet qui est construit
lors des appels au moteur de modèle. C'est à nous de remplir (ou non)
cet objet. Le dernier paramètre est un callback qui prend lui-même deux
paramètres. Il faut utiliser le premier paramètre du callback en cas
d'erreur et le second en cas de succès contenant la chaine de caractère
que le serveur doit retourner.

``` javascript
import * as fs from 'fs';

const ngEngine = (filePath, options, callback) => {
  const file = fs.readFileSync(filePath).toString();
  callback(null, file);
};
```

 

Pour le moment ce moteur de vue ne fait que charger la page html
demandée avant de la retourner. Afin d'interpréter la page html avec
notre application Angular, il faut utiliser la méthode
renderModuleFactory située dans @angular/platform-server. Cette méthode
prend deux paramètres. Le premier est la classe de factory associée au
module serveur de l'application. Le second est un objet de type
PlatformOption. Celui-ci contient une propriété document qu'il faut
remplir en utilisant le contenu du fichier html sur lequel
l'application doit bootstrapper et une propriété url qui doit contenir
l'url appelée.

``` javascript
import { renderModuleFactory } from '@angular/platform-server';
import { AppServerModuleNgFactory } from './aot/src/app/app.server.module.ngfactory';
import * as fs from 'fs';

const ngEngine = (filePath, options, callback) => {
  const file = fs.readFileSync(filePath).toString();
  renderModuleFactory(AppServerModuleNgFactory, {
    document: file,
    url: options.req.url
  })
};
```

 

La méthode renderModuleFactory retourne une promise. Le résultat de
cette promise contient la chaine de caractères de l'html rendu. Il ne
reste donc plus qu'à appeler le callback dans le résultat de cette
promise. Voici donc le code complet concernant le moteur de modèle :

``` javascript
const ngEngine = (filePath, options, callback) => {
  const file = fs.readFileSync(filePath).toString();
  renderModuleFactory(AppServerModuleNgFactory, {
    document: file,
    url: options.req.url
  })
  .then(string => {
    callback(null, string);
  });
};

app.engine('html', ngEngine);
```

 

Pour que ce moteur soit utilisé, il faut le préciser à express en
utilisant le méthode set sur l'application avec en paramètre 'view
engine'. Le deuxième paramètre de cette méthode doit être le type de
fichier géré par le moteur (ici html)

Il faut également lui spécifier le répertoire contenant les vues (ici
c'est la racine du serveur) en utilisant cette même méthode avec le
paramètre 'views'.

``` javascript
app.set('view engine', 'html');
app.set('views', '.');
```

 

Maintenant que le moteur de modèles est en place, il faut l'appeler sur
toutes les urls qui peuvent être demandées au serveur. Il faut donc
utiliser la méthode « get » de l'application express. Cette méthode
prend deux paramètres en entrée. Le premier correspond à l'url, ou à un
pattern d'urls, à laquelle l'application doit répondre. Le second est
la fonction qui effectue la création de la réponse HTTP. Cette fonction
prend en paramètre la requête et la réponse HTTP. C'est sur cet objet
response qu'un l'appel à la méthode render est effectué afin de faire
appel au moteur de modèles.

``` javascript
app.get('*', (request, response) => {
  response.render('index', { req: request });
});
```

 

Le deuxième parmètre passé à la méthode render correpond à l'objet
option qui est récupéré dans le moteur de modèles. On lui passe donc ici
la requête afin que le moteur puisse en déduire l'url appelée

Le fichier final doit donc ressembler à cela : 

``` javascript
import { renderModuleFactory } from '@angular/platform-server';
import { enableProdMode } from '@angular/core';
import 'zone.js';
import { AppServerModuleNgFactory } from './aot/src/app/app.server.module.ngfactory';
import * as express from 'express';
import * as fs from 'fs';

enableProdMode();

const app = express();

const ngEngine = (filePath, options, callback) => {
  const file = fs.readFileSync(filePath).toString();
  renderModuleFactory(AppServerModuleNgFactory, {
    document: file,
    url: options.req.url
  })
  .then(string => {
    callback(null, string);
  });
};

app.engine('html', ngEngine);

app.set('view engine', 'html');
app.set('views', '.');

app.use(express.static('.', { index: false }));

app.get('*', (request, response) => {
  response.render('index', { req: request });
});

app.listen(8000, () => {
  console.log('listening...');
});
```

Le serveur est maintenant terminé, reste à le compiler. Pour cela, nous
allons nous servir de webpack. Il faut donc créer un fichier
webpack.server.config.ts. Voici le contenu de celui-ci: 

``` javascript
const ngtools = require('@ngtools/webpack');
const config = {
    entry: {
        main: './src/main.server.ts'
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    target: 'node',
    output: {
        path: __dirname + '/dist',
        filename: 'main.server.js'
    },
    plugins: [
        new ngtools.AotPlugin({
            tsConfigPath: './tsconfig.server.json',
        })
    ],
    module: {
        rules: [
            { test: /\.css$/, loader: 'raw-loader' },
            { test: /\.html$/, loader: 'raw-loader' },
            { test: /\.ts$/, loader: '@ngtools/webpack' }
        ]
    }
}
module.exports = config;
```

On ne va pas rentrer dans le detail de ce fichier de configuration
webpack. Simplement, on utilise le loader @ngtools/webpack pour les
fichiers .ts et on utilise le plugin AotPlugin se servant du fichier
tsconfig créer précédement. Le reste est plutôt standard pour de la
compilation webpack. Utiliser @ngtools/webpack plutôt que le
traditionnel ts-loader permet de bundler les fichiers
less/sass, d'optimiser les assets etc.. (Plus d'info sur la page
github
[@ngtools/webpack](https://github.com/angular/angular-cli/tree/master/packages/%40ngtools/webpack))

Il faut encore exclure ce fichier de la compilation angular de la partie
cliente. Pour cela, il suffit d'ajouter ce fichier dans la liste des
exclusions du fichier tsconfig.app.json dans le dossier src : 

``` json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "outDir": "../out-tsc/app",
    "baseUrl": "./",
    "module": "es2015",
    "types": []
  },
  "exclude": [
    "test.ts",
    "**/*.spec.ts",
    "main.server.ts"
  ]
}
```

Maintenant pour compiler le serveur, il suffit de lancer la commande
suivante : 

``` powershell
.\node_modules\.bin\ngc -p .\tsconfig.server.json
```


Cependant le serveur doit également retourner les fichiers du client, il
faut donc également les générer. Lorsque l'on exécute la commande ng
build, celle-ci supprime le répertoire dist, il vaut donc mieux
effectuer ng build suivit de la commande webpack. Le plus simple est
encore d'ajouter des scripts dans le fichiers package.json pour
effectuer ces opérations séquentiellement.

```json
{
  "name": "angular-render-server",
  "version": "0.0.0",
  "license": "MIT",
  "scripts": {
    "ng": "ng",
    "run" : "cd dist && node main.server.js && cd ..",
    "start": "ng serve",
    "build:all": "npm run build:app && npm run build:server ",
    "build:server": "webpack --config ./webpack.server.config.ts",
    "build:app": "ng build",
    "test": "ng test",
    "lint": "ng lint",
    "e2e": "ng e2e"
  },
  "private": true,
  "dependencies": {...},
  "devDependencies": {...}
}
```

 

Avec ces scripts supplémentaires, l'exécution de cette commande permet
de générer l'application entièrement : 

``` powershell
npm run build:all
```

Et l'exécution de celle-ci permet de lancer le serveur : 

``` powershell
npm run run
```

Après avoir lancé cette commande, il ne reste plus qu'à se rendre sur
l'url http://localhost:8000 pour vérifier que tout fonctionne.

![2017-08-26 00\_32\_39-Éditer article - Infinite
Blogs.png](https://infiniteblogs.blob.core.windows.net:443/medias/51dc1d80-efc2-4a4d-9db6-b8466c523239_2017-08-26%2000_32_39-%C3%89diter%20article%20-%20Infinite%20Blogs.png)

Et pour vérifier le bon fonctionnement du rendu coté serveur, il faut se
rendre sur l'onglet "Network" des outils pour développeur de Chrome
et vérifier que le HTML retourné par le serveur correspond bien à du
HTML pré-rendu et non simplement au contenu du fichier index.html.

![2017-08-26 00\_36\_57-Éditer article - Infinite
Blogs.png](https://infiniteblogs.blob.core.windows.net:443/medias/88699631-5cce-4972-beb7-2b1b706ae6a9_2017-08-26%2000_36_57-%C3%89diter%20article%20-%20Infinite%20Blogs.png)

 