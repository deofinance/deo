// Input validation middleware
import { z, ZodSchema } from 'zod';

/**
 * Validate request body against schema
 */
export async function validateBody<T>(
  body: any,
  schema: ZodSchema<T>
): Promise<{ success: boolean; data?: T; errors?: any }> {
  try {
    const data = await schema.parseAsync(body);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      };
    }
    return { success: false, errors: [{ message: 'Validation failed' }] };
  }
}

// Common validation schemas
export const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const otpSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'Code must be 6 digits'),
});

export const transferSchema = z.object({
  recipient: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  amount: z.string().regex(/^\d+(\.\d+)?$/, 'Invalid amount'),
  chain_id: z.enum(['1', '137', '42161', '10', '56']),
  stablecoin: z.enum(['USDC']),
});

export const updateUserSchema = z.object({
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional(),
  date_of_birth: z.string().datetime().optional(),
});

export const createCardholderSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone_number: z.string().min(10).max(20),
  billing_address: z.object({
    line1: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(2).max(2),
    postal_code: z.string().min(1),
    country: z.string().length(2),
  }),
});

export const issueCardSchema = z.object({
  type: z.enum(['virtual', 'physical']),
  currency: z.string().length(3),
  spending_limits: z
    .object({
      daily: z.number().positive().optional(),
      monthly: z.number().positive().optional(),
    })
    .optional(),
});
