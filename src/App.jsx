import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";

import Blank from "./pages/Blank";
import Dashboard from "./pages/Dashboard";
import Group from "./pages/Group";

import MainLayout from "./layout/MainLayout";

import "./assets/libs/boxicons-2.1.1/css/boxicons.min.css";
import "./scss/App.scss";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="Home" element={<Blank />} />
          <Route path="Group" element={<Group />} />
          <Route path="Students" element={<Blank />} />
          <Route path="Stats" element={<Blank />} />
          <Route path="Export" element={<Blank />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
