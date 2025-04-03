import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const StockManagement = () => {
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState("");
    const [columns, setColumns] = useState([]);
    const [values, setValues] = useState({});
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    // Charger la liste des tables au démarrage
    useEffect(() => {
        fetch("http://localhost:5000/get_tables")
            .then((response) => response.json())
            .then((data) => setTables(data))
            .catch((error) => console.error("Erreur lors du chargement des tables:", error));
    }, []);

    // Charger les colonnes et leurs types lorsqu'une table est sélectionnée
    useEffect(() => {
        if (selectedTable) {
            fetch("http://localhost:5000/get_table_structure", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ table_name: selectedTable }),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.columns) {
                        setColumns(data.columns);
                        setValues(Object.fromEntries(data.columns.map(col => [col.name, ""])));
                    } else {
                        setColumns([]);
                        setValues({});
                    }
                })
                .catch((error) => {
                    console.error("Erreur lors du chargement des colonnes:", error);
                    setColumns([]);
                    setValues({});
                });
        }
    }, [selectedTable]);

    // Mettre à jour les valeurs des colonnes
    const handleValueChange = (colName, value) => {
        setValues(prevValues => ({
            ...prevValues,
            [colName]: value
        }));
    };

    // Vérification des types avant insertion
    const validateValues = () => {
        for (const col of columns) {
            const value = values[col.name];
            switch (col.type) {
                case "INTEGER":
                    if (!/^\d+$/.test(value)) return `La colonne ${col.name} doit être un entier.`;
                    break;
                case "FLOAT":
                    if (!/^\d+(\.\d+)?$/.test(value)) return `La colonne ${col.name} doit être un nombre décimal.`;
                    break;
                case "BOOLEAN":
                    if (!["true", "false"].includes(value.toLowerCase())) return `La colonne ${col.name} doit être 'true' ou 'false'.`;
                    break;
                case "DATE":
                    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return `La colonne ${col.name} doit être une date au format YYYY-MM-DD.`;
                    break;
                default:
                    break;
            }
        }
        return null;
    };

    // Gérer l'ajout des valeurs à la table
    const handleAddProduct = async () => {
        const error = validateValues();
        if (error) {
            setMessage(error);
            return;
        }

        const response = await fetch("http://localhost:5000/add_product", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                table_name: selectedTable,
                values: values
            })
        });

        const result = await response.json();
        setMessage(result.message || result.error);
    };

    return (
        <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
            <h2>Gestion de Stock - Snowflake</h2>

            {/* Sélectionner une table */}
            <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                style={{ padding: "10px", width: "100%", marginBottom: "10px" }}
            >
                <option value="">-- Sélectionner une table --</option>
                {tables.map((table, index) => (
                    <option key={index} value={table}>
                        {table}
                    </option>
                ))}
            </select>

            {/* Formulaire pour chaque colonne */}
            {columns.length > 0 && (
                <div>
                    {columns.map((col, index) => (
                        <div key={index} style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                            <input
                                type="text"
                                placeholder={`Valeur pour ${col.name}`}
                                value={values[col.name] || ""}
                                onChange={(e) => handleValueChange(col.name, e.target.value)}
                                style={{ flex: 1, padding: "10px", marginRight: "10px" }}
                            />
                            <span style={{ fontWeight: "bold" }}>{col.type}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Bouton Ajouter */}
            <button onClick={handleAddProduct} style={{ padding: "10px", width: "100%" }}>
                Ajouter au stock
            </button>

            {message && <p style={{ marginTop: "10px", color: "red" }}>{message}</p>}

            <button
                onClick={() => navigate("/")}
                style={{ marginTop: "20px", padding: "10px", width: "100%" }}
            >
                Retour au menu
            </button>
        </div>
    );
};

export default StockManagement;
