/* Bonneville - bibliothèque commune (version 1.0)
   Utilisée par : Bonneville - Employés (employes.html), Bonneville - Tempo (tempo.html, tempo-drive.html),
   et plus tard Bonneville - Logistique et Bonneville Transport Drive.
   Stockage : AddInData de Geotab, même identifiant que Bonneville - Logistique. */
(function () {
  'use strict';
  var ADDIN_ID = 'aXdeNEZ7tQ7eMPNywYFFKrA';
  var VERSION = '1.3.0';
  var TELEPHONE = '(438) 978-2162';

  // ---------- Accès à Geotab
  function creerApi(api) {
    function appel(methode, params) {
      return new Promise(function (ok, ko) { api.call(methode, params, ok, ko); });
    }
    function lireComplet() { return appel('Get', { typeName: 'AddInData', search: { addInId: ADDIN_ID } }); }
    function filtrer(l, types) { return (l || []).filter(function (x) { return types.indexOf((x.details || {}).type) >= 0; }); }
    function lireType(type) {
      return appel('Get', { typeName: 'AddInData', search: { addInId: ADDIN_ID, whereClause: 'type = "' + type + '"' } })
        .then(function (l) { return filtrer(l, [type]); });
    }
    // Plusieurs types d'un coup ; si le filtre n'est pas accepté, lecture complète puis tri.
    function lireTypes(types) {
      return Promise.all(types.map(lireType)).then(function (res) {
        var tout = [].concat.apply([], res);
        return tout.length ? tout : lireComplet().then(function (l) { return filtrer(l, types); });
      }).catch(function () { return lireComplet().then(function (l) { return filtrer(l, types); }); });
    }
    // Un champ précis (ex. user = "x") pour un type donné.
    function lireChamp(type, champ, valeur) {
      function garder(l) { return (l || []).filter(function (x) { var d = x.details || {}; return d.type === type && String(d[champ]) === String(valeur); }); }
      return appel('Get', { typeName: 'AddInData', search: { addInId: ADDIN_ID, whereClause: champ + ' = "' + valeur + '"' } })
        .then(garder)
        .catch(function () { return lireType(type).then(garder); })
        .catch(function () { return lireComplet().then(garder); });
    }
    function groupes(g) { return g && g.length ? g : [{ id: 'GroupCompanyId' }]; }
    function ajouter(details, g) {
      return appel('Add', { typeName: 'AddInData', entity: { addInId: ADDIN_ID, groups: groupes(g), details: details } });
    }
    function modifier(id, details, g) {
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
    { cle: 'admin', nom: 'Administrateur Heures & Dépenses (accès au bureau, approbation finale des heures)' },
    { cle: 'gps', nom: 'Transport Drive (GPS)' },
    { cle: 'formTransport', nom: 'Formulaires Transport (L1, L2)' },
    { cle: 'formInstallation', nom: 'Formulaires Installation (L3, L3b, L4, L5)' },
    { cle: 'formEvaluation', nom: 'Auto-évaluation (L6)' },
    { cle: 'heures', nom: 'Heures & Dépenses' },
    { cle: 'chef', nom: 'Chef d’équipe (approuve son équipe)' },
    { cle: 'tousVoyages', nom: 'Commissionnaire (voit tous les voyages, répartit ses heures)' },
    { cle: 'finition', nom: 'Finition (entrepreneur : Mon horaire, formulaires F0 à F5)' },
    { cle: 'service', nom: 'Service (technicien : Mon horaire, interventions)' }
  ];
  var ROLES = [
    { cle: 'chauffeur', nom: 'Chauffeur' }, { cle: 'escorte', nom: 'Escorte' }, { cle: 'chef', nom: 'Chef d’équipe' },
    { cle: 'installation', nom: 'Installation' }, { cle: 'commissionnaire', nom: 'Commissionnaire' }, { cle: 'bureau', nom: 'Bureau' }, { cle: 'administrateur', nom: 'Administrateur Heures & Dépenses' }, { cle: 'entrepreneur', nom: 'Entrepreneur (Finition)' }, { cle: 'technicien', nom: 'Technicien (Service)' }
  ];
  var PROFILS_DEFAUT = [
    { pid: 'entrepreneur', nom: 'Entrepreneur (Finition)', role: 'entrepreneur', droits: { finition: true } },
    { pid: 'technicien', nom: 'Technicien (Service)', role: 'technicien', droits: { service: true } },
    { pid: 'administrateur', nom: 'Administrateur Heures & Dépenses', role: 'administrateur', droits: { admin: true, heures: true } },
    { pid: 'chauffeur', nom: 'Chauffeur', role: 'chauffeur', droits: { gps: true, formTransport: true, heures: true } },
    { pid: 'escorte', nom: 'Escorte', role: 'escorte', droits: { gps: true, heures: true } },
    { pid: 'chef', nom: 'Chef d’équipe', role: 'chef', droits: { formInstallation: true, formEvaluation: true, heures: true, chef: true } },
    { pid: 'installation', nom: 'Installation', role: 'installation', droits: { formEvaluation: true, heures: true } },
    { pid: 'commissionnaire', nom: 'Commissionnaire', role: 'commissionnaire', droits: { gps: true, heures: true, tousVoyages: true } },
    { pid: 'bureau', nom: 'Bureau', role: 'bureau', droits: { heures: true } }
  ];
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

  window.Bonneville = {
    ADDIN_ID: ADDIN_ID, VERSION: VERSION, TELEPHONE: TELEPHONE,
    creerApi: creerApi,
    DROITS: DROITS, ROLES: ROLES, PROFILS_DEFAUT: PROFILS_DEFAUT, nomRole: nomRole,
    droitsEffectifs: droitsEffectifs, roleEffectif: roleEffectif,
    jourIso: jourIso, dateDe: dateDe, ajouterJours: ajouterJours, debutSemaine: debutSemaine,
    heureMaintenant: heureMaintenant, minutesDe: minutesDe, hhmm: hhmm, duree: duree, heureFr: heureFr,
    JOURS: JOURS, JOURS_COURTS: JOURS_COURTS, MOIS: MOIS, dateCourte: dateCourte, argent: argent,
    tauxA: tauxA, tauxHoraireA: tauxHoraireA, calculer: calculer, STATUTS: STATUTS, modifiable: modifiable, chefDe: chefDe,
    REGLES_DEFAUT: REGLES_DEFAUT, reglesA: reglesA, remunA: remunA, tauxRegles: tauxRegles, calculerPaie: calculerPaie, typeSortie: typeSortie, NOMS_SORTIE: NOMS_SORTIE, distanceM: distanceM, pointDe: pointDe,
    feriesQuebec: feriesQuebec
  };
})();
