import streamlit as st
from streamlit_sortable import sortable_container, sortable_item

st.set_page_config(layout="wide")
st.title("Prototype User-Builder KPI - Drag & Drop")

# Initialisation de la liste des KPI
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
st.subheader("Dashboard - Drag & Drop")

# Drag & drop container
with sortable_container(key="kpi_sortable"):
    for idx, kpi in enumerate(st.session_state.kpis):
        with sortable_item(key=f"kpi_{idx}"):
            st.markdown(f"**{kpi['name']}** (source: {kpi['source']})")
            st.metric(label="Valeur", value=0)  # Placeholder pour la métrique
