let kpis = JSON.parse(localStorage.getItem('kpis')) || [];
let sheetData = [];

const kpiContainer = document.getElementById('kpiContainer');
const addKpiBtn = document.getElementById('addKpiBtn');
const kpiNameInput = document.getElementById('kpiName');
const fileInput = document.getElementById('fileInput');
const columnSelect = document.getElementById('columnSelect');
const calcSelect = document.getElementById('calcSelect');

// Chargement CSV/XLSX
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();

  reader.onload = (evt) => {
    const data = evt.target.result;
    const workbook = XLSX.read(data, { type: 'binary' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    sheetData = XLSX.utils.sheet_to_json(firstSheet, { defval: 0 });
    columnSelect.innerHTML = '<option value="">-- Choisir une colonne --</option>';
    if (sheetData.length > 0) {
      Object.keys(sheetData[0]).forEach((col) => {
        const opt = document.createElement('option');
        opt.value = col;
        opt.textContent = col;
        columnSelect.appendChild(opt);
      });
    }
  };
  reader.readAsBinaryString(file);
});

// Calcul KPI
function computeKpiValue(kpi) {
  if (!sheetData.length || !kpi.column) return 0;
  const vals = sheetData.map((r) => parseFloat(r[kpi.column])).filter((v) => !isNaN(v));
  switch (kpi.calc) {
    case 'sum': return vals.reduce((a, b) => a + b, 0);
    case 'avg': return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2);
    case 'max': return Math.max(...vals);
    case 'min': return Math.min(...vals);
    case 'count': return vals.length;
    default: return 0;
  }
}

// Crée un bloc KPI
function createKpiBlock(kpi, index) {
  const div = document.createElement('div');
  div.className = 'kpi-block';
  div.setAttribute('data-index', index);

  const h3 = document.createElement('h3');
  h3.textContent = kpi.name;
  div.appendChild(h3);

  const p = document.createElement('p');
  p.textContent = `Colonne: ${kpi.column}, Type: ${kpi.calc}`;
  div.appendChild(p);

  const value = document.createElement('p');
  value.textContent = 'Valeur: ' + computeKpiValue(kpi);
  div.appendChild(value);

  // Mini-menu correct
  const menu = document.createElement('select');
  menu.innerHTML = `
    <option value="">Actions</option>
    <option value="edit">Reparamétrer</option>
    <option value="delete">Supprimer</option>
  `;
  menu.addEventListener('change', (e) => {
    if (e.target.value === 'delete') {
      kpis.splice(index, 1);
      renderKpis();
    } else if (e.target.value === 'edit') {
      showEditForm(kpi, index);
    }
    e.target.value = '';
  });
  div.appendChild(menu);

  return div;
}

// Reparamétrer un KPI
function showEditForm(kpi, index) {
  const div = document.createElement('div');
  div.style.marginTop = '10px';

  const nameInput = document.createElement('input');
  nameInput.value = kpi.name;
  nameInput.placeholder = 'Nom du KPI';
  div.appendChild(nameInput);

  const colSelect = document.createElement('select');
  Object.keys(sheetData[0] || {}).forEach((col) => {
    const opt = document.createElement('option');
    opt.value = col;
    opt.textContent = col;
    if (col === kpi.column) opt.selected = true;
    colSelect.appendChild(opt);
  });
  div.appendChild(colSelect);

  const calcSelect = document.createElement('select');
  ['sum', 'avg', 'max', 'min', 'count'].forEach((c) => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    if (c === kpi.calc) opt.selected = true;
    calcSelect.appendChild(opt);
  });
  div.appendChild(calcSelect);

  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Sauvegarder';
  saveBtn.style.marginTop = '5px';
  saveBtn.addEventListener('click', () => {
    kpis[index] = {
      name: nameInput.value,
      column: colSelect.value,
      calc: calcSelect.value,
    };
    renderKpis();
  });
  div.appendChild(saveBtn);

  const block = kpiContainer.querySelector(`[data-index='${index}']`);
  block.innerHTML = '';
  block.appendChild(div);
}

// Render
function renderKpis() {
  kpiContainer.innerHTML = '';
  kpis.forEach((kpi, i) => {
    kpiContainer.appendChild(createKpiBlock(kpi, i));
  });
  localStorage.setItem('kpis', JSON.stringify(kpis));
}

// Ajouter KPI
addKpiBtn.addEventListener('click', () => {
  const name = kpiNameInput.value.trim();
  const column = columnSelect.value;
  const calc = calcSelect.value;
  if (name && column && calc) {
    kpis.push({ name, column, calc });
    renderKpis();
    kpiNameInput.value = '';
  }
});

renderKpis();

// Drag & drop Lego
new Sortable(kpiContainer, {
  animation: 150,
  onEnd: function (evt) {
    const moved = kpis.splice(evt.oldIndex, 1)[0];
    kpis.splice(evt.newIndex, 0, moved);
    renderKpis();
  },
});
