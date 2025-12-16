import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import LoginRegister from "./Composants/LoginRegister/LoginRegister";
import Todo from "./Composants/Todo/Todo"; 

function App() {
  // On vérifie si un token existe pour rester connecté au rafraîchissement (F5)
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<LoginRegister setIsAuthenticated={setIsAuthenticated} />}
        />

        <Route
          path="/todo"
          element={
            isAuthenticated ? (
              // 👇 C'EST LA LIGNE IMPORTANTE : On passe la fonction à Todo
              <Todo setIsAuthenticated={setIsAuthenticated} />
            ) : (
              // Sinon on redirige vers l'accueil
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;