# ADLToiture

Application web de gestion pour un artisan couvreur, développée dans le cadre du Travail de Fin d'Études IFAPME Développeur Web Front-End (X75) — Année 2025-2026.

## Description

ADL Toiture est une entreprise artisanale de couverture basée en Brabant wallon (Belgique). Ce projet est une application web SPA composée de deux parties :

- **Site public** : vitrine de l'entreprise, formulaire de demande de devis, avis clients, FAQ et carte interactive
- **Espace admin** : gestion complète des demandes, rendez-vous, clients, devis, avis et statistiques

Projet fonctionnel basé sur une vraie entreprise, développé en anticipation de sa reprise d'activité.

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Front-end | React.js + Vite + CSS personnalisé mobile-first |
| Back-end | PHP OOP (API REST — 38 endpoints) |
| Base de données | MySQL (9 tables) |
| Authentification | JWT (JSON Web Token) |
| Carte | Leaflet.js + OpenStreetMap |
| Graphiques | Recharts |
| PDF | jsPDF |

## Fonctionnalités

- Formulaire de demande de devis avec consentement RGPD
- Espace admin sécurisé par JWT
- Gestion des demandes, RDV, clients, devis avec statuts
- Export iCal (.ics) compatible Google Calendar / Outlook
- Génération PDF des devis
- Anonymisation RGPD des clients (soft delete)
- Statistiques graphiques (Recharts)
- FAQ dynamique connectée à l'API

## Démo en ligne

[adltoiture.alwaysdata.net](https://adltoiture.alwaysdata.net)

## Installation

```bash
# Cloner le repo
git clone https://github.com/MyriamMI/ADLToiture.git
cd ADLToiture

# Installer les dépendances front-end
npm install
npm run dev

# Configurer le back-end
# Copier php/.env.example en php/.env et remplir les infos de connexion

# Importer la base de données
mysql -u root -p < php/database/adltoiture.sql
```

## Prérequis

- Node.js v18+
- PHP 8+
- MySQL 8+
- WAMP (en local)

## Maquettes Figma

[Voir les maquettes sur Figma](#)

## Auteur

Myriam Micollier — [@MyriamMI](https://github.com/MyriamMI)  
Formation : IFAPME Développeur Web Front-End — Section X75  
Formateur : Mohamad Haji | Année 2025-2026
