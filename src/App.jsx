import React from "react";
import "./App.css";
import CodeEditor from "./CodeEditor";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import "./App.css";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import "./i18n.js";

function App() {
  return (
    <div className="app-container">
      <Header />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/" element={<CodeEditor class="CodeEditor" />} />
        </Routes>
      </BrowserRouter>
      <Footer />
    </div>
  );
}

export default App;