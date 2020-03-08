---
title: "Angular 2: Les pipes"
date: '2016-07-19T22:00:00.000Z'
lang: fr
---

Qu'est-ce qu'un pipe ?
------------------------

Un pipe est un élément du framework Angular permettant d'effectuer des
transformations directement dans le template. Ils sont utilisés pour
mettre en forme une date ou un nombre. Ils peuvent également être
utilisés pour effectuer des filtres. Ce sont d'ailleurs les remplaçants
des filtres d'AngularJS

Utiliser un pipe
----------------

Pour utiliser un pipe, il suffit de se servir de l'opérateur pipe (\|)
sur l'objet à transformer et d'ajouter le nom du pipe à utiliser.

``` javascript
import { Component } from '@angular/core';

@Component({
  selector: 'sample',
  template: `<p>{{now | date}}</p>`
})
export class Sample {
  now: Date = new Date();
}
```

Dans l'exemple ci-dessous, le pipe date est appliqué à l'objet `now`
de type Date. Ainsi celui-ci sera ne sera pas affiché sous la forme
JavaScript des dates (Tue Jul 12 2016 13:51:59 GMT+0200 (Romance
Daylight Time)) mais sous une forme plus lisible utilisant la convention
d'écriture américaine : Jul 12, 2016

Il est, de plus, possible de passer des paramètres dans les pipes. Pour
cela, il suffit simplement de les ajouter à la suite de l'appel au
pipe, séparés par des doubles points (:).

Par exemple, ``` {{now | date:'MM/dd/yyyy'}} ``` deviendra 07/12/2016.

Créer un Pipe
-------------

Pour créer un pipe, il faut créer une classe implémentant l'interface
`PipeTransform`. Cette interface ne contient qu'une seule méthode à
implémenter avec la signature suivante :
`transform(value: any, ...args: any[]): any;`. C'est cette méthode qui
est exécutée lorsque l'opérateur pipe est utilisé. Le paramètre value
retourne la valeur de l'objet sur lequel est appliqué le pipe et args
retournent tous les autres paramètres utilisés lors de l'appel au pipe.

Il est également nécessaire d'appliquer le décorateur `Pipe` sur la
classe. Ce décorateur n'a qu'une seule métadonnée obligatoire qui
représente le nom du pipe : name. C'est avec ce nom que le pipe est
utilisable au sein d'un template.

``` javascript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'sample' })
export class SamplePipe implements PipeTransform {
  transform(input: string): string {
        return `${input} from sample pipe`;
  }
}
```

Dans cette exemple, j'ai simplement créé un pipe qui ajoute " from
sample pipe" à la fin de toutes chaines caratères qui lui sont passées.

Pour pouvoir utiliser un pipe custom il est nécessaire d'ajouter la
référence au type dans la partie "declarations" du module dans lequel
on souhaite utiliser ce pipe :

``` javascript
@NgModule({
  declarations: [
   SamplePipe,
   ...
  ],
  imports: [...],
  providers: [...],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

Une fois que le pipe est enregistré dans le module de l'application, il
peut-être utilisé dans les templates de vos composants comme n'importe
quel pipe du framework

``` javascript
import { Component } from '@angular/core'; 
 
@Component({ 
    selector: 'sample', 
    template: `<p>{{hello | sample}}</p>`
}) 
export class Sample { 
    hello: string = `hello`; 
}
```

Le retour de ce composant sera "hello from sample pipe".

Pipe pure & impure
------------------

L'actualisation de la transformation est la plus grosse distinction
entre les pipes d'Angular et les filtres d'AngularJS. En effet, par
défaut, Angular ne réexécutera la méthode transform du pipe que
lorsqu'il détectera une modification sur une valeur de type primitif,
ou un changement de référence pour les autres types. Autrement dit, il
ne réexécutera pas le pipe lorsqu'une propriété d'un objet est
modifiée, ou encore lorsqu'un élément est ajouté ou retiré d'un Array.

Cela permet à Angular d'assurer de bien meilleures performances que son
prédécesseur, mais apporte également son lot de limitations. Il est
cependant possible de retirer cette limitation. Pour cela, il faut
tagger le pipe comme étant impure. Afin de rendre un pipe impure, il
suffit de rajouter pure: false dans le décorateur du pipe.

``` javascript
@Pipe({ name: "sample", pure: false }) 
```

Cependant, il vaut mieux dans la plupart des cas éviter l'utilisation
des pipes impures car ceux-ci influent beaucoup sur les performances.
Dans le cas d'un filtre, il est souvent possible remplacer un pipe
impure par un bind sur une nouvelle propriété dans le composant qui
devrait être mise à jour manuellement lorsque les entrées du filtre sont
modifiées.
