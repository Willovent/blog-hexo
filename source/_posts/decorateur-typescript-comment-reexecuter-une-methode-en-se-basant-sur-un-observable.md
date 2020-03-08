---
title: "Decorateur typescript: comment réexécuter une méthode en se basant sur un Observable"
date: '2018-06-24T22:00:00.000Z'
lang: fr
---
Cet article nécessite des connaissances de base sur les décorateurs. Si vous n'êtes pas à l'aise avec ce concept, je vous conseil l'article [A la découverte des décorateurs TypeScript](https://sebastienollivier.fr/blog/javascript/a-la-decouverte-des-decorateurs-typescript) de Sébastien Ollivier.

Le but de ce poste est de voir de quelle manière réexécuter une méthode lorsqu'un `Observable` émet une nouvelle valeur en utilisant un décorateur.

Le cas d'utilisation qui a motivé l'écriture de ce décorateur est le suivant : 
Je dois réexécuter des appels HTTP lorsque l'utilisateur change la langue de l'interface. En effet, certaines données sont contextuelles à la langue de l'utilisateur. Lorsque ce dernier la change, il est donc nécessaire de récupérer les données contextuelles à cette nouvelle langue.

## Étape 1: Spécifier le ou les observables qui doivent déclencher une réexécution

Pour cela, on utilise un décorateur qui va stocker le nom d'une propriété de type `Observable` directement dans le prototype de la classe en utilisant un décorateur : 

```typescript
const TRIGGER_KEY = '__async_decorator_trigger_key__';

export function AsyncTrigger() {
  return function(target: Object, propertyKey: string | symbol) {
    if (!target[TRIGGER_KEY]) {
      target[TRIGGER_KEY] = [];
    }
    target[TRIGGER_KEY].push(propertyKey);
  };
}
```

Dans ce morceau de code, on stocke le nom dans la propriété dans un tableau dans le prototype de la classe. On le fait dans un tableau afin d'avoir la possibilité d'utiliser plusieurs triggers. 

## Étape 2: s'abonner au changement. 

La logique est simple: on merge les observables stockés dans le prototype et quand l'un d'eux émet une nouvelle valeur, on réexécute la méthode sur laquelle le décorateur a été appliqué. On doit en revanche faire tout cela dans le contexte d'exécution de la méthode (en replaçant `descriptor.value`), ce qui implique que la méthode doit être appelée dans le constructeur de la classe pour que le mécanisme se met en place.

```typescript
export function Async() {
  return function(_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    // On stocke une référence vers la méthode originale
    const oldFunc: Function = descriptor.value;

    // On remplace la méthode originale par notre mécanisme
    descriptor.value = function(...args) {
      if (this[TRIGGER_KEY]) {
        // On merges les observables stockés dans le prototype
        const observable = merge(...this[TRIGGER_KEY].map(x => this[x]));
        // On s'abonne au merge et on déclenche la méthode original lorsque qu'une nouvelle valeur est émise
        const subscription = observable.subscribe(() => oldFunc.apply(this, args));
      } else {
        // Si pas de trigger: warning dans la console
        console.warn('Async decorator used with no trigger');
        oldFunc.apply(this, args);
      }
    };
  };
}
```

Attention cependant, on créer ici une suscription qui n'est pas `unsubscribe`. A vous d'implémenter cette notion en fonction du cycle de vie de vos classes. Pour un composant Angular par exemple, il est simple de se greffer sur la méthode `ngOnDestroy` du composant: 

```typescript
export function Async() {
  return function(_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const oldFunc: Function = descriptor.value;

    descriptor.value = function(...args) {
      if (this[TRIGGER_KEY]) {
        const observable = merge(...this[TRIGGER_KEY].map(x => this[x]));
        const subscription = observable.subscribe(() => oldFunc.apply(this, args));

        const oldDestroy = this.ngOnDestroy;
        if (!oldDestroy) {
          console.error('Usage of Async without implementing ngOnDestroy');
        }

        this.ngOnDestroy = function() {
          subscription.unsubscribe();
          oldDestroy.apply(this);
        };
      } else {
        console.warn('Async decorator used with no trigger');
        oldFunc.apply(this, args);
      }
    };
```

## Étape 3: Utilisation

L'utilisation de ces décorateurs se fait en 3 points :
1. On applique le décorateur `@AsyncTrigger()` sur une ou plusieurs propriétés de type `Observable`
2. On applique le décorateur `@Async()` sur la ou les méthodes que l'on veut réexécuter lorsqu'un des observables émet une valeur.
2. On appelle les méthodes décorées par `@Async()` dans le constructeur de la classe (ou dans la méthode `ngOnInit` dans le cas d'une application Angular).

```typescript
@Component({...})
export class MyComponent implements OnInit, OnDestroy {

  @AsyncTrigger() languageTrigger = this.i18nService.languageChanged$;

  constructor(private i18nService: I18nService) {}

  ngOnInit() {
    this.loadLanguageRelatedData();
  }

  ngOnDestroy() { }

  @Async()
  private loadLanguageRelatedData() {...}

}
```


Dans cet exemple, la méthode `loadLanguageRelatedData` est réexécutée à chaque fois que l'Observable `languageTrigger` émet une nouvelle valeur. 

__Happy coding !__
 