import { z } from 'zod';

// Enums
// export enum UserRole {
//   ADMIN = 'ADMIN',
//   EDITOR = 'EDITOR',
//   VIEWER = 'VIEWER',
// }
// 1. Define the object as the runtime value
export const UserRole = {
  ADMIN : 'ADMIN',
  EDITOR : 'EDITOR',
  VIEWER : 'VIEWER',
} as const;

// 2. Create a Type from the object values (optional but helpful)
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// export enum AdminRole {
//   SUPER_ADMIN = 'SUPER_ADMIN',
//   ADMIN = 'ADMIN',
// }
// 1. Define the object as the runtime value
export const AdminRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
} as const;

// 2. Create a Type from the object values (optional but helpful)
export type AdminRole = (typeof AdminRole)[keyof typeof AdminRole];
// Permission type
export type Permission = 
  | 'create'
  | 'edit'
  | 'delete'
  | 'manage_users'
  | 'manage_admins'
  | 'approve_users'
  | 'manage_content'
  | 'view_analytics';

// User Interface
export interface User {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  ward: string;
  role: UserRole;
  profileImageUrl?: string;
  approved: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Admin User Interface
export interface AdminUser {
  id: number;
  username: string;
  role: AdminRole;
  createdAt: string;
  lastLogin?: string;
  active: boolean;
}

// Auth State Interface
export interface AuthState {
  user: User | null;
  admin: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

// Auth Context Type
export interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => void;
  adminLogin: (username: string, password: string) => Promise<void>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  hasAdminRole: (roles: AdminRole | AdminRole[]) => boolean;
  can: (permission: Permission) => boolean;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

// Form Data Types
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  email: string;
  fullName: string;
  phone: string;
  ward: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
  role?: 'VIEWER' | 'EDITOR' | 'ADMIN'; // Add role field (optional, defaults to VIEWER)
}

// export interface RegisterFormData {
//   email: string;
//   fullName: string;
//   phone: string;
//   ward: string;
//   password: string;
//   confirmPassword: string;
//   agreeTerms: boolean;
// }

export interface AdminLoginFormData {
  username: string;
  password: string;
  mode: 'admin' | 'user';
}

// Validation Schemas
export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  ward: z.string().min(1, 'Please select a ward'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  agreeTerms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
  role: z.enum(['VIEWER', 'EDITOR', 'ADMIN']).optional().default('VIEWER'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// export const RegisterSchema = z.object({
//   email: z.string().email('Invalid email address'),
//   fullName: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
//   phone: z.string().min(10, 'Phone number must be at least 10 digits'),
//   ward: z.string().min(1, 'Please select a ward'),
//   password: z.string()
//     .min(8, 'Password must be at least 8 characters')
//     .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
//     .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
//     .regex(/[0-9]/, 'Password must contain at least one number'),
//   confirmPassword: z.string(),
//   agreeTerms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
// }).refine((data) => data.password === data.confirmPassword, {
//   message: "Passwords don't match",
//   path: ["confirmPassword"],
// });

export const AdminLoginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  mode: z.enum(['admin', 'user']),
});

// Kenyan Wards
// export const KENYAN_WARDS = [
//   'Westlands', 'Karura', 'Kitisuru', 'Parklands', 'Lavington',
//   'Kilimani', 'Kileleshwa', 'Riruta', 'Kawangware', 'Dagoretti',
//   'Karen', 'Langata', 'Embakasi'
// ];
export const KENYAN_WARDS = [
  "Westlands",
  "Karura",
  "Kibra",
  "Makadara",
  "Dagoretti",
  "Ruaraka",
  "Embakasi",
  "Kasarani",
  "Langata",
  "Nairobi Central",
  "Starehe",
  "Nyaya"
];