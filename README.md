# Board Game Hub

Une application mobile communautaire de gestion et partage de jeux de société, développée avec React Native et Expo.

## Fonctionnalités Principales

### 📚 Bibliothèque Personnelle
- Ajout et gestion de votre collection de jeux
- Import de jeux via JSON/CSV
- Catégorisation automatique
- Statuts : possédé, liste de souhaits, emprunté

### 📖 Règles Interactives
- Affichage structuré des règles de jeu
- Support multilingue
- Versioning des règles
- Assistant IA pour expliquer les règles (à venir)

### 🎯 Système de Score Automatisé
- Calculs automatiques des scores
- Support multi-joueurs et équipes
- Historique des parties
- Classements et statistiques

### 👥 Fonctionnalités Communautaires
- Partage de jeux avec la communauté
- Système d'amis
- Découverte de nouveaux jeux
- Recommandations personnalisées

### 📊 Gestion des Parties
- Création de sessions de jeu
- Suivi en temps réel des scores
- Ajout de joueurs invités
- Historique complet des parties

## Installation

### Prérequis
- Node.js 18+
- npm ou yarn
- Compte Supabase

### Configuration

1. Cloner le repository
```bash
git clone <repository-url>
cd board-game-hub
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer Supabase
   - Créer un projet sur [supabase.com](https://supabase.com)
   - Copier `.env.example` vers `.env`
   - Ajouter vos identifiants Supabase

```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Les migrations de base de données sont déjà appliquées via les outils MCP

### Démarrage

```bash
npm run dev
```

## Structure du Projet

```
app/
├── (tabs)/              # Navigation principale
│   ├── index.tsx       # Bibliothèque
│   ├── games.tsx       # Découverte
│   ├── community.tsx   # Communauté
│   └── profile.tsx     # Profil
├── auth/               # Authentification
│   ├── login.tsx
│   └── signup.tsx
├── game/               # Gestion des jeux
│   ├── add.tsx
│   ├── import.tsx
│   ├── [id].tsx
│   └── [id]/rules.tsx
└── session/            # Sessions de jeu
    ├── create.tsx
    └── [id].tsx

components/             # Composants réutilisables
contexts/              # Contexts React (Auth)
lib/                   # Configuration (Supabase)
types/                 # Types TypeScript
utils/                 # Utilitaires (import/export)
```

## Base de Données

### Tables Principales

- **profiles** : Profils utilisateurs
- **games** : Catalogue de jeux
- **game_rules** : Règles structurées (JSONB)
- **scoring_systems** : Systèmes de notation
- **user_libraries** : Bibliothèques personnelles
- **game_sessions** : Sessions de jeu
- **session_players** : Joueurs et scores
- **friendships** : Relations sociales
- **game_shares** : Partages de jeux

## Import de Jeux

### Format JSON

```json
{
  "title": "Skull King",
  "description": "A trick-taking card game",
  "minPlayers": 2,
  "maxPlayers": 6,
  "durationMinutes": 30,
  "ageMin": 8,
  "complexity": 2,
  "rules": {
    "sections": [
      {
        "title": "Objective",
        "content": "Predict the exact number of tricks you will win"
      }
    ]
  },
  "scoringSystem": {
    "name": "Standard",
    "config": {
      "type": "points",
      "formula": "bid * 20 + tricks * 10"
    },
    "isAutomated": true
  }
}
```

### Format CSV

```csv
title,description,minPlayers,maxPlayers,duration,age,complexity
Skull King,A trick-taking card game,2,6,30,8,2
Catan,Resource management and trading,3,4,90,10,3
```

## Sécurité

L'application utilise Row Level Security (RLS) de Supabase pour garantir que :
- Les utilisateurs ne peuvent accéder qu'à leurs propres données
- Les jeux publics sont accessibles à tous
- Les jeux partagés respectent les permissions définies

## Fonctionnalités à Venir

- [ ] Assistant IA pour les règles
- [ ] Analyse de photos de plateau pour calcul automatique des scores
- [ ] Intégration BGG (BoardGameGeek)
- [ ] Mode hors ligne
- [ ] Synchronisation multi-appareils avancée
- [ ] Tournois et événements
- [ ] Statistiques avancées

## Technologies

- **Frontend** : React Native, Expo SDK 54
- **Backend** : Supabase (PostgreSQL, Auth, Storage)
- **Navigation** : Expo Router
- **UI** : StyleSheet (React Native)
- **Icons** : Lucide React Native

## Contribution

Les contributions sont les bienvenues ! Veuillez ouvrir une issue pour discuter des changements majeurs.

## Licence

MIT

## Support

Pour toute question ou problème, ouvrez une issue sur GitHub.
