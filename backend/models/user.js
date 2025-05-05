const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

const User = {
  // Get all users
  getAll: async () => {
    try {
      const [rows] = await pool.query(`
        SELECT id, username, email, role, created_at, last_login 
        FROM users
      `);
      return rows;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  },

  // Get user by ID
  getById: async (id) => {
    try {
      const [rows] = await pool.query(`
        SELECT id, username, email, role, created_at, last_login 
        FROM users 
        WHERE id = ?
      `, [id]);
      return rows[0];
    } catch (error) {
      console.error(`Error getting user by ID ${id}:`, error);
      throw error;
    }
  },

  // Get user by username
  getByUsername: async (username) => {
    try {
      const [rows] = await pool.query(`
        SELECT * 
        FROM users 
        WHERE username = ?
      `, [username]);
      return rows[0];
    } catch (error) {
      console.error(`Error getting user by username ${username}:`, error);
      throw error;
    }
  },

  // Get user by email
  getByEmail: async (email) => {
    try {
      const [rows] = await pool.query(`
        SELECT * 
        FROM users 
        WHERE email = ?
      `, [email]);
      return rows[0];
    } catch (error) {
      console.error(`Error getting user by email ${email}:`, error);
      throw error;
    }
  },

  // Create a new user
  create: async (userData) => {
    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      const [result] = await pool.query(`
        INSERT INTO users (id, username, password, email, role)
        VALUES (?, ?, ?, ?, ?)
      `, [
        userData.id || `USER${Date.now().toString().slice(-6)}`,
        userData.username,
        hashedPassword,
        userData.email,
        userData.role || 'User'
      ]);
      
      if (result.affectedRows) {
        return await User.getById(result.insertId || userData.id);
      }
      return null;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update a user
  update: async (id, userData) => {
    try {
      let query = 'UPDATE users SET ';
      const params = [];

      if (userData.username) {
        query += 'username = ?, ';
        params.push(userData.username);
      }

      if (userData.email) {
        query += 'email = ?, ';
        params.push(userData.email);
      }

      if (userData.role) {
        query += 'role = ?, ';
        params.push(userData.role);
      }

      if (userData.password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        query += 'password = ?, ';
        params.push(hashedPassword);
      }

      // Remove trailing comma and space
      query = query.slice(0, -2);
      query += ' WHERE id = ?';
      params.push(id);

      const [result] = await pool.query(query, params);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      throw error;
    }
  },

  // Delete a user
  delete: async (id) => {
    try {
      const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  },

  // Update last login timestamp
  updateLastLogin: async (id) => {
    try {
      const [result] = await pool.query(`
        UPDATE users 
        SET last_login = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error updating last login for user ${id}:`, error);
      throw error;
    }
  },

  // Verify password
  verifyPassword: async (plainPassword, hashedPassword) => {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error verifying password:', error);
      throw error;
    }
  }
};

module.exports = User;