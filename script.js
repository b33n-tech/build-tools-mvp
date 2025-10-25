let kpis = JSON.parse(localStorage.getItem('kpis')) || [];
let sheetData = [];

const kpiContainer = document.getElementById('kpiContainer');
const addKpiBtn = document.getElementById('addKpiBtn');
const kpiNameInput = document.getElementById('kpiName');
const fileInput = document.getElementById('fileInput');
const columnSelect = document.getElementById('columnSelect');
const calcSelect = document.getElementById('calcSelect');

// Lire le fichier CSV/XLSX
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
        let data = evt.target.result;
        if (file.name.endsWith('.csv')) {
            const rows = data.split('\n').map(r => r.split(','));
            sheetData = rows.map(r => Object.fromEntries(r.map((v,i)=>[rows[0][i], v])));
        } else {
            const workbook = XLSX.read(data, {type:'binary'});
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            sheetData = XLSX.utils.sheet_to_json(firstSheet);
        }
        // Remplir dropdown colonnes
        columnSelect.innerHTML = '<option value="">-- Choisir une colonne --</option>';
        if(sheetData.length > 0){
            Object.keys(sheetData[0]).forEach(col => {
                const option = document.createElement('option');
                option.value = col;
                option.textContent = col;
                columnSelect.appendChild(option);
            });
        }
    };
    if(file.name.endsWith('.csv')){
        reader.readAsText(file);
    } else {
        reader.readAsBinaryString(file);
    }
});

// Créer un bloc KPI
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

    return div;
}

// Calcul KPI
function computeKpiValue(kpi) {
    if(!sheetData.length || !kpi.column) return 0;
    const vals = sheetData.map(r=>parseFloat(r[kpi.column])).filter(v=>!isNaN(v));
    switch(kpi.calc){
        case 'sum': return vals.reduce((a,b)=>a+b,0);
        case 'avg': return vals.reduce((a,b)=>a+b,0)/vals.length;
        case 'max': return Math.max(...vals);
        case 'min': return Math.min(...vals);
        case 'count': return vals.length;
        default: return 0;
    }
}

// Render KPI
function renderKpis() {
    kpiContainer.innerHTML = '';
    kpis.forEach((kpi,index)=>{
        kpiContainer.appendChild(createKpiBlock(kpi,index));
    });
    localStorage.setItem('kpis',JSON.stringify(kpis));
}

// Ajouter KPI
addKpiBtn.addEventListener('click', ()=>{
    const name = kpiNameInput.value.trim();
    const column = columnSelect.value;
    const calc = calcSelect.value;
    if(name && column && calc){
        kpis.push({name,column,calc});
        renderKpis();
        kpiNameInput.value = '';
    }
});

// Initial render
renderKpis();

// Drag & drop Lego
new Sortable(kpiContainer,{
    animation:150,
    onEnd: function(evt){
        const moved = kpis.splice(evt.oldIndex,1)[0];
        kpis.splice(evt.newIndex,0,moved);
        renderKpis();
    }
});
