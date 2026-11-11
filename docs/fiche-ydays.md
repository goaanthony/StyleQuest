# FICHE PROJET : StyleQuest — Saison 2

---

## Nom du projet

**StyleQuest**

---

## Pitch

*StyleQuest* transforme l'apprentissage du CSS en jeu vidéo : lis une courte leçon, code directement dans l'app et vois le résultat en temps réel. Chaque exercice réussi rapporte de l'XP, alimente ta série quotidienne et te fait monter de niveau. Testé par de vrais élèves — ça marche.

---

## Description détaillée du projet

StyleQuest est une application desktop gamifiée d'apprentissage du code. Le principe est simple : au lieu de lire un cours passif, l'élève progresse à travers des **quêtes** — une leçon courte suivie d'exercices pratiques où il écrit du vrai code et voit le résultat s'afficher en direct, face à l'objectif à atteindre. Chaque réussite est récompensée : XP, montée de niveau, série quotidienne, étoiles selon la performance.

### Ce qu'a construit la V1 (an dernier)

La première équipe a livré une application **complète et fonctionnelle** :

- Un parcours CSS structuré en chapitres, leçons et exercices interactifs
- Un éditeur de code en temps réel avec validation intelligente
- Un système de comptes avec progression sauvegardée en base de données
- De la gamification : XP, niveaux, série quotidienne 🔥, étoiles selon le nombre d'indices utilisés
- Une carte de progression visuelle inspirée de Duolingo
- Une application desktop installable sur Windows, macOS et Linux

### Ce que la Saison 2 apporte

La nouvelle équipe a pour mission de **reprendre, améliorer et faire évoluer** ce projet existant. C'est un exercice de transmission concret : lire du code qu'on n'a pas écrit, comprendre une architecture, puis la faire grandir.

Les grands axes de cette année :

- 🌐 **Multi-langage** — intégration d'un second parcours pédagogique pour élargir l'offre au-delà du CSS
- 👩‍🏫 **Dashboard enseignant** — un espace dédié permettant à un professeur de suivre la progression de toute une classe en temps réel
- ✨ **Amélioration de l'expérience** — refonte et polish de l'UI/UX, nouvelles animations, meilleure fluidité globale
- 📦 **Distribution propre** — packaging soigné de l'application pour les trois plateformes (Windows, macOS, Linux)

---

## Objectifs & Livrables

### MVP — mi-parcours
- Prise en main complète de la V1 (code, architecture, base de données)
- Premières améliorations UI/UX visibles et fonctionnelles
- Intégration d'un second langage avec ses propres leçons et exercices interactifs

### Version finale — fin d'année
- Parcours multi-langage complet (CSS + au moins un autre langage)
- Dashboard enseignant opérationnel (suivi de progression par classe)
- Application packagée et distribuable sur Windows, macOS et Linux
- Expérience utilisateur nettement enrichie par rapport à la V1

---

## Équipe

| Nom | Filière |
|---|---|
| Goasdoue Anthony *(porteur)* | Dev |
| Thimote Guinard | Dev |
| Armengaud Lenny | Dev |
| Gabrielle Yana | Dev |
| Hugo Aguer | Dev |
| Krommer William | Dev |
| Cochet Gabriel | Dev |
| Champilou Nathan | Dev |
| Rodney Nguema Bekui | Infra |
| Asmaou Alade | Infra |
| Ouiya Emelie | Infra |
| Moulot Samuel | Infra |
| DIATHA Christ | Infra |
| Lysa MBADINGA | Infra |
| Geay Raphaël | Infra |
| Martinez Tchoffo | Infra |

---

## Les 11 séances de travail

#### Séance 1 — Découverte & Cadrage
**Objectif :** L'équipe prend connaissance du projet, de son historique et de sa vision pour la Saison 2.
**Activités :**
- Présentation de la V1 et démo de l'application existante
- Exploration du code et de l'architecture par les devs, exploration de l'infrastructure par les infras
- Définition des rôles au sein de la nouvelle équipe
- Mise en place des outils collaboratifs (GitHub, gestionnaire de tâches, Discord)

