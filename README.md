# ADLToiture

Application web de gestion pour un couvreur professionnel, développée dans le cadre du Travail de Fin d'Études IFAPME Développeur Web Front-End (X75) — Année 2025-2026.

## Description

ADL Toiture est une entreprise artisanale de couverture basée en Brabant wallon (Belgique). Ce projet est une application web SPA permettant de :
- Présenter les services de l'entreprise au public
- Recevoir des demandes de rendez-vous en ligne
- Gérer les rendez-vous, clients et devis via un espace admin privé

> Projet fictif fonctionnel basé sur une entreprise réelle, développé en anticipation de sa reprise d'activité.

## Avancement

| Étape | Statut |
|-------|--------|
| Cahier des charges | ✅ Terminé |
| Maquettes Desktop 1440px — 10 pages | ✅ Terminé |
| Maquettes iPad paysage 1024px — 10 pages | ✅ Terminé |
| Maquettes Mobile 390px — 15 frames | ✅ Terminé |
| Prototypage Figma (navigation) | ✅ Terminé |
| Développement back-end PHP + MySQL | ⏳ À venir |
| Développement front-end React | 🔄 En cours |
| Tests & déploiement | ⏳ À venir |

## Maquettes Figma
[Voir les maquettes sur Figma](https://www.figma.com/design/6qH3UsrKONycCrwY0e8kcF)

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Front-end | React.js + Vite + CSS custom properties |
| Back-end | PHP (API REST) |
| Base de données | MySQL |
| Carte | Leaflet.js + OpenStreetMap |
| Auth | JWT |

## Prérequis

- Node.js v18+
- PHP 8+
- MySQL 8+
- WAMP (en local)

## Installation

```bash
# Cloner le repo
git clone https://github.com/MyriamMi/ADLToiture.git
cd ADLToiture

# Installer les dépendances front-end
cd ADLToiture
npm install
npm run dev

# Configurer le back-end
cd ../server
cp config.example.php config.php
# Remplir les infos de connexion MySQL dans config.php

# Importer la base de données
mysql -u root -p < database/adltoiture.sql
```

## Structure du projet

## Auteur

**Myriam Mi** — [@MyriamMi](https://github.com/MyriamMi)  
Formation : IFAPME Développeur Web Front-End — Section X75  
Formateur : Mohamad Haji | Année 2025-2026
