-- Base de données ADLToiture
-- Créée dans le cadre du TFE IFAPME 2025-2026

CREATE DATABASE IF NOT EXISTS adltoiture_db;
USE adltoiture_db;

-- Table admin
CREATE TABLE admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

-- Table demandes
-- Reçoit les demandes du formulaire public
CREATE TABLE demandes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    email VARCHAR(150),
    ville VARCHAR(100) NOT NULL,
    service VARCHAR(100),
    surface DECIMAL(8,2),
    message TEXT,
    date_envoi DATETIME DEFAULT CURRENT_TIMESTAMP,
    statut ENUM('nouvelle','traitee','refusee') DEFAULT 'nouvelle'
);

-- Table clients
-- Créée manuellement par l'admin après acceptation d'une demande
CREATE TABLE clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    email VARCHAR(150),
    adresse VARCHAR(255),
    ville VARCHAR(100) NOT NULL,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    statut ENUM('nouveau','en_cours','termine','annule') DEFAULT 'nouveau'
);

-- Table rdv
-- Créé automatiquement quand l'admin accepte une demande
CREATE TABLE rdv (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    service VARCHAR(100) NOT NULL,
    date_demande DATETIME NOT NULL,
    date_rdv DATE,
    heure_debut TIME,
    heure_fin TIME,
    date_confirmation DATETIME,
    statut ENUM('en_attente','confirme','annule','termine') DEFAULT 'en_attente',
    notes TEXT,
    ical_uid VARCHAR(255) NOT NULL UNIQUE,
    FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- Table devis
CREATE TABLE devis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    service VARCHAR(100) NOT NULL,
    statut ENUM('brouillon','envoye','accepte','refuse') DEFAULT 'brouillon',
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_envoi DATETIME,
    date_reponse DATETIME,
    tva TINYINT DEFAULT 6,
    montant_ht DECIMAL(10,2) DEFAULT 0.00,
    montant_tva DECIMAL(10,2) DEFAULT 0.00,
    montant_ttc DECIMAL(10,2) DEFAULT 0.00,
    notes TEXT,
    FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- Table devis_lignes
-- Chaque ligne du devis (matériaux, main d'oeuvre, etc.)
CREATE TABLE devis_lignes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    devis_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    quantite DECIMAL(8,2) DEFAULT 1,
    unite VARCHAR(20),
    prix_unitaire DECIMAL(10,2) DEFAULT 0.00,
    total DECIMAL(10,2) DEFAULT 0.00,
    FOREIGN KEY (devis_id) REFERENCES devis(id)
);

-- Table lignes_favorites
-- Lignes réutilisables dans le calculateur de devis
CREATE TABLE lignes_favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('materiaux','mo','machine','frais') NOT NULL,
    description VARCHAR(255) NOT NULL,
    unite VARCHAR(20),
    prix_unitaire DECIMAL(10,2) DEFAULT 0.00
);

-- Table avis
CREATE TABLE avis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    note TINYINT NOT NULL,
    commentaire TEXT NOT NULL,
    date DATE NOT NULL,
    statut ENUM('en_attente','valide') DEFAULT 'en_attente',
    deleted_at DATETIME NULL DEFAULT NULL
);

-- Table services
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    UNIQUE KEY nom_unique (nom)
);

INSERT INTO services (nom) VALUES
    ('Rénovation toiture'),
    ('Pose neuve'),
    ('Zinguerie'),
    ('Isolation combles'),
    ('Nettoyage toiture'),
    ('Réparation urgence'),
    ('Inspection toiture'),
    ('Traitement hydrofuge');

-- Table faq
CREATE TABLE faq (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question VARCHAR(255) NOT NULL,
    reponse TEXT NOT NULL,
    categorie ENUM('Services','Devis','Zone','Urgences','Garanties') NOT NULL
);