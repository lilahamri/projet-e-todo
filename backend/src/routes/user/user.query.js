import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connection from "../../config/db.js";

export const register = async (req, res) => {
  try {
    const { email, password, name, firstname } = req.body;
    if (!email || !password || !name || !firstname) {
      return res.status(400).json({ msg: "Bad parameter" });
    }
    const [existing] = await connection.promise().query("SELECT id FROM user WHERE email = ?", [email]);
    if (existing.length > 0) return res.status(409).json({ msg: "Account already exists" });

    const hashedPwd = await bcrypt.hash(password, 10);
    const [{ insertId }] = await connection.promise().query(
      `INSERT INTO user (email, password, name, firstname) VALUES (?, ?, ?, ?)`,
      [email, hashedPwd, name, firstname]
    );
    const token = jwt.sign({ id: insertId }, process.env.SECRET);
    return res.status(201).json({ token });
  } catch (err) {
    return res.status(500).json({ msg: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: "Bad parameter" });

    const [rows] = await connection.promise().query("SELECT * FROM user WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(401).json({ msg: "Invalid Credentials" });

    const user = rows[0];
    const isValidPwd = await bcrypt.compare(password, user.password);
    if (!isValidPwd) return res.status(401).json({ msg: "Invalid Credentials" });

    const token = jwt.sign({ id: user.id }, process.env.SECRET);
    return res.status(200).json({ token });
  } catch (err) {
    return res.status(500).json({ msg: "Internal server error" });
  }
};

export const getUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await connection.promise().query("SELECT * FROM user WHERE id = ?", [userId]);
    if (rows.length === 0) return res.status(404).json({ msg: "Not found" });
    return res.status(200).json(rows[0]);
  } catch (err) {
    return res.status(500).json({ msg: "Internal server error" });
  }
};

export const getUserEmail = async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) return res.status(400).json({ msg: "Bad parameter" });
    const [rows] = await connection.promise().query("SELECT * FROM user WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(404).json({ msg: "Not found" });
    return res.status(200).json(rows[0]);
  } catch (err) {
    return res.status(500).json({ msg: "Internal server error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, name, firstname } = req.body;

    const [rows] = await connection.promise().query("SELECT * FROM user WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ msg: "Not found" });
    const currentUser = rows[0];

    const newEmail = email || currentUser.email;
    const newName = name || currentUser.name;
    const newFirstname = firstname || currentUser.firstname;

    let newPassword = currentUser.password;
    if (password && password.trim() !== "") {
        newPassword = await bcrypt.hash(password, 10);
    }

    await connection.promise().query(
      `UPDATE user SET email = ?, password = ?, name = ?, firstname = ? WHERE id = ?`,
      [newEmail, newPassword, newName, newFirstname, id]
    );

    const [updatedRows] = await connection.promise().query("SELECT * FROM user WHERE id = ?", [id]);
    return res.status(200).json(updatedRows[0]);
  } catch (err) {
    return res.status(500).json({ msg: "Internal server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await connection.promise().query("DELETE FROM user WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ msg: "Not found" });
    return res.status(200).json({ msg: `Successfully deleted record number: ${id}` });
  } catch (err) {
    return res.status(500).json({ msg: "Internal server error" });
  }
};