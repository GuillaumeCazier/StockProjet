import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddTable() {
  const [tableName, setTableName] = useState("");
  const [columns, setColumns] = useState([{ name: "", type: "TEXT" }]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleAddColumn = () => {
    setColumns([...columns, { name: "", type: "TEXT" }]);
  };

  const handleChangeColumn = (index, value) => {
    const newCols = [...columns];
    newCols[index].name = value;
    setColumns(newCols);
  };

  const handleChangeColumnType = (index, value) => {
    const newCols = [...columns];
    newCols[index].type = value;
    setColumns(newCols);
  };

  const handleCreateTable = async () => {
    if (!tableName || columns.some(col => col.name.trim() === "")) {
      setMessage("Merci de renseigner un nom de table et toutes les colonnes.");
      return;
    }

    const response = await fetch("http://localhost:5000/create_table", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        table_name: tableName,
        columns: columns
      })
    });

    const result = await response.json();
    setMessage(result.message || result.error);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <h2>Créer une Nouvelle Table</h2>

      <input
        type="text"
        placeholder="Nom de la table"
        value={tableName}
        onChange={(e) => setTableName(e.target.value)}
        style={{ padding: "10px", width: "100%", marginBottom: "10px" }}
      />

      {columns.map((col, index) => (
        <div key={index} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <input
            type="text"
            placeholder={`Nom de la colonne ${index + 1}`}
            value={col.name}
            onChange={(e) => handleChangeColumn(index, e.target.value)}
            style={{ padding: "10px", flex: "2" }}
          />

          <select
            value={col.type}
            onChange={(e) => handleChangeColumnType(index, e.target.value)}
            style={{ padding: "10px", flex: "1" }}
          >
            <option value="TEXT">TEXT</option>
            <option value="INTEGER">INTEGER</option>
            <option value="FLOAT">FLOAT</option>
            <option value="BOOLEAN">BOOLEAN</option>
            <option value="DATE">DATE</option>
          </select>
        </div>
      ))}

      <button
        onClick={handleAddColumn}
        style={{ padding: "10px", width: "100%", marginBottom: "10px" }}
      >
        Ajouter une colonne
      </button>

      <button
        onClick={handleCreateTable}
        style={{ padding: "10px", width: "100%" }}
      >
        Créer la table
      </button>

      {message && <p style={{ marginTop: "10px" }}>{message}</p>}

      <button
        onClick={() => navigate("/")}
        style={{ marginTop: "20px", padding: "10px", width: "100%" }}
      >
        Retour au menu
      </button>
    </div>
  );
}

export default AddTable;
