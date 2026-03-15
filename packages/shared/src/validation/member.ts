import { z } from 'zod';

export const createMemberSchema = z.object({
  name: z.string().min(2).max(200),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
  email: z.string().email().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  emergencyPhone: z.string().optional(),
  bloodGroup: z.string().max(5).optional(),
  notes: z.string().max(1000).optional(),
});

export const updateMemberSchema = createMemberSchema.partial();

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
