---
title: "Génération d'une font d'icônes"
date: '2018-07-22T22:00:00.000Z'
lang: fr
---


Avant de voir comment, on va se pencher sur pourquoi utiliser une police de caractère pour stocker des icônes.


## Pourquoi générer votre propre font d'icônes ?
Le premier avantage notable est au niveau de la récupération des icônes de l'application. En utilisant une font, il va être possible de récupérer toutes les icônes en une requête HTTP. Sur une grosse application contenant un grand nombre d'icônes, cela permet d'améliorer l'affichage initial de notre application.

Ensuite, l'utilisation permet de manipuler les icônes bien plus simplement. On va pouvoir modifier la taille, la couleur ou encore les ombres sur nos icônes avec de simples règles CSS. Il devient alors facile d'ajouter des comportements dynamiques sur les icônes ( en utilisant les pseudo-selecteurs `:hover` ou `:disabled` par exemple).

Beaucoup d'entreprises ont bien compris tous ces avantages et proposent maintenant des polices d'icônes _ready to use_  à l'instar de [fontawesome](https://fontawesome.com/) ou encore [glyphicons](http://glyphicons.com/). Seulement ces polices contiennent souvent beaucoup d'icônes que vous n'allez pas utiliser (mais tout de même faire télécharger à vos clients). De plus, ces polices ne sont pas customisables, donc si vous comptiez ajouter un icône à celle-ci, ça ne sera pas possible. Enfin, bien qu'elles possèdent généralement un tier gratuit, la plupart vous feront payer l'utilisation complète. Dans ce cas, pourquoi ne pas générer votre police de caractère ?
<center><img src="https://i.imgur.com/6JKHf6k.png" alt="font illustration"></img></center>

## Comment générer votre propre font d'icônes

Le secret réside dans un simple package npm, dont l'utilisation est vraiment très simple : [icon-font-generator](https://github.com/Workshape/icon-font-generator)

Son utilisation est très simple, une fois installé il suffit de lancer la commande suivante :  
```powershell
icon-font-generator [svg-icons-glob] -o [output-dir]
``` 
Donc pour générer une font d'icônes dans le dossier `./assets/fonts` depuis des images format svg dans un dossier `./icons` il faut utiliser 
```powershell
icon-font-generator icons/*.svg -o assets/fonts
```

Une fois cette commande effectuée, il ne reste plus qu'à référencer la font générée dans votre application. Pour cela il faut référencer le fichier icons.css qui se situe dans le dossier précisé lors de l’exécution de la commande.

Cela peut se faire via un import dans un fichier sass/less : 
```css
@import './assets/font/icons.css';
```
Ou encore directement dans l'html : 
```html
<html>
 <head>
  <link href="assets/font/icons.css" rel="stylesheet">
 </head>
</html>
```

Une fois référencée, on peut enfin commencer à utiliser cette font. 

Pour insérer un des icones qui se situent dans notre font, il faut ajouter au DOM un élément `i`  avec la classe `icon-[nom de l'image]`. Par exemple, pour insérer un icône qui était nommé `home.svg`, on peut maintenant l'insérer avec le DOM suivant: 

```html
<i class="icon-home"></i>
```

Et voilà, vous pouvez maintenant utiliser votre propre font d'icône partout dans votre application ! 

Il est même possible de personnaliser les préfix, noms de fichiers etc... de votre font en approfondissant un peu plus les options de ce paquet npm !

```md
Example : icon-font-generator src/*.svg -o dist

Options:
  -o, --out        Output icon font set files to <out> directory
  -n, --name       Name to use for generated fonts and files (Default: icons)
  -s, --silent     Do not produce output logs other than errors (Default: false)
  -f, --fontspath  Relative path to fonts directory to use in output files (Default: ./)
  -c, --css        Generate CSS file if true (Default: true)
  --csspath        CSS output path (Defaults to <out>/<name>.css)
  --csstp          CSS handlebars template path (Optional)
  --html           Generate HTML preview file if true (Default: true)
  --htmlpath       HTML output path (Defaults to <out>/<name>.html)
  --types          Font types - (Defaults to 'svg, ttf, woff, woff2, eot')
  --htmltp         HTML handlebars template path (Optional)
  -j, --json       Generate JSON map file if true (Default: true)
  --jsonpath       JSON output path (Defaults to <out>/<name>.json)
  -p, --prefix     CSS classname prefix for icons (Default: icon)
  -t, --tag        CSS base selector for icons (Default: i)  
  --normalize      Normalize icons sizes (Default: false)
  --round          Setup SVG rounding (Default: 10e12)
  --descent        Offset applied to the baseline (Default: 0)
  --mono           Make font monospace (Default: false)
  --height         Fixed font height value
  --center         Center font horizontally
```

__*Happy Coding !*__
 