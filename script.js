// KPI Builder - click-to-edit in sidebar, drag & drop, localStorage persistence

const dashboard = document.getElementById("dashboard");
const kpiContainer = document.getElementById("kpiContainer");

const saveBtn = document.getElementById("save-btn");
const deleteBtn = document.getElementById("delete-btn");
const sidebarTitle = document.getElementById("sidebar-title");

const nameInput = document.getElementById("kpi-name");
const typeInput = document.getElementById("kpi-type");
const sourceInput = document.getElementById("kpi-source");

let editingId = null;
let kpis = JSON.parse(localStorage.getItem('kpis')) || [];

// render function
function renderKPIs() {
  kpiContainer.innerHTML = '';
  kpis.forEach((kpi) => {
    const block = document.createElement('div');
    block.className = 'kpi-block';
    block.dataset.id = kpi.id;

    // content
    const title = document.createElement('h3');
    title.textContent = kpi.name;
    block.appendChild(title);

    const meta = document.createElement('div');
    meta.className = 'kpi-meta';
    meta.textContent = `${kpi.type || 'Type -'} • ${kpi.source || 'Source -'}`;
    block.appendChild(meta);

    // placeholder value (you can integrate real computation later)
    const value = document.createElement('div');
    value.className = 'kpi-value';
    value.textContent = kpi.value !== undefined ? kpi.value : '—';
    block.appendChild(value);

    // click to edit in sidebar
    block.addEventListener('click', (ev) => {
      // if user is dragging, avoid opening (Sortable cancels click on drag)
      editKPI(kpi.id);
    });

    kpiContainer.appendChild(block);
  });

  // persist order/structure
  localStorage.setItem('kpis', JSON.stringify(kpis));
}

// create or update
saveBtn.addEventListener('click', () => {
  const name = nameInput.value.trim();
  const type = typeInput.value;
  const source = sourceInput.value.trim();

  if (!name) {
    alert('Le nom du KPI est requis');
    return;
  }

  if (editingId) {
    // update existing
    const idx = kpis.findIndex(k => k.id === editingId);
    if (idx !== -1) {
      kpis[idx].name = name;
      kpis[idx].type = type;
      kpis[idx].source = source;
      // optional: recalc value if you implement calculation later
    }
    editingId = null;
  } else {
    // new KPI
    const newKpi = {
      id: Date.now().toString(),
      name,
      type,
      source,
      value: '—'
    };
    kpis.push(newKpi);
  }

  resetSidebar();
  renderKPIs();
});

// delete
deleteBtn.addEventListener('click', () => {
  if (!editingId) return;
  kpis = kpis.filter(k => k.id !== editingId);
  editingId = null;
  resetSidebar();
  renderKPIs();
});

// click a KPI => load into sidebar
function editKPI(id) {
  const kpi = kpis.find(k => k.id === id);
  if (!kpi) return;
  editingId = id;
  nameInput.value = kpi.name || '';
  typeInput.value = kpi.type || '';
  sourceInput.value = kpi.source || '';
  sidebarTitle.textContent = "Modifier le KPI";
  saveBtn.textContent = "💾 Mettre à jour";
  deleteBtn.style.display = 'inline-block';
}

// reset sidebar to create mode
function resetSidebar() {
  nameInput.value = '';
  typeInput.value = '';
  sourceInput.value = '';
  sidebarTitle.textContent = "Créer un KPI";
  saveBtn.textContent = "Ajouter KPI";
  deleteBtn.style.display = 'none';
  editingId = null;
}

// init sortable for Lego drag & drop
new Sortable(kpiContainer, {
  animation: 150,
  onEnd: function (evt) {
    // update kpis order according to DOM order
    const newOrder = [];
    kpiContainer.querySelectorAll('.kpi-block').forEach(block => {
      const id = block.dataset.id;
      const k = kpis.find(x => x.id === id);
      if (k) newOrder.push(k);
    });
    kpis = newOrder;
    renderKPIs();
  }
});

// initial render
renderKPIs();
