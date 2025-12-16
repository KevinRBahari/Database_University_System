import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import {
  initializeDatabase,
  verifyPassword,
  createUser,
  createStudent,
  createInstructor,
  findUserById,
  getStudentByUserId,
  getInstructorByUserId,
  getAllStudents,
  getAllInstructors,
  getAllCourses,
  getCourseById,
  getCourseWithSections,
  getStudentEnrollments,
  getStudentGPA,
  getAllDepartments,
  getActiveSemester,
  db
} from './database.js';

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

//Middleware
app.use(cors());
app.use(express.json());

//Init Database
initializeDatabase()
  .then(() => {
    console.log('Database initialized successfully');
  })
  .catch(err => {
    console.error('Database initialization failed:', err);
    process.exit(1);
  });

//Helper functions for database queries
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

const getQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const allQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

//Helper function to generate JWT token
const generateToken = (userId, userType) => {
  return jwt.sign({ userId, userType }, JWT_SECRET, { expiresIn: '24h' });
};

//Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.userId = decoded.userId;
    req.userType = decoded.userType;
    next();
  });
};

//Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.userType !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

//====================Auth Route====================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { user_id, password } = req.body;

    if (!user_id || !password) {
      return res.status(400).json({ message: 'User ID and password are required' });
    }

    const user = await verifyPassword(user_id, password);

    if (!user) {
      return res.status(401).json({ message: 'Invalid user ID or password' });
    }

    if (!user.is_approved) {
      return res.status(403).json({ message: 'Account pending approval' });
    }

    const token = generateToken(user.id, user.user_type);

    res.json({ token, user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { user_id, name, email, password, user_type, ...additionalData } = req.body;

    if (!user_id || !name || !email || !password || !user_type) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Create user
    const newUser = await createUser({
      userId: user_id,
      name,
      email,
      password,
      userType: user_type,
      gender: additionalData.gender,
      dateOfBirth: additionalData.date_of_birth,
      phone: additionalData.contact_phone,
      address: additionalData.contact_address
    });

    //Create student or instructor profile
    if (user_type === 'student') {
      await createStudent(newUser.id, {
        studentId: user_id,
        college: additionalData.college || 'Engineering',
        major: additionalData.major || 'Undeclared',
        year: additionalData.year_of_study || 1,
        enrollmentYear: new Date().getFullYear()
      });
    } else if (user_type === 'instructor') {
      await createInstructor(newUser.id, {
        instructorId: user_id,
        deptId: additionalData.dept_id || 1,
        title: additionalData.title || 'Instructor',
        office: additionalData.office_location || '',
        hours: additionalData.office_hours || ''
      });
    }

    const token = generateToken(newUser.id, user_type);

    res.status(201).json({ token, user: newUser });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ message: 'User ID or email already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/auth/verify', authenticateToken, async (req, res) => {
  try {
    const user = await findUserById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ valid: true, user });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//====================Student Route====================
app.get('/api/student/profile', authenticateToken, async (req, res) => {
  try {
    const student = await getStudentByUserId(req.userId);
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }
    const gpa = await getStudentGPA(student.id);
    res.json({ ...student, gpa });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/student/enrollments', authenticateToken, async (req, res) => {
  try {
    const student = await getStudentByUserId(req.userId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    const enrollments = await getStudentEnrollments(student.id);
    res.json(enrollments);
  } catch (error) {
    console.error('Enrollments fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/students', authenticateToken, async (req, res) => {
  try {
    const students = await getAllStudents();
    res.json(students);
  } catch (error) {
    console.error('Students fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/students/:id/enrollments', authenticateToken, async (req, res) => {
  try {
    const enrollments = await getStudentEnrollments(req.params.id);
    res.json(enrollments);
  } catch (error) {
    console.error('Student enrollments fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//====================Instructor Route====================
app.get('/api/instructor/profile', authenticateToken, async (req, res) => {
  try {
    const instructor = await getInstructorByUserId(req.userId);
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor profile not found' });
    }
    res.json(instructor);
  } catch (error) {
    console.error('Instructor profile fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/instructors', authenticateToken, async (req, res) => {
  try {
    const instructors = await getAllInstructors();
    res.json(instructors);
  } catch (error) {
    console.error('Instructors fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/instructors/:id/courses', authenticateToken, async (req, res) => {
  try {
    const courses = await allQuery(
      `SELECT cs.*, c.course_name, c.course_code, c.credits,
              s.semester_name, s.semester_code
       FROM course_sections cs
       JOIN courses c ON cs.course_id = c.id
       JOIN semesters s ON cs.semester_id = s.id
       WHERE cs.instructor_id = ?`,
      [req.params.id]
    );
    res.json(courses);
  } catch (error) {
    console.error('Instructor courses fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//====================Course Route====================
app.get('/api/courses', authenticateToken, async (req, res) => {
  try {
    const courses = await getAllCourses();
    res.json(courses);
  } catch (error) {
    console.error('Courses fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/courses/:id', authenticateToken, async (req, res) => {
  try {
    const course = await getCourseById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    console.error('Course fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/courses/:id/sections', authenticateToken, async (req, res) => {
  try {
    const sections = await getCourseWithSections(req.params.id);
    res.json(sections);
  } catch (error) {
    console.error('Course sections fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//====================Enrollment Route====================
app.post('/api/enrollments', authenticateToken, async (req, res) => {
  try {
    const { section_id } = req.body;
    
    console.log('Enrollment request:', { section_id, userId: req.userId });
    
    if (!section_id) {
      return res.status(400).json({ message: 'Section ID is required' });
    }

    //Get student ID from user ID
    const student = await getQuery(
      'SELECT id FROM students WHERE user_id = ?',
      [req.userId]
    );
    
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    console.log('Student found:', student.id);

    //Check if already enrolled
    const existing = await getQuery(
      'SELECT id FROM enrollments WHERE student_id = ? AND section_id = ?',
      [student.id, section_id]
    );
    
    if (existing) {
      return res.status(400).json({ message: 'Already enrolled in this section' });
    }

    //Check section capacity
    const section = await getQuery(
      'SELECT * FROM course_sections WHERE id = ?',
      [section_id]
    );
    
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    
    if (section.current_enrollment >= section.max_capacity) {
      return res.status(400).json({ message: 'Section is full' });
    }
    
    //Check for time conflicts
    const conflicts = await getQuery(
      `SELECT COUNT(*) as count FROM enrollments e
       JOIN course_sections cs1 ON e.section_id = cs1.id
       JOIN section_time_slots sts1 ON cs1.id = sts1.section_id
       JOIN section_time_slots sts2 ON sts2.section_id = ?
       JOIN course_sections cs2 ON cs2.id = sts2.section_id
       WHERE e.student_id = ? 
       AND e.enrollment_status IN ('enrolled', 'enrolling')
       AND sts1.time_slot_id = sts2.time_slot_id
       AND cs1.semester_id = cs2.semester_id`,
      [section_id, student.id]
    );
    
    if (conflicts && conflicts.count > 0) {
      return res.status(400).json({ message: 'Time conflict with existing enrollment' });
    }
    
    //Enroll student
    const result = await runQuery(
      'INSERT INTO enrollments (student_id, section_id, enrollment_status) VALUES (?, ?, ?)',
      [student.id, section_id, 'enrolled']
    );
    
    //Update section enrollment count
    await runQuery(
      'UPDATE course_sections SET current_enrollment = current_enrollment + 1 WHERE id = ?',
      [section_id]
    );

    console.log('Enrollment successful:', result.lastID);

    res.status(201).json({ 
      message: 'Successfully enrolled',
      enrollment_id: result.lastID
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ message: error.message || 'Enrollment failed' });
  }
});

//====================Grade Management====================
app.put('/api/enrollments/:id/grade', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { numeric_grade, final_grade, enrollment_status } = req.body;

    console.log('Grade update request:', { id, numeric_grade, final_grade, enrollment_status });

    // Verify enrollment exists and get instructor info
    const enrollment = await getQuery(
      `SELECT e.*, cs.instructor_id, i.user_id as instructor_user_id
       FROM enrollments e
       JOIN course_sections cs ON e.section_id = cs.id
       JOIN instructors i ON cs.instructor_id = i.id
       WHERE e.id = ?`,
      [id]
    );

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    console.log('Enrollment found:', enrollment);
    console.log('Current user:', req.userId, 'Instructor:', enrollment.instructor_user_id);

    //Check if user is the instructor for this course
    if (enrollment.instructor_user_id !== req.userId && req.userType !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to grade this enrollment' });
    }

    //Calculate grade points based on letter grade
    const gradePointMap = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D': 1.0, 'F': 0.0
    };
    const grade_points = gradePointMap[final_grade] || 0;

    //Update enrollment
    await runQuery(
      `UPDATE enrollments 
       SET numeric_grade = ?, final_grade = ?, grade_points = ?, enrollment_status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [numeric_grade, final_grade, grade_points, enrollment_status, id]
    );

    console.log('Grade updated successfully');

    res.json({ 
      message: 'Grade updated successfully',
      enrollment_id: id,
      numeric_grade,
      final_grade,
      grade_points,
      enrollment_status
    });
  } catch (error) {
    console.error('Grade update error:', error);
    res.status(500).json({ message: 'Failed to update grade: ' + error.message });
  }
});

//====================Department Route====================
app.get('/api/departments', async (req, res) => {
  try {
    const departments = await getAllDepartments();
    console.log('Departments fetched:', departments.length);
    res.json(departments);
  } catch (error) {
    console.error('Departments fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//====================Semester Route====================
app.get('/api/semesters/active', authenticateToken, async (req, res) => {
  try {
    const semester = await getActiveSemester();
    res.json(semester);
  } catch (error) {
    console.error('Active semester fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//====================Admin Course Management====================
//Create new course
app.post('/api/courses', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { course_code, course_name, description, credits, dept_id, course_type, instructor_id } = req.body;

    if (!course_code || !course_name || !credits || !dept_id || !course_type) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const result = await runQuery(
      `INSERT INTO courses (course_code, course_name, description, credits, dept_id, course_type) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [course_code, course_name, description, credits, dept_id, course_type]
    );

    res.status(201).json({ 
      message: 'Course created successfully',
      course_id: result.lastID 
    });
  } catch (error) {
    console.error('Course creation error:', error);
    if (error.message.includes('UNIQUE constraint')) {
      return res.status(409).json({ message: 'Course code already exists' });
    }
    res.status(500).json({ message: 'Failed to create course' });
  }
});

//Update course
app.put('/api/courses/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { course_name, description, credits, dept_id, course_type } = req.body;

    await runQuery(
      `UPDATE courses 
       SET course_name = ?, description = ?, credits = ?, dept_id = ?, course_type = ?
       WHERE id = ?`,
      [course_name, description, credits, dept_id, course_type, id]
    );

    res.json({ message: 'Course updated successfully' });
  } catch (error) {
    console.error('Course update error:', error);
    res.status(500).json({ message: 'Failed to update course' });
  }
});

//Delete course
app.delete('/api/courses/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await runQuery('DELETE FROM courses WHERE id = ?', [id]);

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Course deletion error:', error);
    res.status(500).json({ message: 'Failed to delete course' });
  }
});

//===================Admin Student Management====================
//Update student
app.put('/api/students/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, major, college, year_of_study, gender, contact_phone } = req.body;

    //Get the student record to find user_id
    const student = await getQuery('SELECT user_id FROM students WHERE id = ?', [id]);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    //Update users table
    await runQuery(
      `UPDATE users 
       SET name = ?, email = ?, gender = ?, contact_phone = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, email, gender, contact_phone, student.user_id]
    );

    //Update students table
    await runQuery(
      `UPDATE students 
       SET major = ?, college = ?, year_of_study = ?
       WHERE id = ?`,
      [major, college, year_of_study, id]
    );

    res.json({ message: 'Student updated successfully' });
  } catch (error) {
    console.error('Student update error:', error);
    if (error.message.includes('UNIQUE constraint')) {
      return res.status(409).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Failed to update student' });
  }
});

//====================Admin Instructor Management====================
//Update instructor
app.put('/api/instructors/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, dept_id, title, office_location, office_hours, contact_phone } = req.body;

    //Get the instructor record to find user_id
    const instructor = await getQuery('SELECT user_id FROM instructors WHERE id = ?', [id]);
    
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    //Update users table
    await runQuery(
      `UPDATE users 
       SET name = ?, email = ?, contact_phone = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, email, contact_phone, instructor.user_id]
    );

    //Update instructors table
    await runQuery(
      `UPDATE instructors 
       SET dept_id = ?, title = ?, office_location = ?, office_hours = ?
       WHERE id = ?`,
      [dept_id, title, office_location, office_hours, id]
    );

    res.json({ message: 'Instructor updated successfully' });
  } catch (error) {
    console.error('Instructor update error:', error);
    if (error.message.includes('UNIQUE constraint')) {
      return res.status(409).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Failed to update instructor' });
  }
});

//====================Heatlth Check====================
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

//Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

//404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

//Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

//Shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  process.exit(0);
});