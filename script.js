const dashboard = document.getElementById("dashboard");
const saveBtn = document.getElementById("save-btn");
const deleteBtn = document.getElementById("delete-btn");
const sidebarTitle = document.getElementById("sidebar-title");

const nameInput = document.getElementById("kpi-name");
const typeInput = document.getElementById("kpi-type");
const sourceInput = document.getElementById("kpi-source");

let editingId = null;
let kpis = [];

// Création / Mise à jour d'un KPI
saveBtn.addEventListener("click", () => {
const name = nameInput.value.trim();
const type = typeInput.value;
const source = sourceInput.value.trim();

if (!name) return alert("Nom du KPI requis");

if (editingId) {
// Mise à jour
const kpi = kpis.find(k => k.id === editingId);
kpi.name = name;
kpi.type = type;
kpi.source = source;
editingId = null;
sidebarTitle.textContent = "Créer un KPI";
saveBtn.textContent = "Ajouter KPI";
deleteBtn.style.display = "none";
} else {
// Création
const newKpi = { id: Date.now(), name, type, source };
kpis.push(newKpi);
}

renderKPIs();
resetSidebar();
});

// Suppression
deleteBtn.addEventListener("click", () => {
if (editingId) {
kpis = kpis.filter(k => k.id !== editingId);
editingId = null;
renderKPIs();
resetSidebar();
}
});

// Affichage des KPI
function renderKPIs() {
dashboard.innerHTML = "";
kpis.forEach(kpi => {
const block = document.createElement("div");
block.className = "kpi-block";
block.innerHTML = `       <h3>${kpi.name}</h3>       <p>${kpi.type || "Type: -"} </p>       <p>${kpi.source || "Source: -"} </p>
    `;
block.addEventListener("click", () => editKPI(kpi));
dashboard.appendChild(block);
});
}

// Édition d’un KPI existant
function editKPI(kpi) {
editingId = kpi.id;
nameInput.value = kpi.name;
typeInput.value = kpi.type;
sourceInput.value = kpi.source;
sidebarTitle.textContent = "Modifier le KPI";
saveBtn.textContent = "💾 Mettre à jour";
deleteBtn.style.display = "block";
}

// Réinitialiser la sidebar
function resetSidebar() {
nameInput.value = "";
typeInput.value = "";
sourceInput.value = "";
sidebarTitle.textContent = "Créer un KPI";
saveBtn.textContent = "Ajouter KPI";
deleteBtn.style.display = "none";
}
