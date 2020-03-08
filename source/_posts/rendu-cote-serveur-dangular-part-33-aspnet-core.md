---
title: "Rendu côté serveur d'Angular Part 3/3 ASP.NET Core"
date: '2017-12-17T23:00:00.000Z'
lang: fr
---
Cet article est le dernier d'une série de 3 traitant du sujet du rendu
serveur d'une application Angular. Dans cette partie, nous nous
intéresserons à la mise en place avec un serveur ASP.NET Core. La partie
précédente concernait la mise en place avec server Node.JS
([ici](../../posts/Angular/rendu-cote-serveur-d-angular-part-2-3-nodejs)) et
la première partie concernant la théorie
([ici](../../posts/Angular/rendu-cote-serveur-d-angular-part-1-3)). 

Cet article s'appuie enormément sur les principes de la mise en place
avec Node.JS. En effet, le fonctionnement du rendu côté serveur avec
ASP.NET Core est basé sur l'éxécution de processus Node.

Concernant l'organisation des répertoires pour cet article, un dossier
"angular" contenant un projet angular a été créé à la racine d'un
projet ASP.NET Core vide. Ce choix est arbitraire et est laissé au
developpeur. Cependant, attention aux urls relatives dans les exemples
si vous ne suivez pas cette organisation.

![arbre des répertoires](https://i.imgur.com/N9SwjkM.png)

Côté Angular
------------

La première étape est de créer un module spécifique pour le serveur.
Pour celà, on peut se référer à la partie "Création du module serveur"
de l'article [Rendu côté serveur d'Angular Part 2/3
Node.js](../../posts/web/rendu-cote-serveur-d-angular-part-2-3-nodejs "Rendu côté serveur d'Angular Part 2/3 Node.js").

Ensuite il faut créer un fichier main (src/main.server.ts) pour le
serveur. Ce fichier va simplement servir à exposer le module serveur de
notre application. 

``` javascript
import { enableProdMode } from '@angular/core';
export { AppServerModule } from './app/app-server.module';

enableProdMode();
```

Pour la compilation, nous allons créer une application angular/cli
plutôt que d'écrire un fichier webpack. Pour cela, il faut commencer
par créer un fichier tsconfig.json (src/tsconfig.server.json). Ce
fichier va servir à préciser le module d'entrée et ajouter le fichier
main.server.ts à la compilation. Pour plus simplicité, on va étendre le
fichier src/tsconfig.app.json 

``` json
{
  "extends": "./tsconfig.app.json",
  "compilerOptions": {
    "outDir": "../out-tsc/server",
    "module": "commonjs"
  },
  "files": [
    "main.server.ts"
  ],
  "exclude": [
    "test.ts",
    "**/*.spec.ts"
  ],
  "angularCompilerOptions": {
    "entryModule": "app/app.server.module#AppServerModule"
  }
}
```

Les points importants de cet objet de configuration sont :

-   "module" doit être set à commonjs (les autres n'étant pas
    supportés pour le moment)
-   "files" doit contenir le fichier "main.server.ts" créé
    précédemment pour l'ajouter à la compilation
-   "angularCompilerOptions.entryModule" doit pointer vers le module
    serveur de notre application. La syntaxe de cette dernière propriété
    est la suivante: *chemin/vers/le/fichier\#NomDeLaClasse.*

On a maintenant tous les éléments en main pour créer une application
angular/cli. Pour cela, il suffit d'ajouter un objet dans le tableau
apps du fichier .angular-cli.json

``` json
{
      "name": "server",
      "index": "index.html",
      "platform": "server",
      "root": "src",
      "outDir": "dist-server",
      "main": "main.server.ts",
      "tsconfig": "tsconfig.server.json",
      "environmentSource": "environments/environment.ts",
      "environments": {
        "dev": "environments/environment.ts",
        "prod": "environments/environment.prod.ts"
      }
    }
```

Les points importants de cet objet de configuration sont :

-   "platform" doit être set à "server"
-   "tsconfig" doit pointer vers le fichier tsconfig précédemment créé
    (relativement au dossier src)
-   "main" doit pointer vers le fichier main.server.ts  précédemment
    créé (relativement au dossier src)

Dans ce fichier de configuration, il faut également modifier la
propriété outDir de l'application principale pour pointer vers le
dossier wwwroot du projet ASP.NET Core.

``` json
{
      "root": "src",
      "outDir": "../wwwroot",
      "assets": [
        "assets",
        "favicon.ico"
      ],
      "index": "index.html",
      "main": "main.ts",
      "polyfills": "polyfills.ts",
      "test": "test.ts",
      "tsconfig": "tsconfig.app.json",
      "testTsconfig": "tsconfig.spec.json",
      "prefix": "app",
      "styles": [
        "styles.css"
      ],
      "scripts": [],
      "environmentSource": "environments/environment.ts",
      "environments": {
        "dev": "environments/environment.ts",
        "prod": "environments/environment.prod.ts"
      }
    }
```

On peut maintenant modifier le script npm de build afin qu'il effectue
la compilation des applications angular déclarées :

``` json
{
   ...
  "scripts": {
     ...
    "build": "ng build --prod && ng build --prod --app server --output-hashing=none",
     ... 
 },
   ...
}
```

On ajoute le flag \--output-hashing=none afin qu'Angular ne génére pas
un nom de fichier contenant un guid pour la partie serveur. On a en
effet besoin de référencer ce fichier, il lui faut donc un nom statique.

