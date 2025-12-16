import connection from "../../config/db.js";


export const getTodos = async (req, res) => {
  try {
    const [rows] = await connection.promise().query("SELECT * FROM todo");
    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ msg: "Internal server error" });
  }
};


export const getTodo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ msg: "Bad parameter" });
    }

    const [rows] = await connection
      .promise()
      .query("SELECT * FROM todo WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ msg: "Not found" });
    }

    return res.status(200).json(rows[0]);
  } catch (err) {
    return res.status(500).json({ msg: "Internal server error" });
  }
};


export const getMyTodos = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await connection
      .promise()
      .query("SELECT * FROM todo WHERE user_id = ?", [userId]);

    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ msg: "Internal server error" });
  }
};


export const createTodo = async (req, res) => {
  try {
    const { title, description, due_time, user_id, status } = req.body;

    if (!title || !description || !due_time || !user_id) {
      return res.status(400).json({ msg: "Bad parameter" });
    }

    const todoStatus = status || "not started";

    const [{ insertId }] = await connection.promise().query(
      `INSERT INTO todo (title, description, due_time, user_id, status)
       VALUES (?, ?, ?, ?, ?)`,
      [title, description, due_time, user_id, todoStatus]
    );

    const [rows] = await connection
      .promise()
      .query("SELECT * FROM todo WHERE id = ?", [insertId]);

    return res.status(201).json(rows[0]);
  } catch (err) {
    return res.status(500).json({ msg: "Internal server error" });
  }
};


export const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, due_time, user_id, status } = req.body;

    if (!title || !description || !due_time || !user_id || !status) {
      return res.status(400).json({ msg: "Bad parameter" });
    }

    const [result] = await connection.promise().query(
      `UPDATE todo
       SET title = ?, description = ?, due_time = ?, user_id = ?, status = ?
       WHERE id = ?`,
      [title, description, due_time, user_id, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: "Not found" });
    }

    const [rows] = await connection
      .promise()
      .query("SELECT * FROM todo WHERE id = ?", [id]);

    return res.status(200).json(rows[0]);
  } catch (err) {
    return res.status(500).json({ msg: "Internal server error" });
  }
};


export const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ msg: "Bad parameter" });
    }

    const [result] = await connection
      .promise()
      .query("DELETE FROM todo WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: "Not found" });
    }

    return res
      .status(200)
      .json({ msg: `Successfully deleted record number: ${id}` });
  } catch (err) {
    return res.status(500).json({ msg: "Internal server error" });
  }
};
