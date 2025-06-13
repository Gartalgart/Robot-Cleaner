# Robot Cleaner

Ce projet propose une petite simulation de robot aspirateur capable de nettoyer une maison case par case.

## Objectif

L'algorithme gère les déplacements du robot et nettoie chaque pièce de la grille jusqu'à ce que tout soit propre. L'interface web permet de visualiser cette progression.

## Prérequis

- [Node.js](https://nodejs.org/) et `npm`
- [Sass](https://sass-lang.com/) (installé comme dépendance de développement)

## Installation

```bash
npm install
```

## Développement

Lancez la compilation des styles avec :

```bash
npm run sass
```

Cette commande surveille `style.scss` et met à jour `style.css`.

## Lancement

Après compilation des styles, ouvrez simplement `index.html` dans votre navigateur pour démarrer la démonstration.

## Structure du projet

- **js/core** : classes principales (`House`, `Piece`, `Robot`)
- **js/ui** : gestion de l'affichage et des contrôles (`render`, `controls`, `chrono`)
- **js/main.js** : point d'entrée de l'application
- **js/utils.js** : fonctions utilitaires
- **style.scss / responsive.scss** : feuilles de style (compilées en `style.css`)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
