---
title: "Créer un gestionnaire de modales avec Angular"
date: '2019-01-20T23:00:00.000Z'
lang: fr
---
Dans cet article nous allons voir comment créer un gestionnaire de modales dans angular sans utiliser de librairie externe. 

L’implémentation recherchée consiste à pouvoir instancier un composant via un service et que celui-ci se retrouve dans le DOM avec un backdrop (toile de fond) et un bouton permettant la fermeture de ce dernier.

Pour cela, 3 étapes seront nécessaires : 
1. Créer un composant qui contient le backdrop ainsi que le bouton de fermeture. Ce conteneur servira également de host pour les composants de type modale que nous voudrons instancier. 
2. Créer un service qui puisse être utilisé n'importe où dans l'application afin d'instancier une modale.
3. Ecouter ce service dans l'`AppComponent` afin d'y gérer l'injection du conteneur.

## ModalComponent

Dans ce composant nous allons avoir besoin d'un **backdrop**, d'un **conteneur** pour la modal, d'un **template** pour insérer le composant que l'on veut injecter et enfin d'un **bouton de fermeture** de la modale : 
``` html 
<div class="backdrop" (click)="onClose()"></div>
<div class="modal-content">
  <ng-template #template></ng-template>
  <i class="fas fa-window-close" (click)="onClose()"></i>
</div>
```
Le backdrop est également bindé à la méthode `onClose` car la modale doit également se fermer lorsque l'utilisateur clique dessus. 

Ce composant va disposer d'un `@Input` pour récupérer le composant qu'il doit injecter, ainsi qu'un `@Output` afin d’émettre lors qu'il doit se fermer. 

```typescript
export class ModalComponent implements OnInit {

  @Output()
  close = new EventEmitter();

  @Input()
  component: { component: any; props: any };

  onClose() {
    this.close.emit();
  }
}
```

Le type de l'`@Input` component est `{ component: any; props: any }` ce qui permet de pouvoir également passer d’éventuelles `@Input` au composant à injecter.

Il reste encore à gérer l'injection. Pour cela il faut utiliser un `@ViewChild` afin de récupérer une référence au **template** dans l'HTML du `ModalComponent` ainsi que du `ComponentFactoryResolver` afin récupérer la **factory** du composant à injecter. 

```typescript 
export class ModalComponent implements OnInit {

  @ViewChild('template', { read: ViewContainerRef })
  container: ViewContainerRef;

  constructor(private resolver: ComponentFactoryResolver) {}

  ngOnInit() {
    const factory = this.resolver.resolveComponentFactory(this.component.component);
    const ref = this.container.createComponent(factory);
    if (this.component.props) {
      Object.assign(ref.instance, this.component.props);
    }
  }
}
```

Dans le `ngOnInit` du conteneur, on récupère la **factory** du composant à injecter, ensuite on utilise cette factory pour injecter ce composant dans le **template** et enfin, si des **props** ont été passées, on les assigne à notre composant.

A ce stade, il est déjà possible d'utiliser le `ModalComponent` dans un template (bien que ce ne soit pas le but de ce composant)

<iframe src="https://stackblitz.com/edit/modal-demo-oztzts?embed=1&file=src/app/app.component.html" frameborder="0" height="200px" style="margin: 0 -24px; width: calc(100% + 48px)" ></iframe>

> <mat-icon aria-label="" class="mat-icon material-icons" role="img" aria-hidden="true">warning</mat-icon> Le `ModalComponent` n'étant pas présent dans un template de l'application, celui-ci doit être ajouté au tableau `entryComponents` du module principal de l'application 

## ModalService

Afin de rendre possible l'ouvrir d'une modale depuis n'importe où dans l'application, il est nécessaire de créer un service. Celui-ci doit contenir une **méthode** permettant l'ouverture d'une modale et un `Observable` auquel l'`AppComponent` pourra **s'abonner** afin de gérer l'injection dans la page.

Pour gérer l'observable qu'expose ce service, il faut utiliser un [`Subject`](http://reactivex.io/documentation/subject.html) car il est possible d'émettre mais aussi de souscrire à cet objet.

La méthode d'ouverture de modale n'a alors plus qu'à émettre sur cet objet et le tour est joué.

```typescript
@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private componentSubject = new Subject<{ component: any; props: any }>();
  component$ = this.componentSubject.asObservable();

  constructor() { }

  openInModal(component, props = null) {
    this.componentSubject.next({ component, props });
  }
}
```

*On remarque ici que le `Subject` est exposé via sa méthode `asObservable()` qui permet d'éviter que l'on puisse émettre depuis l'extérieur du service.*
>  <mat-icon aria-label="" class="mat-icon material-icons" role="img" aria-hidden="true">warning</mat-icon> Les componsants passés à la méthode `openInModal` n'étant pas présent dans un template de l'application, ceux-ci doivent être ajoutés au tableau `entryComponents` du module principal de l'application 

## AppComponent

La dernière étape consiste à gérer l'injection de la modale dans la page en se servant du `ModalService`.

Il faut donc ici répéter ce qui a été fait dans le `ModalComponent` : Ajouter un template dans l'HTML de la page et injecter un composant de ce template. 

Les seules différences ici est qu'il ne faut pas le faire dans la méthode `ngOnInit` mais dans une souscription au `ModalService` (afin que la modale soit injectée à chaque fois que la méthode `openModal` est appelée). Il faut également gérer la fermeture de la modale.

```html
<ng-template #modalContainer></ng-template>
```
<br/>

```typescript
export class AppComponent implements OnInit {
  @ViewChild('modalContainer', { read: ViewContainerRef })
  modalContainer: ViewContainerRef;

  constructor(private modalService: ModalService, private resolver: ComponentFactoryResolver) {
  }

  ngOnInit() {
    const factory = this.resolver.resolveComponentFactory(ModalComponent);

    this.modalService.component$.subscribe(modal => {
      this.modalContainer.clear();
      const modalRef = this.modalContainer.createComponent(factory);
      modalRef.instance.component = modal;

      let sub: Subscription;
      const cleanUp = () => { this.modalContainer.clear(); sub.unsubscribe(); };
      sub = modalRef.instance.close.subscribe(cleanUp);
      modalRef.onDestroy(cleanUp);
    });
  }
}
```

On peut voir ici que pour supprimer la modale du DOM, il suffit d'appeler la méthode `clear()` sur la référence de template.

On peut maintenant appeler depuis n'importe où dans notre application le `ModalService` afin d'ouvrir une modale

```typescript
 openModal() {
    this.modalService.openInModal(ExempleComponent, { name: 'Joe' });
  }
``` 

Voici un exemple complet dont le code source est [disponible sur github](https://github.com/Willovent/angular-modal-demo).

<iframe src="https://stackblitz.com/edit/modal-demo?embed=1&file=src/app/app.component.ts" frameborder="0" height="500px" style="margin: 0 -24px; width: calc(100% + 48px)" ></iframe>

**Happy coding !**
 