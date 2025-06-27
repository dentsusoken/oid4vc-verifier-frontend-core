import { z } from 'zod';

export interface GetRequest {
  <T>(url: string, schema: z.ZodSchema<T>): Promise<T>;
}
