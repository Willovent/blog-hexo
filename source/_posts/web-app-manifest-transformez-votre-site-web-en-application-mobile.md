---
title: "Web App Manifest: Transformez votre site web en application mobile !"
date: '2017-12-05T23:00:00.000Z'
lang: fr
---
Le web manifest fait partie des guidelines pour la mise en place d'une
Progressive Web App. Pour en savoir plus sur les PWA, vous pouvez jeter
un oeil par ici : [Progressive Web App ou comment se passer des stores
?](../../posts/web/progressive-web-app-ou-comment-se-passer-des-stores "Progressive Web App ou comment se passer des stores ?")

A quoi ça sert ?
----------------

Le web manifest va permettre de fournir des informations sur votre
application au navigateur. Celui-ci va alors pouvoir effectuer quelques
améliorations de performance sur Desktop (par exemple charger une
couleur de fond avant même que le CSS ne soit téléchargé). Mais là où ce
manifest prend tout son sens, c'est sur mobile. En effet lorsqu'un
manifest est présent dans l'application, le navigateur va demander à
l'utilisateur s'il veut ajouter l'application à son écran d'accueil.
Ainsi l'utilisateur pourra utiliser l'application en dehors du
contexte du navigateur, comme une \"vraie\" application mobile.
L'avantage principal est donc que l'on peut investir le device de
l'utilisateur sans passer par un store tout en gardant la flexibilité
du web (Deploiement et mise à jour instantanés, légèreté des paquets
etc\...)

![Add to
homescreen](https://developers.google.com/web/fundamentals/app-install-banners/images/add-to-home-screen.gif)

Comment ça marche
-----------------

Le web manifeste est en fait un simple fichier json. Il se présente sous
la forme suivante : 

``` json
{
    "name": "Exemple d'application",
    "short_name": "Exemple d'app",
    "background_color": "red",
    "description": "Description de mon exemple d'application",
    "orientation": "portrait-primary",
    "scope": "/monapp/",
    "start_url": "./",
    "display": "standalone",
    "theme_color": "yellow",
    "icons": [
        {
            "src": "chemin/vers/image",
            "sizes": "48x48",
            "type": "image/png"
        }
    ]
}
```

Voici à quoi ces propriétés servent : 

-   **name** : Fournit le nom de
    l'application (utilisé pour afficher l'application sur le device)
-   **short\_name** : Fournit un
    nom court pour l'application (destiné à être affiché lorsque le nom
    est trop long pour le contexte courant)
-   **background\_color** :
    Fournit la couleur de fond de l'application. Cette valeur est
    utilisée afin que le navigateur puisse afficher une couleur de fond
    avant que la/les feuilles de style(s) soi(en)t chargée(s). Cela
    permet une transition moins violente lors du chargement de
    l'application
-   **description** : Fournit une
    description de ce que fait l'application.
-   **orientation** : Définit
    l'orientation par défaut de l'application (landscape, portrait
    etc\...)
-   **scope** : Définit le scope
    de l'application. Lorsque l'on sort de ce scope, le navigateur
    reprend un affichage traditionnel. (url relative à l'url du
    manifest). Dans l'exemple, si l'utilisateur navigue vers une url
    ne commencant pas par /monapp/, (par exemple /monsite/mapage),
    l'affichage traditionnel reprendra la main. Pour que toute
    l'application web soit en dehors du contexte du navigateur, il
    suffit de remplir cette propriété avec la valeur \"/\" ou encore ne
    pas l'affecter du tout (\"/\" étant sa valeur par défaut).
-   **start\_url** : Définit
    l'url chargée lorsque l'utilisateur lance l'application depuis la
    page d'accueil (url relative à l'url du manifest)
-   **display** : Définit la
    façon dont doit s'afficher l'application. Lorsque cette valeur est
    à standalone, l'application se lancera comme une application
    native, sortie du contexte du navigateur.
-   **theme\_color** : Définit
    une couleur servant de thème à l'application. Celle-ci est notament
    utilisée comme couleur de contour lors de l'affichage multi-tâches
    sur Android.
-   **icons**:  Définit une liste
    d'icons pour l'application. Il s'agit d'une liste afin de
    pouvoir spéficier des icons pour multiple résolutions. Ils sont
    utilisés lorsque l'application est ajoutée sur l'écran d'accueil
    de l'utilisateur.

Afin que le navigateur soit en mesure de trouver ce fichier, il faut lui
spéficier son chemin dans l'HTML de l'application. Pour cela il suffit
d'utiliser une balise link dans la partie head de l'application : 

``` html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="manifest" href="/manifest.json">
    <title>Document</title>
</head>
<body>
    ...
</body>
</html>
```

Google met à disposition un outil permettant de générer ce manifest avec
une interface très simple. Cet outil permet même de générer des icons à
tous les formats. Il est accessible à cette adresse :
<https://app-manifest.firebaseapp.com/>

 Génial, mais c'est compatible avec quoi ?
-------------------------------------------

Malheureusement, c'est le point faible de ces web app manifest. Ils ne
sont compatibles qu'avec Android pour le moment. Les utilisateurs
d'IPhone ne seront donc pas promptés afin d'ajouter l'application à
leurs écran d'accueil.

![Can i use: Web App
Manifest](https://i.imgur.com/yNJpOj7.png)

Cependant il ne faut pas hésiter à l'insérer tout de même dans vos
applications. En effet, le temps de mise en place est très court et ne
fournit pas d'expérience dégradée lorsque l'appareil n'est pas
compatible, seulement une expérience augmentée lorsque la feature est
présente.

 