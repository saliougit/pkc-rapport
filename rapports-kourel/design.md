# Design System — DMN Pôle Kourel Centrale

> Référence unique pour tous les écrans de l'application.
> Avant tout développement UI, consulter ce fichier.

---

## 1. Fondations

### Palette de couleurs

```
/* Vert — couleur principale de l'institution */
--vert-900: #012E17   /* fonds sombres, textes forts */
--vert-800: #014421   /* sidebar, headers */
--vert-700: #016A3B   /* bouton primaire */
--vert-600: #16824E   /* bouton primaire hover, liens actifs */
--vert-400: #3BAD72   /* icônes actives */
--vert-200: #A8D8C0   /* bordures légères, sous-titres sur fond vert */
--vert-100: #D6EEE4   /* badges "terminé" */
--vert-50:  #EEF8F3   /* fond de section active, highlight */

/* Neutrals — structure de la page */
--gris-950: #111714   /* textes principaux */
--gris-700: #3D4A42   /* textes secondaires */
--gris-500: #6B7A71   /* placeholders, labels */
--gris-300: #BAC3BD   /* bordures */
--gris-200: #DDE3DF   /* séparateurs */
--gris-100: #F0F2F0   /* fonds alternés */
--gris-50:  #F8FAF9   /* fond de page */

/* Sémantiques */
--orange:   #D97706   /* en cours, attention */
--orange-bg:#FEF3C7
--rouge:    #B91C1C   /* erreur, retard */
--rouge-bg: #FEE2E2
--bleu:     #2563EB   /* info, liens */
--bleu-bg:  #EFF6FF

/* Fond de page */
--surface:  #F5F3EE   /* fond général — blanc chaud, pas gris froid */
--card:     #FFFFFF   /* surface des cartes */
```

### Typographie

**Police unique** : `Inter` (Google Fonts) — charger uniquement 400, 500, 600, 700

```css
/* Hiérarchie */
--text-xs:   11px / line-height 1.4   /* labels, badges */
--text-sm:   13px / line-height 1.5   /* corps secondaire */
--text-base: 15px / line-height 1.6   /* corps principal */
--text-lg:   17px / line-height 1.4   /* titres de section */
--text-xl:   20px / line-height 1.3   /* titres de page */
--text-2xl:  26px / line-height 1.2   /* grand titre (accueil) */
```

Règles :
- **Bold (700)** : titres de page, valeurs chiffrées importantes
- **Semibold (600)** : noms, labels de champ, boutons
- **Medium (500)** : navigation, texte interactif
- **Regular (400)** : corps de texte, descriptions

---

## 1b. Rôles & accès

| Rôle | Qui | Ce qu'il voit |
|---|---|---|
| `admin` | Toi | Tout : rapports, évaluation, synthèse, PAD, comptes rendus, gestion |
| `dieuwrigne` | Responsable comité suivi-éval | Évaluation seulement : membres comité, événements, évaluations, rapports éval |
| `membre` | Responsable kourel / membre PAD | Vue simple : section PKC (rapports mensuels) et/ou section PAD (présences) selon affectation |

**Vue membre** : même shell simple que l'accueil actuel, avec deux onglets : **Rapports PKC** et **Rapports PAD**. On n'affiche que les onglets auxquels le membre est affecté.

---

## 2. Layout

### Shell principal (après connexion de type admin/membre)

```
┌────────────────────────────────────────────────────┐
│  SIDEBAR 240px fixe          CONTENU PRINCIPAL      │
│  ┌──────────────┐            ┌──────────────────┐   │
│  │ Logo + Titre │            │ PageHeader        │   │
│  │──────────────│            │──────────────────│   │
│  │ Navigation   │            │                   │   │
│  │  • Section   │            │  Corps de page    │   │
│  │  • Section   │            │  (scroll)         │   │
│  │  • Section   │            │                   │   │
│  │──────────────│            └──────────────────┘   │
│  │ User + Déco. │                                    │
│  └──────────────┘                                    │
└────────────────────────────────────────────────────┘
```

**Mobile** (< 768px) : sidebar → drawer (glisse depuis la gauche via hamburger)

### Shell formulaire / wizard (actuel — rapport mensuel)

Garder le pattern stepper fixe en haut + boutons fixes en bas, contenu scrollable.

### Grille de contenu

- Padding de page : `24px` desktop / `16px` mobile
- Max-width contenu : `900px` (pages formulaire) / `1100px` (pages liste/tableau)
- Gap entre cartes : `16px`
- Gap entre sections : `32px`

---

## 3. Composants

### Boutons

