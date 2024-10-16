import { userSchemaParams } from '../../config/users.config.js';
import { isAuthenticated } from '../../middleware/auth.middleware.js';
import { z } from 'zod';

const fullUserSchema = z
  .object({
    id: z.string().uuid(),
    username: z
      .string()
      .min(userSchemaParams.username.min)
      .max(userSchemaParams.username.max)
      .regex(userSchemaParams.username.regex, {
        message: 'Contains forbidden characters'
      }),
    password: z
      .string()
      .min(userSchemaParams.password.min)
      .max(userSchemaParams.password.max)
      .regex(userSchemaParams.password.regex, {
        message: 'Contains forbidden characters'
      }),
    created_at: z.date()
  })
  .strict();

type FullUserSchema = z.infer<typeof fullUserSchema>;

export const validateUserCreds = (payload: any) =>
  fullUserSchema.pick({ username: true, password: true }).parse(payload);

export const validateUserId = (payload: any) =>
  fullUserSchema.pick({ id: true }).parse(payload);

function validateReqUser<TKey extends keyof FullUserSchema>(
  payload: any,
  props: TKey[],
  required?: true
): Pick<FullUserSchema, TKey>;
function validateReqUser<TKey extends keyof FullUserSchema>(
  payload: any,
  props: TKey[],
  required: false
): null | Pick<FullUserSchema, TKey>;
function validateReqUser<TKey extends keyof FullUserSchema>(
  payload: any,
  props: TKey[],
  required: boolean = true
): null | Pick<FullUserSchema, TKey> {
  const pickObject = props.reduce(
    (obj, prop) => ({
      ...obj,
      [prop]: true
    }),
    {} as Partial<Record<keyof FullUserSchema, true>>
  );

  const result = fullUserSchema.pick(pickObject).safeParse(payload);

  if (result.success) {
    return result.data;
  }

  if (required) {
    throw new Error(
      `${isAuthenticated.name} middleware is required on this route`
    );
  }

  return null;
}

export { validateReqUser };
