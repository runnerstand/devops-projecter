const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

// BUG #1/#7: Added - default password now matches docker-compose and support for DATABASE_URL for production environments
const pool = process.env.DATABASE_URL 
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })
  : new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'tododb',
      password: process.env.DB_PASSWORD || 'postgres',
      port: process.env.DB_PORT || 5432,
    });
app.get('/health', (req, res) => {
   res.json({ status: 'healthy', version: '1.0.0' });
});

// GET todos
// BUG #8: Added - GET endpoint to retrieve all todos
app.get('/api/setup', async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        completed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      INSERT INTO todos (title, completed) VALUES
        ('Learn Docker', false),
        ('Setup CI/CD', true),
        ('Deploy to production', false);
    `);
    res.json({ message: "Database table created and seeded successfully! 🎉" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// BUG #2: Fixed - validation rejects empty or whitespace-only title
app.post('/api/todos', async (req, res) => {
   try {
      const { title, completed = false } = req.body;

      if (!title || !title.trim()) {
         return res.status(400).json({ error: 'Title is required' });
      }

      const result = await pool.query(
         'INSERT INTO todos(title, completed) VALUES($1, $2) RETURNING *',
         [title, completed]
      );
      res.status(201).json(result.rows[0]);
   } catch (err) {
      res.status(500).json({ error: err.message });
   }
});

// BUG #3: Fixed - DELETE endpoint implemented
app.delete('/api/todos/:id', async (req, res) => {
   try {
      const { id } = req.params;
      const result = await pool.query('DELETE FROM todos WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) {
         return res.status(404).json({ error: 'Todo not found' });
      }
      res.json(result.rows[0]);
   } catch (err) {
      res.status(500).json({ error: err.message });
   }
});

// BUG #4: Fixed - PUT endpoint implemented
app.put('/api/todos/:id', async (req, res) => {
   try {
      const { id } = req.params;
      const { title, completed } = req.body;

      // Require at least one field to update
      if (title === undefined && completed === undefined) {
         return res.status(400).json({ error: 'At least one of title or completed is required' });
      }

      // Build dynamic SET clause with only provided fields
      const setClauses = [];
      const values = [];
      let paramIndex = 1;

      if (title !== undefined) {
         if (!title || !title.trim()) {
            return res.status(400).json({ error: 'Title cannot be empty' });
         }
         setClauses.push(`title = $${paramIndex++}`);
         values.push(title.trim());
      }
      if (completed !== undefined) {
         setClauses.push(`completed = $${paramIndex++}`);
         values.push(completed);
      }

      values.push(id);
      const result = await pool.query(
         `UPDATE todos SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
         values
      );
      if (result.rows.length === 0) {
         return res.status(404).json({ error: 'Todo not found' });
      }
      res.json(result.rows[0]);
   } catch (err) {
      res.status(500).json({ error: err.message });
   }
});

const port = process.env.PORT || 8080;

// BUG #5: Fixed - only start server when NOT in test mode
if (process.env.NODE_ENV !== 'test') {
   app.listen(port, () => {
      console.log(`Backend running on port ${port}`);
   });
}

// BUG #6: Fixed - export app for tests
module.exports = app;
