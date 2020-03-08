---
title: "Angular SSR: éviter les doubles requêtes XHR"
date: '2018-03-12T22:00:00.000Z'
lang: fr
---
Dans cet article nous allons voir comment éviter que le client d'une application **Angular** rejoue les mêmes requêtes XHR déjà effectuées par le serveur lors du **Server-Side Rendering**.

La problématique
----------------------------

Lorsqu'une application Angular est rendue coté serveur, celle-ci va s'initialiser une première fois dans un processus node afin de générer le HTML à envoyer au client. L'application va alors s’exécuter comme ça se serait le cas coté client. Des appels XHR vont donc être effectués afin de récupérer le contenu de l'application. Lorsque le client reçoit cet HTML, l'application va se réinitialiser dans le navigateur de l'utilisateur. Au cours de cette  ré-initialisation, les mêmes requêtes XHR vont donc être effectuées. Ces appels sont effectués **2 fois** (une coté serveur et une coté client). 

Etant donnée que ces requêtes ont déjà été effectuées coté serveur, récupérer ces données coté client pourrait être une opération synchrone. Dans ce cas, on peut s'assurer d'éviter l'effet de *flickering* qui arrive parfois lorsque l'application reprend la main coté client.

La solution
-----------------

Pour régler ce problème, **Angular Universal** propose d'utiliser les modules suivants : [**ServerTransferStateModule**](https://angular.io/api/platform-server/ServerTransferStateModule) et [**BrowserTransferStateModule**](https://angular.io/api/platform-browser/BrowserTransferStateModule). Ceux-ci doivent s'insérer respectivement dans le module serveur et le module client de notre application

```typescript
//app.server.module.ts
@NgModule({
  bootstrap: [AppComponent],
  imports: [
    ServerModule,
    ServerTransferStateModule,
   ...
  ]
})
export class AppServerModule { }

//app.browser.module.ts
@NgModule({
  bootstrap: [AppComponent],
  imports: [
    BrowserTransferStateModule
    ,...
  ],
  providers: [ ... ]
})
export class AppModule { }
```


Ces modules vont permettre de créer un store entre le serveur et le client. Il devient donc possible de stocker dans ce store les résultats de requêtes XHR coté serveur afin de les réutiliser coté client. 

Comment ça marche ?
------------------------------------

Ce store fonctionne sur un principe de _clé-valeur_. Pour y accéder il faut se servir du service **TransferState**. Celui-ci expose les méthodes suivantes : 
 1. **_hasKey_ **:  Cette méthode permet de vérifier l'existence d'une clé dans le store
 2. **_get_ **: Cette méthode permet de récupérer une valeur dans le store. On doit également passer une valeur par défaut si la clé est absente du store.
 3. **_set_ **: Cette méthode permet de stocker une valeur dans le store en lui associant une clé.
 4. **_remove_**: Cette méthode permet de retirer une valeur du store.

Point d'attention : La clé ne doit pas être de type string. Afin de créer une clé, on doit utiliser la méthode **_makeKey_**.

Ce service expose également des méthodes permettant de préciser de quelle manière doit être sérialisé le store, mais nous n'en parleront pas dans cet article.

Voici un exemple concert d'utilisation (la récupération des articles pour la page d'accueil de ce blog) : 

```typescript
import { TransferState, makeStateKey } from '@angular/platform-browser';
import { of } from 'rxjs/observable/of';
import { tap } from 'rxjs/operators';

@Injectable()
export class BlogService {

  constructor(private http: HttpClient, private transferState: TransferState) { }

  getPosts(): Observable<PostList> {
    const key = makeStateKey('postList');
    if (this.transferState.hasKey(key)) {
      return of(this.transferState.get(key, null));
    }
    return this.http.get<PostList>(`${environment.apiUrl}/blog`)
      .pipe(tap(postList => {
        this.transferState.set(key, postList);
      }));
  }
}
```
Dans cet exemple, on inject le service **TransferState**. Ensuite, dans la méthode **_getPosts_** on créé une clé pour le store. Puis on vérifie la présence de cette clé dans le store via la méthode **_hasKey_**. 

Si elle est présente, c'est qu'on se trouve coté client. On peut donc directement retourner la valeur stockée dans le store en utilisant la méthode **_get_** du service **TransferState**. On utilise ici l'opérateur _**of**_ afin de créer un Observable à partir d'une valeur.

Si la clé n'est pas présente dans le store, c'est qu'on se trouve coté serveur. On effectue alors la requête HTTP. Mais avant de la retourner, on utilise l'opérateur _**tap**_ de rxjs. Celui permet d'effectuer une action sans influence sur le résultat de l'observable. Ici, on souhaite ajouter ce dernier dans le store afin de le rendre accessible coté client. Pour cela, on utilise la méthode **_set_** on lui fournissant la clé précédemment créée et la valeur à stocker.

Une fois cette mécanique mise en place, on peut observer que la requête HTTP n'est plus effectuée coté client. Celui-ci se servant des données du store.

Techniquement, lorsqu'un objet est mis dans le store, une balise script avec le type _"application/json"_ est ajouté au DOM. Celle-ci contient les données sérialisées du store. L'exemple précédent génére donc ce DOM en plus: 

![Sample de HTML](https://i.imgur.com/hOopvMI.png)

Vous pouvez d'ailleurs l'observer en utilisant les outils de débogage de Chrome directement sur cet article en rafraichissant la page.

Bonus
---------

Effectuer cette mécanique sur chacun des services d'une application, peut-être fastidieux. Un moyen de rendre la tâche générique est de passer pour un _Intercepteur HTTP_. La team Angular Universal a d'ailleurs eu cette idée et l'a intégré au framework. Pour l'utiliser, c'est très simple, il suffit d'importer le module **TransferHttpCacheModule** à la place du module **BrowserTransferStateModule**

 ```typescript
//app.browser.module.ts
@NgModule({
  bootstrap: [AppComponent],
  imports: [
    //BrowserTransferStateModule
    TransferHttpCacheModule
    ,...
  ],
  providers: [ ... ]
})
export class AppModule { }
```

En changeant simplement cet import, il n'est maintenant plus nécessaire de manipuler le service **TransferState**. Les requêtes HTTP sont automatiquement ajoutées au store. 

Attention tout de même si vous utilisez le moteur de rendu ASP.NET. En effet, le module **TransferHttpCacheModule** ne fonctionnait pas jusqu'à la version _**5.0.0-beta.6**_ du package _**@nguniversal/common**_ sortie à la fin du mois de février. Pensez donc à vérifier votre **package.json** si vous êtes concerné :)

**Happy Coding**
 