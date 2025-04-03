import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import StockManagement from "./components/StockManagement";
import ViewProducts from "./components/ViewProducts";
import AddTable from "./components/AddTable";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/modify" element={<StockManagement />} />
        <Route path="/view" element={<ViewProducts />} />
        <Route path="/add" element={<AddTable />} />
      </Routes>
    </Router>
  );
}

export default App;
