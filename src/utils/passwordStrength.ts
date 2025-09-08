export interface PasswordStrength {
  score: number;
  feedback: string;
  color: string;
}

export const checkPasswordStrength = (password: string): PasswordStrength => {
  if (!password) {
    return { score: 0, feedback: 'Enter a password', color: 'text-muted-foreground' };
  }

  let score = 0;
  const feedback: string[] = [];

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('at least 8 characters');
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('uppercase letter');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('lowercase letter');
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('number');
  }

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('special character');
  }

  // Return strength assessment
  if (score <= 2) {
    return {
      score,
      feedback: feedback.length > 0 ? `Add ${feedback.join(', ')}` : 'Weak password',
      color: 'text-destructive'
    };
  } else if (score <= 3) {
    return {
      score,
      feedback: feedback.length > 0 ? `Add ${feedback.join(', ')}` : 'Fair password',
      color: 'text-warning'
    };
  } else if (score <= 4) {
    return {
      score,
      feedback: 'Good password',
      color: 'text-accent'
    };
  } else {
    return {
      score,
      feedback: 'Strong password',
      color: 'text-success'
    };
  }
};