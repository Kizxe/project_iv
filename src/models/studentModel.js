const pool = require('../db');

const getAllStudents = async () => {
  const result = await pool.query('SELECT * FROM students ORDER BY id ASC');
  return result.rows;
};

const getStudentById = async (id) => {
  const result = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
  return result.rows[0];
};

const createStudent = async (name, email, course) => {
  const result = await pool.query(
    'INSERT INTO students (name, email, course) VALUES ($1, $2, $3) RETURNING *',
    [name, email, course]
  );
  return result.rows[0];
};

const updateStudent = async (id, name, email, course) => {
  const result = await pool.query(
    'UPDATE students SET name=$1, email=$2, course=$3 WHERE id=$4 RETURNING *',
    [name, email, course, id]
  );
  return result.rows[0];
};

const deleteStudent = async (id) => {
  await pool.query('DELETE FROM students WHERE id = $1', [id]);
};

module.exports = { getAllStudents, getStudentById, createStudent, updateStudent, deleteStudent };