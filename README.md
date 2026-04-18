# ADLToiture

Application web de gestion pour un couvreur professionnel, développée dans le cadre du Travail de Fin d'Études IFAPME Développeur Web Front-End (X75) — Année 2025-2026.

## Description

ADL Toiture est une entreprise artisanale de couverture basée en Brabant wallon (Belgique). Ce projet est une application web SPA (Single Page Application) permettant de :
- Présenter les services de l'entreprise au public
- Recevoir des demandes de rendez-vous en ligne
- Gérer les rendez-vous, clients et devis via un espace admin privé

> Projet fictif fonctionnel basé sur une entreprise réelle, développé en anticipation de sa reprise d'activité.

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Front-end | React.js + Bootstrap 5.3 |
| Back-end | PHP (API REST) |
| Base de données | MySQL |
| Carte | Leaflet.js + OpenStreetMap |
| Auth | Sessions PHP |

## Prérequis

- Node.js v18+
- PHP 8+
- MySQL 8+
- XAMPP ou Laragon (en local)

## Installation

```bash
# Cloner le repo
git clone https://github.com/MyriamMi/ADLToiture.git
cd ADLToiture

# Installer les dépendances front-end
cd client
npm install
npm start

# Configurer le back-end
cd ../server
cp config.example.php config.php
# Remplir les infos de connexion MySQL dans config.php

# Importer la base de données
mysql -u root -p < database/adltoiture.sql
```

## Structure du projet

## Auteur

