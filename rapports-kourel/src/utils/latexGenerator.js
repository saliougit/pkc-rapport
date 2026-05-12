// src/utils/latexGenerator.js

export function genererLatex(rapport, kourel, programmeAnnuel) {
  const escapeCommon = (str) => str
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/[&%$#_{}]/g, '\\$&')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/✓/g, '$\\checkmark$')
    .replace(/✗|✘/g, '$\\times$')
    .replace(/–/g, '--')
    .replace(/—/g, '---')
    .replace(/…/g, '\\ldots{}')
    .replace(/ /g, '~')

  // Pour les \node TikZ : les sauts de ligne cassent la compilation
  const escape = (str) => {
    if (!str) return ''
    return escapeCommon(str).replace(/\r?\n/g, ' ')
  }

  // Pour les tcolorbox / paragraphes : \n → \\ (saut de ligne LaTeX)
  const escapeBlock = (str) => {
    if (!str) return ''
    return escapeCommon(str).replace(/\r?\n/g, '\\\\ ')
  }

  const calcStatsPA = () => {
    if (!programmeAnnuel || programmeAnnuel.length === 0) return null
    const getEtat = (id) => rapport.programme_annuel_etat?.find(e => e.khassida_id === id)

    const termines     = programmeAnnuel.filter(k => getEtat(k.id)?.statut === 'termine').length
    const enCours      = programmeAnnuel.filter(k => getEtat(k.id)?.statut === 'en_cours').length
    const pasCommences = programmeAnnuel.filter(k => {
      const e = getEtat(k.id)
      return !e || e.statut === 'pas_commence'
    }).length

    let somme = termines * 100
    programmeAnnuel.forEach(k => {
      const e = getEtat(k.id)
      if (e?.statut === 'en_cours') somme += e.pourcentage || 0
    })
    const tauxGlobal = Math.round(somme / programmeAnnuel.length)
    return { termines, enCours, pasCommences, tauxGlobal, total: programmeAnnuel.length }
  }

  const statsPA = calcStatsPA()

  const getBarColor = (taux) => taux >= 80 ? 'VertPrincipal' : taux >= 50 ? 'OrangeStrat' : 'RougeAlerte'

  const getMelodyBar = (melodie, index) => {
    const taux = Math.min(100, Math.max(0, melodie.taux || 0))
    const taux_maitrise = Math.min(100, Math.max(0, melodie.taux_maitrise || 0))
    const bgColor = taux >= 80 ? 'VertPastel' : taux >= 50 ? 'white' : 'RougePastel!60'
    const borderColor = taux >= 80 ? 'VertClair!50' : taux >= 50 ? 'GrisTexte!30' : 'RougeAlerte!40'
    const bColor = getBarColor(taux)
    const statusText = taux >= 80 ? 'Terminé $\\checkmark$' : taux >= 50 ? 'À suivre' : 'Retard~!'

    const barEnd = (5.5 + (taux / 100) * 6).toFixed(2)
    const textInBar = taux >= 30
    const textX = textInBar ? (5.5 + (taux / 100) * 3).toFixed(2) : '8.50'
    const textFont = textInBar
      ? '\\small\\bfseries\\color{white}'
      : `\\tiny\\bfseries\\color{${bColor}}`

    const detailsText = melodie.mode === 'pages'
      ? `${melodie.pages_faites || 0} / ${melodie.pages_total || 0} pages`
      : `${(melodie.dadj_completes || []).length} Dadj complétés sur ${melodie.dadj_total || 0}`

    const typeText = melodie.type === 'revision' ? ' (Révision)' : ''

    return `${index > 0 ? '\\vspace{0.20cm}\n' : ''}\\begin{tikzpicture}
    \\fill[${bgColor}] (0,0) rectangle (16.2,1);
    \\draw[${borderColor}, line width=0.3mm] (0,0) rectangle (16.2,1);
    \\node[anchor=west, font=\\small\\bfseries] at (0.25,0.65) {${escape(melodie.nom)}${typeText}};
    \\node[anchor=west, font=\\tiny\\color{GrisTexte}] at (0.25,0.22) {${escape(detailsText)}};
    \\fill[GrisClair] (5.5,0.28) rectangle (11.5,0.72);
    \\fill[${bColor}] (5.5,0.28) rectangle (${barEnd},0.72);
    \\node[font=${textFont}] at (${textX},0.50) {${taux}\\%};
    \\node[anchor=west, font=\\small\\bfseries\\color{${bColor}}] at (11.7,0.68) {${statusText}};
    \\node[anchor=west, font=\\tiny\\color{GrisTexte}] at (11.7,0.28) {Maîtrise : ${taux_maitrise}\\%};
\\end{tikzpicture}`
  }

  const progBarColor = statsPA ? getBarColor(statsPA.tauxGlobal) : 'OrangeStrat'
  const progBarEnd = statsPA ? (0.3 + (statsPA.tauxGlobal / 100) * 10).toFixed(2) : '0.3'
  const progTextX = statsPA ? (0.3 + (statsPA.tauxGlobal / 100) * 5).toFixed(2) : '5.15'

  const template = `\\documentclass[11pt,a4paper]{article}
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=1.5cm, top=1.5cm]{geometry}
\\usepackage{xcolor}
\\usepackage{tikz}
\\usetikzlibrary{positioning, shadows}
\\usepackage{tcolorbox}
\\tcbuselibrary{skins, breakable}
\\usepackage{enumitem}
\\usepackage{graphicx}
\\usepackage{amssymb}

% Couleurs DMN
\\definecolor{VertPrincipal}{RGB}{22,130,78}
\\definecolor{VertFonce}{RGB}{1,68,33}
\\definecolor{VertPastel}{RGB}{232,245,233}
\\definecolor{VertClair}{RGB}{140,210,180}
\\definecolor{OrangeStrat}{RGB}{230,126,34}
\\definecolor{OrangePastel}{RGB}{252,243,230}
\\definecolor{GrisClair}{RGB}{245,245,245}
\\definecolor{GrisTexte}{RGB}{64,64,64}
\\definecolor{RougeAlerte}{RGB}{192,57,43}
\\definecolor{RougePastel}{RGB}{253,230,228}
\\definecolor{BleuInfo}{RGB}{52,73,94}
\\definecolor{BleuPastel}{RGB}{232,238,245}

% Pastille : cercle coloré avec symbole centré
\\newcommand{\\pastille}[2]{%
  \\begin{tikzpicture}[baseline={([yshift=-2pt]current bounding box.center)}]
    \\fill[#1] (0,0) circle (0.35cm);
    \\node[text=white, font=\\small\\bfseries] at (0,0) {#2};
  \\end{tikzpicture}%
}

\\begin{document}
\\setlength{\\emergencystretch}{4em}

% PAGE DE GARDE
\\begin{center}
    \\vspace*{1cm}

    {\\Huge\\bfseries\\color{VertFonce} Daara Madjmahoun Noreyni}

    \\vspace{0.5cm}

    {\\Large\\color{VertPrincipal} Université Cheikh Anta Diop de Dakar}

    {\\large\\color{GrisTexte} Pôle Kourel Centrale -- Commission Conservatoire}

    \\vspace{1.5cm}

    {\\fontsize{36}{40}\\selectfont\\bfseries\\color{VertFonce} RAPPORT DE SUIVI}

    \\vspace{0.5cm}

    {\\Large\\color{VertPrincipal}\\textbf{${escape(rapport.mois)} ${rapport.annee}}}

    \\vspace{1cm}

    \\begin{tcolorbox}[
        enhanced,
        colback=VertPastel,
        colframe=VertPrincipal,
        boxrule=0.8mm,
        arc=3mm,
        width=0.7\\textwidth
    ]
        \\centering
        \\textbf{\\large ${escape(kourel.nom)}}\\\\[0.3cm]
        ${escape(kourel.responsable)}
    \\end{tcolorbox}

    \\vspace{1cm}

    {\\small\\itshape\\color{GrisTexte}
    Date du rapport : ${rapport.date_rapport}}
\\end{center}

\\newpage

% --- Bandeau principal ---
\\begin{tikzpicture}
    \\fill[VertFonce] (0,0) rectangle (\\textwidth, 1.1cm);
    \\fill[VertPrincipal] (0,0) rectangle (\\textwidth, 0.85cm);
    \\node[text=white, font=\\normalsize\\bfseries, text width=15.5cm, align=center] at (8.1,0.42cm) {RAPPORT ${escape(kourel.nom).toUpperCase()} -- ${escape(rapport.mois).toUpperCase()} ${rapport.annee}};
\\end{tikzpicture}

\\vspace{0.5cm}

% --- Entête identité : 2 colonnes ---
\\begin{tikzpicture}
    % Bloc gauche : Kourel + Responsable + Représentant
    \\fill[VertPastel] (0,0) rectangle (7.8,2.2);
    \\draw[VertPrincipal, line width=0.5mm] (0,0) rectangle (7.8,2.2);
    \\fill[VertPrincipal] (0,1.7) rectangle (7.8,2.2);
    \\node[text=white, font=\\bfseries\\normalsize] at (3.9,1.95) {Identification};
    \\node[anchor=west, font=\\small\\bfseries\\color{VertFonce}] at (0.3,1.4) {Kourel :};
    \\node[anchor=west, font=\\small] at (2.8,1.4) {${escape(kourel.nom)}};
    \\node[anchor=west, font=\\small\\bfseries\\color{VertFonce}] at (0.3,0.95) {Responsable :};
    \\node[anchor=west, font=\\small] at (2.8,0.95) {${escape(kourel.responsable)}};
    \\node[anchor=west, font=\\small\\bfseries\\color{VertFonce}] at (0.3,0.5) {Représentant :};
    \\node[anchor=west, font=\\small\\color{GrisTexte}] at (2.8,0.5) {${escape(kourel.representant || '--')}};
    % Bloc droit : Mois + Date du rapport
    \\fill[GrisClair] (8.2,0) rectangle (16.2,2.2);
    \\draw[GrisTexte!40, line width=0.5mm] (8.2,0) rectangle (16.2,2.2);
    \\fill[VertFonce] (8.2,1.7) rectangle (16.2,2.2);
    \\node[text=white, font=\\bfseries\\normalsize] at (12.2,1.95) {Informations};
    \\node[anchor=west, font=\\small\\bfseries\\color{VertFonce}] at (8.5,1.4) {Mois :};
    \\node[anchor=west, font=\\small\\bfseries] at (10.8,1.4) {${escape(rapport.mois)} ${rapport.annee}};
    \\node[anchor=west, font=\\small\\bfseries\\color{VertFonce}] at (8.5,0.5) {Date du rapport :};
    \\node[anchor=west, font=\\small] at (12.2,0.5) {${rapport.date_rapport}};
\\end{tikzpicture}

\\vspace{0.6cm}

% --- Section : Avancement des Mélodies ---
\\begin{tcolorbox}[
    enhanced,
    colback=white,
    colframe=VertPrincipal,
    boxrule=0.7mm,
    arc=3mm,
    title={\\textbf{Avancement des Mélodies}},
    coltitle=white,
    fonttitle=\\large\\bfseries,
    attach boxed title to top left={xshift=5mm, yshift=-3mm},
    boxed title style={colback=VertPrincipal, arc=2mm}
]

${rapport.melodies && rapport.melodies.length > 0
  ? rapport.melodies.map((m, i) => getMelodyBar(m, i)).join('\n')
  : '\\textit{Pas de mélodies enregistrées}'}

\\end{tcolorbox}

\\vspace{0.5cm}

${statsPA ? `% --- Programme Annuel ---
\\begin{tcolorbox}[
    enhanced,
    colback=white,
    colframe=BleuInfo,
    boxrule=0.7mm,
    arc=3mm,
    title={\\textbf{Évolution par rapport au Programme Annuel}},
    coltitle=white,
    fonttitle=\\large\\bfseries,
    attach boxed title to top left={xshift=5mm, yshift=-3mm},
    boxed title style={colback=BleuInfo, arc=2mm}
]

% --- Bloc progression globale : barre + compteurs ---
\\begin{tikzpicture}
    \\fill[BleuPastel!60] (0,0) rectangle (16.2,2.4);
    \\draw[BleuInfo!40, line width=0.4mm] (0,0) rectangle (16.2,2.4);
    \\node[anchor=west, font=\\bfseries\\color{BleuInfo}] at (0.3,2.1) {Progression globale sur le Programme Annuel};
    \\fill[GrisClair] (0.3,1.1) rectangle (10.3,1.6);
    \\fill[${progBarColor}] (0.3,1.1) rectangle (${progBarEnd},1.6);
    \\node[font=\\small\\bfseries\\color{white}] at (${progTextX},1.35) {${statsPA.tauxGlobal}\\%};
    \\node[anchor=west, font=\\small\\color{GrisTexte}] at (10.5,1.35) {${statsPA.termines} / ${statsPA.total} khassidas};
    \\draw[GrisTexte!40, line width=0.3mm] (0.3,1.1) rectangle (10.3,1.6);
    \\fill[VertPastel] (0.3,0.1) rectangle (4.8,0.85);
    \\draw[VertPrincipal!40, line width=0.3mm] (0.3,0.1) rectangle (4.8,0.85);
    \\node[font=\\bfseries\\color{VertFonce}\\large] at (1.6,0.55) {${statsPA.termines}};
    \\node[anchor=west, font=\\tiny\\color{GrisTexte}] at (2.2,0.55) {Terminés};
    \\fill[OrangePastel] (5.1,0.1) rectangle (9.6,0.85);
    \\draw[OrangeStrat!40, line width=0.3mm] (5.1,0.1) rectangle (9.6,0.85);
    \\node[font=\\bfseries\\color{OrangeStrat}\\large] at (6.4,0.55) {${statsPA.enCours}};
    \\node[anchor=west, font=\\tiny\\color{GrisTexte}] at (7,0.55) {En cours};
    \\fill[RougePastel] (9.9,0.1) rectangle (14.4,0.85);
    \\draw[RougeAlerte!40, line width=0.3mm] (9.9,0.1) rectangle (14.4,0.85);
    \\node[font=\\bfseries\\color{RougeAlerte}\\large] at (11.2,0.55) {${statsPA.pasCommences}};
    \\node[anchor=west, font=\\tiny\\color{GrisTexte}] at (11.8,0.55) {Restants};
\\end{tikzpicture}

\\vspace{0.4cm}

% --- Cards détails côte à côte ---
\\begin{minipage}[t]{0.48\\textwidth}
    \\begin{tcolorbox}[
        enhanced, colback=VertPastel, colframe=VertPrincipal,
        boxrule=0.4mm, arc=2mm, top=2mm, bottom=2mm
    ]
        \\small\\textbf{\\color{VertFonce}$\\checkmark$ Objectifs atteints}\\\\[0.2cm]
        ${escapeBlock(rapport.programme_annuel_textes?.objectifs_atteints || 'Non renseigné')}
    \\end{tcolorbox}
    \\vspace{0.3cm}
    \\begin{tcolorbox}[
        enhanced, colback=OrangePastel, colframe=OrangeStrat,
        boxrule=0.4mm, arc=2mm, top=2mm, bottom=2mm
    ]
        \\small\\textbf{\\color{OrangeStrat}$\\circledast$ Objectifs en cours}\\\\[0.2cm]
        ${escapeBlock(rapport.programme_annuel_textes?.objectifs_en_cours || 'Non renseigné')}
    \\end{tcolorbox}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.48\\textwidth}
    \\begin{tcolorbox}[
        enhanced, colback=RougePastel, colframe=RougeAlerte,
        boxrule=0.4mm, arc=2mm, top=2mm, bottom=2mm
    ]
        \\small\\textbf{\\color{RougeAlerte}$\\times$ Objectifs non atteints}\\\\[0.2cm]
        ${escapeBlock(rapport.programme_annuel_textes?.objectifs_non_atteints || rapport.appreciation?.en_retard || 'Non renseigné')}
    \\end{tcolorbox}
    \\vspace{0.3cm}
    \\begin{tcolorbox}[
        enhanced, colback=BleuPastel, colframe=BleuInfo,
        boxrule=0.4mm, arc=2mm, top=2mm, bottom=2mm
    ]
        \\small\\textbf{\\color{BleuInfo}$\\rightarrow$ Ajustements nécessaires}\\\\[0.2cm]
        ${escapeBlock(rapport.programme_annuel_textes?.ajustements || 'Non renseigné')}
    \\end{tcolorbox}
\\end{minipage}

\\end{tcolorbox}` : ''}

\\newpage

% --- Appréciation Générale ---
\\begin{tcolorbox}[
    enhanced,
    colback=OrangePastel!50,
    colframe=OrangeStrat,
    boxrule=0.7mm,
    arc=3mm,
    title={\\textbf{Appréciation Générale}},
    coltitle=white,
    fonttitle=\\large\\bfseries,
    attach boxed title to top left={xshift=5mm, yshift=-3mm},
    boxed title style={colback=OrangeStrat, arc=2mm}
]
\\vspace{0.15cm}
${escapeBlock(rapport.appreciation?.generale || 'Non renseignée')}
\\end{tcolorbox}

\\vspace{0.5cm}

% --- Conclusion & Priorités : 4 blocs visuels côte à côte ---
\\begin{tcolorbox}[
    enhanced,
    colback=white,
    colframe=VertFonce,
    boxrule=0.7mm,
    arc=3mm,
    title={\\textbf{Conclusion \\& Priorités -- ${escape(rapport.mois)} ${rapport.annee}}},
    coltitle=white,
    fonttitle=\\large\\bfseries,
    attach boxed title to top left={xshift=5mm, yshift=-3mm},
    boxed title style={colback=VertFonce, arc=2mm}
]

\\begin{minipage}{0.24\\textwidth}
    \\begin{tcolorbox}[
        enhanced, colback=VertPastel, colframe=VertPrincipal,
        boxrule=0.5mm, arc=2mm, top=3mm, bottom=3mm
    ]
        \\centering
        \\pastille{VertPrincipal}{\\checkmark}\\\\[0.2cm]
        \\small\\textbf{Positifs}\\\\[0.15cm]
        {\\tiny ${escapeBlock(rapport.appreciation?.points_positifs || 'Non renseigné')}}
    \\end{tcolorbox}
\\end{minipage}
\\hfill
\\begin{minipage}{0.24\\textwidth}
    \\begin{tcolorbox}[
        enhanced, colback=OrangePastel, colframe=OrangeStrat,
        boxrule=0.5mm, arc=2mm, top=3mm, bottom=3mm
    ]
        \\centering
        \\pastille{OrangeStrat}{!}\\\\[0.2cm]
        \\small\\textbf{À surveiller}\\\\[0.15cm]
        {\\tiny ${escapeBlock(rapport.appreciation?.a_surveiller || 'Non renseigné')}}
    \\end{tcolorbox}
\\end{minipage}
\\hfill
\\begin{minipage}{0.24\\textwidth}
    \\begin{tcolorbox}[
        enhanced, colback=RougePastel, colframe=RougeAlerte,
        boxrule=0.5mm, arc=2mm, top=3mm, bottom=3mm
    ]
        \\centering
        \\pastille{RougeAlerte}{\\textrm{$\\times$}}\\\\[0.2cm]
        \\small\\textbf{En retard}\\\\[0.15cm]
        {\\tiny ${escapeBlock(rapport.appreciation?.en_retard || 'Non renseigné')}}
    \\end{tcolorbox}
\\end{minipage}
\\hfill
\\begin{minipage}{0.24\\textwidth}
    \\begin{tcolorbox}[
        enhanced, colback=BleuPastel, colframe=BleuInfo,
        boxrule=0.5mm, arc=2mm, top=3mm, bottom=3mm
    ]
        \\centering
        \\pastille{BleuInfo}{$\\rightarrow$}\\\\[0.2cm]
        \\small\\textbf{Priorités}\\\\[0.15cm]
        {\\tiny ${escapeBlock(rapport.appreciation?.priorites || 'Non renseigné')}}
    \\end{tcolorbox}
\\end{minipage}

\\end{tcolorbox}

\\vspace{0.8cm}

% --- Signature ---
\\begin{tikzpicture}
    \\fill[VertFonce] (0,0) rectangle (16.2,1.8);
    \\fill[VertPastel] (0,0) rectangle (16.2,1.2);
    \\node[text=white, font=\\bfseries\\normalsize] at (8.1,1.5) {Validé par};
    \\node[font=\\large\\bfseries\\color{VertFonce}] at (8.1,0.7) {${escape(kourel.responsable)}};
    \\node[font=\\small\\color{GrisTexte}] at (8.1,0.3) {Responsable -- ${escape(kourel.nom)} $|$ ${rapport.date_rapport}};
\\end{tikzpicture}

\\vspace{0.6cm}

\\end{document}
`

  return template
}
