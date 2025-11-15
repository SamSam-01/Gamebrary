# Guide de Démarrage Rapide

## Configuration en 5 Minutes

### 1. Installation des Dépendances

```bash
npm install
```

### 2. Configuration de Supabase

#### Option A : Utiliser un projet Supabase existant
1. Allez sur [supabase.com](https://supabase.com) et créez un compte
2. Créez un nouveau projet
3. Attendez que le projet soit initialisé (2-3 minutes)
4. Allez dans Project Settings > API
5. Copiez l'URL du projet et la clé `anon/public`

#### Option B : Les migrations sont déjà appliquées
Les migrations de base de données ont été automatiquement appliquées via les outils MCP Supabase. Vous n'avez rien à faire !

### 3. Variables d'Environnement

Créez un fichier `.env` à la racine du projet :

```env
EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon
```

### 4. Démarrer l'Application

```bash
npm run dev
```

Scannez le QR code avec l'app Expo Go sur votre téléphone, ou appuyez sur :
- `w` pour ouvrir dans le navigateur
- `a` pour Android Emulator
- `i` pour iOS Simulator

## Premier Lancement

### Créer un Compte
1. Ouvrez l'application
2. Cliquez sur "Sign Up"
3. Entrez un nom d'utilisateur, email et mot de passe
4. Vous êtes automatiquement connecté !

### Ajouter Votre Premier Jeu

#### Méthode 1 : Manuellement
1. Allez sur l'onglet "Library"
2. Cliquez sur le bouton "+"
3. Remplissez les informations du jeu
4. Cliquez sur "Add Game"

#### Méthode 2 : Import JSON
1. Allez sur l'onglet "Library"
2. Cliquez sur l'icône d'upload
3. Copiez le contenu de `examples/skull-king.json`
4. Collez dans le champ de texte
5. Cliquez sur "Import Games"

#### Méthode 3 : Import CSV
1. Allez sur l'onglet "Library"
2. Cliquez sur l'icône d'upload
3. Sélectionnez "CSV"
4. Copiez le contenu de `examples/games-batch.csv`
5. Collez dans le champ de texte
6. Cliquez sur "Import Games"

### Créer une Session de Jeu

1. Depuis votre bibliothèque, cliquez sur un jeu
2. Cliquez sur "Start Session"
3. Ajoutez des joueurs (vous êtes automatiquement ajouté)
4. Cliquez sur "Start Session"
5. Entrez les scores pendant la partie
6. Cliquez sur "Save Scores"
7. Terminez la session quand la partie est finie

### Explorer la Communauté

1. Allez sur l'onglet "Discover"
2. Parcourez les jeux publics partagés par la communauté
3. Ajoutez-les à votre bibliothèque en un clic
4. Partagez vos propres jeux en les rendant publics

## Fonctionnalités Clés

### 📚 Bibliothèque
- Gérez votre collection
- Statuts : possédé, wishlist, emprunté
- Notes personnelles sur chaque jeu

### 🎮 Sessions
- Créez des parties
- Ajoutez des joueurs (amis ou invités)
- Suivez les scores en temps réel
- Historique complet

### 👥 Social
- Ajoutez des amis
- Partagez vos jeux
- Découvrez de nouveaux jeux
- Voyez les statistiques de vos amis

### 📖 Règles
- Consultez les règles structurées
- Support de plusieurs versions
- Recherche dans les règles

## Exemples de Données

Le dossier `examples/` contient :
- `skull-king.json` : Un jeu complet avec règles et système de score
- `games-batch.csv` : 12 jeux populaires à importer en masse

## Dépannage

### L'app ne démarre pas
```bash
# Nettoyer le cache
npm start -- --clear

# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

### Erreur de connexion Supabase
- Vérifiez que vos variables d'environnement sont correctes
- Assurez-vous que votre projet Supabase est actif
- Vérifiez que vous avez une connexion internet

### Impossible de créer un compte
- Vérifiez que l'email n'est pas déjà utilisé
- Le mot de passe doit faire au moins 6 caractères
- Le nom d'utilisateur doit faire au moins 3 caractères

## Prochaines Étapes

- Explorez l'onglet "Profile" pour personnaliser votre profil
- Invitez des amis dans l'onglet "Community"
- Créez votre premier jeu personnalisé avec des règles détaillées
- Testez le système de scoring automatique avec Skull King

## Support

Consultez le [README.md](./README.md) pour plus d'informations ou ouvrez une issue sur GitHub.
