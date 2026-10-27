// Maka ny cuves rehetra avy amin'ny API (Backend)
async function getCuves() {
    try {
        const response = await fetch('/api/cuves');
        if (!response.ok) {
            throw new Error('Erreur réseau');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Nisy olana tamin'ny fakana données:", error);
        return [];
    }
}

// Mampiditra cuve vaovao (POST)
async function ajouterCuve(cuveData) {
    try {
        const response = await fetch('/api/cuves', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cuveData)
        });
        return await response.json();
    } catch (error) {
        console.error("Nisy olana tamin'ny fandefasana:", error);
    }
}

// Mampiditra entrée vaovao (POST)
async function ajouterEntree(cuve_id, quantite) {
    try {
        const response = await fetch('/api/mouvements/entree', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cuve_id, quantite })
        });

        if (!response.ok) {
            throw new Error("Erreur serveur: " + response.status);
        }

        return await response.json();
    } catch (error) {
        console.error("Nisy olana:", error);
        alert("Nisy olana: " + error.message);
    }
}

async function ajouterSortie(cuve_id, quantite) {
    try {
        const response = await fetch('/api/mouvements/sortie', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cuve_id, quantite })
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Erreur serveur");
        }
        return data;
    } catch (error) {
        console.error("Nisy olana:", error);
        alert(error.message); // Hampiseho ny "Stock insuffisant" raha mihoatra
    }
}

async function getMouvements() {
    try {
        const response = await fetch('/api/mouvements');
        return await response.json();
    } catch (error) {
        console.error("Nisy olana:", error);
        return [];
    }
}