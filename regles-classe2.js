/*
 * LFS - Règles du permis spécial de circulation, classe 2 (bâtiments préfabriqués)
 * Source : Règlement sur le permis spécial de circulation (chapitre C-24.2, r. 35), à jour au 1er juin 2026.
 * Fichier partagé par LFS (MyGeotab) et la future page LFS pour Geotab Drive.
 * Toute modification des règles se fait ici seulement.
 */
(function () {
  var VERSION = '1.3.1';

  function nombreFr(n, dec) {
    return n.toLocaleString('fr-CA', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }

  function distanceM(a, b) {
    var r = 6371000, rad = Math.PI / 180;
    var dLat = (b[0] - a[0]) * rad, dLon = (b[1] - a[1]) * rad;
    var x = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * r * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }

  function cumulKm(latlngs) {
    var c = [0];
    for (var i = 1; i < latlngs.length; i++) { c.push(c[i - 1] + distanceM(latlngs[i - 1], latlngs[i]) / 1000); }
    return c;
  }

  // ===== Conformité permis spécial classe 2 (Règlement sur le permis spécial de circulation, C-24.2, r. 35) =====
  // Art. 12 : chaussées et heures de pointe (lundi au vendredi; ne s'applique pas le samedi).
  var POINTE = {
    montreal: { nom: 'région de Montréal', fenetres: [[390, 570], [930, 1140]], texte: '6 h 30 à 9 h 30 et 15 h 30 à 19 h' },
    quebec: { nom: 'région de Québec', fenetres: [[450, 540], [960, 1050]], texte: '7 h 30 à 9 h et 16 h à 17 h 30' }
  };
  var BBOX_MTL = [45.20, -74.30, 45.85, -73.15], BBOX_QUE = [46.65, -71.60, 47.00, -71.15];
  var CHAUSSEES_POINTE = [
    { z: 'montreal', ref: 'A-20', bbox: BBOX_MTL, txt: 'A-20 (sorties 29 à 98)' },
    { z: 'montreal', ref: 'A-40', bbox: BBOX_MTL, txt: 'A-40 (sorties 35 à 89)' },
    { z: 'montreal', ref: 'A-25', bbox: BBOX_MTL, txt: 'A-25' },
    { z: 'montreal', ref: 'A-440', bbox: BBOX_MTL, txt: 'A-440' },
    { z: 'montreal', ref: 'A-520', bbox: BBOX_MTL, txt: 'A-520' },
    { z: 'montreal', ref: 'A-640', bbox: BBOX_MTL, txt: 'A-640' },
    { z: 'montreal', ref: 'A-15', bbox: [45.66, -74.10, 45.84, -73.90], txt: 'A-15 (sorties 29 à 44)' },
    { z: 'montreal', ref: 'A-13', bbox: BBOX_MTL, txt: 'A-13' },
    { z: 'montreal', ref: 'R-132', bbox: [45.42, -73.56, 45.63, -73.40], txt: 'route 132 (A-15 à Boucherville)' },
    { z: 'montreal', ref: 'R-138', bbox: [45.40, -73.71, 45.47, -73.62], txt: 'route 138 (pont Honoré-Mercier à l’A-20)' },
    { z: 'montreal', nom: /champlain/i, bbox: BBOX_MTL, txt: 'pont Champlain et ses accès' },
    { z: 'montreal', nom: /honor[ée]-?\s?mercier/i, bbox: BBOX_MTL, txt: 'pont Honoré-Mercier et ses accès' },
    { z: 'montreal', nom: /jacques-?\s?cartier/i, bbox: BBOX_MTL, txt: 'pont Jacques-Cartier et ses accès' },
    { z: 'quebec', nom: /pont de qu[ée]bec/i, bbox: BBOX_QUE, txt: 'pont de Québec et ses accès' },
    { z: 'quebec', nom: /pierre-?\s?laporte/i, bbox: BBOX_QUE, txt: 'pont Pierre-Laporte et ses accès' },
    { z: 'quebec', ref: 'A-40', bbox: [46.78, -71.36, 46.88, -71.19], txt: 'A-40 (A-73 à A-440)' },
    { z: 'quebec', ref: 'A-73', bbox: [46.70, -71.36, 46.92, -71.20], txt: 'A-73 (A-20 à Notre-Dame-des-Laurentides)' },
    { z: 'quebec', ref: 'A-440', bbox: BBOX_QUE, txt: 'A-440 (Saint-Augustin à Québec)' },
    { z: 'quebec', ref: 'A-540', bbox: BBOX_QUE, txt: 'A-540' }
  ];

  function cleJour(d) {
    var z = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate());
  }

  function paques(an) {
    var a = an % 19, b = Math.floor(an / 100), c = an % 100, d = Math.floor(b / 4), e = b % 4;
    var f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
    var i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    var mois = Math.floor((h + l - 7 * m + 114) / 31), jour = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(an, mois - 1, jour);
  }

  function nemeLundi(an, mois, n) {
    var d = new Date(an, mois, 1);
    while (d.getDay() !== 1) { d = new Date(an, mois, d.getDate() + 1); }
    return new Date(an, mois, d.getDate() + 7 * (n - 1));
  }

  var cacheFeries = {};
  function joursFeries(an) {
    if (cacheFeries[an]) { return cacheFeries[an]; }
    var p = paques(an);
    var patriotes = new Date(an, 4, 24);
    while (patriotes.getDay() !== 1) { patriotes = new Date(an, 4, patriotes.getDate() - 1); }
    var liste = {};
    [
      [new Date(an, 0, 1), 'Jour de l’An'],
      [new Date(an, p.getMonth(), p.getDate() - 2), 'Vendredi saint'],
      [new Date(an, p.getMonth(), p.getDate() + 1), 'lundi de Pâques'],
      [patriotes, 'Journée nationale des patriotes'],
      [new Date(an, 5, 24), 'Fête nationale'],
      [new Date(an, 6, 1), 'Fête du Canada'],
      [nemeLundi(an, 8, 1), 'Fête du Travail'],
      [nemeLundi(an, 9, 2), 'Action de grâce'],
      [new Date(an, 11, 25), 'Noël'],
      [new Date(an, 11, 26), 'lendemain de Noël']
    ].forEach(function (x) { liste[cleJour(x[0])] = x[1]; });
    cacheFeries[an] = liste;
    return liste;
  }

  function nomFerie(d) { return joursFeries(d.getFullYear())[cleJour(d)] || ''; }

  function altitudeSoleil(date, lat, lon) {
    var rad = Math.PI / 180;
    var d = date.getTime() / 86400000 + 2440587.5 - 2451545.0;
    var g = ((357.529 + 0.98560028 * d) % 360 + 360) % 360;
    var q = ((280.459 + 0.98564736 * d) % 360 + 360) % 360;
    var L = q + 1.915 * Math.sin(g * rad) + 0.020 * Math.sin(2 * g * rad);
    var e = 23.439 - 0.00000036 * d;
    var ra = Math.atan2(Math.cos(e * rad) * Math.sin(L * rad), Math.cos(L * rad)) / rad;
    var dec = Math.asin(Math.sin(e * rad) * Math.sin(L * rad)) / rad;
    var gmst = ((18.697374558 + 24.06570982441908 * d) % 24 + 24) % 24;
    var ha = (gmst * 15 + lon - ra) * rad;
    return Math.asin(Math.sin(lat * rad) * Math.sin(dec * rad) + Math.cos(lat * rad) * Math.cos(dec * rad) * Math.cos(ha)) / rad;
  }

  function estNuit(date, lat, lon) { return altitudeSoleil(date, lat, lon) < -0.833; }

  function dansBbox(p, b) { return p[0] >= b[0] && p[0] <= b[2] && p[1] >= b[1] && p[1] <= b[3]; }

  function refDeNom(nom) {
    var m = String(nom || '').match(/^(A|R)-(\d{1,3})\b/);
    return m ? m[1] + '-' + m[2] : '';
  }

  function m2(v) { return nombreFr(v, 2) + ' m'; }
  function heureFr(d) { return d.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }); }
  function dateFr(d) { return d.toLocaleDateString('fr-CA', { weekday: 'long', day: 'numeric', month: 'long' }); }

  function analyserClasse2(latlngs, routes, totalKm, dureeS, dims, depart) {
    depart = depart || new Date();
    var L = [];
    var b = dims.base;
    var longDep = !!(dims.longueur && dims.longueur > 30);

    // 1. Catégorie de permis (art. 2, par. 2)
    var specif = [], hors = [];
    function limite(val, gen, spec, nom) {
      if (!val) { return; }
      if (val > spec) { hors.push(nom + ' ' + m2(val) + ' (max. ' + m2(spec) + ')'); }
      else if (val > gen) { specif.push(nom + ' ' + m2(val) + ' (> ' + m2(gen) + ')'); }
    }
    limite(dims.baseSaisie ? dims.base : null, 4.30, 5.00, 'largeur au corps du bâtiment');
    if (dims.batiment === 'section') { limite(dims.toit, 5.05, 5.75, 'largeur à la toiture (en section)'); }
    else { limite(dims.toit, 4.60, 5.30, 'largeur à la toiture (bâtiment entier)'); }
    limite(dims.hauteur, 4.30, 5.00, 'hauteur');
    if (longDep) { hors.push('longueur hors tout ' + m2(dims.longueur) + ' (max. 30 m)'); }
    if (dims.ar > 5) { hors.push('excédent arrière ' + m2(dims.ar) + ' (max. 5 m)'); }
    if (hors.length) { L.push({ t: 'Hors des limites de la classe 2 : ' + hors.join(', ') + '.', c: '#8a1c1c', g: 1 }); }
    else if (specif.length) { L.push({ t: 'Permis SPÉCIFIQUE requis : ' + specif.join(', ') + '.', c: '#9a3412', g: 1 }); }
    else { L.push({ t: 'Dimensions dans les limites du permis général.', c: '#14532d', g: 1 }); }
    if (dims.batiment === 'section' && dims.toit > 4.60) { L.push({ t: 'En section : l’excédent de 45 cm doit être du côté de l’accotement droit à au moins 2,10 m du sol, et celui de 30 cm à gauche à au moins 3,65 m du sol.', c: '#5a6270' }); }
    if (dims.corpsDeduit) { L.push({ t: 'La largeur maximale saisie est utilisée comme largeur au corps du bâtiment pour les escortes et les interdictions (règle la plus sévère).', c: '#5a6270' }); }
    else if (!dims.baseSaisie) { L.push({ t: 'Largeur au corps du bâtiment non saisie : la largeur à la toiture est utilisée pour les escortes et les interdictions (plus sévère).', c: '#9a3412' }); }
    if (!dims.longueur) { L.push({ t: 'Longueur hors tout non saisie : la limite de 30 m n’est pas vérifiée.', c: '#9a3412' }); }

    // 2. Signalisation (art. 7)
    var sig = ['phares allumés et feu jaune 360°'];
    if (b > 3.04 || dims.hauteur > 4.30 || (dims.longueur && dims.longueur > 25)) { sig.push('panneaux D avant et arrière'); }
    if (dims.lat > 0.3) { sig.push('drapeaux (jour) ou feux jaunes clignotants (obligatoires la nuit) aux saillies latérales'); }
    if (dims.ar > 1) { sig.push('drapeau ou panneau réfléchissant le jour et feu rouge la nuit à l’excédent arrière'); }
    L.push({ t: 'Signalisation : ' + sig.join('; ') + '.', c: '#1f2937', g: 1 });

    // 3. Escortes (art. 8 et 10)
    var arMulti = b > 3.75 || longDep || dims.ar > 4;
    var avTout = dims.hauteur > 4.5 || dims.av > 2;
    var avUneJour = b > 3.75 || avTout;
    var avUneNuit = b > 3.10 || avTout;
    var arUne = longDep || dims.ar > 4 || b > 4.40;
    function txt(av, ar) { return av && ar ? 'avant et arrière' : (av ? 'avant' : (ar ? 'arrière' : 'aucune')); }
    var auto = 'Escortes sur autoroute à chaussées séparées : ' + txt(avTout, arMulti);
    if (avTout || arMulti) { auto += ' (art. 10 : non requise si le bâtiment porte 4 feux jaunes clignotants de 17,5 cm, à au moins 2 m du sol, aux coins avant et arrière)'; }
    L.push({ t: auto + '.', c: '#1f2937', g: 1 });
    var une = 'Escortes sur les routes à une voie par sens : ' + txt(avUneJour, arUne) + ' le jour';
    if (avUneNuit !== avUneJour) { une += ', ' + txt(avUneNuit, arUne) + ' la nuit'; }
    L.push({ t: une + '.', c: '#1f2937', g: 1 });

    // 4. Analyse horaire le long du trajet (art. 11 et 12)
    var cumul = cumulKm(latlngs), total = cumul[cumul.length - 1] || 1;
    var plages = [], km = 0, sommeR = 0, prec = { auto: false, nom: '' };
    routes.forEach(function (r) { sommeR += r.km; });
    routes.forEach(function (r) {
      var info = r.bretelle ? prec : { auto: /^A-\d/.test(r.nom) || /^Hwy /.test(r.nom), nom: r.nom };
      plages.push({ fin: (km + r.km) / (sommeR || 1), auto: info.auto, nom: info.nom });
      km += r.km; prec = info;
    });
    function plageA(f) { for (var i = 0; i < plages.length; i++) { if (f <= plages[i].fin) { return plages[i]; } } return plages[plages.length - 1] || { auto: false, nom: '' }; }
    function positionA(f) {
      var cible = f * total, i = 0;
      while (i < cumul.length - 1 && cumul[i + 1] < cible) { i++; }
      return latlngs[Math.min(i, latlngs.length - 1)];
    }
    var pointeVise = b > 3.75 || longDep || dims.ar > 4;
    var n = Math.max(12, Math.min(400, Math.ceil(dureeS / 90)));
    var dimanche = null, nuitLarg = null, nuitAr = null, nuitAvant = null, pointe = {};
    for (var k = 0; k <= n; k++) {
      var f = k / n, t = new Date(depart.getTime() + dureeS * 1000 * f), p = positionA(f), pl = plageA(f);
      var ferie = nomFerie(t);
      if (!dimanche && (t.getDay() === 0 || ferie)) { dimanche = { t: t, nom: ferie || 'dimanche' }; }
      if (estNuit(t, p[0], p[1])) {
        if (dims.ar > 4 && !nuitAr) { nuitAr = t; }
        if (b > 3.75 && !nuitLarg) {
          var resteKm = totalKm * (1 - f);
          var exemptee = b <= 4.40 && (pl.auto || (resteKm <= 8 && /^R-1\d\d\b/.test(pl.nom)));
          if (!exemptee) { nuitLarg = { t: t, nom: pl.nom }; }
        }
        if (!pl.auto && !nuitAvant) { nuitAvant = t; }
      }
      if (pointeVise && t.getDay() >= 1 && t.getDay() <= 5 && !ferie) {
        var minutes = t.getHours() * 60 + t.getMinutes(), ref = refDeNom(pl.nom);
        CHAUSSEES_POINTE.forEach(function (c) {
          if (pointe[c.txt]) { return; }
          var touche = c.ref ? ref === c.ref : c.nom.test(pl.nom);
          if (!touche || !dansBbox(p, c.bbox)) { return; }
          POINTE[c.z].fenetres.forEach(function (w) { if (minutes >= w[0] && minutes < w[1]) { pointe[c.txt] = { t: t, z: c.z }; } });
        });
      }
    }
    var arrivee = new Date(depart.getTime() + dureeS * 1000);
    L.push({ t: 'Départ ' + dateFr(depart) + ' à ' + heureFr(depart) + ', arrivée estimée à ' + heureFr(arrivee) + (cleJour(arrivee) !== cleJour(depart) ? ' le ' + dateFr(arrivee) : '') + '.', c: '#5a6270' });
    if (dimanche) { L.push({ t: 'INTERDIT : circulation le ' + dimanche.nom + ' (' + dateFr(dimanche.t) + ', vers ' + heureFr(dimanche.t) + '). Change la date de départ.', c: '#8a1c1c', g: 1 }); }
    if (nuitLarg) { L.push({ t: 'INTERDIT : circulation de nuit vers ' + heureFr(nuitLarg.t) + (nuitLarg.nom ? ' sur ' + nuitLarg.nom : '') + ' (largeur au corps > 3,75 m; permis seulement sur autoroute à chaussées séparées jusqu’à 4,40 m, ou sur les 8 derniers km d’une route 100 à 199).', c: '#8a1c1c', g: 1 }); }
    if (nuitAr) { L.push({ t: 'INTERDIT : circulation de nuit vers ' + heureFr(nuitAr) + ' (excédent arrière > 4 m).', c: '#8a1c1c', g: 1 }); }
    if (nuitAvant && avUneNuit && !avUneJour) { L.push({ t: 'Escorte avant requise : passage de nuit sur une route à une voie vers ' + heureFr(nuitAvant) + ' (largeur au corps > 3,10 m).', c: '#9a3412', g: 1 }); }
    Object.keys(pointe).forEach(function (cle) {
      var x = pointe[cle];
      L.push({ t: 'INTERDIT : ' + cle + ' aux heures de pointe de la ' + POINTE[x.z].nom + ' (' + POINTE[x.z].texte + ', lundi au vendredi), passage estimé vers ' + heureFr(x.t) + '. Change l’heure de départ.', c: '#8a1c1c', g: 1 });
    });
    if (!dimanche && !nuitLarg && !nuitAr && !Object.keys(pointe).length) { L.push({ t: 'Aucune interdiction de jour, de nuit ou d’heures de pointe détectée pour ce départ.', c: '#14532d', g: 1 }); }
    L.push({ t: 'Toujours interdit : visibilité de moins de 1 km ou chaussée non dégagée de neige ou de glace (art. 11). Autoroutes présumées à chaussées séparées et autres routes à une voie par sens; tronçons de pointe repérés approximativement (numéros de sortie non vérifiés); heures estimées selon une vitesse moyenne. Les conditions inscrites au permis ont préséance.', c: '#8a8f98' });
    return L;
  }


  window.LFSClasse2 = {
    version: VERSION,
    analyser: analyserClasse2,
    estNuit: estNuit,
    nomFerie: nomFerie
  };
})();
