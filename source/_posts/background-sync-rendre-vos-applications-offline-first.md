---
title: "Background sync : rendre vos applications Offline First"
date: '2018-02-09T22:00:00.000Z'
lang: fr
---
Dans cet article nous allons voir comment utiliser les nouvelles API des **services workers** afin de rendre une application capable d'effectuer des synchronisations en tâche de fond avec le serveur **même lorsqu'elle n'est pas lancée**. 

Qu'est-ce que le background sync ?
----------------------------------

Un des cas d'usage les plus fréquents sur mobile consiste à **effectuer une action simple, puis ranger son téléphone**. Par exemple, je reçois une notification Facebook m'indiquant que j'ai été taggé sur une photo, **je lance l'app, je like et je range mon téléphone.**

Si l'utilisateur n'a pas de réseau à ce moment-là, **son expérience en sera dégradée car il ne pourra rien faire.** Il aura le choix entre garder son application ouverte jusqu'à ce que l'envoi au serveur ait pu être effectué, ou simplement **abandonner son action**. 

Le background sync permet de déférer la responsabilité au service worker de l’envoi au serveur de façon transparente pour l'utilisateur. Il faut donc passer la requête HTTP de l’application web au service worker. Ce dernier ayant une durée de vie plus longue que celle de l’application web, celui-ci pourra réessayer **même si l’utilisateur décide de fermer l’application**. Ce mécanisme de retry est d’ailleurs automatique avec l'API que nous allons utiliser.

Dans le cas d'une application utilisant ce mécanisme, l'utilisateur pourra donc ranger son téléphone **quel que soit l'état du réseau à ce moment-là**. 

Il est en revanche important de faire comprendre à l'utilisateur que l'application pourra se synchroniser **sans son intervention**.

Comment utiliser le background sync
-----------------------------------

Cette fonctionnalité se basant sur un service worker, la permière chose à faire côté application est donc d'**enregister celui-ci**: 
```js
navigator.serviceWorker.register('/sw.js');
```
Ensuite, il faut récupérer l'objet représentant l'**enregistrement de ce service worker**. Pour cela on peut utiliser _navigator.serviceWorker.ready_. Cet objet est une Promise qui retourne l'instance de l'enregistrement (registration) courant. On peut ensuite l'utiliser pour demander l'enregistrement d'une synchronisation. 
```js
navigator.serviceWorker.ready.then(function(swRegistration) {
  return swRegistration.sync.register('myFirstSync');
});
```
Lorsque cet appel est effectué il déclenche un événement 'sync' côté service worker. Sur cet événement, on retrouve une propriété tag.qui contient la chaîne de caractères passée au moment de l'enregistrement côté application (ici : "myFirstSync"). Pour traiter cette demande, il faut ensuite passer une Promise à la méthode waitUntil de l'événement. Si cette promise est résolue, alors la demande de synchronisation est réussie, si ne ce n'est pas le cas, **la demande de synchronisation a échoué et sera rententée plus tard**.
```js
self.addEventListener('sync', function(event) {
  if (event.tag == 'myFirstSync') {
    event.waitUntil(doSomeStuff());
  }
});
```
Dans cet exemple, la méthode _doSomeStuff_ doit retourner une promise. L'évenement sync ne sera pas redéclenché pour le tag 'myFirstSync'  **tant que la promise retournée par la méthode doSomeStuff n'a pas été résolue**. Peu importe que l'application refasse des demandes de synchronisation ou non.

**Il n'est pas possible de passer de la donnée dans les appels à la synchronisation**. Il faut donc pouvoir stocker ces données dans un storage accessible **côté application ET côté service worker.** Le Localstorage ne répond malheureusement pas à ces critères car il n'est pas disponible côté service worker. Il faut donc se rabattre du côté d'**IndexedDB** pour transmettre les data à envoyer au serveur. La méthode plus simple pour gérer des synchronisations à l'aide d'IndexedDB et de **gérer une queue de messages à envoyer**.

On ne va pas rentrer en profondeur dans l'utilisation d'IndexedDB dans cet article car le sujet est assez vaste et mériterait un post à lui seul. En attendant vous pouvez retrouver les guidelines de google à [cette adresse](https://developers.google.com/web/ilt/pwa/working-with-indexeddb "Guidelines IndexedDB")

Reste un point noir, la compatibilité. En effet seul **Google Chrome et Android** implémentent cette API pour le moment. 

Vous êtes maintenant prêts à rendre vos application **"Offline First"** !
 