const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Mamorona ny dossier 'data' raha mbola tsy misy
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Mampifandray ny base de données
const db = new Database(path.join(dataDir, 'tankflow.db'));

// Mamorona ny tables
db.exec(`
    CREATE TABLE IF NOT EXISTS cuves (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL,
        carburant TEXT NOT NULL,
        capacite REAL NOT NULL,
        stock REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS mouvements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cuve_id INTEGER NOT NULL,
        type TEXT NOT NULL, -- 'entree' na 'sortie'
        quantite REAL NOT NULL,
        date TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(cuve_id) REFERENCES cuves(id)
    );
`);

// Mampiditra données de démonstration (raha mbola tsy misy)
const count = db.prepare('SELECT COUNT(*) as count FROM cuves').get();
if (count.count === 0) {
    const insert = db.prepare('INSERT INTO cuves (nom, carburant, capacite, stock) VALUES (?, ?, ?, ?)');
    insert.run('Cuve A', 'Diesel', 10000, 7500);
    insert.run('Cuve B', 'Essence', 8000, 4000);
    insert.run('Cuve C', 'Kérosène', 5000, 1200);
    console.log('✅ Données de démonstration ajoutées.');
}

console.log('✅ Base de données initialisée avec succès.');