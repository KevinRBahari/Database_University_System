export const isValidStudentId = (studentId) => {
  //Check studentID
  const id = Number(studentId)
  return !isNaN(id) && id > 0 && Number.isInteger(id)
}

//Password validation (min 6 chars for simplicity)
export const isValidPassword = (password) => {
  return password && password.length >= 6
}

//Validate login form with student ID
export const validateLoginForm = (studentId, password) => {
  const errors = {}

  if (!studentId) {
    errors.studentId = 'Student ID is required'
  } else if (!isValidStudentId(studentId)) {
    errors.studentId = 'Please enter a valid Student ID (numbers only)'
  }

  if (!password) {
    errors.password = 'Password is required'
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

//Validate registration form
export const validateRegisterForm = (studentId, name, email, password, confirmPassword) => {
  const errors = {}

  if (!studentId) {
    errors.studentId = 'Student ID is required'
  } else if (!isValidStudentId(studentId)) {
    errors.studentId = 'Please enter a valid Student ID'
  }

  if (!name || name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters'
  }

  if (!email) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email address'
  }

  if (!password) {
    errors.password = 'Password is required'
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

//General purpose validators
export const validators = {
  required: (value, fieldName = 'This field') => {
    return value && value.toString().trim().length > 0
      ? null
      : `${fieldName} is required`
  },

  studentId: (value) => {
    return isValidStudentId(value)
      ? null
      : 'Please enter a valid Student ID'
  },

  minLength: (value, min, fieldName = 'This field') => {
    return value && value.length >= min
      ? null
      : `${fieldName} must be at least ${min} characters`
  }
}
