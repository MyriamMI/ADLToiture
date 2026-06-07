# ADLToiture

Application web de gestion pour un couvreur professionnel, développée dans le cadre du Travail de Fin d'Études IFAPME Développeur Web Front-End (X75) — Année 2025-2026.

## Description

ADL Toiture est une entreprise artisanale de couverture basée en Brabant wallon (Belgique). Ce projet est une application web SPA permettant de :

- Présenter les services de l'entreprise au public
- Recevoir des demandes de rendez-vous en ligne
- Gérer les rendez-vous, clients, devis et avis via un espace admin privé sécurisé

> Projet fictif fonctionnel basé sur une entreprise réelle, développé en anticipation de sa reprise d'activité.

## Avancement

| Étape | Statut |
|-------|--------|
| Cahier des charges | ✅ Terminé |
| Maquettes Desktop 1440px — 10 pages | ✅ Terminé |
| Maquettes iPad paysage 1024px — 10 pages | ✅ Terminé |
| Maquettes Mobile 390px — 15 frames | ✅ Terminé |
| Prototypage Figma (navigation) | ✅ Terminé |
| Développement back-end PHP OOP + MySQL | ✅ Terminé |
| Développement front-end React | ✅ Terminé |
| Déploiement Alwaysdata | ✅ Terminé |

## Maquettes Figma

[Voir les maquettes sur Figma](https://www.figma.com/design/6qH3UsrKONycCrwY0e8kcF)

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Front-end | React.js 18 + Vite + CSS custom properties |
| Back-end | PHP 8 OOP — API REST (38 endpoints, 10 controllers) |
| Base de données | MySQL — 9 tables |
| Authentification | JWT (JSON Web Token) |
| Carte | Leaflet.js + OpenStreetMap |
| Graphiques | Recharts |
| Génération PDF | jsPDF |
| Export calendrier | iCal (avec JWT sécurisé) |
| Hébergement | Alwaysdata (PHP + MySQL + build React) |

## Fonctionnalités principales

### Site public
- Présentation des services avec tarifs
- Formulaire de demande de rendez-vous
- Carte interactive OpenStreetMap
- Avis clients validés
- FAQ accordion connectée à l'API

### Espace admin (protégé par JWT)
- Tableau de bord avec KPIs et statistiques réelles
- Gestion des rendez-vous (CRUD + dropdowns dynamiques clients/services)
- Gestion des clients (CRUD + anonymisation RGPD)
- Gestion des devis (workflow complet : en attente → accepté/refusé + génération PDF)
- Gestion des avis clients (modération + soft delete avec restauration)
- Gestion de la FAQ
- Statistiques avec graphiques Recharts
- Export iCal des rendez-vous

## Sécurité

- Authentification JWT (token vérifié à chaque requête via `GET /auth/check`)
- Mots de passe hashés avec `password_hash()` PHP
- Requêtes SQL préparées (protection injection SQL)
- CORS strict (whitelist exacte)
- Variables sensibles en `.env` protégées par `.htaccess`
- Erreurs PDO supprimées en production

## RGPD

- Données minimales collectées (nom, téléphone, email, adresse)
- Anonymisation client : mise à NULL des données personnelles + désactivation du compte
- Hébergement Alwaysdata en France (données UE)
- Mentions légales sur le site public

## Structure du projet

```
ADLToiture/
├── public/                  # Build React (déployé sur Alwaysdata)
├── src/
│   ├── assets/              # Images, icônes
│   ├── components/          # Composants réutilisables
│   ├── pages/
│   │   ├── public/          # Accueil, Services, À propos, Contact
│   │   └── admin/           # Dashboard, RDV, Clients, Devis, Avis, Stats, FAQ
│   ├── services/
│   │   └── api.js           # apiFetch centralisé (JWT dans headers)
│   └── main.jsx
├── server/                  # API PHP OOP
│   ├── controllers/         # 10 controllers (AuthController, RdvController…)
│   ├── models/              # Classes PHP OOP
│   ├── config/              # Connexion PDO, variables .env
│   └── index.php            # Routeur principal
├── database/
│   └── adltoiture.sql       # Schéma MySQL (9 tables)
├── .env                     # Variables sensibles (non versionné)
└── vite.config.js
```

## Prérequis

- Node.js v18+
- PHP 8+
- MySQL 8+
- WAMP (en local)

## Installation locale

```bash
# Cloner le repo
git clone https://github.com/MyriamMi/ADLToiture.git
cd ADLToiture

# Installer les dépendances front-end
npm install
npm run dev

# Configurer le back-end
cd server
cp config.example.php config.php
# Remplir les infos de connexion MySQL dans config.php

# Importer la base de données
mysql -u root -p < database/adltoiture.sql
```

## Déploiement

Le front-end est buildé avec `npm run build` et déposé via FTP (FileZilla) sur Alwaysdata.  
Le back-end PHP est déposé via FTP dans le répertoire `www/`.  
La base de données MySQL est gérée depuis le panel Alwaysdata.

## Auteur

**Myriam Mi** — [@MyriamMi](https://github.com/MyriamMi)  
Formation : IFAPME Développeur Web Front-End — Section X75  
Formateur : Mohamad Haji | Année 2025-2026  
Assistance IA : Claude (Anthropic) — utilisé comme outil d'aide au développement et à la documentation
