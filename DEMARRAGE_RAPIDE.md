# 🚀 DÉMARRAGE RAPIDE - Rapports Kourel

## ⚡ Installation Ultra-Rapide (5 minutes)

### 1. Installer Node.js

**Si pas déjà installé :**
- Windows/Mac : https://nodejs.org/ (télécharger LTS)
- Linux : `sudo apt install nodejs npm`

**Vérifier :**
```bash
node --version   # Doit afficher v16 ou supérieur
npm --version    # Doit afficher 8 ou supérieur
```

### 2. Installer & Lancer

```bash
# Aller dans le dossier
cd rapports-kourel

# Installer (première fois uniquement - prend 1-2 min)
npm install

# Lancer l'application
npm run dev
```

### 3. Ouvrir dans le navigateur

```
http://localhost:3000
```

**C'EST TOUT ! L'application est lancée** 🎉

---

## 🌐 Déploiement Web (Gratuit - Vercel)

### Option 1 : Via le site Vercel (plus simple)

1. Va sur https://vercel.com
2. Crée un compte (gratuit)
3. Clique "New Project"
4. Importe le dossier `rapports-kourel`
5. Vercel déploie automatiquement
6. Tu obtiens ton URL : `https://rapports-kourel.vercel.app`

### Option 2 : Via la ligne de commande

```bash
# Installer Vercel
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Suivre les instructions, répondre :
# ? Set up and deploy? → Yes
# ? Which scope? → Ton compte
# ? Link to existing project? → No
# ? What's your project's name? → rapports-kourel
# ? In which directory is your code located? → ./

# Déploiement production
vercel --prod
```

**Ton URL sera visible à la fin !**

---

## 📋 Utilisation

### 1. Page d'Accueil
- Sélectionne ton kourel (ou "Autre" pour saisir)
- **Bouton 1** : Gérer Programme Annuel
- **Bouton 2** : Créer un Rapport

### 2. Programme Annuel (configuration 1 fois)
- Ajoute tes khassidas : Nom + Mélodie
- Ex: "Khatimatou" + "Serigne Abdou Diop"
- Sauvegarde automatique

### 3. Créer un Rapport (4 étapes)

**Étape 1 : Identification**
- Mois, année, date
- Représentant (optionnel)

**Étape 2 : Mélodies du mois**
- Clique "+ Ajouter mélodie"
- Choix : Du programme OU Autre
- Type : Nouvelle OU Révision
- Évaluation :
  - **Par pages** : Pages faites / Total
  - **Par Dadj** : Cocher les Dadj (1er coché par défaut)
- Calcul auto du taux et statut

**Étape 3 : Programme Annuel**
- Coche l'état de chaque khassida :
  - ● Terminé
  - ● En cours (avec %)
  - ● Pas commencé
- Stats calculées automatiquement
- Remplis les textareas (objectifs, ajustements)

**Étape 4 : Appréciation**
- Appréciation générale
- 4 blocs colorés :
  - 🟢 Points positifs
  - 🟠 À surveiller
  - 🔴 En retard
  - 🔵 Priorités

### 4. Télécharger le PDF
- Bouton "Télécharger le PDF"
- Design identique au template LaTeX
- Palette verte DMN

---

## 🔧 Commandes Utiles

```bash
# Développement
npm run dev          # Lance le serveur (localhost:3000)

# Production
npm run build        # Compile le projet
npm run preview      # Prévisualise la version compilée

# Déploiement
vercel               # Déploie sur Vercel
vercel --prod        # Déploiement production
```

---

## ❓ Problèmes Courants

### "npm not found"
→ Node.js pas installé. Installer depuis https://nodejs.org/

### Port 3000 déjà utilisé
```bash
# Modifier le port dans vite.config.js
server: {
  port: 3001  # Ou autre port
}
```

### Erreur au lancement
```bash
# Supprimer et réinstaller
rm -rf node_modules
npm install
npm run dev
```

### Données perdues
→ Les données sont dans le LocalStorage du navigateur
→ Ne pas vider le cache du navigateur

---

## 📧 Support

**Développé par :** Baye Saliou NIANE  
**Contact :** SG - Pôle Kourel Centrale  
**Organisation :** Daara Madjmahoun Noreyni - UCAD

---

**VERSION :** 1.0.0 - Mars 2026  
**STATUT :** ✅ Fonctionnel (PDF génération à implémenter)
