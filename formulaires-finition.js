/* Bonneville - Formulaires F0 à F5 (Finition), version 1.0.0
   D'après les formulaires papier « F0 à F5 - fr ».
   Les « Actions à prendre » du papier (photographier le formulaire, téléverser) sont retirées : l'application s'en charge.
   Types d'éléments :
     ok       : case à valider du papier → Oui / Non obligatoire ; Non = explication obligatoire (+ photo si photoSiNon)
     ouinon   : colonne OUI / NON du papier → même règle
     texte    : zone de texte (obligatoire si requis)
     court    : texte court ; nombre : valeur numérique ; dateheure : date et heure
     table    : lignes à ajouter (colonnes définies)
     calcul   : addition et soustraction de mesures
     choix    : un choix parmi une liste
     signature: signature à l'écran
     note     : texte d'information (clause du papier)
   na : ajoute un choix « Sans objet » (libellé personnalisable). */
(function () {
  'use strict';
  var VERSION = '1.0.0';
  function ok(id, t, o) { var x = { id: id, type: 'ok', t: t }; if (o) { for (var k in o) { x[k] = o[k]; } } return x; }
  function lettres(prefixe, liste, o) { return liste.map(function (t, i) { return ok(prefixe + String.fromCharCode(97 + i), String.fromCharCode(97 + i) + ' – ' + t, o); }); }
  var CLAUSE_F1 = 'Les clients reconnaissent que divers sous-traitants, incluant l’équipe de raccord de menuiserie, travailleront dans leur maison. En ce sens, ils comprennent qu’à partir de la date de la signature de la présente, tous les dommages causés aux items ci-haut mentionnés sont exclus de la garantie des Industries Bonneville. Les Industries Bonneville recommandent que le ou les propriétaires de la maison exigent que leurs intervenants protègent ces items durant l’exécution des travaux.';
  var ATTEST_F5 = 'En signant la présente, le client atteste avoir vérifié et validé les items énumérés avec le chef d’équipe à la fin des travaux de raccordement prévus au contrat avec Les Industries Bonneville Ltée.';
  var SATISF_F5 = 'Suite à l’inspection de la maison effectuée avec le chef d’équipe, le client se déclare satisfait des travaux effectués et déclare avoir identifié ci-haut les correctifs qui demeurent à être adressés.';

  var DEFS = {
    F0: {
      code: 'F0', titre: 'Pré-évaluation des travaux', moment: 'Avant le chantier · 24 h avant l’arrivée', delaiJours: -1,
      sections: [
        { titre: 'Vérifications à faire 24 h avant l’arrivée chez le client', items: [
          ok('f0_1', '1 – Plan complet reçu'),
          ok('f0_2', '2 – Feuille de chargement vérifiée (valider matériel et quantités)'),
          { id: 'f0_manq', type: 'texte', t: 'Matériaux manquants (si applicable)' },
          ok('f0_3', '3 – Bon de travail vérifié et accepté'),
          { id: 'f0_rem', type: 'texte', t: 'Remarques ou commentaires (si applicable)' }
        ] },
        { titre: 'Début des travaux', items: [
          { id: 'f0_debut', type: 'dateheure', t: 'Date et heure prévues du début des travaux', requis: true },
          { id: 'f0_duree', type: 'court', t: 'Durée estimée des travaux', requis: true, aide: 'Ex. : 2 jours' }
        ] }
      ]
    },
    F1: {
      code: 'F1', titre: 'Inspection des biens', moment: 'À l’arrivée · avec le client', signatureClient: true,
      sections: [
        { titre: 'Confirmer le bon état des biens suivants avec le client', items: ['Portes extérieures', 'Fenêtres', 'Armoires de cuisine', 'Comptoirs de cuisine', 'Évier de cuisine', 'Vanité de salle de bain', 'Comptoir de salle de bain', 'Baignoire', 'Douche et porte de douche', 'Lavabos', 'Portes intérieures']
          .map(function (t, i) { return { id: 'f1_' + (i + 1), type: 'ouinon', t: t, photoSiNon: true, aideNon: 'Explique le dommage et prends une photo.' }; }) },
        { titre: 'Calcul de la hauteur du « rough » de l’escalier au sous-sol', items: [
          { id: 'f1_rough', type: 'calcul', t: 'Hauteur totale entre plancher fini au RC et plancher fini au S/S', unite: 'po', lignes: [
            ['', 'Hauteur du dessus du plywood au RDC au-dessus de la semelle de fondation'], ['+', 'Finition du plancher RDC'], ['-', 'Épaisseur de l’isolation sous la dalle'],
            ['-', 'Épaisseur de la dalle de béton'], ['-', 'Épaisseur du faux plancher au S/S']] }
        ] },
        { titre: 'Signatures', items: [
          { id: 'f1_clause', type: 'note', t: CLAUSE_F1 },
          { id: 'f1_lieu', type: 'court', t: 'Lieu', requis: true, auto: 'ville' },
          { id: 'f1_sig_client', type: 'signature', t: 'Signature du client', requis: true, client: true },
          { id: 'f1_sig_chef', type: 'signature', t: 'Signature du chef menuisier', requis: true }
        ] }
      ]
    },
    F2: {
      code: 'F2', titre: 'Vérification de la liste de matériel', moment: 'Dans les 4 h suivant l’arrivée · avec le client',
      sections: [
        { titre: 'Vérification de la liste de matériel en inventaire', items: [
          { id: 'f2_1', type: 'ouinon', t: 'L’inventaire et les quantités sont suffisants pour effectuer les travaux', aideNon: 'Ajoute le matériel manquant ou brisé à la demande de matériaux.' },
          { id: 'f2_2', type: 'ouinon', t: 'Tout le matériel électrique inclus au contrat a été livré', aideNon: 'Ajoute le matériel manquant à la demande de matériaux.' }
        ] },
        { titre: 'Demande de matériaux', items: [
          { id: 'f2_dem', type: 'table', t: 'Demande de matériaux (si vous avez répondu Non)', requisSiNon: ['f2_1', 'f2_2'], colonnes: [
            { id: 'qte', t: 'Quantité', type: 'nombre' }, { id: 'desc', t: 'Description', type: 'court' }, { id: 'etat', t: 'État', type: 'choix', options: ['Manquant', 'Brisé'] }] }
        ] }
      ]
    },
    F3: {
      code: 'F3', titre: 'Demande de travaux en extra', moment: 'Au besoin · attendre l’autorisation', autorisation: true, besoin: true,
      sections: [
        { titre: 'Demande de travaux en extra', items: [
          { id: 'f3_note', type: 'note', t: 'Pour tous travaux ne figurant pas sur votre bon de travail et qui dépassent 1 000 $ d’ouvrage. Vous devez attendre l’autorisation de votre coordonnateur avant de débuter les travaux en extra.' },
          { id: 'f3_dem', type: 'table', t: 'Travaux demandés', requis: true, colonnes: [{ id: 'heures', t: 'Temps prévu (heures)', type: 'nombre' }, { id: 'desc', t: 'Description des travaux', type: 'court' }] },
          { id: 'f3_photos', type: 'photos', t: 'Photos des lieux qui requièrent des travaux en extra', min: 1 }
        ] }
      ]
    },
    F4: {
      code: 'F4', titre: 'Auto-inspection', moment: 'Fin des travaux · sans le client',
      sections: [
        { titre: '1 – Items à vérifier sur la toiture', items: lettres('f4_1', ['Aucun trou de clou sur la toiture.', 'Les noues sont fabriquées selon les normes.', 'Aucune bosse sur la toiture.', 'Le joint à la penture est bien cloué.', 'La bande de départ « Glass Guard » est installée.', 'La pellicule protectrice a été enlevée à la penture.', 'La distance entre les bardeaux est conforme et régulière.', 'Le bardeau posé sur place est cloué correctement sur la ligne de colle.', 'Les bardeaux ne sont ni tachés, ni déchirés.', 'S’il y a un toit à deux niveaux, les solins doivent être sous le Tyvek (ou Typar).', 'L’évent de plomberie est bien scellé (ajouter du scellant si nécessaire).', 'Le module d’aération « Maximum » est bien installé.']) },
        { titre: '2 – Items à vérifier pour la membrane', items: lettres('f4_2', ['Le joint d’uréthane est fait entre chaque module et recouvert d’une bande de styrofoam.', 'Les maximums, les évents, les mâts électriques et la cheminée sont installés et sécurisés avec les produits EPDM/Soprema (sinon le client a été avisé).', 'Les remontées sont collées sur du plywood.', 'Les drips sont arrondis et chaque morceau est uni par du « water cutoff ».', 'Les « secur tape » et « cover strips » sont bien collés, sans faux plis et sécurisés par « lap » scellant.', 'Dans un retour de membrane, la remontée est de 12 po et est non perforée sur 8 po.', 'La toiture a été vérifiée et est sans perforation, ni débris sur ou sous la membrane.']) },
        { titre: '3 – Items à vérifier à l’extérieur', items: lettres('f4_3', ['Les bordures de toit sont bien clouées.', 'Les avant-toits sont bien alignés.', 'Les fascias sont bien cloués et non bosselés.', 'Le revêtement est bien installé (pas trop serré).', 'Maisons à 2 étages : vérifier l’isolation et le pare-air entre les modules (s’assurer que les ouvertures pour les courroies de grue sont isolées).', 'Le pare-air (Tyvek ou Typar) est scellé en continu jusqu’aux pignons.', 'Aux extrémités du joint central, les solives coupées sur place sont scellées, le pare-air rabattu.', 'Lors d’une finition de briques en façade, la bordure en J est avancée de ¾ po.', 'Le premier rang de revêtement est bien installé et recouvre la fondation.', 'Les grilles d’entrée et de sortie de l’échangeur d’air sont installées.', 'La sortie de sécheuse est au moins à 8 pi de la grille d’entrée de l’échangeur d’air.']) },
        { titre: '4 – Items à vérifier au grenier', items: lettres('f4_4', ['Les pattes de fermes de toit sont bien installées à tous les 2 pi au maximum.', 'Les fourrures sont bien clouées aux fermes de toit à tous les 2 pi au maximum.', 'Les pattes de fermes de toit sont bien clouées (4 clous chacune).', 'Contreventement des pattes de fermes de toit : fourrure (1x4) clouée à chaque patte.', 'OSB installé dans les pignons.', 'La laine est bien soufflée (minimum de 11 po).', 'Les évents sont raccordés (sinon prévenir le client d’aviser son plombier).']).map(function (x) { if (x.id === 'f4_4f') { x.mesure = 'Mesure réelle (po)'; } return x; }) },
        { titre: '5 – Items à vérifier pour les divisions', items: lettres('f4_5', ['Les pattes de fermes de toit sont bien installées à tous les 2 pi au maximum.', 'Les fourrures sont bien clouées aux fermes de toit à tous les 2 pi au maximum.']) },
        { titre: '6 – Items à vérifier pour la finition', items: lettres('f4_6', ['Les panneaux d’armoires sont bien ajustés.', 'Les joints de comptoirs sont bien ajustés et les éviers et lavabos sont appuyés sur le comptoir.', 'Les portes des vanités sont bien ajustées.', 'La sortie de la hotte de poêle est raccordée.', 'Les portes intérieures sont bien ajustées et non tordues (si non installées, avertir le client de bien vérifier l’ajustement avant de clouer les moulures).', 'La rampe temporaire d’escalier est solide et bien construite.', 'Si l’entrée est à demi-niveau, vérifier si le travail est complété (soufflage de portes, etc.).']).map(function (x) { if (x.id === 'f4_6f') { x.na = 'Faite par le client'; } return x; }) },
        { titre: '7 – Items à vérifier pour la plomberie', items: lettres('f4_7', ['La porte de douche est bien scellée et bien ajustée.', 'Le tuyau et la grille de la sécheuse sont raccordés.']).map(function (x) { if (x.id === 'f4_7b') { x.na = 'Sans objet (au sous-sol)'; } return x; }) },
        { titre: '8 – Items à vérifier pour les fenêtres et les portes extérieures', items: lettres('f4_8', ['Le PVC n’est pas endommagé.', 'Toutes les fenêtres ouvrent et ferment bien.', 'Les vitres thermos ne sont pas endommagées.', 'Les coupe-froids des portes extérieures sont ajustés.', 'La porte-patio est ajustée.', 'Le moustiquaire de porte-patio et/ou de porte-française est installé et ajusté.']) },
        { titre: '9 – Items à vérifier au sous-sol', items: lettres('f4_9', ['Tous les poteaux de soutien sont installés conformément au plan.', 'Le nivellement du plancher a été vérifié sur la longueur et la largeur de la maison.', 'L’isolation du joint central est bien placée et se rend jusqu’à la fondation.', 'Il n’y a aucune solive brisée, ni contreventement coupé.', 'Les solives de périmètre sont fixées à la lisse par des clous de 4 po aux 16 po.', 'Le circuit de l’échangeur d’air est en place.', 'L’escalier est bien supporté et la main courante est installée.', 'Toutes les marches et les contremarches sont bien installées.', 'Le joint central de contreplaqué est vissé à tous les 6 po.', 'Le mur nain est bien isolé.', 'Pour un mur nain, les coins et le dessus de la fondation sont isolés et goudronnés, la laine et les fourrures sont installées.', 'La baignoire est cointée (expliquer au client comment la cointer s’il doit l’enlever pour installer une céramique).']).map(function (x) { if (x.id === 'f4_9j' || x.id === 'f4_9k') { x.na = 'Sans objet'; } return x; }) },
        { titre: '10 – Autres items à vérifier', items: [ok('f4_10a', 'a – La pancarte « UNE RÉALISATION DES INDUSTRIES BONNEVILLE » est bien installée.')] },
        { titre: '11 – Degré de satisfaction du client (selon votre évaluation)', items: [
          { id: 'f4_satisf', type: 'choix', t: 'Degré de satisfaction du client', requis: true, options: ['Excellent', 'Très bon', 'Bon', 'Passable', 'Faible'] },
          { id: 'f4_notes', type: 'texte', t: 'Notes' },
          { id: 'f4_sig_chef', type: 'signature', t: 'Signature du chef d’équipe', requis: true }
        ] }
      ]
    },
    F5: {
      code: 'F5', titre: 'Inspection de fin des travaux', moment: 'Fin des travaux · signature du client', signatureClient: true,
      sections: [
        { titre: '1 – Matériaux et appareils à vérifier', items: lettres('f5_1', ['Portes extérieures', 'Fenêtres', 'Armoires de cuisine', 'Comptoirs de cuisine', 'Éviers de cuisine', 'Vanité(s) de la salle de bain', 'Comptoir(s) de la salle de bain', 'Baignoire', 'Douche et porte de douche', 'Lavabo', 'Portes intérieures'], { photoSiNon: true }) },
        { titre: '2 – Autres items à vérifier', items: lettres('f5_2', ['Le bardeau d’asphalte ne démontre pas d’anomalie esthétique ou visuelle.', 'La membrane ne démontre pas d’anomalie esthétique ou visuelle et les renforts de jonction sont bien collés.', 'Les départs d’aluminium, les soffites et les fascias ne sont ni bossés, ni décrochés.', 'Le revêtement extérieur est bien enligné et ne gondole pas.', 'Les joints de scellant sont esthétiques et terminés.', 'Les portes extérieures et la porte-patio sont bien ajustées, d’équerre, et les coupe-froids sont bien ajustés.', 'Les fenêtres ouvrent et ferment normalement.', 'Toutes les moustiquaires sont installées et en bon état.', 'Les portes intérieures fonctionnent bien et leur cadrage est bien ajusté.', 'Les tablettes de garde-robes sont installées.', 'Les panneaux de gypse sont bien installés.', 'Le contreplaqué au joint des modules est de niveau.', 'La sortie de hotte est raccordée.', 'L’escalier au sous-sol répond aux normes d’échappée (77 po).', 'Toutes les poutrelles de plancher sont conformes.', 'Au sous-sol, les colonnes ajustables sont bien installées (4 boulons par plaque).', 'L’isolant au grenier est conforme et bien placé.', 'Les rebuts ont été placés à l’endroit désigné par le client.', 'Les trous d’échangeur d’air (trous de 6 po aux 6 pi, si au Québec), de hotte et de ventilateur de salle de bain sont faits.', 'Les raccords d’échangeur d’air entre les modules sont complétés (plancher isolé et 2e étage).', 'Les trappes d’accès sont ouvertes au plafond (plomberie, balayeuse centrale, chauffage).', 'Le client a bien protégé ses biens pendant les travaux (comptoirs, marches, armoires, porte d’entrée, base de douche, etc.).', 'Tous les éléments emballés ont été vérifiés (toilettes, bains, porte de douche, robinets, évier, etc.).', 'Les 4 côtés de la maison sont photographiés, ainsi que chaque item qui reste à compléter.'], { photoSiNon: true })
          .map(function (x) { if (x.id === 'f5_2m') { x.na = 'Sans objet'; } if (x.id === 'f5_2r') { x.na = 'Conteneur sur place'; } if (x.id === 'f5_2x') { x.photoSiOui = 4; delete x.photoSiNon; } return x; }) },
        { titre: 'Commentaires', items: [{ id: 'f5_comm', type: 'texte', t: 'Commentaires ou items non complétés' }] },
        { titre: '3 – Points qui demeurent à compléter (si applicables)', items: [
          { id: 'f5_points', type: 'table', t: 'Points qui demeurent à compléter', photoParLigne: true, colonnes: [
            { id: 'desc', t: 'Descriptif', type: 'court' }, { id: 'resp', t: 'Service ou Entrepreneur', type: 'choix', options: ['Service', 'Entrepreneur'] }] }
        ] },
        { titre: 'Entente et retour des matériaux', items: [
          { id: 'f5_entente', type: 'texte', t: 'Entente prise avec le client (si nécessaire)' },
          { id: 'f5_retour_note', type: 'note', t: 'Après un inventaire des matériaux excédentaires, le chef menuisier établit la liste des matériaux laissés sur le chantier appartenant aux Industries Bonneville. Ils seront récupérés plus tard (ex. : bardeaux, revêtement extérieur, bois d’œuvre).' },
          { id: 'f5_retour', type: 'table', t: 'Retour des matériaux', photoParLigne: true, colonnes: [{ id: 'qte', t: 'Quantité', type: 'nombre' }, { id: 'mat', t: 'Matériaux', type: 'court' }] }
        ] },
        { titre: 'Signatures', items: [
          { id: 'f5_attest', type: 'note', t: ATTEST_F5 + ' ' + SATISF_F5 },
          { id: 'f5_lieu', type: 'court', t: 'Lieu', requis: true, auto: 'ville' },
          { id: 'f5_sig_client', type: 'signature', t: 'Signature du client', requis: true, client: true },
          { id: 'f5_sig_chef', type: 'signature', t: 'Signature du chef d’équipe', requis: true }
        ] }
      ]
    }
  };
  function items(code) { var l = []; (DEFS[code] ? DEFS[code].sections : []).forEach(function (s) { s.items.forEach(function (i) { l.push(i); }); }); return l; }
  // Nombre de « Non » (non-conformités) dans des réponses
  function nonConformites(code, rep) { return items(code).filter(function (i) { return (i.type === 'ok' || i.type === 'ouinon') && rep[i.id] && rep[i.id].v === 'non'; }).length; }
  window.FormulairesFinition = { VERSION: VERSION, DEFS: DEFS, CODES: ['F0', 'F1', 'F2', 'F3', 'F4', 'F5'], items: items, nonConformites: nonConformites };
})();
