// Input validation and sanitization utilities
export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }
  return { isValid: true };
};

// Phone validation
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone) return { isValid: true }; // Optional field
  
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
    return { isValid: false, message: 'Please enter a valid phone number' };
  }
  return { isValid: true };
};

// URL validation
export const validateUrl = (url: string): ValidationResult => {
  if (!url) return { isValid: true }; // Optional field
  
  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, message: 'Please enter a valid URL (include http:// or https://)' };
  }
};

// Text sanitization
export const sanitizeText = (text: string): string => {
  return text
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 500); // Limit length
};

// Name validation
export const validateName = (name: string): ValidationResult => {
  if (!name) {
    return { isValid: false, message: 'Name is required' };
  }
  if (name.length < 2) {
    return { isValid: false, message: 'Name must be at least 2 characters long' };
  }
  if (name.length > 100) {
    return { isValid: false, message: 'Name must be less than 100 characters' };
  }
  return { isValid: true };
};

// Company validation
export const validateCompany = (company: string): ValidationResult => {
  if (!company) return { isValid: true }; // Optional field
  
  if (company.length > 100) {
    return { isValid: false, message: 'Company name must be less than 100 characters' };
  }
  return { isValid: true };
};

// Bio validation
export const validateBio = (bio: string): ValidationResult => {
  if (!bio) return { isValid: true }; // Optional field
  
  if (bio.length > 1000) {
    return { isValid: false, message: 'Bio must be less than 1000 characters' };
  }
  return { isValid: true };
};

// Location validation
export const validateLocation = (location: string): ValidationResult => {
  if (!location) return { isValid: true }; // Optional field
  
  if (location.length > 100) {
    return { isValid: false, message: 'Location must be less than 100 characters' };
  }
  return { isValid: true };
};

// API key name validation
export const validateApiKeyName = (name: string): ValidationResult => {
  if (!name) {
    return { isValid: false, message: 'API key name is required' };
  }
  if (name.length < 3) {
    return { isValid: false, message: 'API key name must be at least 3 characters long' };
  }
  if (name.length > 50) {
    return { isValid: false, message: 'API key name must be less than 50 characters' };
  }
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
    return { isValid: false, message: 'API key name can only contain letters, numbers, spaces, hyphens, and underscores' };
  }
  return { isValid: true };
};

// Password validation
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character (@$!%*?&)' };
  }
  return { isValid: true };
};