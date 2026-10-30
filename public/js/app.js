document.addEventListener('DOMContentLoaded', async () => {
    console.log("Tongasoa eto amin'ny TankFlow!");

    // 1. Maka ny données
    let cuves = await getCuves(); 
    
    // 2. Manavao ny interface
    updateInterface(cuves);       

    const menuLinks = document.querySelectorAll('.menu-link');
    const sections = document.querySelectorAll('.page-section');
    const sidebar = document.getElementById('sidebar-wrapper'); // <-- Nampidirina eto

    sections.forEach(section => {
        if (section.id !== 'page-dashboard') section.style.display = 'none';
    });

    // --- FONCTION FIFINDRANA PEJY ---
    window.navigateTo = async (targetId) => {
        // Afenina ny pejy rehetra
        sections.forEach(section => section.style.display = 'none');
        
        // Asehoy ilay pejy tadiavina
        const targetSection = document.getElementById('page-' + targetId);
        if (targetSection) targetSection.style.display = 'block';

        // Havaozina ny loko (active) ao amin'ny menu
        menuLinks.forEach(l => {
            l.classList.remove('active');
            if (l.getAttribute('href') === '#' + targetId) {
                l.classList.add('active');
            }
        });

        // --- TENA ZAVA-DEHIBE: Manafina ny menu rehefa misy click ---
        if (sidebar) {
            sidebar.classList.remove('sidebar-open');
        }

        // MAKA NY DONNÉES VAOVAO (Ho an'ny Dashboard)
        const freshCuves = await getCuves(); 
        updateInterface(freshCuves);

        // Manavao ny pejy manokana
        if (targetId === 'mouvements') {
            const mouvements = await getMouvements();
            renderMouvements(mouvements);
        }
        if (targetId === 'carburants') renderCarburants(freshCuves); 
        if (targetId === 'alertes') renderAlertes(freshCuves); 
        if (targetId === 'rapports') renderChartsPro(freshCuves); 
    };

    // Rehefa manindry ny menu
    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            navigateTo(targetId);
        });
    });

    // --- GESTION MODAL AJOUTER CUVES ---
    const formAjouter = document.getElementById('formAjouterCuve');
    if (formAjouter) {
        formAjouter.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nouveauCuve = {
                nom: document.getElementById('nom').value,
                carburant: document.getElementById('carburant').value,
                capacite: parseFloat(document.getElementById('capacite').value),
                stock: parseFloat(document.getElementById('stock').value)
            };

            const resultat = await ajouterCuve(nouveauCuve);
            if (resultat) {
                const modalEl = document.getElementById('modalAjouterCuve');
                const modal = bootstrap.Modal.getInstance(modalEl);
                if(modal) modal.hide();
                formAjouter.reset();
                alert("Cuve ajoutée avec succès !");
                navigateTo('dashboard'); 
            }
        });
    }

    // --- GESTION ENTRÉES ---
    const formEntree = document.getElementById('formEntree');
    if (formEntree) {
        formEntree.addEventListener('submit', async (e) => {
            e.preventDefault();
            const cuveId = document.getElementById('cuveEntree').value;
            const quantite = parseFloat(document.getElementById('quantiteEntree').value);

            if (cuveId && quantite > 0) {
                const resultat = await ajouterEntree(cuveId, quantite);
                if (resultat) {
                    alert("Entrée enregistrée avec succès !");
                    formEntree.reset();
                    navigateTo('dashboard'); 
                }
            }
        });
    }

    // --- GESTION SORTIES ---
    const formSortie = document.getElementById('formSortie');
    if (formSortie) {
        formSortie.addEventListener('submit', async (e) => {
            e.preventDefault();
            const cuveId = document.getElementById('cuveSortie').value;
            const quantite = parseFloat(document.getElementById('quantiteSortie').value);

            if (cuveId && quantite > 0) {
                const resultat = await ajouterSortie(cuveId, quantite);
                if (resultat) {
                    alert("Sortie enregistrée avec succès !");
                    formSortie.reset();
                    navigateTo('dashboard'); 
                }
            }
        });
    }

    // --- FANAMARINANA NY URL ---
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && document.getElementById('page-' + initialHash)) {
        navigateTo(initialHash);
    } else {
        navigateTo('dashboard');
    }
});

// ==========================================
// FONCTIONS
// ==========================================

function updateInterface(cuves) {
    updateStats(cuves);
    renderTable(cuves, 'liste-cuves'); 
    renderTable(cuves, 'liste-cuves-page'); 
    populateSelects(cuves); 
}

// --- KAJY NY STATS SY ALERTES ---
function updateStats(cuves) {
    let totalStock = 0;
    let totalCapacite = 0;
    let alertes = 0;

    cuves.forEach(cuve => {
        totalStock += cuve.stock;
        totalCapacite += cuve.capacite;
        
        const pourcentage = (cuve.stock / cuve.capacite) * 100;
        if (pourcentage <= 40 || pourcentage > 100) {
            alertes++;
        }
    });

    document.getElementById('val-total-stock').innerText = totalStock.toLocaleString('fr-FR');
    document.getElementById('val-total-capacite').innerText = totalCapacite.toLocaleString('fr-FR');
    document.getElementById('val-total-cuves').innerText = cuves.length;
    
    const alertEl = document.getElementById('val-total-alertes');
    if(alertEl) alertEl.innerText = alertes;
}

function populateSelects(cuves) {
    const selectEntree = document.getElementById('cuveEntree');
    const selectSortie = document.getElementById('cuveSortie');

    if (selectEntree) {
        selectEntree.innerHTML = '<option value="">-- Sélectionner --</option>';
        cuves.forEach(cuve => {
            selectEntree.innerHTML += `<option value="${cuve.id}">${cuve.nom} (${cuve.carburant}) - Stock: ${cuve.stock} L</option>`;
        });
    }

    if (selectSortie) {
        selectSortie.innerHTML = '<option value="">-- Sélectionner --</option>';
        cuves.forEach(cuve => {
            selectSortie.innerHTML += `<option value="${cuve.id}">${cuve.nom} (${cuve.carburant}) - Stock: ${cuve.stock} L</option>`;
        });
    }
}