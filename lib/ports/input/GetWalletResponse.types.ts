import {
  PresentationSubmission,
  presentationSubmissionSchema,
} from '@vecrea/oid4vc-prex';
import { z } from 'zod';
import { MdocVerifyResult } from '../../../../oid4vc-verifier-frontend-hono/build/mdoc-cbor-ts/dist/types/handlers/verify/mdoc';

/**
 * Zod schema for the GetWalletResponseResponse.
 * This schema ensures that the GetWalletResponseResponse is valid.
 * @type {z.ZodObject}
 * @throws {z.ZodError} If the GetWalletResponseResponse is invalid
 */
export const GetWalletResponseResponseSchema = z.object({
  id_token: z.string().optional(),
  vp_token: z.string().optional(),
  presentation_submission: presentationSubmissionSchema.optional(),
  error: z.string().optional(),
  error_description: z.string().optional(),
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
 * @property {string} idToken - The id token
 * @property {string} vpToken - The vp token
 * @property {PresentationSubmission} presentationSubmission - The presentation submission
 * @property {string} error - The error
 * @property {string} error_description - The error description
 */
export class GetWalletResponseResponse {
  /**
   * Creates a new GetWalletResponseResponse
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
   * Creates a new GetWalletResponseResponse from a JSON object
   * @param {unknown} json - The JSON object
   * @returns {GetWalletResponseResponse} The GetWalletResponseResponse
   */
  static fromJSON(json: unknown): GetWalletResponseResponse {
    const parsed = GetWalletResponseResponseSchema.parse(json);
    return new GetWalletResponseResponse(
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
   * Converts the GetWalletResponseResponse to a JSON object
   * @returns {GetWalletResponseResponseJSON} The JSON object
   */
  toJSON(): GetWalletResponseResponseJSON {
    return {
      id_token: this.idToken,
      vp_token: this.vpToken,
      presentation_submission: this.presentationSubmission?.toJSON(),
      error: this.error,
      error_description: this.error_description,
    };
  }
}

export type GetWalletResponseResult = MdocVerifyResult & { vpToken?: string };
