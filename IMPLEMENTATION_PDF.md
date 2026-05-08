# 📄 IMPLÉMENTATION GÉNÉRATION PDF

## 🎯 Objectif

Générer un PDF avec le design exact du template LaTeX à partir des données du formulaire.

---

## 🔧 Solution Recommandée : LaTeX.Online API

### Avantages
- ✅ Gratuit
- ✅ Pas de serveur à gérer
- ✅ Design 100% identique au template
- ✅ Simple à implémenter

### Comment ça marche

```
Données JSON → Génère fichier .tex → Envoie à LaTeX.Online → Reçoit PDF
```

---

## 📝 Étapes d'Implémentation

### 1. Créer le générateur de .tex

**Fichier :** `src/utils/latexGenerator.js`

```javascript
export function genererLatex(rapport, kourel, programmeAnnuel) {
  // Template LaTeX de base
  const template = `
\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
% ... (copier le préambule du template existant)

\\begin{document}

% PAGE DE GARDE
\\begin{center}
  \\textbf{\\Large ${kourel.nom}}
  
  Rapport ${rapport.mois} ${rapport.annee}
\\end{center}

% MÉLODIES
\\section{Avancement des Mélodies}

${rapport.melodies.map(m => `
  \\textbf{${m.nom}} (${m.melodie})
  
  ${m.mode === 'pages' ? 
    `${m.pages_faites} / ${m.pages_total} pages` :
    `${m.dadj_completes.length} Dadj complétés sur ${m.dadj_total}`
  }
  
  Taux : ${m.taux}\\% - ${m.statut.label}
`).join('\n')}

% PROGRAMME ANNUEL
${programmeAnnuel.length > 0 ? `
  \\section{Programme Annuel}
  
  Taux global : ${calcStatsProgamme().tauxGlobal}\\%
  
  Terminés : ${calcStatsProgamme().termines}
  En cours : ${calcStatsProgamme().enCours}
  Pas commencés : ${calcStatsProgamme().pasCommences}
` : ''}

% APPRÉCIATION
\\section{Appréciation}

${rapport.appreciation.generale}

\\subsection{Points positifs}
${rapport.appreciation.points_positifs}

\\subsection{À surveiller}
${rapport.appreciation.a_surveiller}

\\subsection{En retard}
${rapport.appreciation.en_retard}

\\subsection{Priorités}
${rapport.appreciation.priorites}

\\end{document}
`

  return template
}
```

### 2. Appeler LaTeX.Online API

**Fichier :** `src/utils/pdfService.js`

```javascript
import { genererLatex } from './latexGenerator'

export async function genererPDF(rapport, kourel, programmeAnnuel) {
  try {
    // 1. Générer le .tex
    const texContent = genererLatex(rapport, kourel, programmeAnnuel)
    
    // 2. Créer FormData
    const formData = new FormData()
    const blob = new Blob([texContent], { type: 'text/plain' })
    formData.append('file', blob, 'rapport.tex')
    
    // 3. Appeler LaTeX.Online
    const response = await fetch('https://latexonline.cc/compile', {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      throw new Error('Erreur compilation LaTeX')
    }
    
    // 4. Récupérer le PDF
    const pdfBlob = await response.blob()
    
    // 5. Télécharger
    const url = window.URL.createObjectURL(pdfBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Rapport_${kourel.nom}_${rapport.mois}_${rapport.annee}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    
    return { success: true }
    
  } catch (error) {
    console.error('Erreur génération PDF:', error)
    return { success: false, error: error.message }
  }
}
```

### 3. Utiliser dans le composant

**Fichier :** `src/components/FormulaireRapport.jsx`

```javascript
import { genererPDF } from '../utils/pdfService'

// Dans EtapeAppreciation
const genererPDFClick = async () => {
  setLoading(true)
  
  const result = await genererPDF(rapport, kourel, programmeAnnuel)
  
  if (result.success) {
    alert('PDF généré avec succès !')
  } else {
    alert(`Erreur : ${result.error}`)
  }
  
  setLoading(false)
}

return (
  <button
    onClick={genererPDFClick}
    disabled={loading}
    className="..."
  >
    {loading ? 'Génération...' : 'Télécharger PDF'}
  </button>
)
```

---

## 🎨 Template LaTeX Complet

Le template doit inclure :

1. **Préambule** (packages, couleurs, commandes)
```latex
\\definecolor{VertPrincipal}{RGB}{22,130,78}
\\definecolor{VertFonce}{RGB}{1,68,33}
% ... etc
```

2. **Page de garde** (logo, titre, kourel)

3. **Section Mélodies** (barres de progression TikZ)

4. **Section Programme Annuel** (si configuré)
   - Stats globales
   - Liste khassidas avec état

5. **Section Appréciation** (4 blocs colorés)

6. **Footer** (signature, date)

---

## 📦 Alternative : Backend Node.js

Si LaTeX.Online ne marche pas bien :

### Option 1 : Vercel Serverless Function

**Fichier :** `api/generate-pdf.js`

```javascript
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'

const execAsync = promisify(exec)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  const { texContent } = req.body
  
  try {
    // Écrire le .tex
    await fs.writeFile('/tmp/rapport.tex', texContent)
    
    // Compiler
    await execAsync('pdflatex -output-directory=/tmp /tmp/rapport.tex')
    
    // Lire le PDF
    const pdf = await fs.readFile('/tmp/rapport.pdf')
    
    // Retourner
    res.setHeader('Content-Type', 'application/pdf')
    res.send(pdf)
    
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
```

**Problème :** Vercel Serverless ne supporte pas pdflatex nativement.  
**Solution :** Utiliser un Docker avec texlive ou un service externe.

### Option 2 : Service Externe (Overleaf API)

Pas d'API publique gratuite pour l'instant.

---

## ✅ Checklist d'Implémentation

- [ ] Créer `src/utils/latexGenerator.js`
- [ ] Créer `src/utils/pdfService.js`
- [ ] Copier le template LaTeX complet
- [ ] Remplacer les variables dynamiques
- [ ] Gérer les caractères spéciaux LaTeX
- [ ] Tester avec un rapport simple
- [ ] Ajouter gestion d'erreurs
- [ ] Ajouter indicateur de chargement
- [ ] Tester tous les cas (avec/sans programme annuel, etc.)

---

## 🧪 Test

```javascript
// Test simple
const rapport = {
  mois: 'Mars',
  annee: 2026,
  melodies: [
    {
      nom: 'Test',
      melodie: 'Test Mélodie',
      mode: 'pages',
      pages_faites: 5,
      pages_total: 10,
      taux: 50,
      statut: { label: 'À suivre', color: 'orange' }
    }
  ],
  appreciation: {
    generale: 'Test appréciation',
    points_positifs: 'Test positif',
    a_surveiller: 'Test surveillance',
    en_retard: 'Test retard',
    priorites: 'Test priorités'
  }
}

const kourel = {
  nom: 'Kourel Test',
  responsable: 'Test Responsable'
}

genererPDF(rapport, kourel, [])
```

---

## 📚 Ressources

- **LaTeX.Online** : https://latexonline.cc/
- **Overleaf** : https://www.overleaf.com/learn
- **TikZ Documentation** : https://tikz.dev/
- **Template LaTeX actuel** : `template_suivi_kourels.tex`

---

**Prochaines étapes :**

1. Implémenter `latexGenerator.js` avec le template complet
2. Tester avec LaTeX.Online
3. Si ça marche → Déployer
4. Si ça marche pas → Backend Node.js avec Docker

**Temps estimé :** 2-3 heures
