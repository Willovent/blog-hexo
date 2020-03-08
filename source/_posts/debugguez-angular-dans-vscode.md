---
title: "Debugguez Angular dans VSCode"
date: '2018-03-29T20:00:00.000Z'
lang: fr
---
![angular love vscode](https://i.imgur.com/hdXCSzm.png)

Dans cet article nous allons voir comment mettre en place un setup permettant de lancer une application Angular (ou tout autre type d'application utilisant un watcher pour effectuer la compilation lorsque le code change), de lancer le navigateur chrome en mode debug et de brancher le debugger à VSCode, le tout en appuyant sur une seule touche.

Pour ce faire, nous allons devoir créer une configuration de lancement (fichier launch.json) qui servira à lancer chrome et se brancher sur ses api de debug. Cette configuration s’appuiera sur une tâche (fichier tasks.json) qui s'occupera de la compilation de notre application.

## tasks.json

La première étape est de créer une tâche dans VSCode. Pour cela, il suffit d'utiliser la commande *Tasks: Configure default Build task*. Cette commande peut-être trouvée en appuyant sur la touche F1, puis en effectuant une recherche.

![Tasks  Configure default Build task ](https://i.imgur.com/yh9mYFj.png)

Une fois la commande sélectionnée, on est invité à choisir une tâche. VSCode va nous proposer les différents scripts disponibles dans notre fichier package.json ainsi des scripts de compilation typescript pour chaque fichier tsonfig.json dans le projet. Dans notre cas, la tache qui nous intéresse est npm : start. 

![npm start](https://i.imgur.com/uFCkyiN.png)

Une fois selectionnée, un fichier tasks.json est créé dans le dossier .vscode. Ce fichier contient un json représentant les différentes taches configurées pour le projet. Dans la tache qui vient d'être créée, nous allons ajouter un identifieur, celui-ci permettra de référencer la tache plus tard. Etant donné que cette tache n'a pas de fin ( elle tournera jusqu'à annulation), il faut le préciser dans la description de la tache. Pour celà, il faut ajouter la propriété **`isBackground`** à true. 

À ce stade, le fichier doit ressembler à ça : 

```json
{
    "tasks": [
        {
            "identifier": "start angular",
            "type": "npm",
            "script": "start",
            "path": "Blog.Web\\angular\\",
            "group": {
                "kind": "build",
                "isDefault": true
            },
            "isBackground": true
        }
    ]
}
```
Il faut maintenant pouvoir fournir a VSCode un moyen de savoir que la compilation est terminée, pour cela, on va se servir de la propriété **`problemMatcher`** . Cette propriété prend en paramètre un tableau d'objets décrivant comment repérer les erreurs et quel est leur format. Pour les tâches qui fonctionnent en background, on peut également décrire quand la compilation commence et quand elle se termine. Pour cela il faut remplir un objet dans la propriété **`background`** de la manière suivante : 

```json
    "problemMatcher": [
        {
        "background": {
            "activeOnStart": true,
            "beginsPattern": "<Regex indiquant que la compilation commence>",
            "endsPattern": "<Regex indiquant que la compilation est terminée>"
          }
       }
    ]
```

Dans le cas d'Angular, ces regex fonctionnent
```json
    "problemMatcher": [
        {
        "background": {
            "activeOnStart": true,
            "beginsPattern":  "\\*\\* NG Live Development Server is listening on localhost:4200, open your browser on http://localhost:4200/ \\*\\*",
            "endsPattern": "webpack: Compiled successfully\\."
          }
       }
    ]
```
À vous d'adapter pour votre compilation.


Pour que la tâche puisse être traquée, il faut également lui fournir le pattern de détection d'erreur. Ce n'est pas le sujet du jour, alors je vais simplement vous le donner pour un output webpack de compilation typescript. 

```json
 {
      "regexp": "ERROR in \\[at-loader\\] ([^:]*):(\\d+):(\\d+)",
      "file": 1,
      "line": 2,
      "column": 3
}
```
Ce pattern est à placer dans le tableau de la propriété **`pattern`** du **`problemMatcher`**. 

Voici donc ce à quoi doit ressembler votre fichier task.json : 
```json
{
    "tasks": [
        {
            "identifier": "start angular",
            "type": "npm",
            "script": "start",
            "path": "Blog.Web\\angular\\",
            "group": {
                "kind": "build",
                "isDefault": true
            },
            "isBackground": true,
            "problemMatcher": [
                {
                    "owner": "custom",
                    "fileLocation": "relative",
                    "pattern": [
                        {
                            "regexp": "ERROR in \\[at-loader\\] ([^:]*):(\\d+):(\\d+)",
                            "file": 1,
                            "line": 2,
                            "column": 3
                        },
                        {
                            "regexp": "TS(.*)",
                            "message": 1
                        }
                    ],
                    "background": {
                        "activeOnStart": true,
                        "beginsPattern": "\\*\\* NG Live Development Server is listening on localhost:4200, open your browser on http://localhost:4200/ \\*\\*",
                        "endsPattern": "webpack: Compiled successfully\\."
                    }
                }
            ]
        }
    ]
}
```

La configuration de notre tâche est bonne, on peut passer à la configuration de lancement.

## launch.json

Pour créer la configuration du lancement, il faut utiliser la commande *Open launch.json file* :

![open launch.json](https://i.imgur.com/4SfrVz5.png)

Une fois cette commande tapée, on est invité à choisir un type d’environnement de configuration. Dans notre cas, il faut sélectionner le type **`Chrome`** 

![select chrome environnement](https://i.imgur.com/EonrH50.png)

Cela va créer un fichier launch.json dans le dossier .vscode. Ce fichier est presque bon en soit, il nous faut simplement modifier l'url (pour lancer sur le port 4200 et le 8080 proposé) et ajouter une **`preLaunchTask`**. Dans la propriété **`preLaunchTask`**, il faut spécifier l'identifieur de la tache créée dans le fichier tasks.json. Si votre projet Angular n'est pas à la racine de votre projet, vous devrez également modifier la propriété **`webRoot`** pour cibler votre projet.
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "chrome",
            "request": "launch",
            "name": "Launch Chrome against localhost",
            "url": "http://localhost:4200",
            "webRoot": "${workspaceFolder}/Blog.Web/angular",
            "preLaunchTask": "start angular"
        }
    ]
}
```

Maintenant tout est prêt pour débugger votre application directement dans VSCode, tout ce qu'il reste à faire est appuyer sur F5  !

![debugger en action](https://i.imgur.com/olPXLK5.png)

**Happy debugging !**
 