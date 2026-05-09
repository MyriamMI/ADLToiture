# Journal de bord – ADLToiture TFE

## 23 avril 2026

- Initialisation du dépôt GitHub
- Maquettes Figma Desktop/iPad/Mobile terminées (public + admin + Avis + FAQ)
- Phase en cours : prototypage Figma

### Décisions prises aujourd'hui

- Page Contact : formulaire complet (Nom, Email, Téléphone, Type de service, Message)
- Export agenda : fichier iCal (.ics) généré en PHP, sans API Google
- Envoi emails automatiques : hors périmètre MVP

## 24 avril 2026

- Finalisation et révision des maquettes Figma (ajustements mobile)
- Définition du design system : couleurs #550101 / #fcf4eb, typographie, espacements
- Préparation de la structure des composants React (découpage en pages et sections)

## 25 avril 2026

- Création des pages publiques : Home, ServicesPage, AboutPage, ContactPage, RealisationsPage
- Création des composants layout public : Header, Navbar, Footer
- Mise en place de AuthContext.jsx et ProtectedRoute.jsx
- Mock login fonctionnel : admin / admin123

### Décisions prises aujourd'hui

- CSS custom uniquement — pas de Bootstrap
- Une page = un fichier JSX + un fichier CSS associé

## 26 avril 2026

- Structure React + Vite initialisée et nettoyée
- Dossiers src/ organisés : components, pages, pages/admin, styles, assets
- Git initialisé, branché sur GitHub MyriamMI/ADLToiture
- Stack confirmée : React + Vite, PHP OOP, MySQL, PHP SESSION, Leaflet, Alwaysdata, Cloudinary

## 27 avril 2026

- Création du layout admin : AdminLayout.jsx (sidebar + bottom nav mobile)
- Pages admin développées : LoginPage, DashboardPage, RendezVousPage, ClientsPage
- Pages admin complétées : DevisPage, DevisCalculateurPage (5 étapes + export PDF jsPDF)

### Décisions prises aujourd'hui

- Espace admin protégé via ProtectedRoute sur toutes les routes /admin/\*

## 28 avril 2026

- AvisFaqPage : modération avis + gestion FAQ
- StatistiquesPage : graphiques KPI avec Recharts
- Refactoring architecture :
  - Suppression des fichiers stubs (ancienne version)
  - Création de src/services/api.js (couche réseau centralisée)
  - Fusion de src/layouts/ dans src/components/layout/
  - Réorganisation de tous les CSS dans des sous-dossiers styles/
  - Correction du chemin d'import AuthContext dans AdminLayout

### Décisions prises aujourd'hui

- src/styles/ ne contient plus que variables.css
- src/services/api.js : point d'entrée unique vers l'API PHP
