import { z } from 'zod';

// Common validation patterns
const urlPattern = /^https?:\/\/.+/;
const phonePattern = /^\+?[1-9]\d{1,14}$/;

// User profile schemas
export const profileUpdateSchema = z.object({
  full_name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  bio: z.string()
    .max(1000, "Bio must be less than 1000 characters")
    .optional()
    .nullable(),
  location: z.string()
    .max(100, "Location must be less than 100 characters")
    .optional()
    .nullable(),
  company: z.string()
    .max(100, "Company name must be less than 100 characters")
    .optional()
    .nullable(),
  phone: z.string()
    .regex(phonePattern, "Invalid phone number format")
    .optional()
    .nullable(),
});

// Security chat schemas
export const chatMessageSchema = z.object({
  message: z.string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message must be less than 2000 characters")
    .trim(),
});

// URL scanner schemas
export const urlScanSchema = z.object({
  url: z.string()
    .url("Invalid URL format")
    .regex(urlPattern, "URL must start with http:// or https://")
    .max(2048, "URL is too long"),
});

// Recovery request schemas
export const recoveryRequestSchema = z.object({
  recovery_type: z.enum(['crypto', 'cards', 'cash'], {
    errorMap: () => ({ message: "Invalid recovery type" })
  }),
  amount_lost: z.number()
    .min(0, "Amount must be positive")
    .max(10000000, "Amount exceeds maximum"),
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be less than 5000 characters")
    .trim(),
  scammer_details: z.string()
    .max(2000, "Scammer details must be less than 2000 characters")
    .optional()
    .nullable(),
});

// Contact form schema
export const contactFormSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  email: z.string()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters")
    .trim(),
  subject: z.string()
    .min(3, "Subject must be at least 3 characters")
    .max(200, "Subject must be less than 200 characters")
    .trim(),
  message: z.string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message must be less than 5000 characters")
    .trim(),
});

// API key creation schema
export const apiKeySchema = z.object({
  name: z.string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be less than 50 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Name can only contain letters, numbers, hyphens, and underscores")
    .trim(),
  permissions: z.array(z.string()).optional(),
});

// Password validation
export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

// Sign up schema
export const signUpSchema = z.object({
  email: z.string()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters")
    .trim(),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// File upload validation
export const fileUploadSchema = z.object({
  file: z.custom<File>((val) => val instanceof File, {
    message: "Please select a file",
  }),
  maxSize: z.number().optional(),
  allowedTypes: z.array(z.string()).optional(),
}).refine((data) => {
  if (data.maxSize && data.file.size > data.maxSize) {
    return false;
  }
  return true;
}, {
  message: "File size exceeds maximum allowed",
}).refine((data) => {
  if (data.allowedTypes && data.allowedTypes.length > 0) {
    return data.allowedTypes.includes(data.file.type);
  }
  return true;
}, {
  message: "File type not allowed",
});

// Deep search schema
export const deepSearchSchema = z.object({
  query: z.string()
    .min(3, "Query must be at least 3 characters")
    .max(500, "Query must be less than 500 characters")
    .trim(),
  searchType: z.enum(['person', 'business', 'domain', 'phone', 'email'], {
    errorMap: () => ({ message: "Invalid search type" })
  }).optional(),
});

// Report submission schema
export const reportSchema = z.object({
  report_type: z.enum(['phishing', 'malware', 'scam', 'fraud', 'other'], {
    errorMap: () => ({ message: "Invalid report type" })
  }),
  title: z.string()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must be less than 200 characters")
    .trim(),
  description: z.string()
    .min(20, "Description must be at least 20 characters")
    .max(5000, "Description must be less than 5000 characters")
    .trim(),
  evidence_url: z.string()
    .url("Invalid URL format")
    .optional()
    .nullable(),
  severity: z.enum(['low', 'medium', 'high', 'critical'], {
    errorMap: () => ({ message: "Invalid severity level" })
  }).optional(),
});

// Helper function to validate data
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
} {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

// Helper to format Zod errors for display
export function formatZodErrors(errors: z.ZodError): Record<string, string> {
  const formattedErrors: Record<string, string> = {};
  errors.errors.forEach((error) => {
    const path = error.path.join('.');
    formattedErrors[path] = error.message;
  });
  return formattedErrors;
}
