from flask import Flask, request, jsonify
from flask_cors import CORS
from snowflake.snowpark import Session

app = Flask(__name__)
CORS(app)

# Connexion Snowflake avec Snowpark
def get_session():
    connection_params = {
        "account": "MUMWWSR-DL78402",
        "user": "GCAZIER",
        "password": "uDu:PBD9F:WvdmV",
        "role": "SYSADMIN",
        "warehouse": "COMPUTE_WH",
        "database": "STOCK",
        "schema": "PUBLIC"
    }
    return Session.builder.configs(connection_params).create()

@app.route("/add_product", methods=["POST"])
def add_product():
    try:
        data = request.json
        table_name = data.get("table_name")
        values = data.get("values", {})

        if not table_name or not values:
            return jsonify({"error": "Données incomplètes"}), 400

        session = get_session()

        # Générer dynamiquement la requête SQL
        columns = ", ".join(values.keys())
        values_placeholders = ", ".join(f"'{v}'" for v in values.values())

        query = f"INSERT INTO {table_name} ({columns}) VALUES ({values_placeholders})"
        session.sql(query).collect()
        session.close()

        return jsonify({"message": f"Valeurs ajoutées à {table_name} avec succès!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# Récupérer la liste des tables
@app.route("/get_tables", methods=["GET"])
def get_tables():
    try:
        session = get_session()  # Ouvre une session Snowflake
        tables = session.sql("SHOW TABLES").collect()  # Exécute la requête SQL
        session.close()  # Ferme la session après utilisation

        table_names = [table['name'] for table in tables]  # Récupère les noms des tables
        return jsonify(table_names)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# Récupérer le contenu d'une table sélectionnée
@app.route("/get_table_data", methods=["POST"])
def get_table_data():
    try:
        table_name = request.json.get("table_name")
        if not table_name:
            return jsonify({"error": "Nom de table manquant"}), 400

        session = get_session()  # Ouvre une session Snowflake
        rows = session.sql(f"SELECT * FROM {table_name} LIMIT 100").collect()
        session.close()  # Ferme la session après utilisation

        if rows:
            columns = rows[0].as_dict().keys()
            data = [row.as_dict() for row in rows]
        else:
            # Requête alternative pour récupérer les colonnes même si aucune ligne
            desc_result = session.sql(f"DESC TABLE {table_name}").collect()
            columns = [col["name"] for col in desc_result]
            data = []

        return jsonify({"columns": list(columns), "data": data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route pour obtenir les colonnes d'une table
@app.route("/get_table_columns", methods=["POST"])
def get_table_columns():
    try:
        # Récupérer les données de la requête
        data = request.json
        table_name = data.get("table_name")

        # Vérifier si le nom de la table est fourni
        if not table_name:
            return jsonify({"error": "Nom de la table manquant"}), 400

        # Obtenir la session Snowpark
        session = get_session()

        # Charger la table dans un DataFrame
        df = session.table(table_name)

        # Obtenir les colonnes du DataFrame
        columns = df.columns

        # Retourner les colonnes sous forme de JSON
        return jsonify({"columns": columns})

    except Exception as e:
        # Si une erreur se produit, retourner l'erreur
        return jsonify({"error": str(e)}), 500
        
# Route pour obtenir les colonnes d'une table
@app.route("/create_table", methods=["POST"])
def create_table():
    try:
        data = request.json
        table_name = data.get("table_name")
        columns = data.get("columns")

        if not table_name or not columns:
            return jsonify({"error": "Nom de table ou colonnes manquantes"}), 400

        # Liste des types de données valides en Snowflake
        valid_types = {"TEXT", "INTEGER", "FLOAT", "BOOLEAN", "DATE"}

        # Construire les définitions des colonnes avec leurs types
        column_defs = []
        for col in columns:
            col_name = col.get("name")
            col_type = col.get("type", "TEXT").upper()

            if not col_name or col_type not in valid_types:
                return jsonify({"error": f"Colonne invalide : {col_name} ({col_type})"}), 400
            
            column_defs.append(f'"{col_name}" {col_type}')  # Ajout de guillemets pour éviter les conflits avec les mots-clés

        # Construire la requête SQL de création de table
        create_query = f'CREATE TABLE IF NOT EXISTS "{table_name}" ({", ".join(column_defs)})'

        # Exécuter la requête sur Snowflake
        session = get_session()
        session.sql(create_query).collect()
        session.close()

        return jsonify({"message": f"Table '{table_name}' créée avec succès."})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/get_table_structure", methods=["POST"])
def get_table_structure():
    try:
        data = request.json
        table_name = data.get("table_name")

        if not table_name:
            return jsonify({"error": "Nom de table manquant"}), 400

        session = get_session()

        # Récupérer les colonnes et leurs types depuis Snowflake
        query = f"DESC TABLE {table_name}"
        result = session.sql(query).collect()
        
        # Transformer le résultat en liste de dictionnaires avec nom et type
        columns = [{"name": row[0], "type": row[1]} for row in result]

        session.close()

        return jsonify({"columns": columns})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
