// 1. FONCTIONS HO AN'NY DASHBOARD SY TABLEAUX
function renderTable(cuves, tbodyId) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return; 

    tbody.innerHTML = ''; 

    if (cuves.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Tsy misy cuve voatahiry.</td></tr>';
        return;
    }

    cuves.forEach(cuve => {
        const pourcentage = Math.round((cuve.stock / cuve.capacite) * 100);
        // Hifehezana ny bara mba tsy hihoatra ny 100% ny sakany
        const displayWidth = Math.min(pourcentage, 100); 
        
        let levelClass = 'green-level';
        let statusClass = 'normal';
        let statusText = 'Normal';

        if (pourcentage <= 25) {
            levelClass = 'red-level';
            statusClass = 'critical';
            statusText = 'Critique';
        } else if (pourcentage <= 40) {
            levelClass = 'orange-level';
            statusClass = 'warning';
            statusText = 'Attention';
        } else if (pourcentage > 100) {
            levelClass = 'red-level';
            statusClass = 'critical';
            statusText = 'Débordement';
        }

        tbody.innerHTML += `
            <tr>
                <td><span class="tank-id">CUV-00${cuve.id}</span></td>
                <td>${cuve.nom}</td>
                <td><span class="fuel-dot gasoil"></span> ${cuve.carburant}</td>
                <td>${cuve.capacite.toLocaleString('fr-FR')} L</td>
                <td>${cuve.stock.toLocaleString('fr-FR')} L</td>
                <td>
                    <div class="level-cell">
                        <div class="progress-track">
                            <span class="level ${levelClass}" style="width:${displayWidth}%"></span>
                        </div>
                        <span class="${pourcentage > 100 ? 'text-danger fw-bold' : ''}">${pourcentage}%</span>
                    </div>
                </td>
                <td><span class="status-pill ${statusClass}">${statusText}</span></td>
            </tr>
        `;
    });
}

// 2. FONCTIONS HO AN'NY MOUVEMENT

function renderMouvements(mouvements) {
    const tbody = document.getElementById('liste-mouvements');
    if (!tbody) return;

    tbody.innerHTML = ''; 

    if (mouvements.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Tsy misy mouvement voatahiry.</td></tr>';
        return;
    }

    mouvements.forEach(mvt => {
        const isEntree = mvt.type === 'entree';
        const badgeColor = isEntree ? 'bg-success' : 'bg-danger';
        const typeTexte = isEntree ? 'Entrée' : 'Sortie';
        const signe = isEntree ? '+' : '-';
        const dateFormat = new Date(mvt.date).toLocaleString('fr-FR');

        tbody.innerHTML += `
            <tr>
                <td><span class="tank-id">MVT-${mvt.id}</span></td>
                <td>${dateFormat}</td>
                <td>${mvt.cuve_nom} (${mvt.carburant})</td>
                <td><span class="badge ${badgeColor}">${typeTexte}</span></td>
                <td class="${isEntree ? 'text-success' : 'text-danger'} fw-bold">
                    ${signe} ${mvt.quantite.toLocaleString()} L
                </td>
            </tr>
        `;
    });
}

// 3. FONCTIONS HO AN'NY CARBURANTS

function renderCarburants(cuves) {
    const container = document.getElementById('carburants-container');
    if (!container) return;

    container.innerHTML = '';

    if (cuves.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted">Tsy misy cuve voatahiry.</div>';
        return;
    }

    const dataCarburants = {};
    cuves.forEach(c => {
        if (!dataCarburants[c.carburant]) {
            dataCarburants[c.carburant] = { stock: 0, capacite: 0, nombre: 0 };
        }
        dataCarburants[c.carburant].stock += c.stock;
        dataCarburants[c.carburant].capacite += c.capacite;
        dataCarburants[c.carburant].nombre += 1;
    });

    for (const [nom, data] of Object.entries(dataCarburants)) {
        const pourcentage = Math.round((data.stock / data.capacite) * 100) || 0;
        const displayWidth = Math.min(pourcentage, 100);
        
        let icon = 'fa-gas-pump';
        let colorClass = 'cyan';
        if (nom.toLowerCase().includes('essence')) { colorClass = 'green'; icon = 'fa-car'; }
        if (nom.toLowerCase().includes('super')) { colorClass = 'purple'; icon = 'fa-star'; }
        if (nom.toLowerCase().includes('pétrole')) { colorClass = 'red'; icon = 'fa-fire'; }

        container.innerHTML += `
            <div class="col-md-6 col-lg-3 mb-4">
                <div class="stat-card ${colorClass} h-100">
                    <div class="stat-card-header">
                        <span>${nom}</span>
                        <span class="stat-icon"><i class="fa-solid ${icon}"></i></span>
                    </div>
                    <h3>${data.stock.toLocaleString('fr-FR')} <small>L</small></h3>
                    <p>${data.nombre} cuve(s) • Capacité: ${data.capacite.toLocaleString('fr-FR')} L</p>
                    
                    <div class="progress-track mt-3">
                        <span class="level ${pourcentage > 100 ? 'red-level' : 'green-level'}" style="width:${displayWidth}%"></span>
                    </div>
                </div>
            </div>
        `;
    }
}

