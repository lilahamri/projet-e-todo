import { Router } from "express";
import { authRequired } from "../../middleware/auth.js";
import {
  getTodos,
  getTodo,
  getMyTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from "./todos.query.js";

const router = Router();


router.get("/todos", authRequired, getTodos);
router.get("/todos/:id", authRequired, getTodo);
router.get("/user/todos", authRequired, getMyTodos);
router.post("/todos", authRequired, createTodo);
router.put("/todos/:id", authRequired, updateTodo);
router.delete("/todos/:id", authRequired, deleteTodo);

export default router;
