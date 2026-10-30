const Database = require('better-sqlite3');
const path = require('path');

// Sokafy ny base de données
const db = new Database(path.join(__dirname, '../data/tankflow.db'));

// -----------------------------------------
// FONCTIONS HO AN'NY CUVES
// -----------------------------------------

// Maka ny cuves rehetra
function getAllCuves() {
    return db.prepare('SELECT * FROM cuves').all();
}

// Mampiditra cuve vaovao
function addCuve(nom, carburant, capacite, stock) {
    const insert = db.prepare('INSERT INTO cuves (nom, carburant, capacite, stock) VALUES (?, ?, ?, ?)');
    return insert.run(nom, carburant, capacite, stock);
}

// -----------------------------------------
// FONCTIONS HO AN'NY MOUVEMENTS (ENTRÉES / SORTIES)
// -----------------------------------------

// Mampiditra entrée (Livraison) vaovao
function addEntree(cuveId, quantite) {
    db.prepare('UPDATE cuves SET stock = stock + ? WHERE id = ?').run(quantite, cuveId);
    const insertMouvement = db.prepare('INSERT INTO mouvements (cuve_id, type, quantite) VALUES (?, ?, ?)');
    return insertMouvement.run(cuveId, 'entree', quantite);
}

// Mampiditra sortie (Famoahana) vaovao
function addSortie(cuveId, quantite) {
    const cuve = db.prepare('SELECT stock FROM cuves WHERE id = ?').get(cuveId);
    if (!cuve) throw new Error("Cuve introuvable");
    if (cuve.stock < quantite) throw new Error("Stock insuffisant ! Ny stock misy dia: " + cuve.stock + " L");

    db.prepare('UPDATE cuves SET stock = stock - ? WHERE id = ?').run(quantite, cuveId);
    const insertMouvement = db.prepare('INSERT INTO mouvements (cuve_id, type, quantite) VALUES (?, ?, ?)');
    return insertMouvement.run(cuveId, 'sortie', quantite);
}

// Maka ny mouvements rehetra
function getAllMouvements() {
    return db.prepare(`
        SELECT m.id, m.type, m.quantite, m.date, c.nom as cuve_nom, c.carburant
        FROM mouvements m
        JOIN cuves c ON m.cuve_id = c.id
        ORDER BY m.id DESC
    `).all();
}

// EXPORTATION
module.exports = { 
    getAllCuves, 
    addCuve, 
    addEntree, 
    addSortie,
    getAllMouvements
};