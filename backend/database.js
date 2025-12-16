import sqlite3 from 'sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'university_system.db');
const db = new sqlite3.Database(DB_PATH);

//Init Database
export const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      //Create all tables
      const tables = [
        //Department
        `CREATE TABLE IF NOT EXISTS departments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          dept_code TEXT UNIQUE NOT NULL,
          dept_name TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        //User
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          user_type TEXT NOT NULL CHECK(user_type IN ('student', 'instructor', 'admin')),
          gender TEXT CHECK(gender IN ('Male', 'Female', 'Other')),
          date_of_birth DATE,
          contact_phone TEXT,
          contact_address TEXT,
          is_approved INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        //Student
        `CREATE TABLE IF NOT EXISTS students (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL UNIQUE,
          student_id TEXT UNIQUE NOT NULL,
          college TEXT,
          major TEXT,
          year_of_study INTEGER,
          enrollment_year INTEGER,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`,
        
        //Instructor
        `CREATE TABLE IF NOT EXISTS instructors (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL UNIQUE,
          instructor_id TEXT UNIQUE NOT NULL,
          dept_id INTEGER NOT NULL,
          title TEXT,
          office_location TEXT,
          office_hours TEXT,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (dept_id) REFERENCES departments(id)
        )`,
        
        //Semester
        `CREATE TABLE IF NOT EXISTS semesters (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          semester_code TEXT UNIQUE NOT NULL,
          semester_name TEXT NOT NULL,
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          registration_start DATE,
          registration_end DATE,
          is_active INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        //Course
        `CREATE TABLE IF NOT EXISTS courses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          course_code TEXT UNIQUE NOT NULL,
          course_name TEXT NOT NULL,
          description TEXT,
          credits INTEGER NOT NULL,
          dept_id INTEGER NOT NULL,
          course_type TEXT CHECK(course_type IN ('general_required', 'major_required', 'major_elective', 'university_elective', 'practical')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (dept_id) REFERENCES departments(id)
        )`,
        
        //Course Prerequisite
        `CREATE TABLE IF NOT EXISTS course_prerequisites (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          course_id INTEGER NOT NULL,
          prerequisite_course_id INTEGER NOT NULL,
          minimum_grade TEXT DEFAULT 'D',
          FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
          FOREIGN KEY (prerequisite_course_id) REFERENCES courses(id) ON DELETE CASCADE,
          UNIQUE(course_id, prerequisite_course_id)
        )`,
        
        //Time Slot
        `CREATE TABLE IF NOT EXISTS time_slots (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          day_of_week TEXT NOT NULL CHECK(day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
          start_time TIME NOT NULL,
          end_time TIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        //Course Section
        `CREATE TABLE IF NOT EXISTS course_sections (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          section_code TEXT UNIQUE NOT NULL,
          course_id INTEGER NOT NULL,
          semester_id INTEGER NOT NULL,
          instructor_id INTEGER NOT NULL,
          max_capacity INTEGER NOT NULL DEFAULT 30,
          current_enrollment INTEGER DEFAULT 0,
          room_location TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
          FOREIGN KEY (semester_id) REFERENCES semesters(id),
          FOREIGN KEY (instructor_id) REFERENCES instructors(id)
        )`,
        
        //Section Time Slot
        `CREATE TABLE IF NOT EXISTS section_time_slots (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          section_id INTEGER NOT NULL,
          time_slot_id INTEGER NOT NULL,
          FOREIGN KEY (section_id) REFERENCES course_sections(id) ON DELETE CASCADE,
          FOREIGN KEY (time_slot_id) REFERENCES time_slots(id) ON DELETE CASCADE,
          UNIQUE(section_id, time_slot_id)
        )`,
        
        //Enrollment
        `CREATE TABLE IF NOT EXISTS enrollments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id INTEGER NOT NULL,
          section_id INTEGER NOT NULL,
          enrollment_status TEXT NOT NULL DEFAULT 'enrolled' CHECK(enrollment_status IN ('enrolling', 'enrolled', 'dropped', 'passed', 'failed', 'retake_pending')),
          final_grade TEXT,
          numeric_grade REAL,
          grade_points REAL,
          enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
          FOREIGN KEY (section_id) REFERENCES course_sections(id) ON DELETE CASCADE,
          UNIQUE(student_id, section_id)
        )`,
        
        //Grade Scale
        `CREATE TABLE IF NOT EXISTS grade_scale (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          letter_grade TEXT UNIQUE NOT NULL,
          min_percentage REAL NOT NULL,
          max_percentage REAL NOT NULL,
          grade_points REAL NOT NULL
        )`
      ];

      //Execute table creation
      let completed = 0;
      tables.forEach((sql, index) => {
        db.run(sql, (err) => {
          if (err) {
            console.error(`Error creating table ${index}:`, err);
            reject(err);
            return;
          }
          completed++;
          if (completed === tables.length) {
            seedDatabase().then(resolve).catch(reject);
          }
        });
      });
    });
  });
};

const seedDatabase = () => {
  return new Promise((resolve, reject) => {
    db.get("SELECT COUNT(*) as count FROM users", async (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      if (row.count === 0) {
        try {
          console.log('demo accounts');
          
          //Insert departments
          const depts = [
            ['CSE', 'Computer Science and Engineering'],
            ['EE', 'Electrical Engineering'],
            ['ME', 'Mechanical Engineering'],
            ['MATH', 'Mathematics'],
            ['PHYS', 'Physics']
          ];

          for (const [code, name] of depts) {
            await runQuery('INSERT INTO departments (dept_code, dept_name) VALUES (?, ?)', [code, name]);
          }
          console.log('✅ Departments created');

          //Insert admin user
          const adminHash = await bcrypt.hash('admin123', 10);
          await runQuery(
            `INSERT INTO users (user_id, name, email, password_hash, user_type, is_approved) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            ['99999', 'System Administrator', 'admin@university.edu', adminHash, 'admin', 1]
          );
          console.log('✅ Admin account created (ID: 99999, Password: admin123)');

          //Insert DEMO Student
          const studentHash = await bcrypt.hash('student123', 10);
          const studentResult = await runQuery(
            `INSERT INTO users (user_id, name, email, password_hash, user_type, gender, date_of_birth, contact_phone, is_approved) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            ['10001', 'Alice Johnson', 'alice.student@university.edu', studentHash, 'student', 'Female', '2003-05-15', '+1234567890', 1]
          );
          await runQuery(
            `INSERT INTO students (user_id, student_id, college, major, year_of_study, enrollment_year) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [studentResult.lastID, '10001', 'Engineering', 'Computer Science', 3, 2022]
          );
          console.log('✅ Demo STUDENT account created (ID: 10001, Password: student123)');

          //Insert more sample student
          const students = [
            ['10002', 'Bob Smith', 'bob.smith@university.edu', '10002', 'Engineering', 'Electrical Engineering', 2, 2023],
            ['10003', 'Charlie Brown', 'charlie.brown@university.edu', '10003', 'Engineering', 'Mechanical Engineering', 4, 2021]
          ];

          for (const [uid, name, email, sid, college, major, year, enroll] of students) {
            const result = await runQuery(
              `INSERT INTO users (user_id, name, email, password_hash, user_type, is_approved) 
               VALUES (?, ?, ?, ?, ?, ?)`,
              [uid, name, email, studentHash, 'student', 1]
            );
            await runQuery(
              `INSERT INTO students (user_id, student_id, college, major, year_of_study, enrollment_year) 
               VALUES (?, ?, ?, ?, ?, ?)`,
              [result.lastID, sid, college, major, year, enroll]
            );
          }
          console.log('✅ Additional students created');

          //Insert DEMO Instructor
          const instructorHash = await bcrypt.hash('instructor123', 10);
          const instructorResult = await runQuery(
            `INSERT INTO users (user_id, name, email, password_hash, user_type, gender, contact_phone, is_approved) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            ['20001', 'Dr. Emily Chen', 'emily.chen@university.edu', instructorHash, 'instructor', 'Female', '+1987654321', 1]
          );
          await runQuery(
            `INSERT INTO instructors (user_id, instructor_id, dept_id, title, office_location, office_hours) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [instructorResult.lastID, '20001', 1, 'Professor', 'Building A, Room 301', 'Mon-Wed 2-4 PM']
          );
          console.log('✅ Demo INSTRUCTOR account created (ID: 20001, Password: instructor123)');

          //Insert more instructor sample
          const instructors = [
            ['20002', 'Prof. Michael Davis', 'michael.davis@university.edu', '20002', 1, 'Associate Professor', 'Building B, Room 205', 'Tue-Thu 3-5 PM'],
            ['20003', 'Dr. Sarah Wilson', 'sarah.wilson@university.edu', '20003', 2, 'Assistant Professor', 'Building C, Room 102', 'Mon-Fri 1-2 PM']
          ];

          for (const [uid, name, email, iid, dept, title, office, hours] of instructors) {
            const result = await runQuery(
              `INSERT INTO users (user_id, name, email, password_hash, user_type, is_approved) 
               VALUES (?, ?, ?, ?, ?, ?)`,
              [uid, name, email, instructorHash, 'instructor', 1]
            );
            await runQuery(
              `INSERT INTO instructors (user_id, instructor_id, dept_id, title, office_location, office_hours) 
               VALUES (?, ?, ?, ?, ?, ?)`,
              [result.lastID, iid, dept, title, office, hours]
            );
          }
          console.log('✅ Additional instructors created');

          //Insert semester
          await runQuery(
            `INSERT INTO semesters (semester_code, semester_name, start_date, end_date, registration_start, registration_end, is_active) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            ['2025S1', 'Spring 2025', '2025-01-15', '2025-05-30', '2024-12-01', '2025-01-10', 1]
          );
          console.log('✅ Semester created');

          //Insert time slot
          const timeSlots = [
            ['Monday', '08:00', '09:30'],
            ['Monday', '10:00', '11:30'],
            ['Wednesday', '08:00', '09:30'],
            ['Wednesday', '10:00', '11:30'],
            ['Friday', '14:00', '15:30']
          ];

          for (const [day, start, end] of timeSlots) {
            await runQuery(
              'INSERT INTO time_slots (day_of_week, start_time, end_time) VALUES (?, ?, ?)',
              [day, start, end]
            );
          }
          console.log('✅ Time slots created');

          //Insert course 
          const courses = [
            ['CS101', 'Introduction to Computer Science', 'Basic programming concepts and problem solving', 3, 1, 'general_required'],
            ['CS201', 'Data Structures and Algorithms', 'Advanced data structures and algorithm analysis', 4, 1, 'major_required'],
            ['CS301', 'Database Systems', 'Design and implementation of database systems', 3, 1, 'major_required'],
            ['MATH101', 'Calculus I', 'Differential and integral calculus', 4, 4, 'general_required'],
            ['PHYS101', 'Physics I', 'Mechanics and thermodynamics', 4, 5, 'general_required']
          ];

          for (const [code, name, desc, credits, dept, type] of courses) {
            await runQuery(
              `INSERT INTO courses (course_code, course_name, description, credits, dept_id, course_type) 
               VALUES (?, ?, ?, ?, ?, ?)`,
              [code, name, desc, credits, dept, type]
            );
          }
          console.log('✅ Courses created');

          //Insert course prerequisite
          await runQuery(
            'INSERT INTO course_prerequisites (course_id, prerequisite_course_id, minimum_grade) VALUES (?, ?, ?)',
            [2, 1, 'C']
          );
          await runQuery(
            'INSERT INTO course_prerequisites (course_id, prerequisite_course_id, minimum_grade) VALUES (?, ?, ?)',
            [3, 2, 'C']
          );
          console.log('✅ Prerequisites created');

          //Insert course section
          const sections = [
            ['CS101-01', 1, 1, 1, 35, 15, 'Room A101'],
            ['CS201-01', 2, 1, 2, 30, 12, 'Room B205'],
            ['CS301-01', 3, 1, 1, 25, 8, 'Room C301'],
            ['MATH101-01', 4, 1, 3, 40, 20, 'Room D102'],
            ['PHYS101-01', 5, 1, 3, 35, 18, 'Lab E201']
          ];

          for (const [code, course, sem, inst, cap, enrolled, room] of sections) {
            await runQuery(
              `INSERT INTO course_sections (section_code, course_id, semester_id, instructor_id, max_capacity, current_enrollment, room_location) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [code, course, sem, inst, cap, enrolled, room]
            );
          }
          console.log('✅ Course sections created');

          //Insert section time slot
          await runQuery('INSERT INTO section_time_slots (section_id, time_slot_id) VALUES (?, ?)', [1, 1]);
          await runQuery('INSERT INTO section_time_slots (section_id, time_slot_id) VALUES (?, ?)', [1, 3]);
          await runQuery('INSERT INTO section_time_slots (section_id, time_slot_id) VALUES (?, ?)', [2, 2]);
          await runQuery('INSERT INTO section_time_slots (section_id, time_slot_id) VALUES (?, ?)', [2, 4]);
          console.log('✅ Section time slots created');

          //Insert grade scale
          const grades = [
            ['A+', 95, 100, 4.0], ['A', 90, 94.99, 4.0], ['A-', 85, 89.99, 3.7],
            ['B+', 80, 84.99, 3.3], ['B', 75, 79.99, 3.0], ['B-', 70, 74.99, 2.7],
            ['C+', 65, 69.99, 2.3], ['C', 60, 64.99, 2.0], ['C-', 55, 59.99, 1.7],
            ['D', 50, 54.99, 1.0], ['F', 0, 49.99, 0.0]
          ];

          for (const [letter, min, max, points] of grades) {
            await runQuery(
              'INSERT INTO grade_scale (letter_grade, min_percentage, max_percentage, grade_points) VALUES (?, ?, ?, ?)',
              [letter, min, max, points]
            );
          }
          console.log('✅ Grade scale created');

          //Insert sample enrollments for demo student
          await runQuery(
            'INSERT INTO enrollments (student_id, section_id, enrollment_status, numeric_grade, final_grade, grade_points) VALUES (?, ?, ?, ?, ?, ?)',
            [1, 1, 'passed', 88, 'A-', 3.7]
          );
          await runQuery(
            'INSERT INTO enrollments (student_id, section_id, enrollment_status) VALUES (?, ?, ?)',
            [1, 2, 'enrolled']
          );
          await runQuery(
            'INSERT INTO enrollments (student_id, section_id, enrollment_status, numeric_grade, final_grade, grade_points) VALUES (?, ?, ?, ?, ?, ?)',
            [1, 4, 'passed', 92, 'A', 4.0]
          );
          console.log('✅ Sample enrollments created for demo student');

          console.log('\n🎉 Database seeded successfully!');
          console.log('\n📝 Demo Accounts:');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('👤 STUDENT:');
          console.log('   ID: 10001');
          console.log('   Password: student123');
          console.log('   Email: alice.student@university.edu');
          console.log('');
          console.log('👨‍🏫 INSTRUCTOR:');
          console.log('   ID: 20001');
          console.log('   Password: instructor123');
          console.log('   Email: emily.chen@university.edu');
          console.log('');
          console.log('👨‍💼 ADMIN:');
          console.log('   ID: 99999');
          console.log('   Password: admin123');
          console.log('   Email: admin@university.edu');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
          
          resolve();
        } catch (error) {
          console.error('Error seeding database:', error);
          reject(error);
        }
      } else {
        console.log('Database already contains data, skipping seed');
        resolve();
      }
    });
  });
};

