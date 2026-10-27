const express = require('express');
const router = express.Router();
//fonction ilaina @ db
const { addEntree, addSortie, getAllMouvements } = require('../db/queries');
        // MOUVEMENTS

// Maka histoire entre sortie 

router.get('/', (req, res) => {
    try {
        const mouvements = getAllMouvements();
        res.json(mouvements);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//  Mandray ny Entrée 
router.post('/entree', (req, res) => {
    try {
        const { cuve_id, quantite } = req.body;
        addEntree(cuve_id, quantite);
        res.status(201).json({ message: 'Entrée enregistrée avec succès' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mandray ny Sortie
router.post('/sortie', (req, res) => {
    try {
        const { cuve_id, quantite } = req.body;
        addSortie(cuve_id, quantite);
        res.status(201).json({ message: 'Sortie enregistrée avec succès' });
    } catch (error) {
        res.status(400).json({ error: error.message }); 
    }
});

module.exports = router;