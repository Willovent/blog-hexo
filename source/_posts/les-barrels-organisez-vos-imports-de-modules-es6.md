---
title: "Les Barrels : Organisez vos imports de modules es6"
date: '2018-02-22T22:00:00.000Z'
lang: fr
---
Pour cet article, nous allons utiliser le langage **typescript**. Cependant, une grande partie de son contenu est également applicable aux projets javascript exploitant les features **es6** du langage (à l'aide de [Babel](https://babeljs.io/ "babeljs") par exemple).

La problèmatique
----------------

Lorsque l'on developpe une application web, la tendance est à séparer les blocs techniques/fonctionnels en tant que **modules**. On utilise ensuite ces modules dans d'autres fichiers du projet.

Lorsque **l'application grandit**, généralement les dépendances de nos différents **modules grandissent également.** On se retrouve donc avec des fichiers **dont les dizaines de premières lignes** sont uniquement les **imports de ces dépendances**.

Voici comment sont généralement exportés les modules d'une application. 
```typescript
// services/service1.ts
export class Service1 { }

// services/service2.ts
export class Service2 { }

// services/service3.ts
export class Service3 { }
```
Ici, on a 3 fichiers qui exportent chacun un service différent. Si jamais un autre module a besoin de ces 3 services, voici comment il va devoir s'y prendre :
```typescript
// index.ts
import { Service1 } from "./services/service1";
import { Service2 } from "./services/service2";
import { Service3 } from "./services/service3";
```
Ici on ne se retrouve qu'avec trois lignes, cependant ces services appartiennent tous à la même catégorie fonctionnelle, ce sont les services de notre application. Est-ce qu'il ne serait pas intéressant de pouvoir effectuer un import directement sur le path _./services_ pour ces trois modules ?

Les barrels
-----------

C'est exactement le principe d'un **barrel**. Il s'agit simplement d'un regroupement de modules afin qu'ils soient exposés depuis un seul et même module. Simplifiant ainsi la lecture du code de notre application. 

Pour déclarer un barrel, il suffit de ré-exporter la totalité des modules que l'on veut exposer depuis ce dernier. Un exemple de code sera bien plus parlant : 
```typescript
// services/index.ts
export * from './service1';
export * from './service2';
export * from './service3';
```
 Et voilà, on a créé un barrel pour nos services. Ils peuvent maintenant s'importer de la manière suivante: 
```typescript
import { Service1, Service2, Service3 } from "./services";
```
NB: On n'est pas forcé de préciser le fichier dans le path ici (_./services/index_) car le résolveur de module va automatiquement chercher un fichier index si aucun n'est précisé.

Pour aller plus loin
--------------------

Attention, cette partie n'est valide plus que pour TypeScript.

Même avec ces barrels, nos imports peuvent parfois avoir des formes un peu inattendues. En effet, ceux-ci étant relatifs, on peut parfois se retrouver avec imports de ce type : 
```typescript
import { Service1, Service2, Service3 } from "../../../../services";
```
Et encore, dans cet exemple on ne fait que remonter. Dans certain cas on peut se retrouver avec ce genre d'imports :
```typescript
import { Service1, Service2, Service3 } from "../../../../api/base/datasource/services";
```
Dans ce genre de cas, il est très facile de perdre patience, notamment lorsqu'on a à importer une dizaine de modules de la sorte avant de pouvoir commencer à developper le nouveau module.

Heureusement, Typescript est là pour nous aider. En effet, il est possible de déclarer des alias au sein du fichier **tsconfig.json**. Ceux-ci vont permettre **de créer des chemins absolus** vers **un ou plusieurs module(s)**.

Pour créer un alias, il faut utiliser la propriété **paths** des **compilerOptions**. Attention, les chemins utilisés dans la propriété **paths** sont relatifs à la propriété **baseUrl**. Il est donc **obligatoire** de référencer une baseUrl si on veut utiliser les alias. 

La déclaration d'alias se fait de la manière suivante : 
```json
{
    "compilerOptions": {
        "module": "commonjs",
        "noImplicitAny": true,
        "removeComments": true,
        "preserveConstEnums": true,
        "sourceMap": true,
        "baseUrl": ".",
        "paths": {
            "app-services" : ["./services"]
        }
    },
    "files": [
        "index.ts"
    ]
}
```
 Dans cet exemple, on déclare un alias de _"./services"_ vers _"app-service"_. Utiliser cet alias est aussi simple que ça: 
```typescript
import { Service1, Service2, Service3 } from "app-services";
```
Les plus attentifs l'auront remarqué, il s'agit ici d'un **import absolu**. Autrement dit, cet import sera toujours fait de la même façon, peu importe l'emplacement du fichier dans l'application.

On remarque également que l'alias est affecté avec un tableau. Cela veut dire qu'il est possible de créer des **alias** pour effectuer la résolution de **modules sur différents chemins**.

Cette fonctionnalité n'est utilisable que pour **les alias en pattern glob**. Par exemple, si on dispose d'un dossier _api/services_ dans lequel sont disposés des services d'api, il est possible de créer l'alias suivant : 
```json
{
    "compilerOptions": {
        "module": "commonjs",
        "noImplicitAny": true,
        "removeComments": true,
        "preserveConstEnums": true,
        "sourceMap": true,
        "baseUrl": ".",
        "paths": {
            "app-services/*": [
                "./api/services/*",
                "./services/*"
            ]
        }
    },
    "files": [
        "index.ts"
    ]
}
```
Avec cet alias, il sera possible d'importer les modules de la manière suivante : 
```typescript
import { ApiService1 } from "app-services/api.service1";
import { Service1 } from "app-services/service1";
```
**Happy coding !**
 