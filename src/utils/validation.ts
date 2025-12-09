export const validateUsername = (username: string, minLength = 5): string => {
  if (!username.trim()) {
    return 'Username is required';
  }
  if (username.length < minLength) {
    return `Username must be at least ${minLength} characters`;
  }
  return '';
};

export const validatePassword = (password: string, minLength = 8): string => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters`;
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    return 'Password must contain at least one special character';
  }
  return '';
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return '';
};

export const validateName = (name: string): string => {
  if (!name.trim()) {
    return 'Name is required';
  }
  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters';
  }
  return '';
};

// Simple validations for login (no complexity checks for security)
export const validateLoginUsername = (username: string): string => {
  if (!username.trim()) {
    return 'Username is required';
  }
  return '';
};

export const validateLoginPassword = (password: string): string => {
  if (!password) {
    return 'Password is required';
  }
  return '';
};
