// Charger les KPI depuis localStorage ou créer tableau vide
let kpis = JSON.parse(localStorage.getItem('kpis')) || [];

const kpiContainer = document.getElementById('kpiContainer');
const addKpiBtn = document.getElementById('addKpiBtn');
const kpiNameInput = document.getElementById('kpiName');
const kpiSourceInput = document.getElementById('kpiSource');

// Créer un bloc KPI
function createKpiBlock(kpi, index) {
    const div = document.createElement('div');
    div.className = 'kpi-block';
    div.setAttribute('data-index', index);

    const h3 = document.createElement('h3');
    h3.textContent = kpi.name;
    div.appendChild(h3);

    const p = document.createElement('p');
    p.textContent = 'Source: ' + (kpi.source || 'N/A');
    div.appendChild(p);

    const value = document.createElement('p');
    value.textContent = 'Valeur: ' + (kpi.value || 0);
    div.appendChild(value);

    return div;
}

// Rendu des KPI
function renderKpis() {
    kpiContainer.innerHTML = '';
    kpis.forEach((kpi, index) => {
        const block = createKpiBlock(kpi, index);
        kpiContainer.appendChild(block);
    });
    localStorage.setItem('kpis', JSON.stringify(kpis));
}

// Ajouter un KPI
addKpiBtn.addEventListener('click', () => {
    const name = kpiNameInput.value.trim();
    const source = kpiSourceInput.value.trim();
    if (name) {
        kpis.push({ name, source, value: 0 });
        renderKpis();
        kpiNameInput.value = '';
        kpiSourceInput.value = '';
    }
});

// Initial render
renderKpis();

// Drag & Drop avec Sortable.js
new Sortable(kpiContainer, {
    animation: 150,
    onEnd: function (evt) {
        const movedItem = kpis.splice(evt.oldIndex, 1)[0];
        kpis.splice(evt.newIndex, 0, movedItem);
        renderKpis();
    }
});
