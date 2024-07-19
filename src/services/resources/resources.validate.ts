import { z } from 'zod';

const fullResourceSchema = z.object({
  id: z.string().uuid(),
  value: z.string().min(1).max(256),
  owner: z.string().uuid(),
  created_at: z.date()
});

export const validateResourceValue = (payload: any) =>
  fullResourceSchema.pick({ value: true }).parse(payload);

export const validateResourceId = (payload: any) =>
  fullResourceSchema.pick({ id: true }).parse(payload);

const listResourcesSchema = z.object({
  offset: z.coerce.number().int().gte(0).default(0),
  limit: z.coerce
    .number()
    .int()
    .gte(0)
    .lte(100)
    .default(100)
    .transform((val) => (val === 0 ? 100 : val)),
  sort: z
    .object({
      created_at: z.enum(['asc', 'desc']).default('asc')
    })
    .default({})
});

export const validateListResources = (payload: any) =>
  listResourcesSchema.parse(payload);
