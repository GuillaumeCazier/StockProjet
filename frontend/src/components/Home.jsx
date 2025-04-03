import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-bold">Gestion du Stock</h1>
      <button 
        className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        onClick={() => navigate("/modify")}
      >
        Modifier
      </button>
      <button 
        className="px-4 py-2 bg-green-500 text-white rounded-lg"
        onClick={() => navigate("/add")}
      >
        Ajouter
      </button>
      <button 
        className="px-4 py-2 bg-green-500 text-white rounded-lg"
        onClick={() => navigate("/view")}
      >
        Visualiser
      </button>
    </div>
  );
}

export default Home;