/*
 * Bonneville - Formulaires L1 à L6 (chargement, déchargement, installation)
 * Fichier partagé par la page Bonneville de Geotab Drive (remplissage) et par LFS dans MyGeotab (consultation et PDF).
 * Les textes reprennent ceux des formulaires papier. Toute modification des formulaires se fait ici seulement.
 */
(function () {
  var VERSION = '1.1';
  var TELEPHONE = '(438) 978-2162';

  function ouinon(id, texte, opts) { var o = { t: 'ouinon', id: id, texte: texte }; for (var k in (opts || {})) { o[k] = opts[k]; } return o; }
  function check(id, texte) { return { t: 'check', id: id, texte: texte }; }
  function action(id, texte, si) { return { t: 'action', id: id, texte: texte, si: si || null }; }
  function info(texte, gras) { return { t: 'info', texte: texte, gras: !!gras }; }

  var DEFS = {
    L1: {
      code: 'L1', titre: 'CHARGEMENT ET CONFORMITÉ ROUTIÈRE', titreCourt: 'Chargement et conformité routière',
      qui: 'Chauffeur, avant le départ', groupe: 'transport', parModule: true,
      entete: [{ id: 'serie', label: 'Série #', auto: 'serie' }, { id: 'date', label: 'Date et heure', auto: 'date' },
        { id: 'module', label: 'Module #', auto: 'module' }, { id: 'chauffeur', label: 'Chauffeur', auto: 'auteur' }],
      sections: [
        { titre: 'Vérifications avant le chargement des modules :', souligne: 'avant', sous: 'Cocher les cases pour valider', items: [
          check('av1', '1 - Il n\'y a pas de tuyaux sous les modules, ni d’obstacles pour le chargement.'),
          check('av2', '2 - L\'emballage des modules est adéquat et résistant.'),
          check('av3', '3 - Les modules sont bien assis sur leurs pattes.'),
          check('av4', '4 - Vous avez le bon fardier pour respecter la hauteur du chargement.')] },
        { titre: 'Vérifications après le chargement des modules :', souligne: 'après', items: [
          check('ap1', '1 - La pancarte «D» est posée.'),
          check('ap2', '2 - Les lumières sont posées sans endommager la maison et elles fonctionnent.'),
          check('ap3', '3 - Les modules sont attachés dans le premier 3 pieds, puis à tous les 10 pieds.'),
          check('ap4', '4 - Les dimensions du chargement sont conformes au plan et au bon de travail.'),
          check('ap5', '5 - Les permis de transport et les documents requis sont conformes.')] },
        { titre: 'Actions à prendre :', actions: true, items: [
          action('ac1', 'Prendre une photo du chargement – Coté droit-côté gauche'),
          action('ac2', 'Prendre des photos des problématiques à l’intérieur du module'),
          action('ac3', 'Prendre une photo du présent formulaire une fois rempli.'),
          action('ac4', 'Téléverser votre photo sur OneDrive (L1 - CHARGEMENT & CONFORMITÉ ROUTIÈRE).'),
          action('ac5', 'Prendre la route en direction du site.')] }
      ],
      contact: '** En cas de non conformité, veuillez nous contacter **', initiales: true
    },
    L2: {
      code: 'L2', titre: 'DÉCHARGEMENT ET ENTREPOSAGE', titreCourt: 'Déchargement et entreposage',
      qui: 'Chauffeur, à l’arrivée', groupe: 'transport', parModule: true,
      entete: [{ id: 'serie', label: 'Série #', auto: 'serie' }, { id: 'date', label: 'Date et heure', auto: 'date' },
        { id: 'module', label: 'Module #', auto: 'module' }, { id: 'chauffeur', label: 'Chauffeur', auto: 'auteur' }],
      sections: [
        { titre: 'Vérifications après le déchargement des modules :', souligne: 'après', sous: '(Cochez les cases OUI ou NON)', items: [
          ouinon('q1', '1 - L\'emballage des modules est-il en bon état?'),
          ouinon('q2', '2 - Est-ce que toutes les poutrelles sont en bon état?'),
          ouinon('q3', '3 - Avez-vous installé les modules en angle pour l\'écoulement?')] },
        { titre: 'Actions à prendre :', actions: true, items: [
          action('ac1', 'Prendre des photos des problématiques à l’intérieur du module'),
          action('ac2', 'Prendre une photo du présent formulaire une fois rempli'),
          action('ac3', 'Téléverser vos photos sur OneDrive (sous L2 – DÉCHARGEMENT & ENTREPOSAGE)'),
          action('ac4', 'Prendre la route pour le retour.')] }
      ],
      contact: '** En cas de non conformité, veuillez nous contacter **', initiales: true
    },
    L3: {
      code: 'L3', titre: 'CONFORMITÉ AVANT INSTALLATION', titreCourt: 'Conformité avant installation',
      qui: 'Chef d’équipe', groupe: 'installation', parModule: false,
      entete: [{ id: 'serie', label: 'Série #', auto: 'serie' }, { id: 'date', label: 'Date et heure', auto: 'date' },
        { id: 'chef', label: 'Chef d’équipe', auto: 'auteur' }, { id: 'equipe', label: 'Équipe' }],
      sections: [
        { titre: '1- Conformité du paiement', sous: 'Sélectionner A ou B selon la méthode de paiement', items: [{ t: 'paiement', id: 'paiement' },
          info('**En cas de problème avec le paiement, ne pas débuter les travaux** Veuillez nous contacter ' + TELEPHONE + '.', true)] },
        { titre: '2 – Conformité du site', sous: 'Si vous cochez non : explication et photo', items: [
          ouinon('site1', 'Conformité d’accès et préparation de terrain', { photo: true }),
          { t: 'oui', id: 'site2', texte: 'Périmètre de sécurité installé' }] },
        { titre: '3 – Conformité des fondations', sous: 'Si vous cochez non : explication et photo', items: [
          ouinon('f1', 'De niveau', { photo: true }), ouinon('f2', 'Bon état', { photo: true }),
          ouinon('f3', 'Fonds de cave conformes', { photo: true }), ouinon('f4', 'Empattements conformes', { photo: true }),
          ouinon('f5', 'Fenêtres bon état', { photo: true }), ouinon('f6', 'Mesures conformes', { photo: true })] },
        { titre: 'Actions à prendre :', sous: 'Choisir le cas qui s’applique', items: [{ t: 'decision', id: 'cas' }] }
      ],
      decisions: {
        A: { titre: 'A - SI FONDATIONS CONFORMES', suite: ['Prendre une photo du formulaire L3 une fois rempli.', 'Téléverser vos photos sur OneDrive (sous L3 – CONFORMITÉ AVANT INSTALLATION)', 'Remplir le formulaire L4.1 avant de procéder à l’installation des modules sur les fondations.'] },
        B: { titre: 'B - SI FONDATIONS AVEC NON-CONFORMITÉS MINEURES, MAIS SANS IMPACTS FUTURS', suite: ['Prendre une photo du formulaire L3 une fois rempli.', 'Téléverser vos photos sur OneDrive (sous L3 – CONFORMITÉ AVANT INSTALLATION)', 'Remplir le formulaire L4.1 avant de procéder à l’installation des modules sur les fondations.'] },
        C: { titre: 'C - FONDATIONS AVEC NON-CONFORMITÉS MAJEURES, MAIS N’EMPÊCHENT PAS L’INSTALLATION', suite: ['Prendre une photo du formulaire L3 une fois rempli.', 'Remplir le formulaire L3b avec le client et prendre une photo du formulaire une fois rempli.', 'Téléverser vos photos sur OneDrive (sous L3 – CONFORMITÉ AVANT INSTALLATION)', 'Remplir le formulaire L4.1 avant de procéder à l’installation des modules sur les fondations.'], l3b: true },
        D: { titre: 'SI FONDATION AVEC NON-CONFORMITÉS MAJEURES QUI EMPÊCHENT L’INSTALLATION', suite: ['Prendre une photo du formulaire L3 une fois rempli.', 'Remplir le formulaire L3b avec le client et prendre une photo du formulaire une fois rempli.', 'Téléverser vos photos sur OneDrive (sous L3 – CONFORMITÉ AVANT INSTALLATION)', 'Veuillez nous contacter au ' + TELEPHONE + ', ne pas débuter l’installation.'], l3b: true, arret: true }
      },
      contact: 'Prendre en photo les non conformités.', initiales: true
    },
    L3b: {
      code: 'L3b', titre: 'AVIS DE FONDATION NON-CONFORME', titreCourt: 'Avis de fondation non conforme',
      qui: 'Chef d’équipe et client (si L3 le demande)', groupe: 'installation', parModule: false,
      entete: [{ id: 'serie', label: 'Série #', auto: 'serie' }, { id: 'date', label: 'Date et heure', auto: 'date' },
        { id: 'chef', label: 'Chef d’équipe', auto: 'auteur' }, { id: 'equipe', label: 'Équipe' }],
      sections: [
        { titre: 'Non-conformités constatées', items: [
          info('À la suite de l’inspection de la fondation, des non-conformités ont été constatées par le chef d’équipe d’installation des Industries Bonneville Ltée, tel que décrit ci-bas:'),
          { t: 'texte', id: 'nc', label: 'Non-conformités constatées', requis: true },
          info('Par la présente, le client déclare avoir pris connaissance de toutes les non-conformités identifiées.'),
          info('Le client comprend que ces dites non-conformités peuvent avoir un impact sur la qualité de l\'installation de la maison et il convient de l\'une des deux options suivantes:', true)] },
        { titre: 'Choix du client', items: [{ t: 'option', id: 'option', options: [
          { v: '1', titre: 'OPTION 1 - Le client déclare vouloir procéder à l’installation malgré les non conformités.', textes: [
            'En acceptant de procéder à l’installation et ce, malgré les non-conformités dénoncées, le client déclare être entièrement responsable des conséquences possibles découlant directement ou indirectement de ces dites non-conformités.',
            'Ce faisant, le client dégage Les Industries Bonneville Ltée de toutes responsabilités présente et futures en lien avec cette situation.'] },
          { v: '2', titre: 'OPTION 2 - Le client demande de ne pas procéder à l’installation de la maison.', textes: [
            'En refusant de procéder à l’installation, le client déclare être entièrement responsable des coûts additionnels relatifs aux frais engendrés pour le retour des modules en usine ainsi que pour la planification et l’exécution de la deuxième livraison/installation.',
            'Le client sera responsable d’effectuer les correctifs requis et d’aviser lorsque prêt pour une seconde livraison. La facture, représentant le montant total des coûts additionnels mentionnés ci-haut, sera communiquée, au client, par courriel, dans un délai d’une semaine avant la date prévue pour la deuxième mobilisation. La totalité de ce montant devra être payée, par chèque certifié, à l’ordre des Industries Bonneville Ltée, lors de cette deuxième mobilisation.'] }] }] },
        { titre: 'Signatures', items: [
          info('En foi de quoi, le client déclare avoir reçue une copie, lu, compris et signée ce document le :', true),
          { t: 'champ', id: 'dateSig', label: 'Date', auto: 'jour' }, { t: 'champ', id: 'lieu', label: 'Lieu', requis: true },
          { t: 'signature', id: 'sigClient', label: 'Signature du client :' },
          { t: 'signature', id: 'sigChef', label: 'Signature du chef d’équipe d’installation :' }] },
        { titre: 'À faire ensuite :', actions: true, items: [
          action('ac1', 'Si Option 1, prendre une photo du présent formulaire et le téléverser sur OneDrive (L3)', { option: '1' }),
          action('ac2', 'Si Option 2, veuillez nous appeler au ' + TELEPHONE + '.', { option: '2' })] }
      ]
    },
    L4: {
      code: 'L4', titre: 'INSPECTION DE CONFORMITÉ', titreCourt: 'Inspection de conformité',
      qui: 'Chef d’équipe et client', groupe: 'installation', parModule: false,
      entete: [{ id: 'serie', label: 'Série #', auto: 'serie' }, { id: 'client', label: 'Nom du client', requis: true }],
      sections: [
        { titre: 'INSPECTIONS EXTÉRIEURES', sous: '(Revêtement, fascia, soffite, toiture, portes, etc.)', items: [
          ouinon('e1', 'Coté façade', { photo: true }), ouinon('e2', 'Coté droit', { photo: true }),
          ouinon('e3', 'Coté arrière', { photo: true }), ouinon('e4', 'Coté gauche', { photo: true })] },
        { titre: 'INSPECTIONS SALLE DE BAIN', items: [
          ouinon('s1', 'Comptoir de salle de bain', { photo: true }), ouinon('s2', 'Vanité et panneaux', { photo: true }),
          ouinon('s3', 'Bain, douche et porte douche', { photo: true }), ouinon('s4', 'Bain autoportant et toilette', { photo: true }),
          ouinon('s5', 'Lavabos', { photo: true }), ouinon('s6', 'Robinets', { photo: true })] },
        { titre: 'INSPECTIONS CUISINE', items: [
          ouinon('c1', 'Armoires & panneaux', { photo: true }), ouinon('c2', 'Comptoirs', { photo: true }), ouinon('c3', 'Éviers et robinets', { photo: true })] },
        { titre: 'INSPECTIONS PORTES & FENETRES', items: [
          ouinon('p1', 'Fenêtres et moustiquaires', { photo: true }), ouinon('p2', 'Porte entrée et recouvrements', { photo: true }),
          ouinon('p3', 'Portes intérieures', { photo: true }), ouinon('p4', 'Porte extérieures & porte patio', { photo: true })] },
        { titre: 'INSPECTIONS GÉNÉRALES', items: [
          ouinon('g1', 'Matériaux électriques reçus', { photo: true }), ouinon('g2', 'Déchets déposés à l’endroit désigné & plastique emporté', { photo: true }),
          ouinon('g3', 'Étanchéité temporaire', { photo: true }), ouinon('g4', 'Poutrelles de plancher', { photo: true }),
          ouinon('g5', 'Politique garantie signée', { photo: true })] },
        { titre: 'Protection de vos biens :', items: [
          info('1. Inspecter vos biens le jour 1 de la livraison de votre maison'),
          info('2. S’assurer que tous vos biens soient protégés pendant l’entièreté des travaux.'),
          info('(Portes extérieures, recouvrement d’aluminium (contours de portes ou fenêtres), comptoirs, armoires…)'),
          info('Un rouleau de mousse auto-adhésif a été remis à votre disposition pour vous aider à protéger vos biens.', true),
          { t: 'champ', id: 'initialesClient', label: 'Initiales', requis: true },
          info('Suite à la vérification des items ci-haut mentionnés, le client se déclare satisfait et reconnaît avoir pris possession de la maison. Si certains items ne peuvent être vérifiés en date de la présente, le client a un délai de 48 heures pour signaler un item manquant, non-conforme ou défectueux.', true)] },
        { titre: 'Signatures', items: [
          { t: 'champ', id: 'dateSig', label: 'Date et heure', auto: 'date' },
          { t: 'signature', id: 'sigClient', label: 'Signature du client :' },
          { t: 'signature', id: 'sigChef', label: 'Signature du chef installateur :' },
          info('Veuillez maintenant remplir le formulaire L5.', true)] }
      ]
    },
    L5: {
      code: 'L5', titre: 'CONFORMITÉ DE L’INSTALLATION', titreCourt: 'Conformité de l’installation',
      qui: 'Chef d’équipe', groupe: 'installation', parModule: false,
      entete: [{ id: 'serie', label: 'Série #', auto: 'serie' }, { id: 'client', label: 'Nom du client', requis: true }],
      sections: [
        { titre: 'Conformité de l’installation', sous: '(Cochez les cases OUI ou NON)', explicationCommune: 'explications', items: [
          ouinon('i1', '1 - La maison est d’équerre sur la fondation.', { sansExplication: true }),
          ouinon('i2', '2 - Les sections arrivent égales des 2 côtés (bas & haut du mur extérieur).', { sansExplication: true }),
          ouinon('i3', '3 - Les corniches sont égales.', { sansExplication: true }),
          ouinon('i4', '4 - L\'espace entre les sections est égal (haut et bas).', { sansExplication: true }),
          ouinon('i5', '5 - Beam central ligné.', { sansExplication: true }),
          ouinon('i6', '6 - Les planchers des sections sont égaux et au niveau.', { sansExplication: true }),
          ouinon('i7', '7 - Poteaux de cave conformes au plan.', { sansExplication: true }),
          ouinon('i8', '8 - Plaques d’acier fixés au beam central (2 tires-fonds de 2.5 po).', { sansExplication: true }),
          ouinon('i9', '9 - Les sections sont boulonnées ensemble.', { sansExplication: true }),
          ouinon('i10', '10 - Les ouvertures sont symétriques.', { sansExplication: true }),
          ouinon('i11', '11 - Modules cloués aux fondations et au 2ieme étage (clous 3-1/2" aux 16" c/c).', { sansExplication: true }),
          ouinon('i13', '13 - Étanchéité temporaire fait (toiture / entre modules et étages)', { sansExplication: true }),
          ouinon('i14', '14 - Déchets disposés à l\'endroit désigné par le client.', { sansExplication: true }),
          ouinon('i15', '15 - Pancarte Bonneville installée.', { sansExplication: true })] },
        { titre: 'Explications si non (indiquer le numéro de non-conformité) :', items: [{ t: 'texte', id: 'explications', label: 'Explications', requisSiNon: true }] },
        { titre: 'Signature', items: [
          { t: 'signature', id: 'sigChef', label: 'Signature du chef d’équipe d’installation :' },
          { t: 'champ', id: 'dateSig', label: 'Signé le (date et heure)', auto: 'date' }] },
        { titre: 'Actions à prendre :', actions: true, items: [
          action('ac1', 'Prendre une photo du formulaire L4 une fois rempli (recto & verso).'),
          action('ac2', 'Prendre une photo du présent formulaire une fois rempli (L5).'),
          action('ac3', 'Téléverser vos photos d’installation et des formulaires (sous L4 & L5 - Installation).')] }
      ]
    },
    L6: {
      code: 'L6', titre: 'Auto-évaluation', titreCourt: 'Auto-évaluation',
      qui: 'Chaque membre de l’équipe', groupe: 'installation', parModule: false, parPersonne: true,
      entete: [{ id: 'serie', label: 'Série #', auto: 'serie' }, { id: 'nom', label: 'Prénom, Nom', auto: 'auteur' }],
      sections: [
        { titre: '3 – Conformité des processus', sous: '(Cochez les cases OUI ou NON)', items: [
          ouinon('p1', '1- Les modules étaient prêt pour le chargement.', { sansExplication: true }),
          ouinon('p2', '2- Le chargement des modules a été facile.', { sansExplication: true }),
          ouinon('p3', '3- Dimensions des modules conformes aux standards routiers.', { sansExplication: true }),
          ouinon('p4', '4- Permis et documents complets et reçus à temps.', { sansExplication: true }),
          ouinon('p5', '5- Aucun retards occasionnés durant l\'installation.', { sansExplication: true }),
          ouinon('p6', '6- Plans pour installation clairs, conformes et sans erreur.', { sansExplication: true }),
          ouinon('p7', '7- Méthode de construction adéquates.', { sansExplication: true }),
          ouinon('p8', '8- Matériaux requis pour installation au chargement.', { sansExplication: true })] },
        { titre: 'Commentaires', items: [{ t: 'texte', id: 'commentaires', label: 'Commentaires' }] },
        { titre: 'Actions à prendre :', actions: true, items: [
          action('ac1', 'Prendre une photo du présent formulaire une fois rempli.'),
          action('ac2', 'Faites-nous le parvenir accompagné de vos commentaires par courriel.')] }
      ]
    }
  };
  var ORDRE = ['L1', 'L2', 'L3', 'L3b', 'L4', 'L5', 'L6'];

  // ---------- Validation et résumé
  function actionVisible(item, r) { return !item.si || !item.si.option || r.option === item.si.option; }

  function aUnNon(def, r) {
    var n = false;
    def.sections.forEach(function (s) { s.items.forEach(function (it) { if (it.t === 'ouinon' && r[it.id] === 'non') { n = true; } }); });
    return n;
  }

  function manquants(def, r) {
    var m = [];
    (def.entete || []).forEach(function (c) { if (c.requis && !String(r[c.id] || '').trim()) { m.push(c.label); } });
    def.sections.forEach(function (s) {
      s.items.forEach(function (it) {
        var v = r[it.id];
        switch (it.t) {
          case 'check': if (!v) { m.push(it.texte); } break;
          case 'action': if (actionVisible(it, r) && !v) { m.push(it.texte); } break;
          case 'oui': if (v !== 'oui') { m.push(it.texte); } break;
          case 'ouinon':
            if (v !== 'oui' && v !== 'non') { m.push(it.texte); }
            else if (v === 'non' && !it.sansExplication && !String(r[it.id + '_expl'] || '').trim()) { m.push('Explication : ' + it.texte); }
            break;
          case 'texte':
            if ((it.requis || (it.requisSiNon && aUnNon(def, r))) && !String(v || '').trim()) { m.push(it.label); }
            break;
          case 'champ': if (it.requis && !String(v || '').trim()) { m.push(it.label); } break;
          case 'paiement': if (!v || !v.mode) { m.push('Conformité du paiement'); } break;
          case 'decision': if (!v) { m.push('Cas A, B, C ou D'); } break;
          case 'option': if (!v) { m.push('Option 1 ou 2'); } break;
          case 'signature': if (!v || !v.length) { m.push(it.label.replace(/\s*:\s*$/, '')); } break;
        }
      });
    });
    if (def.initiales && !String(r.initiales || '').trim()) { m.push('Initiales'); }
    return m;
  }

  function resume(def, r) {
    var non = 0;
    def.sections.forEach(function (s) { s.items.forEach(function (it) { if (it.t === 'ouinon' && r[it.id] === 'non') { non++; } }); });
    var res = { nonConformites: non, alerte: non > 0 };
    if (def.code === 'L3') {
      res.cas = r.cas || '';
      var p = r.paiement || {};
      res.paiementProbleme = p.mode === 'A' && !(p.date && p.montant && p.endossement);
      if (res.paiementProbleme || r.cas === 'C' || r.cas === 'D') { res.alerte = true; }
      res.l3b = !!(r.cas && DEFS.L3.decisions[r.cas] && DEFS.L3.decisions[r.cas].l3b);
    }
    if (def.code === 'L3b') { res.option = r.option || ''; res.alerte = true; }
    var t = [];
    if (non) { t.push(non + ' non-conformité' + (non > 1 ? 's' : '')); }
    if (res.paiementProbleme) { t.push('paiement à vérifier'); }
    if (res.cas) { t.push('cas ' + res.cas + (res.l3b ? ' : L3b requis' : '')); }
    if (res.option) { t.push('option ' + res.option); }
    res.texte = t.length ? t.join(', ') : 'Conforme';
    return res;
  }

  // ---------- PDF (jsPDF, format lettre) : reproduit le gabarit papier
  var LOGO = 'data:image/png;base64,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';
  var LOGO_RATIO = 31 / 250;

  function propre(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/[’‘]/g, '\'').replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/…/g, '...').replace(/\u00a0/g, ' ');
  }

  function dessinerFormulaire(doc, f, premier) {
    var def = DEFS[f.code];
    if (!def) { return; }
    var r = f.reponses || {};
    var W = 612, H = 792, M = 34, X1 = M, X2 = W - M, L = X2 - X1, y = 0;
    var GRIS = [229, 229, 229], GRIS_CLAIR = [242, 242, 242], TRAIT = 60;
    var colonnes = null;

    function police(style, taille) { doc.setFont('helvetica', style); doc.setFontSize(taille); }
    function texte(t, x, yy, opt) { doc.text(t, x, yy, opt || {}); }
    function lignes(t, larg, style, taille) { police(style || 'normal', taille || 10); return doc.splitTextToSize(propre(t), larg); }
    function remplir(c) { doc.setFillColor(c[0], c[1], c[2]); }

    function logo() { try { doc.addImage(LOGO, 'PNG', X2 - 120, 14, 120, 120 * LOGO_RATIO); } catch (e) {} }
    function nouvellePage() {
      doc.addPage('letter', 'portrait'); logo();
      police('bold', 9); doc.setTextColor(80);
      texte(propre(def.code + ' - ' + def.titre + ' (suite)   Série # ' + (r.serie || f.serie || '')), X1, 26);
      doc.setTextColor(0); y = 42;
      if (colonnes) { enteteColonnes(colonnes, null); }
    }
    function place(h) { if (y + h > H - 30) { nouvellePage(); } }

    function rondCoche(x, cy, coche, rayon) {
      var rr = rayon || 7.5;
      doc.setDrawColor(TRAIT); doc.setLineWidth(0.9); doc.circle(x, cy, rr, 'S');
      if (coche) { doc.setLineWidth(1.8); doc.line(x - rr * 0.5, cy + 0.2, x - rr * 0.12, cy + rr * 0.45); doc.line(x - rr * 0.12, cy + rr * 0.45, x + rr * 0.55, cy - rr * 0.5); doc.setLineWidth(0.9); }
    }
    function iconeValider(x, cy) { rondCoche(x, cy, true, 8); }

    // Colonnes d'un tableau : [{t:'texte', w}, {t:'case', label}, ...] largeurs en points
    function calculerColonnes(type) {
      if (type === 'check') { return [{ k: 'texte', w: L - 62 }, { k: 'valider', w: 62, label: 'Cocher les cases pour valider' }]; }
      if (type === 'ouinon') { return [{ k: 'texte', w: L - 104 }, { k: 'oui', w: 52, label: 'OUI' }, { k: 'non', w: 52, label: 'NON' }]; }
      if (type === 'photo') { return [{ k: 'texte', w: 168 }, { k: 'photo', w: 48, label: 'PHOTO' }, { k: 'oui', w: 44, label: 'OUI' }, { k: 'non', w: 44, label: 'NON' }, { k: 'expl', w: L - 304, label: 'EXPLICATIONS' }]; }
      return null;
    }
    function enteteColonnes(cols, titre, sous, souligne) {
      if (cols[cols.length - 1].k === 'valider') { sous = ''; }
      var tl = titre ? lignes(titre, cols[0].w - 16, 'bolditalic', 13) : [];
      var sl = sous ? lignes(sous, cols[0].w - 12, 'italic', 8.5) : [];
      var h = Math.max(cols[cols.length - 1].k === 'valider' ? 48 : 40, 14 + tl.length * 15 + sl.length * 10);
      place(h);
      remplir(GRIS); doc.setDrawColor(TRAIT); doc.setLineWidth(0.9); doc.rect(X1, y, L, h, 'FD');
      var x = X1;
      cols.forEach(function (c, i) {
        if (i) { doc.line(x, y, x, y + h); }
        if (c.k === 'texte') {
          if (tl.length) {
            police('bolditalic', 13);
            var y0 = y + (h - tl.length * 15 - sl.length * 10) / 2 + 11;
            tl.forEach(function (ln, j) {
              texte(ln, x + c.w / 2, y0 + j * 15, { align: 'center' });
              if (souligne && ln.indexOf(souligne) >= 0) {
                var lw = doc.getTextWidth(ln), debut = doc.getTextWidth(ln.slice(0, ln.indexOf(souligne)));
                var xs = x + c.w / 2 - lw / 2 + debut;
                doc.setLineWidth(0.8); doc.line(xs, y0 + j * 15 + 2, xs + doc.getTextWidth(souligne), y0 + j * 15 + 2);
              }
            });
            if (sl.length) { police('italic', 8.5); texte(sl, x + c.w / 2, y0 + tl.length * 15 - 2, { align: 'center' }); }
          }
        } else if (c.k === 'valider') {
          police('normal', 6.5); texte(['Cocher les', 'cases pour', 'valider'], x + c.w / 2, y + 9, { align: 'center' });
          iconeValider(x + c.w / 2, y + h - 10);
        } else if (c.k === 'expl') {
          police('bold', 11); texte('EXPLICATIONS', x + c.w / 2, y + h / 2 + 4, { align: 'center' });
        } else {
          police('bold', 8); texte(c.label, x + c.w / 2, y + 10, { align: 'center' });
          iconeValider(x + c.w / 2, y + h - 12);
        }
        x += c.w;
      });
      y += h;
    }
    function rangee(cols, item) {
      var v = r[item.id];
      var tw = cols[0].w - 16;
      var tl = lignes(item.texte, tw, 'normal', 10.5);
      var expl = (item.t === 'ouinon' && v === 'non') ? (r[item.id + '_expl'] || '') : '';
      var sousExpl = [];
      var colExpl = cols.filter(function (c) { return c.k === 'expl'; })[0];
      var explLignes = [];
      if (colExpl) { explLignes = expl ? lignes(expl, colExpl.w - 12, 'italic', 9) : []; }
      else if (item.t === 'ouinon' && !item.sansExplication) { sousExpl = lignes('Explications (si NON) : ' + expl, tw, 'normal', 9.5); }
      var h = Math.max(26, 10 + tl.length * 12.5, 10 + explLignes.length * 11) + (sousExpl.length ? sousExpl.length * 12 + 10 : 0);
      place(h);
      doc.setDrawColor(TRAIT); doc.setLineWidth(0.9); doc.rect(X1, y, L, h, 'S');
      var x = X1, cy = y + Math.min(h, 26 + (tl.length - 1) * 6) / 2 + 0.5;
      if (sousExpl.length) { cy = y + 13 + (tl.length - 1) * 6; }
      cols.forEach(function (c, i) {
        if (i) { doc.line(x, y, x, y + h); }
        if (c.k === 'texte') {
          police('normal', 10.5); texte(tl, x + 8, y + 16);
          if (sousExpl.length) {
            police('bold', 9.5); texte('Explications', x + 8, y + 16 + tl.length * 12.5 + 6);
            police('normal', 9.5); var reste = sousExpl.slice(); reste[0] = reste[0].replace(/^Explications \(si NON\) : ?/, '(si NON) : ');
            texte(reste, x + 70, y + 16 + tl.length * 12.5 + 6);
            doc.setLineWidth(0.6); doc.line(x + 8, y + h - 6, x + c.w - 8, y + h - 6); doc.setLineWidth(0.9);
          }
        } else if (c.k === 'valider') { rondCoche(x + c.w / 2, cy, !!v); }
        else if (c.k === 'oui') { rondCoche(x + c.w / 2, cy, v === 'oui'); }
        else if (c.k === 'non') { if (item.t !== 'oui') { rondCoche(x + c.w / 2, cy, v === 'non'); } }
        else if (c.k === 'photo') { if (item.photo) { rondCoche(x + c.w / 2, cy, !!r[item.id + '_photo']); } }
        else if (c.k === 'expl') { police('italic', 9); texte(explLignes, x + 6, y + 14); }
        x += c.w;
      });
      y += h;
    }
    function boite(h, gris) {
      place(h);
      if (gris) { remplir(GRIS_CLAIR); doc.setDrawColor(TRAIT); doc.setLineWidth(0.9); doc.rect(X1, y, L, h, 'FD'); }
      else { doc.setDrawColor(TRAIT); doc.setLineWidth(0.9); doc.rect(X1, y, L, h, 'S'); }
    }
    function signature(traits, x, yy, w, h) {
      doc.setDrawColor(TRAIT); doc.setLineWidth(0.6); doc.line(x, yy + h, x + w, yy + h);
      if (!traits || !traits.length) { return; }
      doc.setDrawColor(10); doc.setLineWidth(1.1);
      traits.forEach(function (tr) { for (var i = 1; i < tr.length; i++) { doc.line(x + tr[i - 1][0] / 300 * w, yy + tr[i - 1][1] / 120 * h, x + tr[i][0] / 300 * w, yy + tr[i][1] / 120 * h); } });
      doc.setDrawColor(TRAIT);
    }

    // ----- Page, logo et bande de titre
    if (!premier) { doc.addPage('letter', 'portrait'); }
    logo();
    remplir(GRIS); doc.rect(0, 34, W, 46, 'F');
    police('bold', 18); texte(propre(def.code + ' - ' + def.titre), W / 2, 63, { align: 'center' });
    y = 92;

    // ----- Renseignements (cadre gris)
    var cases = def.entete || [], nbl = Math.ceil(cases.length / 2), hInfo = nbl * 34 + 12;
    remplir(GRIS_CLAIR); doc.setDrawColor(150); doc.setLineWidth(0.9); doc.rect(X1, y, L, hInfo, 'FD');
    cases.forEach(function (c, i) {
      var col = i % 2, lig = Math.floor(i / 2), x = X1 + 10 + col * (L / 2), yy = y + 26 + lig * 34;
      police('bold', 11); texte(propre(c.label + ' :'), x, yy);
      var xv = x + (col ? 92 : 84), wv = L / 2 - (col ? 104 : 96);
      doc.setFillColor(255, 255, 255); doc.rect(xv, yy - 17, wv, 22, 'F');
      doc.setDrawColor(TRAIT); doc.line(xv, yy + 5, xv + wv, yy + 5);
      police('normal', 11); texte(propre(r[c.id] || ''), xv + 4, yy);
    });
    y += hInfo + 12;

    // ----- Sections
    def.sections.forEach(function (s) {
      if (s.actions) {
        var visibles = s.items.filter(function (it) { return actionVisible(it, r); });
        var lt = visibles.map(function (it, i) { return lignes((i + 1) + '. ' + it.texte, L - 60, 'bolditalic', 10); });
        var h = 34 + lt.reduce(function (a, l) { return a + l.length * 12 + 6; }, 0) + 6;
        boite(h, true);
        police('bolditalic', 14); texte(propre(s.titre), W / 2, y + 22, { align: 'center' });
        var yy = y + 40;
        visibles.forEach(function (it, i) {
          police('bolditalic', 10); texte(lt[i], X1 + 12, yy);
          var fin = X1 + 12 + doc.getTextWidth(lt[i][lt[i].length - 1]) + 4, yl = yy + (lt[i].length - 1) * 12;
          doc.setLineDashPattern([1, 1.5], 0); doc.setLineWidth(0.6); doc.line(fin, yl, X2 - 24, yl); doc.setLineDashPattern([], 0);
          rondCoche(X2 - 14, yl - 3.5, !!r[it.id], 6.5);
          yy += lt[i].length * 12 + 6;
        });
        y += h + 12; return;
      }
      var interactifs = s.items.filter(function (it) { return it.t !== 'info'; });
      var type = null;
      if (interactifs.length && interactifs.every(function (it) { return it.t === 'check'; })) { type = 'check'; }
      else if (interactifs.length && interactifs.every(function (it) { return it.t === 'ouinon' || it.t === 'oui'; })) {
        type = interactifs.some(function (it) { return it.photo; }) ? 'photo' : 'ouinon';
      }
      if (type) {
        colonnes = calculerColonnes(type);
        enteteColonnes(colonnes, s.titre, s.sous, s.souligne);
        s.items.forEach(function (it) { if (it.t !== 'info') { rangee(colonnes, it); } });
        colonnes = null;
        y += 12; return;
      }

      // Sections libres (paiement, choix, texte, signatures)
      var tl = lignes(s.titre, L - 20, 'bolditalic', 13);
      var hb = 12 + tl.length * 15 + (s.sous ? 12 : 0);
      place(hb + 30);
      remplir(GRIS); doc.setDrawColor(TRAIT); doc.setLineWidth(0.9); doc.rect(X1, y, L, hb, 'FD');
      police('bolditalic', 13); texte(tl, W / 2, y + 17, { align: 'center' });
      if (s.sous) { police('italic', 8.5); texte(propre(s.sous), W / 2, y + hb - 6, { align: 'center' }); }
      y += hb;
      s.items.forEach(function (it) {
        var v = r[it.id], t, h;
        switch (it.t) {
          case 'info':
            t = lignes(it.texte, L - 20, it.gras ? 'bold' : 'normal', 9.5); h = t.length * 11.5 + 10; boite(h);
            police(it.gras ? 'bold' : 'normal', 9.5); texte(t, X1 + 10, y + 14); y += h; break;
          case 'texte':
            t = lignes(v || '', L - 24, 'normal', 10); h = Math.max(3, t.length) * 13 + 16; boite(h);
            doc.setLineDashPattern([1, 1.5], 0); doc.setLineWidth(0.5);
            for (var k = 1; k <= Math.max(3, t.length); k++) { doc.line(X1 + 10, y + 6 + k * 13, X2 - 10, y + 6 + k * 13); }
            doc.setLineDashPattern([], 0); police('normal', 10); texte(t, X1 + 12, y + 16); y += h; break;
          case 'champ':
            boite(30); police('bold', 10.5); texte(propre(it.label + ' :'), X1 + 10, y + 19);
            police('normal', 11); texte(propre(v || ''), X1 + 170, y + 19); doc.setLineWidth(0.6); doc.line(X1 + 166, y + 22, X2 - 14, y + 22); y += 30; break;
          case 'paiement':
            var p = v || {};
            boite(104); police('bold', 13); texte('A -', X1 + 12, y + 30); rondCoche(X1 + 46, y + 26, p.mode === 'A', 8);
            police('normal', 12); texte('Chèque ou traite bancaire reçu', X1 + 60, y + 30);
            [['date', 'Date validée'], ['montant', 'Montant validé'], ['endossement', 'Endossement validé']].forEach(function (x, i) {
              rondCoche(X1 + 320, y + 14 + i * 20, !!p[x[0]], 8); police('normal', 11.5); texte(x[1], X1 + 336, y + 18 + i * 20);
            });
            doc.setLineDashPattern([1, 1.5], 0); doc.setLineWidth(0.5); doc.line(X1 + 10, y + 74, X2 - 10, y + 74); doc.setLineDashPattern([], 0);
            police('bold', 13); texte('B -', X1 + 12, y + 94); rondCoche(X1 + 46, y + 90, p.mode === 'B', 8);
            police('normal', 12); texte('Paiement déjà fait (virement)', X1 + 60, y + 94);
            y += 104; break;
          case 'decision':
            ['A', 'B', 'C', 'D'].forEach(function (kk) {
              var d = DEFS.L3.decisions[kk];
              var tt = lignes(d.titre + ' :', L - 50, 'bolditalic', 10); var suites = v === kk ? d.suite.map(function (sx, i) { return lignes((i + 1) + '. ' + sx, L - 56, 'normal', 9.5); }) : [];
              var hh = tt.length * 12 + 12 + suites.reduce(function (a, l) { return a + l.length * 11 + 3; }, 0);
              boite(hh); rondCoche(X1 + 16, y + 12, v === kk, 7); police('bolditalic', 10); texte(tt, X1 + 30, y + 15);
              var yy = y + 15 + tt.length * 12;
              suites.forEach(function (ss) { police('normal', 9.5); texte(ss, X1 + 36, yy); yy += ss.length * 11 + 3; });
              y += hh;
            });
            break;
          case 'option':
            it.options.forEach(function (o) {
              var tt = lignes(o.titre, L - 46, 'bold', 11); var hh = tt.length * 13 + 10;
              place(hh); remplir(GRIS); doc.setDrawColor(TRAIT); doc.rect(X1, y, L, hh, 'FD');
              rondCoche(X1 + 16, y + hh / 2, v === o.v, 8); police('bold', 11); texte(tt, X1 + 32, y + 16); y += hh;
              var corps = o.textes.map(function (tx) { return lignes(tx, L - 30, 'normal', 9.5); });
              var hc = corps.reduce(function (a, l) { return a + l.length * 11.5 + 6; }, 0) + 6;
              boite(hc); var yy = y + 14;
              corps.forEach(function (ll) { police('normal', 9.5); texte(ll, X1 + 14, yy); yy += ll.length * 11.5 + 6; });
              y += hc;
            });
            break;
          case 'signature':
            boite(70); police('bold', 10.5); texte(propre(it.label), X1 + 10, y + 40);
            signature(v, X1 + 250, y + 8, L - 270, 54); y += 70; break;
        }
      });
      y += 12;
    });

    // ----- Pied gris : contact, initiales, B
    var hp = (def.contact || def.initiales) ? 58 : 34;
    place(hp);
    remplir(GRIS); doc.rect(0, y, W, hp, 'F');
    var centre = (W - 130) / 2;
    if (def.contact) {
      police('bold', 11.5); texte(propre(def.contact), centre, y + 22, { align: 'center' });
      police('bold', 11.5); texte(TELEPHONE, centre, y + 40, { align: 'center' });
    }
    if (def.initiales) {
      doc.setFillColor(255, 255, 255); doc.setDrawColor(150); doc.setLineWidth(0.9); doc.rect(X2 - 112, y + 6, 70, 46, 'FD');
      police('bolditalic', 8.5); texte('Initiales', X2 - 77, y + 17, { align: 'center' });
      police('bold', 12); texte(propre(r.initiales || ''), X2 - 77, y + 40, { align: 'center' });
    }
    var yb = y + (hp - 26) / 2;
    doc.setFillColor(255, 255, 255); doc.setDrawColor(176, 38, 58); doc.setLineWidth(1.3); doc.rect(X2 - 30, yb, 26, 26, 'FD');
    police('normal', 19); texte('B', X2 - 17, yb + 20, { align: 'center' });
    doc.setLineWidth(0.9); doc.setDrawColor(0);
    y += hp + 10;
    if (y < H - 16) {
      police('normal', 7.5); doc.setTextColor(110);
      texte(propre('Rempli dans Bonneville Transport Drive par ' + (f.auteur || '?') + ', envoyé le ' + (f.date ? new Date(f.date).toLocaleString('fr-CA') : '?') + '.'), X1, y);
      doc.setTextColor(0);
    }
  }

  function pdf(formulaires, nomFichier) {
    var J = window.jspdf && window.jspdf.jsPDF;
    if (!J) { throw new Error('La bibliothèque PDF n’a pas été chargée.'); }
    var doc = new J({ unit: 'pt', format: 'letter', orientation: 'portrait' });
    formulaires.forEach(function (f, i) { dessinerFormulaire(doc, f, i === 0); });
    doc.save(nomFichier || 'formulaires.pdf');
  }

  window.BonnevilleFormulaires = {
    version: VERSION, telephone: TELEPHONE, logo: LOGO, defs: DEFS, ordre: ORDRE,
    manquants: manquants, resume: resume, actionVisible: actionVisible, aUnNon: aUnNon, pdf: pdf
  };
})();
