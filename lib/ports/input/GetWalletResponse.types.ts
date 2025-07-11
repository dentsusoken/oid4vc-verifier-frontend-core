import { z } from 'zod';
import { MdocVerifyResult } from 'mdoc-cbor-ts';

/**
 * Zod schema for the GetWalletResponseResponse.
 * This schema ensures that the GetWalletResponseResponse is valid.
 * @type {z.ZodObject}
 * @throws {z.ZodError} If the GetWalletResponseResponse is invalid
 */
// export const GetWalletResponseResponseSchema = z.object({
//   id_token: z.string().optional(),
//   vp_token: z.string().optional(),
//   presentation_submission: presentationSubmissionSchema.optional(),
//   error: z.string().optional(),
//   error_description: z.string().optional(),
// });
export const GetWalletResponseResponseSchema = z.object({
  state: z.string(),
  response: z.string(),
});

/**
 * Represents a type of GetWalletResponseResponse JSON
 */
export type GetWalletResponseResponseJSON = z.infer<
  typeof GetWalletResponseResponseSchema
>;

/**
 * Represents a GetWalletResponseResponse
 * @class
 * @property {string} state - The state
 * @property {string} response - The response
 */
export class GetWalletResponseResponse {
  /**
   * Creates a new GetWalletResponseResponse
   * @param {string} state - The state
   * @param {string} response - The response
   */
  constructor(
    public readonly state: string,
    public readonly response: string
  ) {}

  /**
   * Creates a new GetWalletResponseResponse from a JSON object
   * @param {unknown} json - The JSON object
   * @returns {GetWalletResponseResponse} The GetWalletResponseResponse
   */
  static fromJSON(json: unknown): GetWalletResponseResponse {
    const parsed = GetWalletResponseResponseSchema.parse(json);
    return new GetWalletResponseResponse(parsed.state, parsed.response);
  }

  /**
   * Converts the GetWalletResponseResponse to a JSON object
   * @returns {GetWalletResponseResponseJSON} The JSON object
   */
  toJSON(): GetWalletResponseResponseJSON {
    return {
      state: this.state,
      response: this.response,
    };
  }
}

export type GetWalletResponseResult = MdocVerifyResult & { vpToken?: string };