L'exécution de la commande npm run build remplit maintenant le dossier
wwwroot du projet ASP.NET Core avec l'application cliente Angular et
crée un dossier dist-server contenant un fichier main.bundle.js.

On va maintenant créer le script Node.JS que va exécuter le serveur
ASP.NET Core. Pour cela, il faut comprendre que ce serveur attend un
module commonjs avec un export global. Cet export doit exposer une
fonction prenant en paramètre un callback. C'est le resultat de ce
callback qui sera reçu par le serveur. 

``` javascript
module.exports = function (callback) {
  callback(null /* les erreurs vont ici */, "hello world");
}
```

Le serveur recevra la valeur "hello world" s'il exécute l'exemple
ci-dessus. Il est également possible de passer des paramètres
supplémentaires depuis le serveur. Ces paramètres seront passés à la
fonction exportée.

Pour effectuer le rendu de l'application angular, on va se servir du
renderModuleFactory en utilisant le module exporté dans le fichier
main.server.ts (main.bundle.js pour la version compilé). Pour en savoir
plus sur le fonction du renderModuleFactory, rendez-vous sur
l'article [Rendu côté serveur d'Angular Part 2/3
Node.js](../../posts/web/rendu-cote-serveur-d-angular-part-2-3-nodejs "Rendu côté serveur d'Angular Part 2/3 Node.js") partie
"Création du serveur Node.JS". On va également considérer que le
serveur nous envoie l'url demandée en second paramètre.

``` javascript
const renderModuleFactory = require('@angular/platform-server').renderModuleFactory;
const AppServerModuleNgFactory = require('./dist-server/main.bundle').AppServerModuleNgFactory;
const readFileSync = require('fs').readFileSync;
require('zone.js');

const file = readFileSync('./wwwroot/index.html').toString();

module.exports = function (callback, path) {
  renderModuleFactory(AppServerModuleNgFactory, {
    document: file,
    url: path
  }).then(body => {
    callback(null, body);
  });
}
```

Pour cet exemple, ce script (server.js) est placé à la racine du projet
angular. On a maintenant terminé avec la partie Angular, voyons
maintenant comment configuer le projet ASP.NET Core

Côté ASP.NET Core
-----------------

Pour commencer, il faut ajouter les services Node dans le moteur
d'injection de dépendances. Pour cela, il suffit d'appeler la méthode
AddNodeServices dans la méthode ConfigureServices de la classe Startup: 

``` csharp
public void ConfigureServices(IServiceCollection services)
 {
      services.AddMvc();
      services.AddNodeServices();
 }
```

Il est maintenant possible d'injecter l'interface INodeServices. Cette
interface expose une méthode générique InvokeAsync qui permet
d'exécuter un script Node.JS. Le premier paramètre de cette méthode est
le chemin vers le script à exécuter, les suivants sont les paramètres
qui seront passés au script Node.JS. Pour récupérer l'html pré-rendu de
notre application Angular dans une action de contrôleur, il suffit donc
d'écrire le code suivant :

``` csharp
public class HomeController : Controller
    {
        [HttpGet]
        public async Task<IActionResult> Index([FromServices]INodeServices nodeServices)
        {
            ViewData["ResultFromNode"] = await nodeServices.InvokeAsync<string>("./angular/server.js", Request.Path);
            return View();
        }
    }
```

On passe ici Request.Path en tant que second paramètre afin que le
script Node.JS et notre application Angular puissent récupérer la route
demandée. Cet appel nous renvoie le html pré-rendu de notre application.
Celui-ci est ajouté au ViewBag afin que l'on puisse effectuer le rendu
dans une page Razor avec la syntaxe suivante :

``` csharp
@Html.Raw(ViewBag.ResultFromNode)
```

Il ne reste plus maintenant qu'à ajouter un fallback dans le routage de
l'application ASP.NET Core afin que les urls non reconnues par celui-ci
soient envoyées vers le contrôleur de rendu de l'application Angular.
Pour cela on peut se servir de la méthode d'extension
MapSpaFallbackRoute lors de la configuration des routes qui est
justement prévue à cet effet: 

``` csharp
public void Configure(IApplicationBuilder app, IHostingEnvironment env)
  {
      if (env.IsDevelopment())
      {
          app.UseDeveloperExceptionPage();
      }

      app.UseMvc(routes =>
      {
          routes.MapRoute(
            name: "default",
            template: "{controller=Home}/{action=Index}/{id?}");

          routes.MapSpaFallbackRoute(
            name: "spa-fallback",
            defaults: new { controller = "Home", action = "Index" });

      });
      app.UseStaticFiles();
  }
```

La dernière étape est d'ajouter la compilation du projet angular en
target de prébuild du projet ASP.NET Core. Pour cela, il suffit
d'ajouter ce noeud au csproj:

``` xml
  <Target Name="PreBuild" BeforeTargets="PreBuildEvent">
    <Exec Command="cd angular && npm run build" />
  </Target>
```

Et voilà, tout est maintenant en place. 

Vous pouvez retrouver le code complet de cet exemple sur mon github à
l'adresse suivante :
<https://github.com/Willovent/angular-ssr-asp.net-core>

Bonus
-----

Tout ce système et même plus (live reloading, partage de donnés
client/serveur etc\...) est disponible sous la forme d'un template
dotnet. Pour l'utiliser, il suffit de lancer la commande 

``` powershell
dotnet new angular
```

Have fun !

 