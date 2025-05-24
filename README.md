# Scraping TCF Canada

Application de scraping pour extraire les sujets d'expression écrite et orale du TCF Canada.

## 🚀 Fonctionnalités

- Scraping des sujets d'expression écrite
- Scraping des sujets d'expression orale
- Interface utilisateur moderne avec DaisyUI
- Export des données au format JSON
- Copie rapide des sujets dans le presse-papiers

## 📋 Prérequis

- Node.js (version 14 ou supérieure)
- npm ou yarn

## 🔧 Installation

1. Clonez le dépôt :

```bash
git clone [URL_DU_REPO]
cd scraping
```

2. Installez les dépendances :

```bash
npm install
```

3. Créez un fichier `.env` à la racine du projet :

```env
PORT=3000
```

## 🚀 Utilisation

1. Démarrez le serveur :

```bash
npm start
```

2. Ouvrez votre navigateur à l'adresse :

```
http://localhost:3000
```

3. Utilisez l'interface pour :
   - Scraper les sujets d'expression écrite
   - Scraper les sujets d'expression orale
   - Copier les sujets dans le presse-papiers

## 📡 Utilisation de l'API

### Expression Écrite

```bash
curl -X POST http://localhost:3000/api/scrape/expression-ecrite \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://reussir-tcfcanada.com/mars-2025-expression-ecrite/"
  }'
```

Réponse :

```json
{
  "success": true,
  "data": {
    "combinaison": {
      "combinaison_1": {
        "Tache_1": "Vous avez assisté à une conférence sur l'impact des réseaux sociaux...",
        "Tache_2": "Vous écrivez à un ami pour lui raconter votre expérience...",
        "Tache_3": "Vous rédigez un article pour le journal de votre école..."
      }
    }
  },
  "url": "https://reussir-tcfcanada.com/mars-2025-expression-ecrite/",
  "timestamp": "2024-03-24T10:30:00.000Z"
}
```

### Expression Orale

```bash
curl -X POST http://localhost:3000/api/scrape/expression-orale \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://reussir-tcfcanada.com/mars-2025-expression-orale/"
  }'
```

Réponse :

```json
{
  "success": true,
  "data": {
    "taches": {
      "tache_1": {
        "partie_1": {
          "sujet_1": "Présentez-vous et parlez de votre parcours professionnel..."
        },
        "partie_2": {
          "sujet_1": "Vous devez organiser une réunion avec vos collègues..."
        },
        "partie_3": {
          "sujet_1": "Vous participez à un débat sur l'impact de la technologie..."
        }
      }
    }
  },
  "url": "https://reussir-tcfcanada.com/mars-2025-expression-orale/",
  "timestamp": "2024-03-24T10:30:00.000Z"
}
```

### Gestion des erreurs

En cas d'erreur, l'API renvoie un objet avec `success: false` :

```json
{
  "success": false,
  "error": "URL invalide : doit contenir 'expression-ecrite'",
  "url": "https://exemple.com",
  "timestamp": "2024-03-24T10:30:00.000Z"
}
```

## 📁 Structure du projet

```
scraping/
├── src/
│   ├── index.js      # Serveur Express
│   └── scap.js       # Fonctions de scraping
├── public/
│   └── index.html    # Interface utilisateur
├── output/           # Fichiers JSON générés
├── .env             # Variables d'environnement
└── package.json     # Dépendances
```

## 🔧 Configuration

Le projet utilise les technologies suivantes :

- Express.js pour le serveur
- DaisyUI pour l'interface
- node-fetch pour les requêtes HTTP

## 📝 Format des données

### Expression Écrite

```json
{
  "combinaison": {
    "combinaison_1": {
      "Tache_1": "contenu",
      "Tache_2": "contenu",
      "Tache_3": "contenu"
    }
  }
}
```

### Expression Orale

```json
{
  "taches": {
    "tache_1": {
      "partie_1": {
        "sujet_1": "contenu"
      }
    }
  }
}
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Auteurs

- Votre nom - Développeur initial

## 🙏 Remerciements

- [DaisyUI](https://daisyui.com/) pour l'interface utilisateur
- [Express.js](https://expressjs.com/) pour le serveur
- [node-fetch](https://www.npmjs.com/package/node-fetch) pour les requêtes HTTP
