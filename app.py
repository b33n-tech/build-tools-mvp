import streamlit as st
import pandas as pd
from st_aggrid import AgGrid, GridOptionsBuilder, GridUpdateMode

st.set_page_config(layout="wide")
st.title("Prototype User-Builder KPI - AgGrid Drag & Drop")

# ------------------- Initialisation -------------------
if "kpi_df" not in st.session_state:
    st.session_state.kpi_df = pd.DataFrame(columns=["Nom KPI", "Source", "Valeur"])

# ------------------- Sidebar : créer un KPI -------------------
st.sidebar.header("Créer un KPI")
kpi_name = st.sidebar.text_input("Nom du KPI")
kpi_source = st.sidebar.text_input("Source (ex: colonne)")

if st.sidebar.button("Push KPI"):
    if kpi_name:
        new_row = pd.DataFrame([{"Nom KPI": kpi_name, "Source": kpi_source, "Valeur": 0}])
        st.session_state.kpi_df = pd.concat([st.session_state.kpi_df, new_row], ignore_index=True)
        st.success(f"KPI '{kpi_name}' ajouté !")
    else:
        st.warning("Merci de donner un nom au KPI")

# ------------------- Dashboard -------------------
st.subheader("Dashboard - Drag & Drop avec AgGrid")

# Configuration AgGrid
gb = GridOptionsBuilder.from_dataframe(st.session_state.kpi_df)
gb.configure_default_column(editable=True, sortable=True)
gb.configure_grid_options(rowDragManaged=True, suppressMovableColumns=True)
grid_options = gb.build()

grid_response = AgGrid(
    st.session_state.kpi_df,
    gridOptions=grid_options,
    update_mode=GridUpdateMode.MODEL_CHANGED,
    fit_columns_on_grid_load=True,
    enable_enterprise_modules=False,
    height=300
)

# Mise à jour du dataframe après drag & drop
st.session_state.kpi_df = pd.DataFrame(grid_response['data'])

# Affichage visuel des KPI comme des “briques”
st.subheader("Aperçu Dashboard")
for idx, row in st.session_state.kpi_df.iterrows():
    st.markdown(f"**{row['Nom KPI']}** (Source: {row['Source']})")
    st.metric(label="Valeur", value=row["Valeur"])
