/* Bonneville - Heures & Dépenses : bibliothèque commune (version 1.2.1)
   Utilisée par : heures.html et heures-drive.html (coquilles), tempo.html, tempo-drive.html et employes.html.
   Stockage : AddInData de Geotab, identifiant propre à Heures & Dépenses (séparé de LFS).
   Types enregistrés : employe (accès), heure (une entrée d'heures), depense (une dépense avec reçu).
   Les photos des reçus sont des MediaFile de Geotab. */
(function () {
  'use strict';
  var ADDIN_ID = 'aqKJVB4VwR32I2cfuHWClzw';      // Stockage de Heures & Dépenses
  var LFS_ID = 'aXdeNEZ7tQ7eMPNywYFFKrA';        // Stockage de LFS (lecture seule)
  var TYPES_LFS = ['voyage', 'formresume'];      // Types lus dans LFS, jamais écrits par Heures & Dépenses
  var VERSION = '1.2.1';
  var TELEPHONE = '(438) 978-2162';

  // ---------- Accès à Geotab
  function creerApi(api) {
    function appel(methode, params) {
      return new Promise(function (ok, ko) { api.call(methode, params, ok, ko); });
    }
    function estLFS(type) { return TYPES_LFS.indexOf(type) >= 0; }
    function lireComplet() { return appel('Get', { typeName: 'AddInData', search: { addInId: ADDIN_ID } }); }
    function lireCompletLFS() { return appel('Get', { typeName: 'AddInData', search: { addInId: LFS_ID } }).catch(function () { return []; }); }
    function filtrer(l, types) { return (l || []).filter(function (x) { return types.indexOf((x.details || {}).type) >= 0; }); }
    // Lecture d'un type : les voyages et formulaires viennent de LFS (lecture seule), le reste du stockage de Heures & Dépenses.
    function lireTypeDans(id, type) {
      return appel('Get', { typeName: 'AddInData', search: { addInId: id, whereClause: 'type = "' + type + '"' } })
        .then(function (l) { return filtrer(l, [type]); });
    }
    function lireType(type) {
      if (estLFS(type)) {
        return lireTypeDans(LFS_ID, type).catch(function () { return lireCompletLFS().then(function (l) { return filtrer(l, [type]); }); });
      }
      return lireTypeDans(ADDIN_ID, type);
    }
    // Plusieurs types d'un coup ; si le filtre n'est pas accepté, lecture complète puis tri.
    function lireTypesPropres(types) {
      if (!types.length) { return Promise.resolve([]); }
      return Promise.all(types.map(lireType)).then(function (res) {
        var tout = [].concat.apply([], res);
        return tout.length ? tout : lireComplet().then(function (l) { return filtrer(l, types); });
      }).catch(function () { return lireComplet().then(function (l) { return filtrer(l, types); }); });
    }
    function lireTypes(types) {
      var propres = types.filter(function (t) { return !estLFS(t); }), lfs = types.filter(estLFS);
      return Promise.all([
        lireTypesPropres(propres),
        Promise.all(lfs.map(function (t) { return lireType(t).catch(function () { return []; }); }))
      ]).then(function (r) { return r[0].concat([].concat.apply([], r[1])); });
    }
    // Un champ précis (ex. user = "x") pour un type donné.
    function lireChamp(type, champ, valeur) {
      function garder(l) { return (l || []).filter(function (x) { var d = x.details || {}; return d.type === type && String(d[champ]) === String(valeur); }); }
      var id = estLFS(type) ? LFS_ID : ADDIN_ID;
      return appel('Get', { typeName: 'AddInData', search: { addInId: id, whereClause: champ + ' = "' + valeur + '"' } })
        .then(garder)
        .catch(function () { return lireType(type).then(garder); })
        .catch(function () { return (estLFS(type) ? lireCompletLFS() : lireComplet()).then(garder); });
    }
    function groupes(g) { return g && g.length ? g : [{ id: 'GroupCompanyId' }]; }
    function refuserLFS(details) { return details && estLFS(details.type) ? Promise.reject(new Error('Les ' + details.type + ' appartiennent à LFS : Heures & Dépenses ne les modifie pas.')) : null; }
    function ajouter(details, g) {
      var refus = refuserLFS(details); if (refus) { return refus; }
      return appel('Add', { typeName: 'AddInData', entity: { addInId: ADDIN_ID, groups: groupes(g), details: details } });
    }
    function modifier(id, details, g) {
      var refus = refuserLFS(details); if (refus) { return refus; }
      return appel('Set', { typeName: 'AddInData', entity: { id: id, addInId: ADDIN_ID, groups: groupes(g), details: details } });
    }
    function enregistrer(ligne, details, g) {
      // ligne : { id } ou null. Retourne l'id.
      if (ligne && ligne.id) { return modifier(ligne.id, details, g).then(function () { return ligne.id; }); }
      return ajouter(details, g);
    }
    function retirer(id) { return appel('Remove', { typeName: 'AddInData', entity: { id: id } }); }
    function session() {
      return new Promise(function (ok) {
        try { api.getSession(function (s) { ok(s || {}); }); } catch (e) { ok({}); }
      });
    }
    function utilisateurs() {
      return appel('Get', { typeName: 'User', resultsLimit: 3000 }).then(function (u) {
        return (u || []).map(function (x) {
          return {
            id: x.id, user: x.name,
            nom: ((x.firstName || '') + ' ' + (x.lastName || '')).trim() || x.name,
            securite: (x.securityGroups || []).map(function (g) { return g.id; }),
            actif: !x.activeTo || new Date(x.activeTo) > new Date()
          };
        }).sort(function (a, b) { return a.nom.localeCompare(b.nom, 'fr'); });
      });
    }
    function estAdministrateur(userName) {
      return appel('Get', { typeName: 'User', search: { name: userName } }).then(function (u) {
        var x = u && u[0];
        return !!(x && (x.securityGroups || []).some(function (g) { return g.id === 'GroupEverythingSecurityId'; }));
      });
    }
    return {
      appel: appel, lireType: lireType, lireTypes: lireTypes, lireChamp: lireChamp, lireComplet: lireComplet,
      ajouter: ajouter, modifier: modifier, enregistrer: enregistrer, retirer: retirer,
      session: session, utilisateurs: utilisateurs, estAdministrateur: estAdministrateur
    };
  }

  // ---------- Droits et profils
  var DROITS = [
    { cle: 'heures', nom: 'Heures (saisie dans Geotab Drive)' },
    { cle: 'depenses', nom: 'Dépenses (saisie dans Geotab Drive, avec photo du reçu)' },
    { cle: 'admin', nom: 'Administrateur (accès au bureau)' },
    { cle: 'hos', nom: 'Heures auto (HOS)' }
  ];
  var ROLES = [{ cle: 'employe', nom: 'Employé' }, { cle: 'administrateur', nom: 'Administrateur' }];
  var PROFILS_DEFAUT = [];
  function nomRole(cle) { var r = ROLES.filter(function (x) { return x.cle === cle; })[0]; return r ? r.nom : (cle || ''); }
  // employe : details d'un enregistrement « employe » ; profils : liste de details « profil »
  function droitsEffectifs(employe, profils) {
    if (!employe) { return {}; }
    var base = employe.droits;
    if (!base) { var p = (profils || []).filter(function (x) { return x.pid === employe.profil; })[0]; base = p ? p.droits || {} : {}; }
    return base;
  }
  function roleEffectif(employe, profils) {
    if (!employe) { return ''; }
    var p = (profils || []).filter(function (x) { return x.pid === employe.profil; })[0];
    return p ? p.role : '';
  }

  // ---------- Dates (semaine du dimanche au samedi)
  function z(n) { return (n < 10 ? '0' : '') + n; }
  function jourIso(d) { d = d || new Date(); return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()); }
  function dateDe(iso) { var p = String(iso).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function ajouterJours(iso, n) { var d = dateDe(iso); d.setDate(d.getDate() + n); return jourIso(d); }
  function debutSemaine(iso) { var d = dateDe(iso); d.setDate(d.getDate() - d.getDay()); return jourIso(d); }
  function heureMaintenant() { var d = new Date(); return z(d.getHours()) + ':' + z(d.getMinutes()); }
  function minutesDe(hhmm) { if (!hhmm) { return null; } var p = String(hhmm).split(':'); return (+p[0]) * 60 + (+p[1] || 0); }
  function hhmm(min) { min = Math.max(0, Math.round(min)); return z(Math.floor(min / 60)) + ':' + z(min % 60); }
  function duree(min) { min = Math.max(0, Math.round(min || 0)); var h = Math.floor(min / 60), m = min % 60; return h + ' h ' + z(m); }
  function heureFr(h) { if (!h) { return '—'; } var m = minutesDe(h); return Math.floor(m / 60) + ' h ' + z(m % 60); }
  var JOURS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  var JOURS_COURTS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  var MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  function dateCourte(iso) { var d = dateDe(iso); return JOURS_COURTS[d.getDay()] + ' ' + d.getDate() + ' ' + MOIS[d.getMonth()]; }
  function argent(n) { return (Math.round((n || 0) * 100) / 100).toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' }); }

  // ---------- Taux (liste [{taux, depuis}] : le dernier en vigueur à la date)
  function tauxA(liste, date) {
    var t = null;
    (liste || []).slice().sort(function (a, b) { return String(a.depuis).localeCompare(String(b.depuis)); })
      .forEach(function (x) { if (String(x.depuis) <= date) { t = Number(x.taux); } });
    return t;
  }
  function tauxHoraireA(paie, date) {
    if (!paie) { return null; }
    var ex = (paie.exceptions || []).filter(function (e) { return e.date === date; })[0];
    if (ex) { return Number(ex.taux); }
    if (paie.mode === 'jour') {
      var grille = null;
      (paie.jours || []).slice().sort(function (a, b) { return String(a.depuis).localeCompare(String(b.depuis)); })
        .forEach(function (g) { if (String(g.depuis) <= date) { grille = g; } });
      if (grille) { var v = grille.t[dateDe(date).getDay()]; if (v !== '' && v !== null && v !== undefined) { return Number(v); } }
    }
    return tauxA(paie.unique, date);
  }

  // ---------- Calculs d'une journée
  // journee : { date, debut 'HH:MM', fin, pauses:[{debut, fin}], voyage, segments:[{serie, debut, fin}],
  //             ajouts:[{serie, minutes}], repas:[{type, montant, serie}], km:[{serie, km}], vehicule }
  function chevauchement(a1, a2, b1, b2) { return Math.max(0, Math.min(a2, b2) - Math.max(a1, b1)); }
  function calculer(j, maintenantHHMM) {
    var maint = minutesDe(maintenantHHMM || heureMaintenant());
    var deb = minutesDe(j.debut), fin = j.fin ? minutesDe(j.fin) : maint;
    var res = { total: 0, pauses: 0, parSerie: {}, ajouts: 0, repas: 0, km: 0, kmPerso: 0 };
    if (deb === null) { return res; }
    if (fin < deb) { fin = deb; }
    var pauses = (j.pauses || []).map(function (p) {
      var a = minutesDe(p.debut), b = p.fin ? minutesDe(p.fin) : maint;
      return [Math.max(a, deb), Math.min(b, fin)];
    }).filter(function (p) { return p[1] > p[0]; });
    pauses.forEach(function (p) { res.pauses += p[1] - p[0]; });
    var segs = (j.segments && j.segments.length) ? j.segments : [{ serie: j.voyage || '', debut: j.debut, fin: j.fin }];
    segs.forEach(function (s, i) {
      var a = minutesDe(s.debut), b = s.fin ? minutesDe(s.fin) : (i === segs.length - 1 ? fin : a);
      a = Math.max(a, deb); b = Math.min(b, fin);
      if (b <= a) { return; }
      var m = b - a;
      pauses.forEach(function (p) { m -= chevauchement(a, b, p[0], p[1]); });
      var cle = s.serie || '';
      res.parSerie[cle] = (res.parSerie[cle] || 0) + Math.max(0, m);
    });
    (j.ajouts || []).forEach(function (x) {
      var cle = x.serie || '';
      res.parSerie[cle] = (res.parSerie[cle] || 0) + (Number(x.minutes) || 0);
      res.ajouts += Number(x.minutes) || 0;
    });
    Object.keys(res.parSerie).forEach(function (k) { res.total += res.parSerie[k]; });
    (j.repas || []).forEach(function (r) { res.repas += Number(r.montant) || 0; });
    (j.km || []).forEach(function (k) { res.km += Number(k.km) || 0; });
    res.kmPerso = j.vehicule === 'compagnie' ? 0 : res.km;
    return res;
  }

  var STATUTS = {
    ouverte: { nom: 'En cours', couleur: 'gris' },
    terminee: { nom: 'À soumettre', couleur: 'gris' },
    attente_chef: { nom: 'En attente du chef d’équipe', couleur: 'gris' },
    attente_admin: { nom: 'Approuvé par le chef d’équipe', couleur: 'orange' },
    approuvee: { nom: 'Approbation finale', couleur: 'vert' },
    a_corriger: { nom: 'À corriger', couleur: 'rouge' }
  };
  function modifiable(j) { return !j || ['ouverte', 'terminee', 'a_corriger'].indexOf(j.statut) >= 0; }

  // Chef d'une personne : l'employé chef dont l'équipe contient cette personne.
  function chefDe(user, employes) {
    var chef = (employes || []).filter(function (e) { return (e.equipe || []).indexOf(user) >= 0 && e.user !== user; })[0];
    return chef ? { chef: chef.user, remplacant: chef.remplacant || '' } : null;
  }


  // ===================== Règles de rémunération (employés qui livrent) =====================
  var REGLES_DEFAUT = {
    roles: [
      { cle: 'r1', nom: 'Rôle 1 : Escorte-installateur', avanceMin: 60, taux: { apprenti: 25, maitrise: 28, expert: 30 } },
      { cle: 'r2', nom: 'Rôle 2 : Camionneur-installateur / responsable véhicule', avanceMin: 120, taux: { apprenti: 30, maitrise: 33, expert: 35 } }
    ],
    niveaux: [{ cle: 'apprenti', nom: 'Apprenti' }, { cle: 'maitrise', nom: 'En maîtrise' }, { cle: 'expert', nom: 'Expert' }],
    chefPlus: 5,
    boni: { montant: 150, mode: 'chaque', declencheur: 'L5' },
    specialAutorise: true,
    tempsDemi: { inclus: true, debutJour: 5, debutHeure: '16:00', finJour: 0, finHeure: '23:59' },
    heures: { apresDepartChantier: 30, avantArriveeChantier: 30, dinerNonDeduit: true, minAnnulation: 180, minEloigne: 360 },
    repas: { paliers: [{ min: 0, montant: 0 }, { min: 180, montant: 30 }, { min: 361, montant: 75 }], eloigne: 75 },
    eloigne: { distanceActive: false, distanceKm: 250 },
    zoneChantierM: 300
  };
  // regles : details « reglesPaie » ({ versions: [{ depuis, r }] }) ; renvoie la version en vigueur à la date
  function reglesA(regles, date) {
    var v = null;
    ((regles && regles.versions) || []).slice().sort(function (a, b) { return String(a.depuis).localeCompare(String(b.depuis)); })
      .forEach(function (x) { if (String(x.depuis) <= date) { v = x.r; } });
    return v || ((regles && regles.versions && regles.versions[0]) ? regles.versions[0].r : REGLES_DEFAUT);
  }
  // Rémunération de l'employé à la date : { role, niveau, chef, domicile } (fiche : employe.remun = [{ depuis, ... }])
  function remunA(employe, date) {
    var v = null;
    ((employe && employe.remun) || []).slice().sort(function (a, b) { return String(a.depuis).localeCompare(String(b.depuis)); })
      .forEach(function (x) { if (String(x.depuis) <= date) { v = x; } });
    return v;
  }
  function tauxRegles(r, rem) {
    if (!r || !rem) { return null; }
    var role = (r.roles || []).filter(function (x) { return x.cle === rem.role; })[0];
    if (!role) { return null; }
    var t = Number((role.taux || {})[rem.niveau]);
    if (isNaN(t)) { return null; }
    return t + (rem.chef ? Number(r.chefPlus) || 0 : 0);
  }
  // Type de sortie selon les événements de la journée
  function typeSortie(j) {
    var dep = !!j.departUsine, ret = !!j.retourUsine, arr = !!j.arriveeChantier;
    if (!dep && !arr) { return 'un_jour'; }
    if (j.sortie) { return j.sortie; }
    if (dep && ret) { return 'un_jour'; }
    if (dep && !ret) { return 'jour1'; }
    if (!dep && arr && ret) { return 'dernier'; }
    if (!dep && arr) { return 'jourN'; }
    return 'un_jour';
  }
  // Heures payées d'une journée selon les règles. Renvoie null si l'employé n'a pas de rémunération par règles.
  function calculerPaie(j, employe, regles) {
    var rem = remunA(employe, j.date); if (!rem) { return null; }
    var r = reglesA(regles, j.date), role = (r.roles || []).filter(function (x) { return x.cle === rem.role; })[0] || { avanceMin: 60 };
    var H = r.heures || {}, sortie = typeSortie(j);
    var depUsine = minutesDe(j.departUsine || j.debut), arr = minutesDe(j.arriveeChantier), depCh = minutesDe(j.departChantier), fin = minutesDe(j.retourUsine || j.fin);
    var debut, finP, note = [];
    if (sortie === 'un_jour' || sortie === 'jour1') { debut = depUsine === null ? null : depUsine - (Number(role.avanceMin) || 0); note.push('départ de l’usine − ' + duree(role.avanceMin)); }
    else { debut = arr === null ? minutesDe(j.debut) : arr - (Number(H.avantArriveeChantier) || 0); note.push('arrivée au chantier − ' + duree(H.avantArriveeChantier)); }
    if (sortie === 'un_jour' || sortie === 'dernier') { finP = fin; note.push((rem.domicile ? 'arrivée au domicile' : 'retour à l’usine')); }
    else { finP = depCh === null ? fin : depCh + (Number(H.apresDepartChantier) || 0); note.push('départ du chantier + ' + duree(H.apresDepartChantier)); }
    if (finP === null && !j.retourUsine && !j.fin) { finP = minutesDe(heureMaintenant()); note.push('en cours'); }
    var minutes = (debut === null || finP === null) ? 0 : Math.max(0, finP - debut);
    if (!H.dinerNonDeduit) { (j.pauses || []).forEach(function (p) { if (p.fin) { minutes -= Math.max(0, minutesDe(p.fin) - minutesDe(p.debut)); } }); }
    if (j.dinerDeduit) { minutes -= Number(j.dinerDeduit) || 0; note.push('dîner déduit par le gestionnaire'); }
    var eloigne = !!j.eloigne;
    if (j.annulation) { var mn = eloigne ? Number(H.minEloigne) || 0 : Number(H.minAnnulation) || 0; if (minutes < mn) { minutes = mn; note.push('minimum ' + duree(mn) + (eloigne ? ' (région éloignée)' : ' (annulation)')); } }
    var taux = tauxRegles(r, rem);
    // Temps et demi : seulement si approuvé par le gestionnaire, pour les heures dans la période (ex. vendredi 16 h à dimanche)
    var majorees = 0;
    if (j.tempsDemiApprouve && r.tempsDemi) {
      var jour = dateDe(j.date).getDay(), td = r.tempsDemi, dansJour = function (d) { var a = td.debutJour, b = td.finJour; return a <= b ? (d >= a && d <= b) : (d >= a || d <= b); };
      if (dansJour(jour)) {
        var dDeb = jour === td.debutJour ? minutesDe(td.debutHeure) : 0, dFin = jour === td.finJour ? minutesDe(td.finHeure) : 1440;
        majorees = Math.max(0, Math.min(finP, dFin) - Math.max(debut, dDeb));
      }
    }
    var salaire = taux === null ? null : (minutes / 60 * taux) + (majorees / 60 * taux * 0.5);
    var repas = 0, paliers = ((r.repas || {}).paliers || []).slice().sort(function (a, b) { return a.min - b.min; });
    paliers.forEach(function (p) { if (minutes >= p.min) { repas = Number(p.montant) || 0; } });
    if (eloigne) { repas = Math.max(repas, Number((r.repas || {}).eloigne) || 0); }
    return { sortie: sortie, debut: debut, fin: finP, minutes: minutes, majorees: majorees, taux: taux, salaire: salaire, repas: repas, role: rem.role, niveau: rem.niveau, chef: !!rem.chef, note: note.join(', ') };
  }
  var NOMS_SORTIE = { un_jour: 'Sortie d’un jour', jour1: 'Jour 1', jourN: 'Jour 2 et suivants', dernier: 'Dernier jour' };
  function distanceM(a, b) {
    var R = 6371000, la1 = a.lat * Math.PI / 180, la2 = b.lat * Math.PI / 180, dl = (b.lat - a.lat) * Math.PI / 180, dn = (b.lon - a.lon) * Math.PI / 180;
    var x = Math.sin(dl / 2) * Math.sin(dl / 2) + Math.cos(la1) * Math.cos(la2) * Math.sin(dn / 2) * Math.sin(dn / 2);
    return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }
  function pointDe(p) { if (!p) { return null; } var lat = p.lat !== undefined ? p.lat : p.latitude, lon = p.lon !== undefined ? p.lon : (p.lng !== undefined ? p.lng : p.longitude); return (lat === undefined || lon === undefined) ? null : { lat: Number(lat), lon: Number(lon) }; }

  // ---------- Jours fériés du Québec
  function paques(an) {
    var a = an % 19, b = Math.floor(an / 100), c = an % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
    var h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    var mois = Math.floor((h + l - 7 * m + 114) / 31), jour = ((h + l - 7 * m + 114) % 31) + 1;
    return jourIso(new Date(an, mois - 1, jour));
  }
  function nIemeLundi(an, mois, n) { var d = new Date(an, mois, 1); while (d.getDay() !== 1) { d.setDate(d.getDate() + 1); } d.setDate(d.getDate() + 7 * (n - 1)); return jourIso(d); }
  function feriesQuebec(an) {
    var p = paques(an), patriotes = new Date(an, 4, 24); while (patriotes.getDay() !== 1) { patriotes.setDate(patriotes.getDate() - 1); }
    var l = [
      [an + '-01-01', 'Jour de l’An'], [ajouterJours(p, -2), 'Vendredi saint'], [ajouterJours(p, 1), 'Lundi de Pâques'],
      [jourIso(patriotes), 'Journée nationale des patriotes'], [an + '-06-24', 'Fête nationale'], [an + '-07-01', 'Fête du Canada'],
      [nIemeLundi(an, 8, 1), 'Fête du Travail'], [nIemeLundi(an, 9, 2), 'Action de grâce'], [an + '-12-25', 'Noël']
    ];
    var o = {}; l.forEach(function (x) { o[x[0]] = x[1]; }); return o;
  }


  // ---------- Périodes de paye : 14 jours (Semaine 1 et Semaine 2), à partir du jeudi 22 octobre 2026
  var PERIODE_ANCRE = '2026-10-22';
  function joursEntre(a, b) { return Math.round((dateDe(b) - dateDe(a)) / 86400000); }
  function periodeDe(iso) {
    var n = Math.floor(joursEntre(PERIODE_ANCRE, iso || jourIso()) / 14), d = ajouterJours(PERIODE_ANCRE, n * 14);
    return { n: n, debut: d, fin: ajouterJours(d, 13), s1: { debut: d, fin: ajouterJours(d, 6) }, s2: { debut: ajouterJours(d, 7), fin: ajouterJours(d, 13) } };
  }
  function periodeVoisine(p, k) { return periodeDe(ajouterJours(p.debut, 14 * k)); }
  function semaineDe(p, iso) { return iso < p.s2.debut ? 1 : 2; }
  function dateLongue(iso) { var d = dateDe(iso); return d.getDate() + ' ' + MOIS[d.getMonth()] + ' ' + d.getFullYear(); }
  function libellePeriode(p) {
    var a = dateDe(p.debut), b = dateDe(p.fin);
    return 'du ' + a.getDate() + ' ' + MOIS[a.getMonth()] + (a.getFullYear() !== b.getFullYear() ? ' ' + a.getFullYear() : '') + ' au ' + b.getDate() + ' ' + MOIS[b.getMonth()] + ' ' + b.getFullYear();
  }
  function libelleSemaine(s) { var a = dateDe(s.debut), b = dateDe(s.fin); return a.getDate() + ' ' + MOIS[a.getMonth()] + ' au ' + b.getDate() + ' ' + MOIS[b.getMonth()]; }
  // Durée d'une entrée d'heures (une fin plus tôt que le début veut dire après minuit)
  function minutesEntree(e) {
    // Heures HOS non ajustées : le temps de service réel (les pauses hors service sont déjà retirées)
    if (e && typeof e.minutes === 'number') { return e.minutes; }
    var a = minutesDe(e.debut), b = minutesDe(e.fin);
    if (a === null || b === null) { return 0; }
    return b >= a ? b - a : b + 1440 - a;
  }
  function heuresDecimales(min) { return Math.round((min || 0) / 60 * 100) / 100; }

  // ---------- Heures automatiques à partir des journaux HOS de Geotab (DutyStatusLog)
  // Comptent comme travaillées : Conduite (D), En service (ON) et Déplacement dans la cour (YM).
  // Hors service (OFF), Couchette (SB), Usage personnel (PC) et Attente (WT) arrêtent le compte.
  var HOS_TRAVAIL = { D: 1, ON: 1, YM: 1 }, HOS_ARRET = { OFF: 1, SB: 1, PC: 1, WT: 1 };
  function hhmm(d) { return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
  function isoLocal(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function lireHos(G, userId, debut, fin) {
    var de = dateDe(ajouterJours(debut, -2)), a = dateDe(ajouterJours(fin, 1));
    return G.appel('Get', { typeName: 'DutyStatusLog', search: { userSearch: { id: userId }, fromDate: de.toISOString(), toDate: a.toISOString() }, resultsLimit: 5000 })
      .then(function (l) { return l || []; });
  }
  // Transforme les journaux en une entrée par jour : premier début, dernière fin et temps de service réel
  function joursHos(journaux, debut, fin) {
    var l = journaux.filter(function (x) { return (!x.state || x.state === 'Active') && (HOS_TRAVAIL[x.status] || HOS_ARRET[x.status]); })
      .map(function (x) { return { t: new Date(x.dateTime), travail: !!HOS_TRAVAIL[x.status] }; })
      .sort(function (a, b) { return a.t - b.t; });
    var maintenant = new Date(), finPlage = dateDe(ajouterJours(fin, 1)), jours = {};
    l.forEach(function (x, i) {
      if (!x.travail) { return; }
      var a = x.t, b = i + 1 < l.length ? l[i + 1].t : (maintenant < finPlage ? maintenant : finPlage);
      while (a < b) {
        var minuit = dateDe(ajouterJours(isoLocal(a), 1)), bout = b < minuit ? b : minuit, j = isoLocal(a);
        if (j >= debut && j <= fin) {
          var o = jours[j] || (jours[j] = { min: 0, debut: a, fin: bout });
          o.min += Math.round((bout - a) / 60000);
          if (a < o.debut) { o.debut = a; } if (bout > o.fin) { o.fin = bout; }
        }
        a = bout;
      }
    });
    return jours;
  }
  // Entrées virtuelles (non enregistrées) pour les employés « heures auto », avec leurs ajustements éventuels
  function heuresHos(G, gens, debut, fin, ajustements) {
    return Promise.all(gens.map(function (g) {
      return lireHos(G, g.id, debut, fin).then(function (journaux) {
        var jours = joursHos(journaux, debut, fin), out = [];
        Object.keys(jours).forEach(function (j) {
          var o = jours[j]; if (o.min < 1) { return; }
          var aj = (ajustements || []).filter(function (x) { return x.d.user === g.user && x.d.date === j; })[0];
          var d = { type: 'heure', user: g.user, nom: g.nom, date: j, hos: true, description: 'Heures HOS (Conduite, En service, Cour)' };
          if (aj) { d.debut = aj.d.debut; d.fin = aj.d.fin; d.ajuste = true; d.ajustId = aj.id; d.ajustePar = aj.d.majPar || aj.d.user; d.ajusteLe = aj.d.majLe || ''; d.hosDebut = hhmm(o.debut); d.hosFin = hhmm(o.fin); d.hosMinutes = o.min; d.description = 'Heures HOS ajustées'; }
          else { d.debut = hhmm(o.debut); d.fin = o.fin.getHours() === 0 && o.fin.getMinutes() === 0 && isoLocal(o.fin) !== j ? '00:00' : hhmm(o.fin); d.minutes = o.min; }
          out.push({ id: 'hos:' + g.user + ':' + j, d: d });
        });
        return out;
      }).catch(function () { return []; });
    })).then(function (r) { return [].concat.apply([], r); });
  }

  // ---------- Photos des reçus (MediaFile de Geotab)
  // Dans la page d'aperçu seulement : les photos restent dans le navigateur (jamais en production, où aucune fenêtre parente ne fournit apercuMedia)
  function apercu() {
    var w = window;
    for (var i = 0; i < 5 && w; i++) {
      try { if (w.apercuMedia) { return w.apercuMedia; } } catch (e) { return null; }
      if (w === w.parent) { break; } w = w.parent;
    }
    return null;
  }
  function sessionServeur(api) {
    return new Promise(function (ok, ko) {
      try { api.getSession(function (c, srv) { ok({ cred: { database: c.database, userName: c.userName, sessionId: c.sessionId }, serveur: srv || c.server || 'my.geotab.com' }); }); } catch (e) { ko(e); }
    });
  }
  // Réduit la photo (côté le plus long : 1600 px, JPEG) pour un envoi rapide depuis le cellulaire
  function reduirePhoto(fichier) {
    return new Promise(function (ok, ko) {
      var url = URL.createObjectURL(fichier), im = new Image();
      im.onload = function () {
        var k = Math.min(1, 1600 / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement('canvas');
        c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        c.toBlob(function (b) { if (b) { ok(b); } else { ko(new Error('Photo illisible')); } }, 'image/jpeg', 0.8);
      };
      im.onerror = function () { URL.revokeObjectURL(url); ko(new Error('Photo illisible')); };
      im.src = url;
    });
  }
  function envoyerRecu(api, blob, nom, meta) {
    var ap = apercu(); if (ap) { return ap.envoyer(blob); }
    var maintenant = new Date().toISOString();
    return new Promise(function (ok, ko) {
      api.call('Add', { typeName: 'MediaFile', entity: { name: nom, solutionId: ADDIN_ID, mediaType: 'Image', fromDate: maintenant, toDate: maintenant, metaData: JSON.stringify(meta || {}) } }, ok, ko);
    }).then(function (id) {
      return sessionServeur(api).then(function (ses) {
        var fd = new FormData();
        fd.append('JSON-RPC', JSON.stringify({ method: 'UploadMediaFile', params: { credentials: ses.cred, mediaFile: { id: id } } }));
        fd.append('file', blob, nom);
        return fetch('https://' + ses.serveur + '/apiv1', { method: 'POST', body: fd }).then(function (r) { if (!r.ok) { throw new Error('HTTP ' + r.status); } return r.text(); })
          .then(function (t) { if (/"error"/.test(t)) { throw new Error(t.slice(0, 160)); } return id; });
      });
    });
  }
  function lireRecu(api, id) {
    var ap = apercu(); if (ap) { return ap.lire(id); }
    return sessionServeur(api).then(function (ses) {
      var fd = new FormData();
      fd.append('JSON-RPC', JSON.stringify({ method: 'DownloadMediaFile', params: { credentials: ses.cred, mediaFile: { id: id } } }));
      return fetch('https://' + ses.serveur + '/apiv1', { method: 'POST', body: fd }).then(function (r) {
        if (!r.ok) { throw new Error('HTTP ' + r.status); }
        if (/json/.test(r.headers.get('content-type') || '')) { return r.text().then(function (t) { throw new Error(t.slice(0, 160)); }); }
        return r.blob();
      });
    });
  }
  function retirerRecu(api, id) {
    var ap = apercu(); if (ap) { return Promise.resolve(); }
    return new Promise(function (ok) { api.call('Remove', { typeName: 'MediaFile', entity: { id: id } }, ok, function () { ok(); }); });
  }

  window.Bonneville = {
    ADDIN_ID: ADDIN_ID, LFS_ID: LFS_ID, TYPES_LFS: TYPES_LFS, VERSION: VERSION, TELEPHONE: TELEPHONE,
    creerApi: creerApi,
    DROITS: DROITS, ROLES: ROLES, PROFILS_DEFAUT: PROFILS_DEFAUT, nomRole: nomRole,
    droitsEffectifs: droitsEffectifs, roleEffectif: roleEffectif,
    jourIso: jourIso, dateDe: dateDe, ajouterJours: ajouterJours, debutSemaine: debutSemaine,
    heureMaintenant: heureMaintenant, minutesDe: minutesDe, hhmm: hhmm, duree: duree, heureFr: heureFr,
    JOURS: JOURS, JOURS_COURTS: JOURS_COURTS, MOIS: MOIS, dateCourte: dateCourte, argent: argent,
    tauxA: tauxA, tauxHoraireA: tauxHoraireA, calculer: calculer, STATUTS: STATUTS, modifiable: modifiable, chefDe: chefDe,
    REGLES_DEFAUT: REGLES_DEFAUT, reglesA: reglesA, remunA: remunA, tauxRegles: tauxRegles, calculerPaie: calculerPaie, typeSortie: typeSortie, NOMS_SORTIE: NOMS_SORTIE, distanceM: distanceM, pointDe: pointDe,
    feriesQuebec: feriesQuebec,
    aAcces: function (d) { d = d || {}; return !!(d.heures || d.depenses); },
    PERIODE_ANCRE: PERIODE_ANCRE, periodeDe: periodeDe, periodeVoisine: periodeVoisine, semaineDe: semaineDe, libellePeriode: libellePeriode, libelleSemaine: libelleSemaine, dateLongue: dateLongue,
    minutesEntree: minutesEntree, heuresHos: heuresHos, joursHos: joursHos, heuresDecimales: heuresDecimales, reduirePhoto: reduirePhoto, envoyerRecu: envoyerRecu, lireRecu: lireRecu, retirerRecu: retirerRecu
  };
})();
