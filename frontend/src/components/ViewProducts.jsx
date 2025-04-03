import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ViewProducts = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Charger la liste des tables au démarrage
  useEffect(() => {
    fetch("http://localhost:5000/get_tables")
      .then((response) => response.json())
      .then((tableList) => {
        setTables(tableList);
        if (tableList.length > 0) setSelectedTable(tableList[0]); // Sélectionner la première table par défaut
      })
      .catch((error) => console.error("Erreur de récupération des tables:", error));
  }, []);

  // Charger les données de la table sélectionnée
  const fetchTableData = (tableName) => {
    setLoading(true);
    fetch("http://localhost:5000/get_table_data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table_name: tableName })
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.error) {
          console.error("Erreur:", result.error);
          setColumns([]);
          setData([]);
        } else {
          setColumns(result.columns);
          setData(result.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des données:", error);
        setLoading(false);
      });
  };

  // Quand on sélectionne une table, on charge ses données
  useEffect(() => {
    if (selectedTable) fetchTableData(selectedTable);
  }, [selectedTable]);

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto", textAlign: "center" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>Visualisation des Tables</h1>

      {/* Liste déroulante des tables */}
      <select
        value={selectedTable}
        onChange={(e) => setSelectedTable(e.target.value)}
        style={{ padding: "10px", width: "100%", marginBottom: "20px" }}
      >
        {tables.map((table, index) => (
          <option key={index} value={table}>{table}</option>
        ))}
      </select>

      {loading ? (
        <p>Chargement des données...</p>
      ) : (
        <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #ccc", padding: "10px" }}>
          {columns.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {columns.map((col, index) => (
                    <th key={index} style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map((col, colIndex) => (
                      <td key={colIndex} style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>
                        {row[col]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Aucune donnée trouvée.</p>
          )}
        </div>
      )}

      {/* Bouton Retour au menu */}
      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: "20px",
          padding: "10px",
          width: "100%",
          backgroundColor: "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          justifyContent: "center",
        }}
      >
        Retour au menu
      </button>
    </div>
  );
};

export default ViewProducts;