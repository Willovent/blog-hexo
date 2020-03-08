---
title: "Rendu côté serveur d'Angular Part 1/3"
date: '2017-08-08T22:00:00.000Z'
lang: fr
---
Cet article est le premier d'une série de 3 qui traiteront du sujet du
rendu serveur d'une application Angular. Dans cette première partie,
nous nous intéresserons à la partie théorique du sujet. Les deux parties
suivantes traiteront de la mise en place avec Node.JS et ASP.NET Core.

Pourquoi effectuer du rendu côté serveur ?
------------------------------------------

Grâce au rendu côté serveur, les applications web (Angular ou autre)
profitent de deux améliorations notables : 

La première de ces améliorations concerne le référencement des pages
d'une Single Page Application (SPA) dans les moteurs de recherche. En
effet, les crawlers de moteur de recherche (les robots utilisé afin
d'indexer le contenu des pages) n'exécutent pas toujours le
JavaScript. Dans le cas d'une application Angular, si rien n'est prévu
pour ces crawlers, ceux-ci vont visiter une page ne contenant que le
texte "Loading\..." et ce quelle que soit la page visitée. En effet la
page index.html de base d'une application angular ne contient qu'une
div avec ce texte et rien n'est ajouté si le javascript n'est pas
activé. Le rendu côté serveur permet de retourner une page avec le HTML
de l'application pré-rempli, les crawlers peuvent donc visiter toutes
les pages de notre application afin de les référencer convenablement.
Ils auront accès aux données de l'application.

Le deuxième avantage notable de ce mécasime est le temps d'affichage de
la page. En effet traditionnellement, avant qu'une page ne puisse
s'afficher, il faut que le navigateur récupère tout le JavaScript,
l'interprète et que le framework bootstrap notre application.
Lorsqu'on utilise le rendu côté serveur, le navigateur reçoit une page
html déjà traitée et peux donc l'afficher directement. Il faut tout de
même attendre que tout le JavaScript soit téléchargé et que le framework
ait bootstrappé l'application avant que celle-ci ne devienne
interactive.

Pour illustrer ce deuxième avantage, j'ai effectué un test dans le
navigateur chrome en simulant un réseau 4G et en désactivant le cache.
J'ai également activé l'enregistrement des frames afin de pouvoir
comparer le temps d'affichage avec et sans rendu coté serveur. 

![performances rendu coté serveur angular
](https://infiniteblogs.blob.core.windows.net:443/medias/b74b5364-c8cf-4ecf-8c58-c8200cd2c5b6_perf.png)

On peut voir dans cet exemple qu'il faut plus de 7 secondes à
l'application avant d'afficher du contenu. C'est principalement le
temps de récupération des fichiers JavaScript par le navigateur. En
revanche lorsque l'application est rendue coté serveur, il ne faut que
206ms avant que l'application ne puisse afficher du contenu. En
effet, le serveur retourne un fichier HTML déjà rendu que le navigateur
n'a qu'à afficher. Il faut en revanche attendre prêt de 7 secondes
avant que l'application ne soit interactive. 

Comment ça marche ?
-------------------

Le principe fondamental de ce concept est que le client et le serveur
exécutent la même application Angular. Ainsi lorsque le serveur retourne
une page HTML pré-rendue, celle-ci est identique à ce que le client
aurait généré. Ainsi le client peut "se greffer" aux éléments déjà
créés par le serveur afin de ne pas regénérer une page.

Afin que le serveur puisse générer le même HTML que le navigateur, il
doit connaître le code du client. Pour cela, client et serveur exécutent
la même application, simplement avec des points d'entrée différents. Le
HTML est donc identique, qu'il soit généré par le navigateur ou par le
serveur Node.JS.

Cependant le module de base d'une application Angular importe le
BrowserModule ainsi que d'autres modules incompatible avec l'exécution
hors du navigateur. Afin de palier à ce problème il suffit de créer un
module référencant le module principal de l'application et le module
ServerModule. Le serveur se servira de ce module afin de bootstrapper
l'application.

![schema fonctionnement rendu coté serveur
Angular](https://infiniteblogs.blob.core.windows.net:443/medias/84188086-1566-421b-93e3-0f14f5ac6915_schem.png)

Le schéma ci-dessus résume les étapes du chargement d'une application
avec rendu côté serveur. Tout d'abord, lorsqu'un utilisateur charge la
page, le navigateur envoie une requête HTTP au serveur(1). Ensuite, le
serveur Node.JS exécute l'application Angular en utilisant le module
créé à cet effet(2). Lors de cette étape, le serveur utilise
l'application pour générer l'HTML correpondant à la requête fournie
par le navigateur. Une fois généré, le serveur retourne cet HTML au
navigateur qui va pouvoir l'afficher tel quel (3). Enfin, le navigateur
va charger l'application en utilisant son module principal (4).

Pour mettre ce mécanisme en plus il faut donc commencer par créer un
module pour le serveur ne nécessitant pas l'exécution au sein d'un
navigateur. Ensuite il faut créer le serveur node.js se servant de ce
module. Enfin, il faut créer la configuration de compilation de ce
module. Ces différentes étapes seront décrites dans la suite de cette
série.

 