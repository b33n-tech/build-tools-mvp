const kpiContainer = document.getElementById("kpiContainer");
const saveBtn = document.getElementById("save-btn");
const deleteBtn = document.getElementById("delete-btn");
const sidebarTitle = document.getElementById("sidebar-title");

const nameInput = document.getElementById("kpi-name");
const typeInput = document.getElementById("kpi-type");
const sourceInput = document.getElementById("kpi-source");
const fileInput = document.getElementById("file-upload");

let editingId = null;
let kpis = JSON.parse(localStorage.getItem('kpis')) || [];
let dataBase = [];

// ---- Upload fichier ----
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();

  reader.onload = (evt) => {
    const data = evt.target.result;
    let wb;
    if (file.name.endsWith(".csv")) {
      const csv = new Uint8Array(data);
      const arr = Array.from(csv).map(c => String.fromCharCode(c)).join("");
      wb = XLSX.read(arr, { type: "string" });
    } else {
      wb = XLSX.read(data, { type: "binary" });
    }
    const wsname = wb.SheetNames[0];
    const ws = wb.Sheets[wsname];
    dataBase = XLSX.utils.sheet_to_json(ws);
    populateColumns();
  };

  if (file.name.endsWith(".csv")) reader.readAsArrayBuffer(file);
  else reader.readAsBinaryString(file);
});

// ---- Remplir liste colonnes ----
function populateColumns() {
  sourceInput.innerHTML = '<option value="">Choisir colonne</option>';
  if (dataBase.length === 0) return;
  Object.keys(dataBase[0]).forEach(col => {
    const opt = document.createElement('option');
    opt.value = col;
    opt.textContent = col;
    sourceInput.appendChild(opt);
  });
}

// ---- Ajouter / Mettre à jour KPI ----
saveBtn.addEventListener('click', () => {
  const name = nameInput.value.trim();
  const type = typeInput.value;
  const col = sourceInput.value;

  if (!name) return alert("Nom du KPI requis");

  let value = "—";
  if (dataBase.length && col) {
    const vals = dataBase.map(r => parseFloat(r[col])).filter(v => !isNaN(v));
    if (vals.length) {
      switch(type) {
        case 'sum': value = vals.reduce((a,b)=>a+b,0); break;
        case 'avg': value = (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2); break;
        case 'max': value = Math.max(...vals); break;
        case 'min': value = Math.min(...vals); break;
        case 'count': value = vals.length; break;
        default: value = "—";
      }
    }
  }

  if (editingId) {
    const idx = kpis.findIndex(k=>k.id===editingId);
    if (idx!==-1) {
      kpis[idx] = { ...kpis[idx], name, type, col, value };
    }
    editingId = null;
  } else {
    kpis.push({ id: Date.now().toString(), name, type, col, value });
  }

  renderKPIs();
  resetSidebar();
});

// ---- Supprimer ----
deleteBtn.addEventListener('click', () => {
  if (!editingId) return;
  kpis = kpis.filter(k => k.id !== editingId);
  editingId = null;
  resetSidebar();
  renderKPIs();
});

// ---- Editer un KPI ----
function editKPI(id) {
  const kpi = kpis.find(k=>k.id===id);
  if (!kpi) return;
  editingId = id;
  nameInput.value = kpi.name || '';
  typeInput.value = kpi.type || '';
  sourceInput.value = kpi.col || '';
  sidebarTitle.textContent = "Modifier le KPI";
  saveBtn.textContent = "💾 Mettre à jour";
  deleteBtn.style.display = 'inline-block';
}

// ---- Reset sidebar ----
function resetSidebar() {
  nameInput.value='';
  typeInput.value='';
  sourceInput.value='';
  sidebarTitle.textContent = "Créer un KPI";
  saveBtn.textContent = "Ajouter KPI";
  deleteBtn.style.display='none';
  editingId=null;
}

// ---- Render ----
function renderKPIs() {
 
