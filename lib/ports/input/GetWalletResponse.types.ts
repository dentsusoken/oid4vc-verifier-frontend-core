import {
  PresentationSubmission,
  presentationSubmissionSchema,
} from 'oid4vc-prex';
import { z } from 'zod';

/**
 * Zod schema for the GetWalletResponseResult.
 * This schema ensures that the GetWalletResponseResult is valid.
 * @type {z.ZodObject}
 * @throws {z.ZodError} If the GetWalletResponseResult is invalid
 */
export const GetWalletResponseResultSchema = z.object({
  id_token: z.string().optional(),
  vp_token: z.string().optional(),
  presentation_submission: presentationSubmissionSchema.optional(),
  error: z.string().optional(),
  error_description: z.string().optional(),
});

/**
 * Represents a type of GetWalletResponseResult JSON
 */
export type GetWalletResponseResultJSON = z.infer<
  typeof GetWalletResponseResultSchema
>;

/**
 * Represents a GetWalletResponseResult
 * @class
 * @property {string} idToken - The id token
 * @property {string} vpToken - The vp token
 * @property {PresentationSubmission} presentationSubmission - The presentation submission
 * @property {string} error - The error
 * @property {string} error_description - The error description
 */
export class GetWalletResponseResult {
  /**
   * Creates a new GetWalletResponseResult
   * @param {string} idToken - The id token
   * @param {string} vpToken - The vp token
   * @param {PresentationSubmission} presentationSubmission - The presentation submission
   * @param {string} error - The error
   * @param {string} error_description - The error description
   */
  constructor(
    public readonly idToken?: string,
    public readonly vpToken?: string,
    public readonly presentationSubmission?: PresentationSubmission,
    public readonly error?: string,
    public readonly error_description?: string
  ) {}

  /**
   * Creates a new GetWalletResponseResult from a JSON object
   * @param {unknown} json - The JSON object
   * @returns {GetWalletResponseResult} The GetWalletResponseResult
   */
  static fromJSON(json: unknown): GetWalletResponseResult {
    const parsed = GetWalletResponseResultSchema.parse(json);
    return new GetWalletResponseResult(
      parsed.id_token,
      parsed.vp_token,
      parsed.presentation_submission
        ? PresentationSubmission.fromJSON(parsed.presentation_submission)
        : undefined,
      parsed.error,
      parsed.error_description
    );
  }

  /**
   * Converts the GetWalletResponseResult to a JSON object
   * @returns {GetWalletResponseResultJSON} The JSON object
   */
  toJSON(): GetWalletResponseResultJSON {
    return {
      id_token: this.idToken,
      vp_token: this.vpToken,
      presentation_submission: this.presentationSubmission?.toJSON(),
      error: this.error,
      error_description: this.error_description,
    };
  }
}