```
Primaire    bg:vert-700  text:white   hover:vert-800   border:none    h:40px
Secondaire  bg:white     text:vert-700  hover:vert-50  border:vert-300  h:40px
Ghost       bg:transparent  text:gris-700  hover:gris-100  border:none  h:40px
Danger      bg:rouge-bg  text:rouge    hover:rouge/10  border:rouge   h:40px
```

- `border-radius: 8px` (pas de rounded-full sur les boutons d'action)
- `font-weight: 600`, `font-size: 13px`
- Icône + texte : gap `8px`, icône `16px`
- État disabled : `opacity-40`, `cursor-not-allowed`
- Jamais de dégradé sur les boutons

### Cartes

```
surface: white
border: 1px solid gris-200
border-radius: 12px
padding: 20px (desktop) / 16px (mobile)
shadow: 0 1px 3px rgba(0,0,0,0.06)  ← pas de shadow lourde
```

**Stat card** (nombre + label) :
```
valeur:  text-2xl font-700 vert-800
label:   text-xs font-500 gris-500 uppercase tracking-wide
```

### Formulaires

```
Label       : text-xs font-600 gris-500 uppercase tracking-wide, mb-6px
Input       : border gris-300, radius 8px, h-40px, px-12px, text-sm gris-950
              focus: border vert-600, ring 2px vert-50
              disabled: bg gris-100, text gris-500
Select      : même style que input
Textarea    : même style, min-h 80px, resize-y
Error msg   : text-xs rouge, mt-4px
```

### Tableau

```
Header row  : bg gris-50, text-xs font-600 gris-500 uppercase, h-40px
Data row    : bg white, border-b gris-100, h-52px, text-sm
Hover row   : bg gris-50
Action cell : boutons ghost, icônes 16px, gap 4px
```

### Badges / statuts

```
Terminé     : bg vert-100, text vert-800, font-600
En cours    : bg orange-bg, text orange-700, font-600
Pas commencé: bg gris-100, text gris-600, font-500
Retard      : bg rouge-bg, text rouge, font-600
```
- `border-radius: 6px`, `padding: 2px 8px`, `font-size: 11px`

### Navigation sidebar

```
Fond         : vert-800
Item normal  : text vert-200, hover bg vert-900/40
Item actif   : bg vert-900, text white, bordure gauche 3px vert-400
Section label: text vert-400 text-xs uppercase tracking-widest, mb-8px
```

### PageHeader

```
Titre de page   : text-xl font-700 gris-950
Sous-titre      : text-sm gris-500
Breadcrumb      : text-xs gris-500 / separator " › " / actif gris-950
Bouton d'action : bouton Primaire, aligné à droite
Séparateur bas  : border-b gris-200, mb-24px
```

---

## 4. Iconographie

**Librairie unique** : `lucide-react` (déjà installée)
- Taille standard : `18px`
- Taille petite (dans badge/label) : `14px`
- Taille large (illustration vide) : `40px`
- Couleur : hérite de `currentColor` — toujours la même que le texte parent

Pas de mélange avec d'autres librairies d'icônes.

---

## 5. États vides et de chargement

**Liste vide** :
```
icône centrée 40px gris-300
titre: text-sm font-600 gris-700  "Aucun X pour le moment"
texte: text-sm gris-500            description courte
bouton (optionnel): Primaire ou Secondaire
```

**Chargement** :
- Spinner `lucide Loader` `animate-spin` en vert-600, centré
- Pas de skeleton sauf pour les tableaux longs (> 10 lignes attendues)

**Erreur** :
- Bandeau `bg rouge-bg border rouge border-l-4` avec message clair

---

## 6. Espacement — règles strictes

| Utilisation | Valeur |
|---|---|
| Entre deux champs de formulaire | `16px` |
| Entre sections dans une page | `32px` |
| Entre cartes dans une grille | `16px` |
| Padding interne d'une carte | `20px` |
| Padding d'un bouton | `10px 16px` |
| Gap icône + texte dans un bouton | `8px` |

---

## 7. Ce qu'on ne fait pas

- Pas de `rounded-full` sur les boutons (sauf avatar)
- Pas de gradient sur les fonds de page ou les boutons
- Pas de `shadow-xl` ou `shadow-2xl` sur les cartes
- Pas de plusieurs tailles de police dans le même bloc de texte
- Pas de couleur de fond différente sur chaque section de la même page
- Pas d'animation sauf `transition-colors` (150ms) et `animate-spin`
- Pas de texte en majuscules sauf labels et nav sections (et uniquement en `text-xs`)