---

#### Séance 2 — Audit & Planification
**Objectif :** Identifier précisément ce qui fonctionne, ce qui peut être amélioré, et décider des priorités de l'année.
**Activités :**
- Audit de la V1 : points forts, bugs connus, dette technique
- Recueil des retours des utilisateurs de la V1 (élèves ayant testé l'an dernier)
- Définition du backlog : liste des fonctionnalités à développer cette année
- Répartition des grands chantiers entre les équipes dev et infra

---

#### Séance 3 — Setup & Premiers Chantiers
**Objectif :** Tout le monde est opérationnel et les premiers développements commencent.
**Activités :**
- Installation et configuration de l'environnement de développement pour toute l'équipe
- Correction des premiers bugs identifiés lors de l'audit
- Début du refactoring des parties de code à améliorer
- Les infras préparent les environnements de test et de déploiement

---

#### Séance 4 — Amélioration de l'Expérience V1
**Objectif :** Rendre l'application existante meilleure avant d'ajouter de nouvelles fonctionnalités.
**Activités :**
- Refonte visuelle de certains écrans (animations, cohérence graphique)
- Amélioration de la fluidité de la boucle de jeu (leçon → exercice → récompense)
- Correction des bugs remontés par les utilisateurs
- Tests d'utilisabilité internes

---

#### Séance 5 — Conception du Second Langage
**Objectif :** Concevoir et structurer le nouveau parcours pédagogique (HTML ou JavaScript).
**Activités :**
- Choix du second langage et justification pédagogique
- Définition de la structure des chapitres, notions et exercices du nouveau parcours
- Rédaction des premières leçons et exercices
- Réflexion sur l'adaptation du validateur de code au nouveau langage

---

#### Séance 6 — Intégration du Second Langage
**Objectif :** Le nouveau parcours est jouable dans l'application.
**Activités :**
- Développement du validateur de code spécifique au nouveau langage
- Intégration des leçons et exercices dans l'app
- Adaptation de la carte de progression pour afficher plusieurs parcours
- Premiers tests du nouveau parcours

---

#### Séance 7 — Contenu Pédagogique & QA
**Objectif :** Enrichir les deux parcours et corriger ce qui ne va pas.
**Activités :**
- Rédaction de nouveaux exercices pour le CSS et le second langage
- Session de tests utilisateurs (élèves) pour identifier les points de friction
- Correction des bugs remontés
- Revue globale de la qualité du contenu pédagogique

---

#### Séance 8 — Dashboard Enseignant — Conception
**Objectif :** Définir et commencer à construire l'espace de suivi pour les enseignants.
**Activités :**
- Maquettage du dashboard : quelles données afficher, comment les présenter
- Développement des vues enseignant (liste des élèves, progression par module)
- Mise en place des endpoints API nécessaires pour alimenter le dashboard

---

#### Séance 9 — Dashboard Enseignant — Finalisation
**Objectif :** Le dashboard est complet et connecté aux vraies données.
**Activités :**
- Finalisation de toutes les vues du dashboard
- Connexion aux données de progression des élèves en base de données
- Tests du dashboard avec de vraies données
- Gestion des accès (rôle enseignant vs. élève)

---

#### Séance 10 — Finalisation & Packaging
**Objectif :** L'application est stable, complète et prête à être distribuée.
**Activités :**
- Gel du code (plus de nouvelles fonctionnalités)
- Packaging de l'application pour Windows, macOS et Linux
- Rédaction d'un guide d'utilisation
- Préparation des supports de présentation (slides, démo)

---

#### Séance 11 — Présentation Finale
**Objectif :** Valoriser le travail de l'année devant le jury.
**Activités :**
- Rétrospective de l'équipe (ce qu'on a appris, ce qu'on referait différemment)
- Démonstration live de StyleQuest Saison 2 (inscription → leçon → exercice → profil → dashboard)
- Soutenance devant le jury de l'école
