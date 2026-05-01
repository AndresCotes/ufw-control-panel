import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(3),
  password: z.string().min(8)
});

export type LoginDto = z.infer<typeof loginSchema>;
