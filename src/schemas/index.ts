// ==============================================================================
// TAHAB HOTEL & SUITES LTD — ZOD VALIDATION SCHEMAS
// ==============================================================================

import { z } from 'zod';

// 1. Booking Form Schema
export const bookingFormSchema = z
  .object({
    roomId: z.string().min(1, 'Please select a room or suite'),
    checkIn: z.string().min(1, 'Check-in date is required'),
    checkOut: z.string().min(1, 'Check-out date is required'),
    guestCount: z
      .number({ invalid_type_error: 'Guest count must be a number' })
      .min(1, 'At least 1 guest is required')
      .max(10, 'Maximum 10 guests per booking'),
    guestName: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Name is too long'),
    guestEmail: z.string().email('Please enter a valid email address'),
    guestPhone: z
      .string()
      .min(7, 'Phone number must be at least 7 digits')
      .max(20, 'Phone number is too long')
      .regex(/^[+0-9\s\-()]+$/, 'Invalid phone number format'),
    specialRequest: z.string().max(500, 'Special requests maximum 500 characters').optional(),
  })
  .refine(
    (data) => {
      const checkInDate = new Date(data.checkIn);
      const checkOutDate = new Date(data.checkOut);
      return checkOutDate > checkInDate;
    },
    {
      message: 'Check-out date must be after check-in date',
      path: ['checkOut'],
    }
  );

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

// 2. Contact Form Schema
export const contactFormSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .min(7, 'Phone number must be at least 7 digits')
    .max(20)
    .regex(/^[+0-9\s\-()]+$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(150),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

// 3. Authentication Schemas
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().min(7, 'Valid phone number is required').max(20),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

// 4. Admin Room Schema
export const roomAdminSchema = z.object({
  name: z.string().min(3, 'Room name is required').max(100),
  slug: z.string().min(3, 'Slug is required').max(100),
  category: z.enum(['standard', 'executive', 'presidential']),
  description: z.string().min(20, 'Detailed description is required'),
  tagline: z.string().max(150).optional(),
  pricePerNight: z.number().min(1000, 'Price must be at least ₦1,000'),
  capacity: z.number().min(1).max(10),
  bedType: z.string().min(2, 'Bed type is required'),
  floor: z.number().min(1).max(10),
  sizeSqm: z.number().optional(),
  status: z.enum(['available', 'maintenance', 'booked']),
});

export type RoomAdminFormValues = z.infer<typeof roomAdminSchema>;
