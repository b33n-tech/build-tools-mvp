const dashboard = document.getElementById("dashboard");
const kpiContainer = document.getElementById("kpiContainer");

const saveBtn = document.getElementById("save-btn");
const deleteBtn = document.getElementById("delete-btn");
const sidebarTitle = document.getElementById("sidebar-title");

const nameInput = document.getElementById("kpi-name");
const typeInput = document.getElementById("kpi-type");
const columnSelect = document.getElementById("kpi-column");
const fileInput = document.getElementById("file-input");

let editingId = null;
let kpis = JSON.parse(localStorage.getItem('kpis')) || [];
let dataBase = []; // contient les lignes du fichier uploadé

// ===== Upload et parsing =====
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (evt) => {
    let data = evt.target.result;
    let wb;
    if (file.name.endsWith('.csv')) {
      wb = XLSX.read(data, { type: 'binary', raw: true });
    } else {
      wb = XLSX.read(data, { type: 'binary' });
    }
    const wsName = wb.SheetNames[0];
    const ws = wb.Sheets[wsName];
    dataBase = XLSX.utils.sheet_to_json(ws, { defval: 0 });
    populateColumns();
    alert(`Fichier chargé : ${file.name} (${dataBase.length} lignes)`);
  };
  reader.readAsBinaryString(file);
});

// remplir liste déroulante colonnes
function populateColumns() {
  columnSelect.innerHTML = '<option value="">Sélectionner une colonne</option>';
  if (dataBase.length === 0) return;
  Object.keys(dataBase[0]).forEach(col => {
    const option = document.createElement('option');
    option.value = col;
    option.textContent = col;
    columnSelect.appendChild(option);
  });
}

// ===== Calcul KPI =====
function computeKPI(kpi) {
  if (!dataBase.length || !kpi.column || !kpi.type) return '—';
  const vals = dataBase.map(r => parseFloat(r[kpi.column])).filter(v => !isNaN(v));
  if (!vals.length) return '—';
  switch(kpi.type) {
    case 'sum': return vals.reduce((a,b)=>a+b,0);
    case 'avg': return (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2);
    case 'min': return Math.min(...vals);
    case 'max': return Math.max(...vals);
    default: return '—';
  }
}

// ===== Render KPI =====
function renderKPIs() {
  kpiContainer.innerHTML = '';
  kpis.forEach((kpi) => {
    const block = document.createElement('div');
    block.className = 'kpi-block';
    block.dataset.id = kpi.id;

    const title = document.createElement('h3');
    title.textContent = kpi.name;
    block.appendChild(title);

    const meta = document.createElement('div');
    meta.className = 'kpi-meta';
    meta.textContent = `${kpi.type || '-'} • ${kpi.column || '-'}`;
    block.appendChild(meta);

    const value = document.createElement('div');
    value.className = 'kpi-value';
    value.textContent = computeKPI(kpi);
    block.appendChild(value);

    block.addEventListener('click', () => editKPI(kpi.id));
    kpiContainer.appendChild(block);
  });

  localStorage.setItem('kpis', JSON.stringify(kpis));
}

// ===== Ajouter / mettre à jour =====
saveBtn.addEventListener('click', () => {
  const name = nameInput.value.trim();
  const type = typeInput.value;
  const column = columnSelect.value;

  if (!name) return alert('Nom du KPI requis');

  if (editingId) {
    const idx = kpis.findIndex(k => k.id === editingId);
    if (idx !== -1) {
      kpis[idx].name = name;
      kpis[idx].type = type;
      kpis[idx].column = column;
    }
    editingId = null;
  } else {
    const newKpi = {
      id: Date.now().toString(),
      name,
      type,
      column
    };
    kpis.push(newKpi);
  }

  resetSidebar();
  renderKPIs();
});

// ===== Supprimer =====
deleteBtn.addEventListener('click', () => {
  if (!editingId) return;
  kpis = kpis.filter(k => k.id !== editingId);
  resetSidebar();
  renderKPIs();
});

// ===== Edit KPI =====
function editKPI(id) {
  const kpi = kpis.find(k => k.id === id);
  if (!kpi) return;

  editingId = id;
  nameInput.value = kpi.name;
  typeInput.value = kpi.type;
  columnSelect.value = kpi.column;
  deleteBtn.style.display = 'block';
  sidebarTitle.textContent = 'Modifier KPI';
}

function resetSidebar() {
  editingId = null;
  nameInput.value = '';
  typeInput.value = '';
  columnSelect.value = '';
  deleteBtn.style.display = 'none';
  sidebarTitle.textContent = 'Créer un KPI';
}

// ===== Drag & Drop =====
new Sortable(kpiContainer, {
  animation: 150,
  ghostClass: 'sortable-ghost'
});

// ===== Initial render =====
renderKPIs();
