export const validateUsername = (username: string, minLength = 4): string => {
  if (!username.trim()) {
    return 'Username is required';
  }
  if (username.length < minLength) {
    return `Username must be at least ${minLength} characters`;
  }
  return '';
};

export const validatePassword = (password: string, minLength = 6): string => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters`;
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
