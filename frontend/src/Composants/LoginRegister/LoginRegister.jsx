import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import "./LoginRegister.css";

const LoginRegister = ({ setIsAuthenticated }) => {
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();

  const toggleForm = () => setIsRegister(!isRegister);

  // REGISTER
  const handleRegister = async (e) => {
    e.preventDefault();

    const name = e.target.name.value.trim();
    const firstname = e.target.firstname.value.trim();
    const email = e.target.email.value.trim();
    const password = e.target.password.value.trim();

    if (!name || !firstname || !email || !password) {
      alert("Veuillez remplir tous les champs !");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, firstname, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Erreur serveur");
        return;
      }

      alert("Inscription réussie, vous pouvez vous connecter !");
      setIsRegister(false); // revenir sur login
    } catch (error) {
      console.error(error);
      alert("Erreur de communication avec le serveur");
    }
  };

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();

    const email = e.target.email.value.trim();
    const password = e.target.password.value.trim();

    if (!email || !password) {
      alert("Veuillez remplir tous les champs !");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Identifiants incorrects");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("isAuthenticated", "true");

      setIsAuthenticated(true);
      navigate("/todo");
    } catch (error) {
      console.error(error);
      alert("Erreur serveur");
    }
  };

  return (
    <div className={`wrapper ${isRegister ? "active" : ""}`}>
      
      {/* LOGIN */}
      <div className="form-box login">
        <form onSubmit={handleLogin}>
          <h1>Login</h1>

          <div className="input-box">
            <input type="email" name="email" placeholder="Email" required />
            <FaEnvelope className="icon" />
          </div>

          <div className="input-box">
            <input type="password" name="password" placeholder="Password" required />
            <FaLock className="icon" />
          </div>

          <button type="submit">Login</button>

          <p>
            Don't have an account?{" "}
            <a href="#" onClick={(e) => { e.preventDefault(); toggleForm(); }}>Register</a>
          </p>
        </form>
      </div>

      {/* REGISTER */}
      <div className="form-box register">
        <form onSubmit={handleRegister}>
          <h1>Register</h1>

          <div className="input-box">
            <input type="text" name="firstname" placeholder="Firstname" required />
            <FaUser className="icon" />
          </div>

          <div className="input-box">
            <input type="text" name="name" placeholder="Name" required />
            <FaUser className="icon" />
          </div>

          <div className="input-box">
            <input type="email" name="email" placeholder="Email" required />
            <FaEnvelope className="icon" />
          </div>

          <div className="input-box">
            <input type="password" name="password" placeholder="Password" required />
            <FaLock className="icon" />
          </div>

        
          <button type="submit">Register</button>

          <p>
            Already have an account?{" "}
            <a href="#" onClick={(e) => { e.preventDefault(); toggleForm(); }}>Login</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginRegister;
