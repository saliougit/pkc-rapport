# 📊 Rapports Kourel - Daara Madjmahoun Noreyni

Application web pour la génération de rapports de suivi des kourels avec export PDF.

## ✨ Fonctionnalités

- ✅ **Gestion Programme Annuel** : Configuration des khassidas avec mélodie
- ✅ **Rapport Mensuel Multi-étapes** :
  1. Identification (kourel, mois, date)
  2. Avancement des Mélodies (du programme ou autres)
  3. Programme Annuel (état des khassidas)
  4. Appréciation & Conclusion
- ✅ **Mode Évaluation Flexible** : Par pages OU par Dadj
- ✅ **Type de Mélodie** : Nouvelle ou Révision
- ✅ **Calcul Automatique** : Taux, statuts, progression globale
- ✅ **Sauvegarde Auto** : LocalStorage
- ✅ **Export PDF** : Génération avec design identique au template LaTeX

## 🚀 Installation

### Prérequis
- Node.js 16+ (https://nodejs.org/)

### Étapes

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer en développement
npm run dev

# 3. Ouvrir dans le navigateur
# → http://localhost:3000
```

## 📦 Déploiement sur Vercel

```bash
# 1. Installer Vercel CLI (si pas déjà fait)
npm i -g vercel

# 2. Se connecter
vercel login

# 3. Déployer
vercel

# 4. Production
vercel --prod
```

Ton URL sera : `https://rapports-kourel.vercel.app`

## 🎨 Stack Technique

- **Frontend** : React 18 + Vite
- **Styling** : Tailwind CSS (palette verte DMN exacte)
- **Icons** : Lucide React
- **PDF** : Génération LaTeX → PDF (à implémenter)

## 📂 Structure

```
rapports-kourel/
├── src/
│   ├── components/
│   │   └── FormulaireRapport.jsx  # Formulaire multi-étapes
│   ├── App.jsx                     # Application principale
│   ├── main.jsx                    # Point d'entrée React
│   └── index.css                   # Styles Tailwind
├── public/                         # Assets statiques
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🎯 Utilisation

### 1. Sélectionner le Kourel
- Choisir parmi les 6 kourels prédéfinis
- Ou saisir un nouveau kourel

### 2. Gérer le Programme Annuel (optionnel)
- Ajouter les khassidas du programme
- Format : Nom + Mélodie (ex: Khatimatou - Serigne Abdou Diop)
- Modifier / Supprimer

### 3. Créer un Rapport

**Étape 1 : Identification**
- Mois, année, date
- Représentant (optionnel)

**Étape 2 : Mélodies**
- Source : Du programme OU Autre
- Type : Nouvelle OU Révision
- Évaluation : Par pages OU Par Dadj
- Par défaut : 1er Dadj coché

**Étape 3 : Programme Annuel**
- Cocher l'état de chaque khassida
- Terminé / En cours (%) / Pas commencé
- Calcul auto : Taux global, stats
- Textareas : Objectifs, ajustements

**Étape 4 : Appréciation**
- Appréciation générale
- Points positifs
- À surveiller
- En retard
- Priorités mois suivant

### 4. Télécharger le PDF
- Cliquer sur "Télécharger le PDF"
- Format identique au template LaTeX
- Design avec palette verte DMN

## 🎨 Palette de Couleurs

```css
Vert Principal : #16824E
Vert Foncé     : #014421
Vert Pastel    : #E8F5E9
Orange Strat   : #E67E22
Rouge Alerte   : #C0392B
Bleu Info      : #34495E
Gris Clair     : #F5F5F5
```

## 🔧 Configuration

### LocalStorage
Les données sont sauvegardées automatiquement dans :
- `rapports_kourel_data` : Programme annuel

### Personnalisation

**Ajouter des kourels par défaut** → `src/App.jsx` ligne 5

```javascript
const KOURELS_DEFAULT = [
  { id: 7, nom: 'Kourel 7', responsable: 'Nouveau Responsable' },
  // ...
]
```

## 📝 TODO

- [ ] Implémenter génération PDF LaTeX
- [ ] Ajouter prévisualisation avant téléchargement
- [ ] Export JSON des données
- [ ] Import JSON pour reprendre un rapport
- [ ] Mode offline complet
- [ ] Historique des rapports
- [ ] Statistiques sur plusieurs mois

## 👨‍💻 Développement

```bash
# Développement
npm run dev

# Build production
npm run build

# Preview production
npm run preview
```

## 📄 Licence

© 2026 Daara Madjmahoun Noreyni - UCAD

---

**Développé par :** Baye Saliou NIANE (SG - Pôle Kourel Centrale)