// 4. FONCTIONS HO AN'NY CHART.JS (GRAPHIQUES)
let chartRepartitionInstance = null;
let chartCuvesInstance = null;
let chartEvolutionInstance = null;

function renderChartsPro(cuves) {
    const dataCarburant = {};
    let totalStock = 0;
    
    cuves.forEach(c => {
        if (!dataCarburant[c.carburant]) dataCarburant[c.carburant] = 0;
        dataCarburant[c.carburant] += c.stock;
        totalStock += c.stock;
    });

    const labelsCarburant = Object.keys(dataCarburant);
    const dataCarburantValues = Object.values(dataCarburant);

    // --- CHART 1: DOUGHNUT ---
    const ctxRep = document.getElementById('chartRepartition');
    if (ctxRep) {
        if (chartRepartitionInstance) chartRepartitionInstance.destroy();
        chartRepartitionInstance = new Chart(ctxRep, {
            type: 'doughnut',
            data: {
                labels: labelsCarburant,
                datasets: [{
                    data: dataCarburantValues,
                    backgroundColor: ['#00d2ff', '#a855f7', '#22c55e', '#f5b942', '#ff5364'],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                cutout: '75%',
                plugins: { legend: { position: 'right', labels: { color: '#edf6ff', font: { size: 12 } } } }
            }
        });
    }

    // --- CHART 2: BAR ---
    const ctxBar = document.getElementById('chartCuves');
    if (ctxBar) {
        const labelsCuves = cuves.map(c => c.nom);
        const dataPourcentages = cuves.map(c => Math.min(Math.round((c.stock / c.capacite) * 100), 100));
        
        if (chartCuvesInstance) chartCuvesInstance.destroy();
        chartCuvesInstance = new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: labelsCuves,
                datasets: [{
                    label: 'Niveau (%)',
                    data: dataPourcentages,
                    backgroundColor: dataPourcentages.map(p => p <= 25 ? '#ff5364' : (p <= 40 ? '#f5b942' : '#22c55e')),
                    borderRadius: 5
                }]
            },
            options: {
                scales: {
                    y: { beginAtZero: true, max: 100, ticks: { color: '#8da3ba' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    x: { ticks: { color: '#8da3ba' }, grid: { display: false } }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    // --- CHART 3: LINE ---
    const ctxLine = document.getElementById('chartEvolution');
    if (ctxLine) {
        const labelsJours = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        const dataEvolution = [ totalStock * 0.8, totalStock * 0.85, totalStock * 0.82, totalStock * 0.9, totalStock * 0.95, totalStock * 0.92, totalStock ];

        if (chartEvolutionInstance) chartEvolutionInstance.destroy();
        chartEvolutionInstance = new Chart(ctxLine, {
            type: 'line',
            data: {
                labels: labelsJours,
                datasets: [{
                    label: 'Stock Total (L)',
                    data: dataEvolution,
                    borderColor: '#00d2ff',
                    backgroundColor: 'rgba(0, 210, 255, 0.1)',
                    borderWidth: 3,
                    pointBackgroundColor: '#00d2ff',
                    fill: true,
                    tension: 0.4 
                }]
            },
            options: {
                scales: {
                    y: { ticks: { color: '#8da3ba' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    x: { ticks: { color: '#8da3ba' }, grid: { display: false } }
                },
                plugins: { legend: { labels: { color: '#edf6ff' } } }
            }
        });
    }
}

// 5. FONCTIONS HO AN'NY ALERTES
function renderAlertes(cuves) {
    const tbody = document.getElementById('liste-alertes');
    if (!tbody) return;

    tbody.innerHTML = '';

    // Maka ny cuves latsaky ny 40% sy mihoatra ny 100% (Débordement)
    const cuvesCritiques = cuves.filter(c => {
        const p = (c.stock / c.capacite) * 100;
        return p <= 40 || p > 100;
    });

    if (cuvesCritiques.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-success fw-bold"><i class="fa-solid fa-check-circle"></i> Tsara ny stocks rehetra, tsy misy alertes.</td></tr>';
        return;
    }

    cuvesCritiques.forEach(cuve => {
        // Kajy ny tena isan-jato
        const pourcentage = Math.round((cuve.stock / cuve.capacite) * 100);
        // Hifehezana ny bara mba tsy hihoatra ny 100% ny sakany
        const displayWidth = Math.min(pourcentage, 100);
        
        tbody.innerHTML += `
            <tr>
                <td><span class="tank-id">CUV-00${cuve.id}</span></td>
                <td>${cuve.nom}</td>
                <td><span class="fuel-dot gasoil"></span> ${cuve.carburant}</td>
                <td class="text-danger fw-bold">${cuve.stock.toLocaleString('fr-FR')} L</td>
                <td>
                    <div class="level-cell">
                        <div class="progress-track">
                            <!-- Eto no nasiam-panitsiana: nampiasa displayWidth fa tsy 100% -->
                            <span class="level red-level" style="width:${displayWidth}%"></span>
                        </div>
                        <span class="text-danger">${pourcentage}%</span>
                    </div>
                </td>
                <td>
                    <button onclick="navigateTo('entrees')" class="btn btn-sm btn-outline-info">
                        <i class="fa-solid fa-plus"></i> Ravitaillement
                    </button>
                </td>
            </tr>
        `;
    });
}