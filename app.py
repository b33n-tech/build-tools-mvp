import streamlit as st

st.set_page_config(layout="wide")
st.title("Prototype User-Builder KPI - MVP Cloud Ready")

# ------------------- Initialisation -------------------
if "kpis" not in st.session_state:
    st.session_state.kpis = []

# ------------------- Sidebar : créer un KPI -------------------
st.sidebar.header("Créer un KPI")
kpi_name = st.sidebar.text_input("Nom du KPI")
kpi_source = st.sidebar.text_input("Source (ex: colonne)")

if st.sidebar.button("Push KPI"):
    if kpi_name:
        st.session_state.kpis.append({"name": kpi_name, "source": kpi_source})
        st.success(f"KPI '{kpi_name}' ajouté !")
    else:
        st.warning("Merci de donner un nom au KPI")

# ------------------- Dashboard -------------------
st.subheader("Dashboard")
kpi_container = st.container()

for idx, kpi in enumerate(st.session_state.kpis):
    with kpi_container:
        st.markdown(f"**{kpi['name']}** (source: {kpi['source']})")
        st.metric(label="Valeur", value=0)  # Placeholder pour métrique

        # --------- Boutons de réorganisation ---------
        col1, col2, col3 = st.columns([1,1,6])
        with col1:
            if st.button("⬆️", key=f"up_{idx}") and idx > 0:
                st.session_state.kpis[idx], st.session_state.kpis[idx-1] = st.session_state.kpis[idx-1], st.session_state.kpis[idx]
        with col2:
            if st.button("⬇️", key=f"down_{idx}") and idx < len(st.session_state.kpis)-1:
                st.session_state.kpis[idx], st.session_state.kpis[idx+1] = st.session_state.kpis[idx+1], st.session_state.kpis[idx]
        # Col3 vide pour l'espacement

# ------------------- Info -------------------
st.info("Prototype MVP : ajoutez des KPIs, réorganisez-les avec les boutons ⬆️ / ⬇️. Drag & drop visuel à venir.")
