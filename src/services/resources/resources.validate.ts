import { z } from 'zod';

const fullResourceSchema = z.object({
  id: z.string().uuid(),
  value: z.string().min(1).max(256),
  owner: z.string().uuid(),
  created_at: z.date()
});

export const validateResourceValue = (payload: any) =>
  fullResourceSchema.pick({ value: true }).parse(payload);
