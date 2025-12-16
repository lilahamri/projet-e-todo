import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Todo.css";

function Todo({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // --- ETATS ---
  const [tasks, setTasks] = useState([]);
  const [userId, setUserId] = useState(null); 

  // Formulaire
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueTime, setDueTime] = useState(""); 
  
  // Édition
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDueTime, setEditDueTime] = useState("");

  // Profil
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePassword, setProfilePassword] = useState("");

  // --- CHARGEMENT ---
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:3001/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.id) {
            setUserId(data.id);
            setProfileEmail(data.email);
        }
      } catch (err) { console.error(err); }
    };
    fetchTodos();
    fetchUser();
  }, [token]);

  const fetchTodos = async () => {
    try {
      const res = await fetch("http://localhost:3001/todos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const formatDateForDb = (isoString) => {
    if (!isoString) return null;
    try {
        return new Date(isoString).toISOString().slice(0, 19).replace('T', ' ');
    } catch (e) { return isoString; }
  };

  // --- ACTIONS ---
  const addTask = async () => {
    if (!title.trim()) return;
    try {
      await fetch("http://localhost:3001/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
            title, 
            description, 
            due_time: dueTime, 
            status: "todo", // Important: on garde "todo" pour la base de données
            user_id: userId 
        }),
      });
      setTitle(""); setDescription(""); setDueTime("");
      fetchTodos();
    } catch (err) { console.error(err); }
  };

  const handleDragStart = (e, taskId) => e.dataTransfer.setData("taskId", taskId);
  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = async (e, newStatus) => {
    const taskId = e.dataTransfer.getData("taskId");
    const task = tasks.find(t => t.id.toString() === taskId.toString());
    if (!task || task.status === newStatus) return;
    
    const updatedTasks = tasks.map(t => t.id.toString() === taskId.toString() ? { ...t, status: newStatus } : t);
    setTasks(updatedTasks);
    
    try {
      await fetch(`http://localhost:3001/todos/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: task.title, description: task.description, due_time: formatDateForDb(task.due_time), 
          status: newStatus, user_id: userId || task.user_id 
        }),
      });
    } catch (err) { fetchTodos(); }
  };

  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description);
    if (task.due_time) setEditDueTime(new Date(task.due_time).toISOString().slice(0, 16));
    else setEditDueTime("");
  };

  const saveEdit = async () => {
    const task = tasks.find(t => t.id === editingTaskId);
    try {
      await fetch(`http://localhost:3001/todos/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: editTitle, description: editDescription, due_time: formatDateForDb(editDueTime), 
          status: task.status, user_id: userId
        }),
      });
      setEditingTaskId(null);
      fetchTodos();
    } catch (err) { console.error("Erreur edit:", err); }
  };

  const deleteTask = async (id) => {
    try {
      await fetch(`http://localhost:3001/todos/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      fetchTodos();
    } catch (err) { console.error(err); }
  };

  // --- LOGOUT & COMPTE ---
  const handleLogout = () => {
    localStorage.removeItem("token");
    if (setIsAuthenticated) setIsAuthenticated(false);
    navigate("/", { replace: true });
  };

  const handleDeleteAccount = async () => {
    if (!userId || !window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ?")) return;
    try {
      await fetch(`http://localhost:3001/users/${userId}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      handleLogout();
    } catch (err) { console.error(err); }
  };

  const handleSaveProfile = async () => {
    if (!userId) return;
    const bodyData = { email: profileEmail };
    if (profilePassword.trim() !== "") bodyData.password = profilePassword;
    try {
      const res = await fetch(`http://localhost:3001/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(bodyData),
      });
      if (res.ok) {
        alert("Profil mis à jour !");
        setShowProfileModal(false);
        setProfilePassword("");
      } else {
        alert("Erreur lors de la mise à jour.");
      }
    } catch (err) { console.error(err); }
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit"
    }).replace(",", " à");
  };

  return (
    <div className="todo-wrapper">
      <div className="todo-header">
        <h2>Ma To-Do List</h2>
        
        <div className="header-buttons">
            <button className="btn-header btn-profile" onClick={() => setShowProfileModal(true)}>
                ⚙️ Modifier Profil
            </button>
            <button className="btn-header btn-account" onClick={handleDeleteAccount}>
                🗑️ Supprimer Compte
            </button>
            <button className="btn-header btn-logout" onClick={handleLogout}>
                🔒 Déconnexion
            </button>
        </div>
      </div>

      <div className="input-box">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre..." />
        <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description..." />
        <input type="datetime-local" value={dueTime} onChange={e => setDueTime(e.target.value)} />
        <button className="add" onClick={addTask}>Ajouter</button>
      </div>
      
      <div className="columns">
        {/* ICI LA CORRECTION : On garde les clés anglaises pour la logique, mais on affiche en Français */}
        {["todo", "in progress", "done"].map(columnStatus => (
          <div 
            key={columnStatus} 
            className={`column ${columnStatus.replace(" ", "-")}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, columnStatus)}
          >
            {/* Affichage du titre en Français selon la colonne */}
            <h3>
                {columnStatus === 'todo' ? 'À FAIRE' : 
                 columnStatus === 'in progress' ? 'EN COURS' : 
                 'TERMINÉES'}
            </h3>

            {tasks.filter(t => {
                // On compare avec les status anglais de la BDD
                if (columnStatus === "todo") return t.status === "todo" || t.status === "not started" || !t.status;
                return t.status === columnStatus;
              }).map((task) => (
                <div key={task.id} className="task" draggable={true} onDragStart={(e) => handleDragStart(e, task.id)} style={{cursor: 'grab'}}> 
                  {editingTaskId === task.id ? (
                    <div className="edit-box">
                      <input value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                      <input value={editDescription} onChange={e => setEditDescription(e.target.value)} />
                      <input type="datetime-local" value={editDueTime} onChange={e => setEditDueTime(e.target.value)} />
                      <div className="edit-actions">
                         <button onClick={saveEdit} style={{background: '#b28eff', color:'white', border:'none', padding:'5px', borderRadius:'5px'}}>OK</button>
                         <button onClick={() => setEditingTaskId(null)} style={{background: '#ff7f91', color:'white', border:'none', padding:'5px', borderRadius:'5px'}}>X</button>
                      </div>
                    </div>
                  ) : (
                    <div className="task-content">
                      {/* Correction de la faute de frappe "doTerminerne" */}
                      <span className={task.status === "done" ? "done" : ""}><b>{task.title}</b></span>
                      <p>{task.description}</p>
                      <small>⏰ {formatDateDisplay(task.due_time)}</small>
                    </div>
                  )}
                  <div className="button-group">
                    <button className="edit" onClick={() => startEditing(task)}>✏️</button>
                    <button className="delete" onClick={() => deleteTask(task.id)}>❌</button>
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>

      {showProfileModal && (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Modifier mon profil</h2>
                
                <label>Email :</label>
                <input 
                    type="email" 
                    value={profileEmail} 
                    onChange={(e) => setProfileEmail(e.target.value)} 
                />
                
                <label>Nouveau mot de passe :</label>
                <input 
                    type="password" 
                    placeholder="Laisser vide si inchangé" 
                    value={profilePassword} 
                    onChange={(e) => setProfilePassword(e.target.value)} 
                />
                
                <div className="modal-actions">
                    <button className="btn-save" onClick={handleSaveProfile}>Enregistrer</button>
                    <button className="btn-cancel" onClick={() => setShowProfileModal(false)}>Annuler</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

export default Todo;