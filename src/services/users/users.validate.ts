import { z } from 'zod';

const createUserSchema = z.object({
  username: z
    .string()
    .min(1)
    .max(32)
    .regex(/^[a-zA-Z0-9._]*$/, { message: 'Contains forbidden characters' }),
  password: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]*$/, {
      message: 'Contains forbidden characters'
    })
});

export const validateCreateUser = (payload: any) =>
  createUserSchema.parse(payload);
