import sqlite3 from 'sqlite3'
import path from 'path'
import bcrypt from 'bcryptjs'

// Set up SQLite database
const DB_PATH = path.join(process.cwd(), 'database_university.db')
const db = new sqlite3.Database(DB_PATH)

// Initialize database and create tables
export const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          program TEXT,
          year INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating users table:', err)
          reject(err)
          return
        }

        // Create some mock data if table is empty
        db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
          if (err) {
            reject(err)
            return
          }

          if (row.count === 0) {
            // Insert default admin/mock user
            const defaultUsers = [
              {
                student_id: '12345',
                name: 'John Doe',
                email: 'john.doe@university.edu',
                password: 'password123',
                program: 'Computer Science',
                year: 3
              }
            ]

            const stmt = db.prepare(`
              INSERT INTO users (student_id, name, email, password_hash, program, year)
              VALUES (?, ?, ?, ?, ?, ?)
            `)

            defaultUsers.forEach(user => {
              bcrypt.hash(user.password, 10, (err, hash) => {
                if (err) {
                  console.error('Error hashing password:', err)
                  return
                }

                stmt.run(user.student_id, user.name, user.email, hash, user.program, user.year)
              })
            })

            stmt.finalize((err) => {
              if (err) {
                reject(err)
                return
              }
              console.log('Database initialized with default users')
              resolve()
            })
          } else {
            resolve()
          }
        })
      })
    })
  })
}

// User operations
export const findUserByStudentId = (studentId) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE student_id = ?', [studentId], (err, row) => {
      if (err) {
        reject(err)
        return
      }
      resolve(row)
    })
  })
}

export const findUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
      if (err) {
        reject(err)
        return
      }
      resolve(row)
    })
  })
}

export const createUser = (userData) => {
  return new Promise((resolve, reject) => {
    const { studentId, name, email, password, program, year } = userData

    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        reject(err)
        return
      }

      db.run(`
        INSERT INTO users (student_id, name, email, password_hash, program, year)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [studentId, name, email, hash, program, year], function(err) {
        if (err) {
          reject(err)
          return
        }

        // Return user data (without password)
        db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err, row) => {
          if (err) {
            reject(err)
            return
          }

          // Remove password hash from response
          const { password_hash, ...userWithoutPassword } = row
          resolve(userWithoutPassword)
        })
      })
    })
  })
}

export const verifyPassword = (studentId, password) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE student_id = ?', [studentId], (err, row) => {
      if (err) {
        reject(err)
        return
      }

      if (!row) {
        resolve(false)
        return
      }

      bcrypt.compare(password, row.password_hash, (err, isValid) => {
        if (err) {
          reject(err)
          return
        }

        if (isValid) {
          // Remove password hash from response
          const { password_hash, ...userWithoutPassword } = row
          resolve(userWithoutPassword)
        } else {
          resolve(false)
        }
      })
    })
  })
}

export const closeDatabase = () => {
  db.close()
}

// Export for use in auth service
export default db
