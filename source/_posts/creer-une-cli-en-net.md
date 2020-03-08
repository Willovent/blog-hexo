---
title: "Créer une CLI en .NET"
date: '2018-09-19T22:00:00.000Z'
lang: fr
---
Dans cet article nous allons voir comment créer une CLI (Command Line Interface) en .NET Core.

## Pourquoi utiliser une CLI

Il existe un grand nombre de scenario nécessitant l'utilisation de ce genre de petit utilitaire : 
- Automatiser une tâche répétitive
- Simplifier un processus de développement autrement plus compliqué
- Créer un outil d'aministration technique
- etc...

## Contexte

Depuis .NET Core, les équipes de Microsoft ont eu à créer quelques CLI afin des outils pour rendre .NET plus utilisable dans un contexte open source (hors de Visual Studio). On pense ici principalement à la commande `dotnet` permettent créer, builder, packager etc... des applications en .NET Core.

Dans cette optique, Microsoft a donc créé des packages permettant de gérer ces CLI en interne, qu'ils ont ensuite poussé dans l'Open Source via le package Nuget [Microsoft.Extensions.Configuration.CommandLine](https://www.nuget.org/packages/Microsoft.Extensions.Configuration.CommandLine/). C'est ce package que nous allons utiliser ici.  

## Le code

Pour créer une CLI, la première étape de générer un projet console .NET Core traditionnel. Cela peut se faire depuis Visual Studio ou avec la commande dotnet suivante : 
```cmd
dotnet new console -n [name]
```
Il faut ensuite ajouter le paquet nuget  `Microsoft.Extensions.Configuration.CommandLine`. Encore une fois, on peut l'effectuer depuis l'interface de Visual Studio, ou avec la commande 
```cmd
dotnet add package Microsoft.Extensions.Configuration.CommandLine
```

Il faut ensuite ajouter créer une instance de la classe `CommandLineApplication` et configurer notre CLI: 
```csharp
static void Main(string[] args)
{
    var app = new CommandLineApplication();

    app.HelpOption("-?|-h|--help");
    app.VersionOption("--version", "1.0.0");

    app.OnExecute(() =>
    {
        app.ShowHelp();
        return 0;
    });

    try
    {
        app.Execute(args);
    }
    catch (CommandParsingException ex)
    {
        Console.WriteLine(ex.Message);
        app.ShowHelp();
    }
}
```
Dans cette configuration, on peut voir de quelle manière on configure une CLI. On a enregistrer ici la commande permettant d'afficher la version ainsi que celle permettant d'afficher l'aide. Dans le cas ou une erreur survient lors du parsing des arguments passé, on affiche l'aide.

A ce stade, on peut déjà exécuté  la CLI. Son output sera le suivant : 

![cli](https://i.imgur.com/79Bpmjv.png)

Ajoutons une commande à notre CLI : 

```csharp
app.Command("greetings", command =>
{

    command.Description = "Greet someone";
    command.HelpOption("-?|-h|--help"); 

    var nameArg = command.Argument("[name]", "The name to greet");
    var fullOption = command.Option("-f|--full", "full greetings flag", CommandOptionType.NoValue);

    command.OnExecute(() =>
    {
        var name = nameArg.Value;
        var fullGreetings = fullOption.HasValue();
        Console.WriteLine($"Hello {name}." + (fullGreetings? " Hope you're fine !" : ""));
        return 0;
    });
});
```

On a ici créé une commande `greeting`. Cette commande dispose d'un argument `name` et d'une option `full`. En compilant ces 2 inputs, la commande écrit un message dans la console. 

L'output de notre CLI est maintenant le suivant :

![cli](https://i.imgur.com/BXgKyuk.png)

**Happy Coding !**
 