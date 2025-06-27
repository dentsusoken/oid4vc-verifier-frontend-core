import { z } from 'zod';

export interface PostRequest {
  <T>(url: string, body: string, schema: z.ZodSchema<T>): Promise<T>;
}
