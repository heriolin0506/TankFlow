const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../data/tankflow.db'));

// --- CUVES ---
function getAllCuves() {
    return db.prepare('SELECT * FROM cuves').all();
}

function addCuve(nom, carburant, capacite, stock) {
    const insert = db.prepare('INSERT INTO cuves (nom, carburant, capacite, stock) VALUES (?, ?, ?, ?)');
    return insert.run(nom, carburant, capacite, stock);
}

// --- MOUVEMENTS ---
function addEntree(cuveId, quantite) {
    db.prepare('UPDATE cuves SET stock = stock + ? WHERE id = ?').run(quantite, cuveId);
    const insertMouvement = db.prepare('INSERT INTO mouvements (cuve_id, type, quantite) VALUES (?, ?, ?)');
    return insertMouvement.run(cuveId, 'entree', quantite);
}

function addSortie(cuveId, quantite) {
    const cuve = db.prepare('SELECT stock FROM cuves WHERE id = ?').get(cuveId);
    if (!cuve) throw new Error("Cuve introuvable");
    if (cuve.stock < quantite) throw new Error("Stock insuffisant ! Ny stock misy dia: " + cuve.stock + " L");

    db.prepare('UPDATE cuves SET stock = stock - ? WHERE id = ?').run(quantite, cuveId);
    const insertMouvement = db.prepare('INSERT INTO mouvements (cuve_id, type, quantite) VALUES (?, ?, ?)');
    return insertMouvement.run(cuveId, 'sortie', quantite);
}

// Ity no maka ny historique (Tena ilaina amin'ny pejy Mouvements)
function getAllMouvements() {
    return db.prepare(`
        SELECT m.id, m.type, m.quantite, m.date, c.nom as cuve_nom, c.carburant
        FROM mouvements m
        JOIN cuves c ON m.cuve_id = c.id
        ORDER BY m.id DESC
    `).all();
}

// --- EXPORTATION ---
module.exports = { 
    getAllCuves, 
    addCuve, 
    addEntree, 
    addSortie,
    getAllMouvements // <-- TENA ZAVA-DEHIBE: Voatarika eto izy io
};