// src/utils/latexGenerator.js

export function genererLatex(rapport, kourel, programmeAnnuel) {
  const escape = (str) => {
    if (!str) return ''
    return str
      .replace(/\\/g, '\\textbackslash{}')
      .replace(/[&%$#_{}]/g, '\\$&')
      .replace(/~/g, '\\textasciitilde{}')
      .replace(/\^/g, '\\textasciicircum{}')
  }

  const calcStatsPA = () => {
    if (!rapport.programme_annuel_etat || rapport.programme_annuel_etat.length === 0) return null
    
    const termines = rapport.programme_annuel_etat.filter(e => e.statut === 'termine').length
    const enCours = rapport.programme_annuel_etat.filter(e => e.statut === 'en_cours').length
    const pasCommences = rapport.programme_annuel_etat.filter(e => e.statut === 'pas_commence').length
    
    let somme = termines * 100
    rapport.programme_annuel_etat.filter(e => e.statut === 'en_cours').forEach(e => {
      somme += e.pourcentage || 0
    })
    
    const tauxGlobal = programmeAnnuel.length > 0 ? Math.round(somme / programmeAnnuel.length) : 0
    
    return { termines, enCours, pasCommences, tauxGlobal, total: programmeAnnuel.length }
  }

  const statsPA = calcStatsPA()

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

% Couleurs DMN
\\definecolor{VertPrincipal}{RGB}{22,130,78}
\\definecolor{VertFonce}{RGB}{1, 68, 33}
\\definecolor{VertPastel}{RGB}{232, 245, 233}
\\definecolor{VertClair}{RGB}{140,210,180}
\\definecolor{OrangeStrat}{RGB}{230, 126, 34}
\\definecolor{GrisClair}{RGB}{245, 245, 245}
\\definecolor{GrisTexte}{RGB}{64, 64, 64}
\\definecolor{RougeAlerte}{RGB}{192, 57, 43}
\\definecolor{BleuInfo}{RGB}{52, 73, 94}
\\definecolor{RougePastel}{RGB}{253,230,228}
\\definecolor{OrangePastel}{RGB}{252,243,230}
\\definecolor{BleuPastel}{RGB}{232,238,245}

\\begin{document}

% ========================================================
% PAGE DE GARDE
% ========================================================
\\begin{center}
    \\vspace*{1cm}
    
    {\\Huge\\bfseries\\color{VertFonce} Daara Madjmahoun Noreyni}
    
    \\vspace{0.5cm}
    
    {\\Large\\color{VertPrincipal} Universit\\'{e} Cheikh Anta Diop de Dakar}
    
    {\\large\\color{GrisTexte} P\\^{o}le Kourel Centrale -- Commission Conservatoire}
    
    \\vspace{1.5cm}
    
    {\\fontsize{36}{40}\\selectfont\\bfseries\\color{VertFonce}
    RAPPORT DE SUIVI}
    
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

\\vspace{0.5cm}

% ========================================================
% IDENTIFICATION
% ========================================================

\\begin{tikzpicture}
    \\fill[VertFonce] (0,0) rectangle (\\textwidth, 1.1cm);
    \\fill[VertPrincipal] (0,0) rectangle (\\textwidth, 0.85cm);
    \\node[text=white, font=\\Large\\bfseries] at (0.5\\textwidth, 0.42cm) {IDENTIFICATION};
\\end{tikzpicture}

\\vspace{0.5cm}

\\begin{tikzpicture}
    \\fill[VertPastel] (0,0) rectangle (7.8,1.8);
    \\draw[VertPrincipal, line width=0.5mm] (0,0) rectangle (7.8,1.8);
    \\fill[VertPrincipal] (0,1.3) rectangle (7.8,1.8);
    \\node[text=white, font=\\bfseries\\normalsize] at (3.9,1.55) {Identification};
    \\node[anchor=west, font=\\small\\bfseries\\color{VertFonce}] at (0.3,0.95) {Kourel :};
    \\node[anchor=west, font=\\small] at (2.5,0.95) {${escape(kourel.nom)}};
    \\node[anchor=west, font=\\small\\bfseries\\color{VertFonce}] at (0.3,0.5) {Responsable :};
    \\node[anchor=west, font=\\small] at (2.5,0.5) {${escape(kourel.responsable)}};
    
    \\fill[GrisClair] (8.2,0) rectangle (16.2,1.8);
    \\draw[GrisTexte!40, line width=0.5mm] (8.2,0) rectangle (16.2,1.8);
    \\fill[VertFonce] (8.2,1.3) rectangle (16.2,1.8);
    \\node[text=white, font=\\bfseries\\normalsize] at (12.2,1.55) {Informations};
    \\node[anchor=west, font=\\small\\bfseries\\color{VertFonce}] at (8.5,0.95) {Mois :};
    \\node[anchor=west, font=\\small\\bfseries] at (10.5,0.95) {${escape(rapport.mois)} ${rapport.annee}};
    \\node[anchor=west, font=\\small\\bfseries\\color{VertFonce}] at (8.5,0.5) {Date du rapport :};
    \\node[anchor=west, font=\\small] at (12.2,0.5) {${rapport.date_rapport}};
\\end{tikzpicture}

% ========================================================
% M\\'{E}LODIES
% ========================================================
\\vspace{0.5cm}

\\begin{tikzpicture}
    \\fill[VertFonce] (0,0) rectangle (\\textwidth, 1.1cm);
    \\fill[VertPrincipal] (0,0) rectangle (\\textwidth, 0.85cm);
    \\node[text=white, font=\\Large\\bfseries] at (0.5\\textwidth, 0.42cm) {AVANCEMENT DES M\\'{E}LODIES};
\\end{tikzpicture}

\\vspace{0.5cm}

\\begin{tcolorbox}[
    enhanced,
    colback=white,
    colframe=VertPrincipal,
    boxrule=0.7mm,
    arc=3mm,
    title={\\textbf{M\\'{e}lodies du mois}},
    coltitle=white,
    fonttitle=\\large\\bfseries,
    attach boxed title to top left={xshift=5mm, yshift=-3mm},
    boxed title style={colback=VertPrincipal, arc=2mm}
]

${rapport.melodies && rapport.melodies.length > 0 ? rapport.melodies.map((melodie, index) => {
  const bgColor = melodie.taux >= 80 ? 'VertPastel' : melodie.taux >= 50 ? 'OrangePastel!60' : 'RougePastel!60'
  const borderColor = melodie.taux >= 80 ? 'GrisTexte!30' : melodie.taux >= 50 ? 'OrangeStrat!40' : 'RougeAlerte!40'
  const barColor = melodie.taux >= 80 ? 'VertPrincipal' : melodie.taux >= 50 ? 'OrangeStrat' : 'RougeAlerte'
  const labelColor = melodie.taux >= 80 ? 'VertPrincipal' : melodie.taux >= 50 ? 'OrangeStrat' : 'RougeAlerte'
  
  const detailsText = melodie.mode === 'pages'
    ? `${melodie.pages_faites || 0} / ${melodie.pages_total || 0} pages`
    : `${(melodie.dadj_completes || []).length} Dadj compl\\'{e}t\\'{e}s sur ${melodie.dadj_total || 0}`
  const typeText = melodie.type === 'revision' ? " (R\\'{e}vision)" : ''
  
  return `
${index > 0 ? '\\vspace{0.15cm}' : ''}\\begin{tikzpicture}
    \\fill[${bgColor}] (0,0) rectangle (16.2,0.8);
    \\draw[${borderColor}, line width=0.3mm] (0,0) rectangle (16.2,0.8);
    \\node[anchor=west, font=\\footnotesize\\bfseries] at (0.2,0.5) {${escape(melodie.nom)}${typeText}};
    \\node[anchor=west, font=\\tiny\\color{GrisTexte}] at (0.2,0.22) {${escape(detailsText)}};
    \\fill[GrisClair] (6,0.22) rectangle (11,0.58);
    \\fill[${barColor}] (6,0.22) rectangle (${6 + (melodie.taux / 100) * 5},0.58);
    \\node[font=\\footnotesize\\bfseries\\color{white}] at (${6 + (melodie.taux / 100) * 2.5},0.4) {${melodie.taux}\\%};
    \\node[anchor=west, font=\\footnotesize\\bfseries\\color{${labelColor}}] at (11.3,0.4) {${melodie.statut ? (typeof melodie.statut === 'string' ? melodie.statut : melodie.statut.label ?? '').toUpperCase() : "TERMIN\\'{E}"}};
\\end{tikzpicture}`
}).join('\n') : "\\textit{Pas de m\\'{e}lodies enregistr\\'{e}es}"}

\\end{tcolorbox}

${statsPA ? `
\\vspace{0.5cm}

% ========================================================
% PROGRAMME ANNUEL
% ========================================================

\\begin{tikzpicture}
    \\fill[VertFonce] (0,0) rectangle (\\textwidth, 1.1cm);
    \\fill[VertPrincipal] (0,0) rectangle (\\textwidth, 0.85cm);
    \\node[text=white, font=\\Large\\bfseries] at (0.5\\textwidth, 0.42cm) {PROGRAMME ANNUEL};
\\end{tikzpicture}

\\vspace{0.5cm}

\\begin{tcolorbox}[
    enhanced,
    colback=white,
    colframe=BleuInfo,
    boxrule=0.7mm,
    arc=3mm,
    title={\\textbf{Progression globale}},
    coltitle=white,
    fonttitle=\\large\\bfseries,
    attach boxed title to top left={xshift=5mm, yshift=-3mm},
    boxed title style={colback=BleuInfo, arc=2mm}
]

\\begin{center}
\\textbf{\\large Taux global : ${statsPA.tauxGlobal}\\%}

\\vspace{0.3cm}

\\begin{tikzpicture}
    \\fill[GrisClair] (0,0) rectangle (10,0.5);
    \\fill[BleuInfo] (0,0) rectangle (${statsPA.tauxGlobal / 10},0.5);
\\end{tikzpicture}

\\vspace{0.5cm}

\\begin{tabular}{ccc}
\\textbf{\\color{VertPrincipal}${statsPA.termines}} & \\textbf{\\color{OrangeStrat}${statsPA.enCours}} & \\textbf{\\color{RougeAlerte}${statsPA.pasCommences}} \\\\
Termin\\'{e}s & En cours & Pas commenc\\'{e}s \\\\
\\end{tabular}
\\end{center}

${rapport.programme_annuel_textes?.objectifs_atteints ? `
\\subsection*{Objectifs atteints}
${escape(rapport.programme_annuel_textes.objectifs_atteints)}
` : ''}

${rapport.programme_annuel_textes?.objectifs_en_cours ? `
\\subsection*{Objectifs en cours}
${escape(rapport.programme_annuel_textes.objectifs_en_cours)}
` : ''}

${rapport.programme_annuel_textes?.ajustements ? `
\\subsection*{Ajustements n\\'{e}cessaires}
${escape(rapport.programme_annuel_textes.ajustements)}
` : ''}

\\end{tcolorbox}
` : ''}

\\vspace{0.5cm}

% ========================================================
% APPR\\'{E}CIATION
% ========================================================

\\begin{tikzpicture}
    \\fill[VertFonce] (0,0) rectangle (\\textwidth, 1.1cm);
    \\fill[VertPrincipal] (0,0) rectangle (\\textwidth, 0.85cm);
    \\node[text=white, font=\\Large\\bfseries] at (0.5\\textwidth, 0.42cm) {APPR\\'{E}CIATION \\& CONCLUSION};
\\end{tikzpicture}

\\vspace{0.5cm}

${rapport.appreciation.generale ? `
\\begin{tcolorbox}[
    enhanced,
    colback=OrangePastel!50,
    colframe=OrangeStrat,
    boxrule=0.7mm,
    arc=3mm
]
\\textbf{Appr\\'{e}ciation g\\'{e}n\\'{e}rale}

${escape(rapport.appreciation?.generale || "Non renseign\\'{e}e")}
\\end{tcolorbox}

\\vspace{0.4cm}
` : ''}

\\begin{tcolorbox}[
    enhanced,
    colback=VertPastel,
    colframe=VertPrincipal,
    boxrule=0.5mm,
    arc=3mm
]
\\textbf{\\color{VertPrincipal}Points positifs}

${escape(rapport.appreciation?.points_positifs || "Non renseign\\'{e}")}
\\end{tcolorbox}

\\vspace{0.3cm}

\\begin{tcolorbox}[
    enhanced,
    colback=OrangePastel,
    colframe=OrangeStrat,
    boxrule=0.5mm,
    arc=3mm
]
\\textbf{\\color{OrangeStrat}À surveiller}

${escape(rapport.appreciation?.a_surveiller || "Non renseign\\'{e}")}
\\end{tcolorbox}

\\vspace{0.3cm}

\\begin{tcolorbox}[
    enhanced,
    colback=RougePastel,
    colframe=RougeAlerte,
    boxrule=0.5mm,
    arc=3mm
]
\\textbf{\\color{RougeAlerte}En retard}

${escape(rapport.appreciation?.en_retard || "Non renseign\\'{e}")}
\\end{tcolorbox}

\\vspace{0.3cm}

\\begin{tcolorbox}[
    enhanced,
    colback=BleuPastel,
    colframe=BleuInfo,
    boxrule=0.5mm,
    arc=3mm
]
\\textbf{\\color{BleuInfo}Priorti\\'{e}s mois suivant}

${escape(rapport.appreciation?.priorites || "Non renseign\\'{e}")}
\\end{tcolorbox}

\\vspace{0.5cm}

\\begin{center}
{\\small\\itshape\\color{GrisTexte}
Document g\\'{e}n\\'{e}r\\'{e} par l'application Rapports Kourel -- DMN UCAD\\\\
${escape(kourel.responsable || 'Responsable')} -- ${escape(rapport.date_rapport || new Date().toLocaleDateString('fr-FR'))}
}
\\end{center}

\\end{document}
`

  return template
}
