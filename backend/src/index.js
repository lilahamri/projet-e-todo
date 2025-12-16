import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import userRoutes from "./routes/user/user.js";
import todosRoutes from "./routes/todos/todos.js";

dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());


app.use(userRoutes);
app.use(todosRoutes);

app.listen(3001, () => {
  console.log("Serveur lancé sur le port 3001");
});
