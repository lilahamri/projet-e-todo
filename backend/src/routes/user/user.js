import { Router } from "express";
import { authRequired } from "../../middleware/auth.js";
import {
  register,
  login,
  getUser,
  getUserEmail,
  updateUser,
  deleteUser
} from "./user.query.js";

const router = Router();


router.post("/register", register);
router.post("/login", login);

router.get("/user", authRequired, getUser);
router.get("/users/:email", authRequired, getUserEmail);
router.put("/users/:id", authRequired, updateUser);
router.delete("/users/:id", authRequired, deleteUser);

export default router;
