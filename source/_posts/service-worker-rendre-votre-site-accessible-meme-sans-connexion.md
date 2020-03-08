---
title: "Service Worker : Rendre votre site accessible même sans connexion !"
date: '2017-12-02T14:58:36.047Z'
lang: fr
---
Dans cet article nous allons voir comment utiliser les nouvelles API des
services workers afin de rendre une application web disponible sans
connexion internet. Il s'agit d'un des critères primordiaux afin de
faire une Progressive Web App. 

Qu'est-ce qu'un service worker ?
----------------------------------

Un service worker est simplement un fichier javascript. Il est exécuté
sous la forme d'une tâche qui vient s'insérer entre le navigateur et
le serveur qui sert l'application. Celui-ci tourne comme un singleton
au niveau du navigateur. Donc si deux onglets sont ouverts dans le
navigateur sur une application qui utilise un service worker, ces deux
onglets se partageront la même instance de ce dernier.

Les service workers peuvent intercepter les requêtes HTTP et retourner
eux mêmes une réponse. Il est donc possible de stocker le résultat de
ces requêtes et de retourner une version locale la prochaine fois que la
même ressource est demandée. C'est exactement de cette manière qu'il
est possible de rendre une application disponible hors connexion.

Le fonctionnement des services worker est événementiel. Il est par
exemple possible de s'abonner à l'événement "install" qui est levé
lorsque le service worker est installé ou encore à l'événement
"fetch" levé lors qu'une requête HTTP est effectuée par un client. 

L'interface Cache 
-------------------

 Au sein des services workers il existe une interface de cache qui
permet de stocker des paires d'objets Request/Reponse. Cette interface
expose différentes méthodes permettant d'ajouter, supprimer, mettre à
jour ou tester l'existence d'une requête dans le cache. Mais
l'implémentation de la gestion de la mise à jour du cache ou de sa
durée de vie est à la charge du développeur.

Mise en place
-------------

Afin de rendre disponible une application web hors connexion il faut
donc commencer par enregistrer le service worker. Pour cela, il suffit
d'appeler la méthode navigator.serviceWorker.register. Cette méthode
prend en paramètre l'url à laquelle le fichier javascript du service
worker est disponible et retourne une Promise. Le résultat de cette
promise permet de traiter les cas d'erreur.

``` javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(function(reg) {
    // registration worked
    console.log('Registration succeeded');
  }).catch(function(error) {
    // registration failed
    console.log('Registration failed with ' + error);
  });
};
```

Côté service worker, afin de se greffer aux requêtes entrantes, il faut
s'abonner à l'évenement "fetch". Sur cet événement, il est possible
d'appeler la méthode respondWith. Celle-ci attend un objet de type
Response. C'est cet objet qui sera envoyé au navigateur en tant que
reponse HTTP.  Le bout de code suivant permet de reproduire le
comportement traditionnel du navigateur. En effet, on effectue ici
l'appel HTTP en utilisant la méthode fetch et on passe le résultat de
cet appel à la méthode respondWith.

``` javascript
this.addEventListener("fetch", event => {
    event.respondWith(
      (async () => {
        return await fetch(event.request);
        })());
  });
```

Pour s'assurer que c'est maintenant bien le service worker qui
s'occupe des requêtes de notre application, on peut vérifier dans le
colonne size de l'onglet Network des DevTools de Chrome que la mention
"from ServiceWorker" apparait bien.

![service-worker.png](https://infiniteblogs.blob.core.windows.net:443/medias/f45edef4-3d7e-4f79-8ccd-6e1b45e3d075_service-worker.png){width="904"
height="200"}

Afin d'utiliser l'interface de cache pour rendre une application
disponible hors connexion il faut commencer par ouvrir un cache. Les
caches sont nommés et peuvent donc être versionnés ou catégorisés. Pour
en ouvrir un, il suffit d'appeler la méthode open sur l'objet caches.
Cette méthode prend en paramètre le nom du cache et retourne une Promise
de l'instance du cache : 

``` javascript
let cacheName = "v1";
let cache = await caches.open(cacheName);
```

Sur cet objet , il va être prossible d'appeler la méthode add pour
ajouter une requête dans le cache. Une fois ajoutée, il est possible de
récupérer la réponse associée en appelant la méthode match : 

``` javascript
await cache.add(event.request);
let response = await cache.match(event.request);
```

Il est également possible de mettre des objets en cache avant que le
navigateur en fasse la requête. Pour cela, il faut s'abonner à
l'événement "install".  Cet événement est levé lorsque le service
worker est installé par le navigateur. Il n'est donc levé qu'une fois
par version du service worker, peu importe le nombre de visite de
l'utilisateur :

``` javascript
this.addEventListener('install', function(event) {
    event.waitUntil((async () => {
        let cache = await caches.open(cacheName);
        await cache.addAll([
            "offline.html",
            "logo.png",
            "other-assets.png",
        ]);
    })());
});
```

Voici un exemple complet de stratégie de cache:  

``` javascript
let cacheName = "v1";

this.addEventListener('install', function(event) {
    event.waitUntil((async () => {
        let cache = await caches.open(cacheName);
        await cache.addAll([
            "offline.html",
            "logo.png",
            "other-assets.png",
        ]);
    })());
});

this.addEventListener("fetch", event => {
  event.respondWith(
    (async () => {
      let cache = await caches.open(cacheName);
      try {
        await cache.add(event.request);
      } catch (e) {
        //Echec de l'ajout dans le cache (hors connection)
      }
      let response = await cache.match(event.request);
      //Si la réponse n'est pas dans le cache, fallback sur une page d'information
      if (!response) {
        response = await cache.match("offline.html");
      }
      return response;
    })()
  );
});
```

Dans cet exemple, les requêtes sont systèmatiquement ajoutées dans le
cache et récupérées depuis celui-ci. De plus un fallback est ajouté pour
gérer le cas où l'utilisateur visite une page hors connexion qui n'est
pas encore dans son cache.

Compatibilité
-------------

Les services workers ne sont disponibles que dans Chrome, Firefox et
Opéra pour le moment. Concernant Safari et Edge, le support est
actuellement en cours de développement. Internet Explorer est donc le
seul à ne pas avoir prévu de supporter cette fonctionnalité. Coté
mobile, seul Android supporte cette API.

C'est à cause de cette compatibilité que l'on peut se permettre
d'utiliser les fonctionnalités ECMAScript 6 comme les fonctions
asynchrones. 

 

A vous de définir votre propre gestion du cache maintenant !

 