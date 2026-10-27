const express = require('express');
const router = express.Router();
const { getAllCuves, addCuve } = require('../db/queries');

// GET: Maka ny cuves rehetra
router.get('/', (req, res) => {
    try {
        const cuves = getAllCuves();
        res.json(cuves);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST: Mampiditra cuve vaovao
router.post('/', (req, res) => {
    try {
        const { nom, carburant, capacite, stock } = req.body;
        addCuve(nom, carburant, capacite, stock);
        res.status(201).json({ message: 'Cuve ajoutée avec succès' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;