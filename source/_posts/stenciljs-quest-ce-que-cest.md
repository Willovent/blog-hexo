---
title: "StencilJs, Qu'est-ce que c'est ?"
date: '2018-05-07T22:00:00.000Z'
lang: fr
---
Stencil est le nouveau framework web développé par la team Ionic. Il est basé sur les standards du web, mais ressemble fortement à un mélange de React et Angular dans la syntaxe. 

![logo stencil](https://i.imgur.com/2iWKeqv.png)

## Encore un framework Js ?!

Historiquement, la team Ionic travaillait essentiellement avec le framework AngularJs (puis Angular) afin de fournir une interface mobile proche du native. Pour ce faire, ils mettaient à disposition une librairie de composants Angular ainsi qu'un tooling permettant d'encapsuler une application Angular dans une application Cordova. 

La nouvelle vision de Ionic est maintenant d'être **framework agnostique**. Leur objectif est que Ionic puisse être utilisé aussi bien dans une application React, Angular que VueJs. Afin de parvenir à cet objectif, ils ont donc développé leur propre framework web, Stencil. Celui-ci est basé sur les standards du web, ainsi, un composant Stencil compilé sera utilisable n'importe où (y compris en Vanilla).

## Web Component 

Le standard sur lequel s'appuie Stencil est celui des [Web Components](https://www.webcomponents.org/). 
Ainsi, un composant Stencil, une fois buildé, peut donc s'utiliser de manière native dans le navigateur.

La déclaration d'un composant est assez simple, notamment pour les développeurs ayant travaillé avec Angular et React. 

Voici un exemple de déclaration de composant: 
``` typescript
import { Component, State,Prop } from '@stencil/core';
import { Todo } from '../models/todo';


@Component({
  tag: 'my-todo',
  styleUrl: 'todo.scss'
})
export class TodoComponent {

  @Prop() todoName: string;
  @State() public todos: Todo[] = [];

  render() {
    return (
      <div>
        <h1>{this.todoName}</h1>
      </div>
    );
  }
}
```

On retrouve ici l'utilisation du décorateur **`Component`** (comme dans Angular) permettant de définir le tag html du composant et ou se situe sa feuille de style. On retrouve également la notion de **`State`** et  de **`Prop`** (comme dans React). Les propriétés décorées par **`State`** déclenchent une ré exécution de la méthode **`render`** lorsque leurs référence est changées. Les propriétés décorées par **`Prop`** sont récupérées en tant qu'input du composant, elles redéclenchent également un rendu lorsqu'elles sont modifiées. Enfin, le template des composants est rédigé en JSX. Tout comme pour React, celui-ci est généré via la méthode **`render`** du composant.

Il est également possible d’émettre des événements. Pour celà, il faut ajouter une propriété de type **`EventEmitter`** (comme dans Angular) et d'y ajouter le décorateur **`Event`**. Ensuite, pour déclencher l'évenement, il faut appeler la méthode **`emit`** sur cette propriété en lui passant en paramètre l'objet que l'on souhait envoyer via l'event.

``` typescript
export class TodoComponent  {

  @Event() todoCompleted: EventEmitter;

  todoCompletedHandler(todo: Todo) {
    this.todoCompleted.emit(todo);
  }
}
```

Les événements levés par cette propriété pourront être écoutés via la méthode **`addEventListener('todoCompleted' ,...)`** comme n'importe quel autre événement natif.

Pour un exemple de composant plus complet, vous pouvez aller jeter un oeil à ce repository : [stencil-todo](https://github.com/Willovent/stencil-todo). Un version [live](https://willovent.github.io/stencil-todo/) est également disponible pour voir le rendu.

## Stencil App

StencilJs permet donc de créer des composants, cependant, afin d'être considéré comme un framework web, celui-ci doit offrir plus de fonctionnalités. 
Afin de construire une Single Page Application, une des briques essentielle est le router.
Ce router contient  la plupart des fonctionnalités que l'on peut attendre de ce type de brique et ne demande que très peu de configuration. Il va par exemple gérer automatiquement le lazyloading des composants de l'application.

Le framework contient également une brique permettant de gérer le state de l'application (nommé **`context`** dans StencilJs), une notion rappelant grandement Redux.

Ces spécificités feront l'objet d'un prochain article, plus technique.

## Tooling

Ionic a volontairement réduit le tooling de son framework. Cependant, pas d’inquiétude, il ne sera pas nécessaire d'écrire un fichier de configuration webpack  pour chaque application ou composant.

Il n'y a pas de cli à installer en global, comme pour Angular, mais il existe différentes manières de scaffolder son application. 

Celle proposée par le "Getting Started" de Stencil est simplement de cloner un repository contenant une application vierge sur github. Il est également possible d'utiliser une générateur yeoman pour arriver à ses fins.

Quelle que soit la manière dont l'application est scaffoldée, les commandes permettant de lancer le serveur de développement et de build l'application se trouve directement dans le fichier package.json (respectivement `npm start` et `npm run build`)

Il est assez facile de commencer à développer, même si en tant que développeur Angular j'aurais apprécié quelques générateurs.

## Compatibilité 

Le format de sortie de Stencil étant des web components, il faut donc jeter un œil à la compatibilité de ceux-ci: 
![Compatibilité Web component](https://i.imgur.com/ydjN6wD.png)

Comme on peut le remarquer dans ce tableau, certaines fonctionnalités des web components  nécessitent un polyfill pour fonctionner sur Edge et Firefox. Cependant, Stencil se charge de récupérer le polyfill de 20kb(gzipped) 
 uniquement lorsqu'il est nécessaire.

Stencil est donc utilisable dès aujourd'hui et la prise en main est extrêmement rapide pour un développeur web ayant déjà travaillé avec des frameworks web modernes. Il n'est pas forcement le candidat idéal lorsque l'on souhaite commencer le développement d'une SPA, notamment à cause son manque de maturité. Cependant si l'objectif est de partager des composants graphiques dans des projets n'utilisant pas tous le même framework, il devient alors la solution parfaite. 

**Happy Codding**
 