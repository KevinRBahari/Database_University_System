import sqlite3 from 'sqlite3'
import path from 'path'
import bcrypt from 'bcryptjs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Set up SQLite database
const DB_PATH = path.join(__dirname, 'database_university.db')
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

        // Create courses table
        db.run(`
          CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_code TEXT UNIQUE NOT NULL,
            course_name TEXT NOT NULL,
            description TEXT,
            credits INTEGER NOT NULL,
            instructor TEXT,
            semester TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) {
            console.error('Error creating courses table:', err)
            reject(err)
            return
          }

          // Create enrollments table
          db.run(`
            CREATE TABLE IF NOT EXISTS enrollments (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              student_id INTEGER NOT NULL,
              course_id INTEGER NOT NULL,
              grade TEXT,
              enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (student_id) REFERENCES users (id),
              FOREIGN KEY (course_id) REFERENCES courses (id),
              UNIQUE(student_id, course_id)
            )
          `, (err) => {
            if (err) {
              console.error('Error creating enrollments table:', err)
              reject(err)
              return
            }

            // Check if users table is empty and add mock data
            db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
              if (err) {
                reject(err)
                return
              }

              if (row.count === 0) {
                // Insert default users
                const defaultUsers = [
                  {
                    student_id: '12345',
                    name: 'John Doe',
                    email: 'john.doe@university.edu',
                    password: 'password123',
                    program: 'Computer Science',
                    year: 3
                  },
                  {
                    student_id: '67890',
                    name: 'Jane Smith',
                    email: 'jane.smith@university.edu',
                    password: 'password123',
                    program: 'Business Administration',
                    year: 2
                  },
                  {
                    student_id: '11111',
                    name: 'Bob Johnson',
                    email: 'bob.johnson@university.edu',
                    password: 'password123',
                    program: 'Engineering',
                    year: 4
                  }
                ]

                const stmt = db.prepare(`
                  INSERT INTO users (student_id, name, email, password_hash, program, year)
                  VALUES (?, ?, ?, ?, ?, ?)
                `)

                let completed = 0
                defaultUsers.forEach(user => {
                  bcrypt.hash(user.password, 10, (err, hash) => {
                    if (err) {
                      console.error('Error hashing password:', err)
                      return
                    }

                    stmt.run(user.student_id, user.name, user.email, hash, user.program, user.year)
                    completed++

                    if (completed === defaultUsers.length) {
                      stmt.finalize((err) => {
                        if (err) {
                          reject(err)
                          return
                        }

                        // Add some mock courses
                        const defaultCourses = [
                          { course_code: 'CS101', course_name: 'Introduction to Computer Science', description: 'Basic programming concepts', credits: 3, instructor: 'Dr. Smith', semester: 'Fall 2024' },
                          { course_code: 'CS201', course_name: 'Data Structures', description: 'Advanced data structures and algorithms', credits: 4, instructor: 'Dr. Johnson', semester: 'Spring 2025' },
                          { course_code: 'MATH101', course_name: 'Calculus I', description: 'Differential and integral calculus', credits: 4, instructor: 'Prof. Davis', semester: 'Fall 2024' }
                        ]

                        const courseStmt = db.prepare(`
                          INSERT INTO courses (course_code, course_name, description, credits, instructor, semester)
                          VALUES (?, ?, ?, ?, ?, ?)
                        `)

                        defaultCourses.forEach(course => {
                          courseStmt.run(course.course_code, course.course_name, course.description, course.credits, course.instructor, course.semester)
                        })

                        courseStmt.finalize((err) => {
                          if (err) {
                            reject(err)
                            return
                          }
                          console.log('Database initialized with default data')
                          resolve()
                        })
                      })
                    }
                  })
                })
              } else {
                resolve()
              }
            })
          })
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

export const findUserById = (id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
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

// Course operations
export const getAllCourses = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM courses ORDER BY course_code', (err, rows) => {
      if (err) {
        reject(err)
        return
      }
      resolve(rows)
    })
  })
}

export const getCourseById = (id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM courses WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err)
        return
      }
      resolve(row)
    })
  })
}

// Enrollment operations
export const enrollStudent = (studentId, courseId) => {
  return new Promise((resolve, reject) => {
    // First check if user exists
    findUserByStudentId(studentId).then(user => {
      if (!user) {
        reject(new Error('Student not found'))
        return
      }

      // Then enroll
      db.run(`
        INSERT INTO enrollments (student_id, course_id)
        VALUES (?, ?)
      `, [user.id, courseId], function(err) {
        if (err) {
          reject(err)
          return
        }
        resolve({ id: this.lastID })
      })
    }).catch(reject)
  })
}

export const getStudentEnrollments = (studentId) => {
  return new Promise((resolve, reject) => {
    findUserByStudentId(studentId).then(user => {
      if (!user) {
        reject(new Error('Student not found'))
        return
      }

      db.all(`
        SELECT e.*, c.course_code, c.course_name, c.description, c.credits, c.instructor, c.semester
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE e.student_id = ?
        ORDER BY c.course_code
      `, [user.id], (err, rows) => {
        if (err) {
          reject(err)
          return
        }
        resolve(rows)
      })
    }).catch(reject)
  })
}

export const closeDatabase = () => {
  db.close()
}

// Export for use
export default db
