import streamlit as st

st.set_page_config(layout="wide")
st.title("Prototype User-Builder KPI")

# Initialisation des KPI
if "kpis" not in st.session_state:
    st.session_state.kpis = []

# ---------------- Sidebar : créer un KPI ----------------
st.sidebar.header("Créer un KPI")
kpi_name = st.sidebar.text_input("Nom du KPI")
kpi_source = st.sidebar.text_input("Source (ex: colonne)")

if st.sidebar.button("Push KPI"):
    if kpi_name:
        st.session_state.kpis.append({"name": kpi_name, "source": kpi_source})
        st.success(f"KPI '{kpi_name}' ajouté !")
    else:
        st.warning("Merci de donner un nom au KPI")

# ---------------- Dashboard : afficher les KPIs ----------------
st.subheader("Dashboard")
kpi_container = st.container()

for idx, kpi in enumerate(st.session_state.kpis):
    with kpi_container:
        st.markdown(f"**{kpi['name']}** (source: {kpi['source']})")
        # Ici tu pourrais mettre un calcul réel ou placeholder
        st.metric(label="Valeur", value=0)
        # Boutons pour déplacer la brique
        col1, col2 = st.columns([1,1])
        with col1:
            if st.button("⬆️", key=f"up_{idx}") and idx > 0:
                st.session_state.kpis[idx], st.session_state.kpis[idx-1] = st.session_state.kpis[idx-1], st.session_state.kpis[idx]
        with col2:
            if st.button("⬇️", key=f"down_{idx}") and idx < len(st.session_state.kpis)-1:
                st.session_state.kpis[idx], st.session_state.kpis[idx+1] = st.session_state.kpis[idx+1], st.session_state.kpis[idx]
