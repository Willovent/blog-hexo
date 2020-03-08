---
title: "Ajouter de l'injection de dépendances dans un CLI .NET"
date: '2018-11-13T23:00:00.000Z'
lang: fr
---
Dans cet article nous allons voir comment utiliser l'injection de dépendances d'ASP.NET dans un project de CLI .NET.
 Cet article va se baser sur la CLI créée dans l'article précédent [Créer une CLI en .NET](https://blog.williamklein.info/posts/ASP.NET/creer-une-cli-en-net), il est donc très fortement conseiller de le lire, ou de reprendre rapidement les exemples.

## Pourquoi faire ?

Utiliser le même système d'injection de dépendances que dans une API va permettre de mutualiser énormément de code. Pour prendre un exemple simple, on va pouvoir s'injecter avec la plus grande simplicité un contexte Entity Framework (ou autre ORM) dans une CLI en réutilisant toutes les configurations déjà utilisées dans une API.

## Comment faire ?

Pour commencer, nous allons refactorer notre code et placer sa logique dans une classe qui hérite de `CommandLineApplication`. Pour cela, rien de plus simple, il nous suffit de passer toute la configuration dans le constructeur de la classe: 

```csharp
public class MaCLI: CommandLineApplication
{
    public MaCLI()
    {
        this.HelpOption("-?|-h|--help");
        this.VersionOption("--version", "1.0.0");

        this.Command("greetings", command =>
        {

            command.Description = "Greet someone";
            command.HelpOption("-?|-h|--help");

            var nameArg = command.Argument("[name]", "The name to greet");
            var fullOption = command.Option("-f|--full", "full greeting flag", CommandOptionType.NoValue);

            command.OnExecute(() =>
            {
                var name = nameArg.Value;
                var fullGreeting = fullOption.HasValue();
                Console.WriteLine($"Hello {name}." + (fullGreeting ? " Hope you're fine !" : ""));
                return 0;
            });
        });

        this.OnExecute(() =>
        {
            this.ShowHelp();
            return 0;
        });
    }
}
```

Pour utiliser cette CLI, il faut maintenant modifier la fonction `Main` du `Program.cs`. Il suffit maintenant d'instancier la classe précédemment créée et d'appeler la méthode `Execute` en lui passant les arguments : 
```csharp
static void Main(string[] args)
{
    var app = new MaCLI();

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


Pourquoi faire modifications ? Cela nous permet maintenant d'utiliser le moteurs d'injection de dépendances pour résoudre cette classe, et donc ses différentes dépendances que l'on peut ajouter dans son constructeur.

Pour cela, la première étape est d'ajouter le nuget `Microsoft.Extensions.DependencyInjection`. Comme toujours, on peut l'effectuer depuis l'interface de Visual Studio, ou avec la commande

```cmd
dotnet add package Microsoft.Extensions.DependencyInjection
```

Une fois ce package ajouté, on peut utiliser la classe `ServiceCollection` qui implémente l'interface `IServiceCollection` (La même interface qui est utilisée dans la méthode `ConfigureServices` dans le `StartUp` d'une application ASP.NET Core !). 
On peut donc instancier cette classe et commencer à la remplir des différents services dont on va servir. Comme notre application n'a pas encore de dépendance, le code se résume alors à cela : 
```csharp
var services = new ServiceCollection();
services.AddScoped<MaCLI>();
```

Ensuite, pour récupérer une instance de notre classe `MaCLI` depuis le moteur de DI, il faut construire un `ServiceProvider` depuis notre collection de services. Cela se fait via la méthode `BuildServiceProvider` : 
```csharp
var serviceProvider = services.BuildServiceProvider();
```

C'est depuis ce service provider que l'on va pouvoir demander des instances de nos services. Pour cela il faut appeler la méthode `GetService` avec le type qui nous interèsse: 
```csharp
var app = serviceProvider.GetRequiredService<MaCLI>();
```

Et voilà !

Pour rendre l'utilité plus concrète, ajoutons un accès en base à notre CLI : 

```csharp
 public class MaCLI : CommandLineApplication
{
    public MaCLI(AppContext context)
    {
       ...

        this.Command("greetings", command =>
        {
            ...
            CommandArgument idArg = command.Argument("[Id]", "Id of the user to greet");            

            command.OnExecute(() =>
            {
                if (int.TryParse(idArg.Value, out int id))
                {
                    User user = context.Users.First(x => x.Id == id);
                    bool fullGreeting = fullOption.HasValue();
                    Console.WriteLine($"Hello {user.FirstName} {user.LastName}." + (fullGreeting ? " Hope you're fine !" : ""));
                    return 0;
                }
                else
                {
                    Console.WriteLine($"Argument 'Id' was not an integer");
                    return 1;
                }
            });
        });
        ...
   }
}
```

Notre CLI utilise maintenant un DbContext qui est injecté via son constructeur. Elle permet maintenant de saluer un user en base de données en fonction de son Id.

Il nous faut maintenant configurer le `DbContext` dans notre `ServiceCollection`. Pour cela, rien de plus facile : 

Comme il s'agit d'un `DbContext` qui est également utilisé dans mon Api, je dispose déjà du code permettant de configurer l'accès en base. Celui-ci se trouve dans une méthode d’extension qui prend en paramètre un `IServiceCollection` :
```csharp
public static void ConfigureData(this IServiceCollection services)
{
    services.AddDbContext<AppContext>(...);
}
```

Je n'ai donc plus qu'a appeler cette méthode dans mon `Main`. 
```csharp
class Program
{
    static void Main(string[] args)
    {
        var services = new ServiceCollection();
        ConfigureServices(services);
        var serviceProvider = services.BuildServiceProvider();

        var app = serviceProvider.GetRequiredService<MaCLI>();
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
    
    static void ConfigureServices(IServiceCollection services)
    {
        services.ConfigureData();
        services.AddScoped<MaCLI>();
    }
}
``` 

On peut également remarquer que la configuration des services se fait maintenant dans une méthode `ConfigureServices`. Ce n'est pas obligatoire, mais cela permet d'uniformiser le code avec ce qui se trouve coté API.

Le code de cette petite CLI est disponible sur github [ici](https://github.com/Willovent/simple-dot-cli-with-di), n'hesitez pas à y jeter un oeil.

**Happy Coding**
 