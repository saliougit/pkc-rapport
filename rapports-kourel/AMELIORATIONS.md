# Suivi des améliorations — Évaluation & Rapport Mensuel

Document de suivi. Chaque point a un statut, une description du problème (confirmée en lisant le code), et une proposition de correction. Les points marqués ⚠️ ont besoin d'une décision avant de coder.

Légende : `[ ]` à faire · `[~]` en cours · `[x]` fait

---

## A. Évaluation (`EvaluationMembre.jsx`)

### A1 — [x] Perte de la progression en cas de retour arrière
**Problème confirmé :** l'évaluation est entièrement en mémoire (`useState`). Un retour en arrière (swipe navigateur / bouton back) démonte le composant et redemande le code → tout est perdu, y compris le programme annuel déjà saisi.

**Proposition :** persister `evalData` (programme + notes) dans `localStorage`, clé liée au code d'évaluation. Si on revient sur `/evaluer?code=...` avec le même code et une évaluation non soumise, on restaure automatiquement la progression au lieu de repartir de zéro. On ne peut pas bloquer totalement le geste de retour natif du téléphone, mais ça rend l'action non destructive.

**localStorage sur mobile : ça marche.** Safari iOS, Chrome Android, et le mode PWA (l'app a déjà un manifest) le supportent tous. Seule limite réelle : si l'app n'est jamais ouverte pendant ~7 jours, Safari iOS peut purger les données de stockage des sites "non réinteragis" (anti-pistage) — sans impact ici puisqu'on restaure juste après un retour arrière accidentel, pas des semaines plus tard. Mode navigation privée = pas de persistance entre sessions, mais c'est attendu.

### A2 — [x] Mélodie + Hourouf doivent être notés ensemble par khassida
**Problème confirmé :** `Mélodie` et `Hourouf` sont deux critères (= deux sections) distincts. L'étape 3 avance section par section : on note la mélodie de **tous** les khassidas, puis on recommence une passe complète pour le hourouf. Les moyennes sont calculées séparément puis combinées à l'étape 4.

**Proposition :** fusionner l'affichage en une seule section "Mélodie & Hourouf". À l'intérieur, on avance **khassida par khassida** (chaque khassida = une sous-étape avec sa propre carte, les deux notes mélodie + hourouf saisies ensemble dessus), au lieu d'une liste unique pour tous les khassidas. Une fois toutes les sous-étapes (khassidas) vues, on calcule la moyenne des deux critères par khassida (comme c'est déjà fait globalement à l'étape 4, mais au niveau de chaque khassida). Les autres critères "normaux" (présence, générale, etc.) restent inchangés.
⚠️ Je dois vérifier s'il existe d'autres critères "par khassida" que mélodie/hourouf avant de coder la fusion (pour ne fusionner que ces deux-là et pas casser un futur 3ᵉ critère par khassida).

### A3 — [x] Ne bloquer qu'à la soumission finale, pas à chaque étape
**Problème confirmé :** `validerEtAvancer` empêche de passer à la section suivante si un seul khassida n'a pas encore de note pour la section en cours (`missingNote`).

**Proposition (précisée) :** on peut naviguer librement entre sections/khassidas même si tout n'est pas encore noté — ce blocage-là disparaît. **Mais** la règle existante de justification obligatoire reste un blocage immédiat : si une note est "extrême" (≤5 ou ≥9), on ne peut pas avancer (ni à la section suivante, ni au khassida suivant) tant que la justification (`remarques`) n'est pas remplie. Donc deux règles distinctes :
- "Tout noter avant d'avancer" → supprimé.
- "Justifier une note extrême avant d'avancer" → conservé, vérifié immédiatement (pas seulement à la soumission).

Le contrôle final à la soumission (`soumettre`) reste en plus : si un khassida/critère n'est toujours pas renseigné à ce moment, on bloque avec un message explicite indiquant **quel khassida** et **quel critère** manque.

### A4 — [x] Soumission très lente
**Problème confirmé :** `soumettre()` fait une boucle `for` avec `await` séquentiel : un appel réseau par section, puis un appel par (khassida × critère) pour le programme. Avec par ex. 2 critères par khassida × 20 khassidas, ça fait ~40+ appels Supabase l'un après l'autre.

**Proposition :** paralléliser avec `Promise.all` (ou un upsert groupé côté `lib/supabase.js` si l'API Supabase le permet en un seul insert multi-lignes). Gain attendu : quasi-instantané au lieu de plusieurs secondes/dizaines de secondes.

---

## B. Rapport Mensuel (programme annuel)

### B1 — [x] Nombre de pages sur le programme annuel, pas à chaque rapport
**Problème confirmé :** `pages_total` / `dadj_total` sont saisis à chaque création de rapport (`FormulaireRapport.jsx`), pas une fois pour toutes sur le khassida.

**Proposition (précisée) :** `pages_total` (et bientôt `bayit_total`, voir B4) se saisit en priorité sur la définition du khassida dans le programme annuel. Le formulaire de rapport se **pré-remplit** avec cette valeur si elle existe — mais si elle n'a pas été renseignée sur le programme (champ optionnel), le formulaire de rapport garde le champ modifiable pour la saisir à ce moment-là (pas de blocage si le kourel n'a pas pensé à le faire en amont).

### B2 — [x] Versionning du programme annuel (ex. 2025-2026, 2026-2027)
**Proposition :** un kourel peut avoir plusieurs "programmes" (un par période/année). Le rapport prend toujours le programme **en vigueur** (le plus récent actif).
**Tranché :** par défaut, le programme "en vigueur" est le **dernier créé**. Le kourel peut à tout moment basculer manuellement un autre programme comme actif (statut "actif" réassignable).

### B3 — [ ] Découpage en trimestres + glisser-déposer
**Proposition résumée (confirme ma compréhension) :**
- Le kourel peut ajouter autant de trimestres qu'il veut.
- Appui long + glisser un khassida depuis **"Programme annuel"** vers un trimestre → déplacement simple, pas de confirmation (le khassida quitte la liste "non affecté").
- Appui long + glisser un khassida d'**un trimestre vers un autre** → on demande **"Déplacer ou dupliquer ?"**.
- Appui long + glisser un khassida d'**un trimestre vers "Programme annuel"** :
  - s'il n'était que dans ce trimestre-là → simple retrait, retour dans la liste non affectée ;
  - s'il était dupliqué dans plusieurs trimestres → le retour vers "Programme annuel" le retire de **tous** les trimestres d'un coup.

**Tranché :** "dupliquer" = la **même entité** affichée dans plusieurs trimestres (étiquette partagée), pas une copie indépendante. Une seule saisie, aucun risque de double-comptage dans les moyennes.

### B4 — [x] Nouveau mode de suivi "Par bayit"
**Proposition (précisée) :** ajouter un 3ᵉ mode de progression (en plus de "Pages" et "Dadj") : `bayit_total` + `bayit_faits`, affiché comme un pourcentage, exactement comme le mode "Pages". Sur le programme annuel, le champ "nombre de bayit" est **optionnel** et directement disponible sur la fiche du khassida (comme `pages_total`, cf B1) — pas obligatoire à l'ajout rapide, mais saisissable sur place. Dès qu'un total (pages ou bayit) est renseigné, ce mode devient sélectionnable pour le suivi de ce khassida. Et comme pour B1 : si le total n'a pas été renseigné sur le programme, le formulaire de rapport permet toujours de le saisir à ce moment-là — rien n'est bloqué.

### B5 — [x] Champs numériques bloqués sur "1" (impossible à vider)
**Problème confirmé :** `pages_total` (et `dadj_total`) sont initialisés à `1`, et `onChange` fait `parseInt(e.target.value) || 1` — donc dès que le champ est vidé, `parseInt('')` vaut `NaN`, et `NaN || 1` remet `1` instantanément. Impossible de taper une nouvelle valeur sans sélectionner le texte d'abord.

**Proposition :** garder la valeur du champ en `string` pendant la saisie (autoriser `''` temporairement), ne convertir en nombre qu'à la validation/sauvegarde (ou au `onBlur`), avec un minimum appliqué seulement si le champ est vide à ce moment-là. À corriger partout où ce pattern existe (`FormulaireRapport.jsx` notamment, à vérifier aussi `Criteres.jsx`, `Kourels.jsx`).

---

## Ordre proposé pour attaquer

1. **B5** (bug input) — isolé, rapide, gain immédiat.
2. **A3** (déblocage navigation) + **A4** (lenteur soumission) — isolés à `EvaluationMembre.jsx`, pas de nouvelle table.
3. **A1** (persistance anti-perte) — isolé, pas de schéma DB.
4. **A2** (fusion mélodie/hourouf) — nécessite une petite vérif de structure, puis retouche UI.
5. **B1** (total pages sur le programme) — nécessite une migration de schéma légère (colonne sur `khassidas`).
6. **B4** (mode "par bayit") — vient naturellement après B1 (même mécanique).
7. **B2** (versionning programme) — nouvelle table / nouveau modèle.
8. **B3** (trimestres + drag & drop) — le plus gros chantier, à faire en dernier une fois B2 posé.
