# API de Recherche Cloudflare

Cette API permet de rechercher du texte sur des pages web protégées par Cloudflare en utilisant Browserless et des proxies publics.

## Installation

1. Clonez ce dépôt
2. Installez les dépendances :

```bash
npm install
```

## Configuration

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```
PORT=3000
BROWSERLESS_TOKEN=votre_token_browserless
```

## Démarrage

Pour démarrer l'API en mode développement :

```bash
npm run dev
```

Pour démarrer en production :

```bash
npm start
```

## Utilisation

### Endpoint de recherche

`POST /search`

#### Corps de la requête

```json
{
  "url": "https://exemple.com",
  "searchText": "texte à rechercher"
}
```

#### Réponse

```json
{
  "found": true,
  "context": "texte autour de la recherche...",
  "url": "https://exemple.com",
  "proxy": "http://ip:port"
}
```

## Fonctionnalités

- Utilisation de Browserless pour le scraping
- Rotation automatique des proxies publics
- Bypass de la protection Cloudflare
- Recherche de texte insensible à la casse
- Retourne le contexte autour du texte trouvé
- Gestion des erreurs
- Support CORS

## Notes

- L'API utilise Browserless pour exécuter les navigateurs headless
- Les proxies sont obtenus depuis l'API GeoNode
- Un délai de 5 secondes est ajouté pour s'assurer que Cloudflare est passé
- Les requêtes timeout après 30 secondes
- Les proxies sont anonymisés via proxy-chain