//Helper function to promisify db.run
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

//Helper function to promisify db.get
const getQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

//Helper function to promisify db.all
const allQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

//User Operations
export const findUserByUserId = (userId) => {
  return getQuery('SELECT * FROM users WHERE user_id = ?', [userId]);
};

export const findUserById = (id) => {
  return getQuery('SELECT * FROM users WHERE id = ?', [id]);
};

export const findUserByEmail = (email) => {
  return getQuery('SELECT * FROM users WHERE email = ?', [email]);
};

export const createUser = async (userData) => {
  const { userId, name, email, password, userType, gender, dateOfBirth, phone, address } = userData;
  const hash = await bcrypt.hash(password, 10);
  
  const result = await runQuery(
    `INSERT INTO users (user_id, name, email, password_hash, user_type, gender, date_of_birth, contact_phone, contact_address, is_approved) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, name, email, hash, userType, gender, dateOfBirth, phone, address, userType === 'student' ? 1 : 0]
  );
  
  const user = await findUserById(result.lastID);
  const { password_hash, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const verifyPassword = async (userId, password) => {
  const user = await findUserByUserId(userId);
  if (!user) return false;
  
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) return false;
  
  const { password_hash, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

//Student Operation
export const createStudent = async (userId, studentData) => {
  const { studentId, college, major, year, enrollmentYear } = studentData;
  return runQuery(
    'INSERT INTO students (user_id, student_id, college, major, year_of_study, enrollment_year) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, studentId, college, major, year, enrollmentYear]
  );
};

export const getStudentByUserId = (userId) => {
  return getQuery(
    `SELECT s.*, u.name, u.email, u.user_id, u.contact_phone, u.gender, u.date_of_birth
     FROM students s
     JOIN users u ON s.user_id = u.id
     WHERE u.id = ?`,
    [userId]
  );
};

export const getAllStudents = () => {
  return allQuery(
    `SELECT s.*, u.name, u.email, u.user_id, u.contact_phone, u.gender
     FROM students s
     JOIN users u ON s.user_id = u.id
     ORDER BY s.student_id`
  );
};

//Instructor Operation
export const createInstructor = async (userId, instructorData) => {
  const { instructorId, deptId, title, office, hours } = instructorData;
  return runQuery(
    'INSERT INTO instructors (user_id, instructor_id, dept_id, title, office_location, office_hours) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, instructorId, deptId, title, office, hours]
  );
};

export const getInstructorByUserId = (userId) => {
  return getQuery(
    `SELECT i.*, u.name, u.email, u.user_id, u.contact_phone, d.dept_name
     FROM instructors i
     JOIN users u ON i.user_id = u.id
     JOIN departments d ON i.dept_id = d.id
     WHERE u.id = ?`,
    [userId]
  );
};

export const getAllInstructors = () => {
  return allQuery(
    `SELECT i.*, u.name, u.email, u.user_id, u.contact_phone, d.dept_name, d.dept_code
     FROM instructors i
     JOIN users u ON i.user_id = u.id
     JOIN departments d ON i.dept_id = d.id
     ORDER BY i.instructor_id`
  );
};

//Course Operation
export const getAllCourses = () => {
  return allQuery(
    `SELECT c.*, d.dept_name, d.dept_code
     FROM courses c
     JOIN departments d ON c.dept_id = d.id
     ORDER BY c.course_code`
  );
};

export const getCourseById = (id) => {
  return getQuery(
    `SELECT c.*, d.dept_name, d.dept_code
     FROM courses c
     JOIN departments d ON c.dept_id = d.id
     WHERE c.id = ?`,
    [id]
  );
};

export const getCourseWithSections = (courseId) => {
  return allQuery(
    `SELECT cs.*, c.course_name, c.course_code, c.credits, s.semester_name, 
            u.name as instructor_name, i.instructor_id
     FROM course_sections cs
     JOIN courses c ON cs.course_id = c.id
     JOIN semesters s ON cs.semester_id = s.id
     JOIN instructors i ON cs.instructor_id = i.id
     JOIN users u ON i.user_id = u.id
     WHERE cs.course_id = ? AND s.is_active = 1`,
    [courseId]
  );
};

//Enrollment Operation
export const enrollStudent = async (studentId, sectionId) => {
  // Check capacity
  const section = await getQuery('SELECT * FROM course_sections WHERE id = ?', [sectionId]);
  if (section.current_enrollment >= section.max_capacity) {
    throw new Error('Section is full');
  }
  
  //Check for time conflict
  const conflicts = await allQuery(
    `SELECT COUNT(*) as count FROM enrollments e
     JOIN course_sections cs1 ON e.section_id = cs1.id
     JOIN section_time_slots sts1 ON cs1.id = sts1.section_id
     JOIN section_time_slots sts2 ON sts2.section_id = ?
     WHERE e.student_id = ? AND e.enrollment_status IN ('enrolled', 'enrolling')
     AND sts1.time_slot_id = sts2.time_slot_id`,
    [sectionId, studentId]
  );
  
  if (conflicts[0].count > 0) {
    throw new Error('Time conflict with existing enrollment');
  }
  
  return runQuery(
    'INSERT INTO enrollments (student_id, section_id, enrollment_status) VALUES (?, ?, ?)',
    [studentId, sectionId, 'enrolled']
  );
};

export const getStudentEnrollments = (studentId) => {
  return allQuery(
    `SELECT e.*, c.course_code, c.course_name, c.credits, c.course_type,
            cs.section_code, s.semester_name, u.name as instructor_name,
            cs.room_location
     FROM enrollments e
     JOIN course_sections cs ON e.section_id = cs.id
     JOIN courses c ON cs.course_id = c.id
     JOIN semesters s ON cs.semester_id = s.id
     JOIN instructors i ON cs.instructor_id = i.id
     JOIN users u ON i.user_id = u.id
     WHERE e.student_id = ?
     ORDER BY s.start_date DESC, c.course_code`,
    [studentId]
  );
};

export const getStudentGPA = async (studentId) => {
  const result = await getQuery(
    `SELECT 
      SUM(e.grade_points) as total_grade_points,
      SUM(c.credits) as total_credits
     FROM enrollments e
     JOIN course_sections cs ON e.section_id = cs.id
     JOIN courses c ON cs.course_id = c.id
     WHERE e.student_id = ? AND e.enrollment_status = 'passed'`,
    [studentId]
  );
  
  if (!result || !result.total_credits) return 0;
  return (result.total_grade_points / result.total_credits).toFixed(2);
};

//Department Operation
export const getAllDepartments = () => {
  return allQuery('SELECT * FROM departments ORDER BY dept_code');
};

//Semester Operation
export const getActiveSemester = () => {
  return getQuery('SELECT * FROM semesters WHERE is_active = 1');
};

export const getAllSemesters = () => {
  return allQuery('SELECT * FROM semesters ORDER BY start_date DESC');
};

export { db };
export default db;
