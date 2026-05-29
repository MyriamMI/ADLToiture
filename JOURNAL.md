# Journal de bord – ADLToiture TFE

## Mars 2026

### 10 mars 2026
- Début du projet TFE
- Analyse du besoin client : concertation avec Dylan 
- Définition du périmètre : site vitrine + espace admin
- Choix de la stack : React + Vite, PHP OOP, MySQL, sessions PHP

### 15 mars 2026
- Rédaction du cahier des charges v1
- Définition des fonctionnalités MoSCoW
- Décision : pas de Bootstrap, CSS custom mobile-first

### 25 mars 2026
- CDC finalisé (v4)
- Périmètre validé : 6 pages publiques + 8 pages admin
- Décision : hébergement sur Alwaysdata (France, RGPD)

## Avril 2026

### 10 avril 2026
- Début des maquettes Figma
- Création du design system : couleurs #550101 / #fcf4eb
- Maquettes Desktop 1440px — pages publiques

### 20 avril 2026
- Maquettes iPad 768px et Mobile 390px terminées
- Maquettes admin : Dashboard, Demandes, Clients, Devis

### 23 avril 2026
- Initialisation du dépôt GitHub
- Maquettes Figma Desktop/iPad/Mobile terminées (public + admin + Avis + FAQ)
- Phase en cours : prototypage Figma

Décisions prises aujourd'hui :
- Page Contact : formulaire complet (Nom, Email, Téléphone, Type de service, Message)
- Export agenda : fichier iCal (.ics) généré en PHP, sans API Google
- Envoi emails automatiques : hors périmètre MVP

### 24 avril 2026
- Finalisation et révision des maquettes Figma (ajustements mobile)
- Définition du design system : couleurs #550101 / #fcf4eb, typographie, espacements
- Préparation de la structure des composants React (découpage en pages et sections)

### 25 avril 2026
- Création des pages publiques : Home, ServicesPage, AboutPage, ContactPage
- Création des composants layout public : Header, Navbar, Footer
- Mise en place de AuthContext.jsx et ProtectedRoute.jsx
- Mock login fonctionnel : admin / admin123

Décisions prises aujourd'hui :
- CSS custom uniquement — pas de Bootstrap
- Une page = un fichier JSX + un fichier CSS associé

### 26 avril 2026
- Structure React + Vite initialisée et nettoyée
- Dossiers src/ organisés : components, pages, pages/admin, styles, assets
- Git initialisé, branché sur GitHub MyriamMI/ADLToiture
- Stack confirmée : React + Vite, PHP OOP, MySQL, PHP SESSION, Leaflet, Alwaysdata

### 27 avril 2026
- Création du layout admin : AdminLayout.jsx (sidebar + bottom nav mobile)
- Pages admin développées : LoginPage, DashboardPage, RendezVousPage, ClientsPage
- Pages admin complétées : DevisPage, AvisFaqPage, StatistiquesPage

Décisions prises aujourd'hui :
- Espace admin protégé via ProtectedRoute sur toutes les routes /admin/*

### 28 avril 2026
- AvisFaqPage : modération avis + gestion FAQ
- StatistiquesPage : graphiques KPI avec Recharts
- Refactoring architecture :
  - Suppression des fichiers stubs
  - Création de src/services/api.js (couche réseau centralisée)
  - Fusion de src/layouts/ dans src/components/layout/
  - Réorganisation de tous les CSS dans des sous-dossiers styles/

Décisions prises aujourd'hui :
- src/styles/ ne contient plus que variables.css
- src/services/api.js : point d'entrée unique vers l'API PHP

## Mai 2026

### 5 mai 2026
- Début du développement back-end PHP OOP
- Création de la base de données MySQL (9 tables)
- Mise en place du singleton PDO et du routeur index.php

### 10 mai 2026
- Développement des contrôleurs : Auth, Clients, Demandes, RDV
- Middleware auth.php : vérification de session PHP
- Tests des endpoints via Postman

### 15 mai 2026
- Contrôleurs complétés : Devis, Avis, FAQ, KPI
- Migration AuthContext : remplacement mock par sessions PHP réelles
- Connexion front-end aux vraies données BDD

### 20 mai 2026
- Déploiement sur Alwaysdata
- Migration base de données en production
- Tests fonctionnels en production

### 26 mai 2026
- Tests responsives sur mobile, tablette et desktop
- Corrections CSS et ajustements UI
- Finalisation du dossier TFE
