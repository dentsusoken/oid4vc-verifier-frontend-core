import {
  PresentationDefinition,
  presentationDefinitionSchema,
} from '@vecrea/oid4vc-prex';
import { z } from 'zod';
import { PresentationId, presentationIdSchema } from '../../domain';

/**
 * Zod schema for the PresentationType.
 * This schema ensures that the PresentationType is valid.
 * @type {z.ZodEnum}
 * @throws {z.ZodError} If the PresentationType is invalid
 */
export const presentationTypeSchema = z.enum([
  'id_token',
  'vp_token',
  'id_token vp_token',
]);

/**
 * Zod schema for the ResponseMode.
 * This schema ensures that the ResponseMode is valid.
 * @type {z.ZodEnum}
 * @throws {z.ZodError} If the ResponseMode is invalid
 */
export const responseModeSchema = z.enum(['direct_post', 'direct_post.jwt']);

/**
 * Zod schema for the JarMode.
 * This schema ensures that the JarMode is valid.
 * @type {z.ZodEnum}
 * @throws {z.ZodError} If the JarMode is invalid
 */
export const jarModeSchema = z.enum(['by_value', 'by_reference']);

/**
 * Zod schema for the PresentationDefinitionMode.
 * This schema ensures that the PresentationDefinitionMode is valid.
 * @type {z.ZodEnum}
 * @throws {z.ZodError} If the PresentationDefinitionMode is invalid
 */
export const presentationDefinitionModeSchema = z.enum([
  'by_value',
  'by_reference',
]);

/**
 * Zod schema for the InitTransactionRequest.
 * This schema ensures that the InitTransactionRequest is valid.
 * @type {z.ZodObject}
 * @throws {z.ZodError} If the InitTransactionRequest is invalid
 */
export const InitTransactionRequestSchema = z.object({
  type: presentationTypeSchema,
  presentation_definition: presentationDefinitionSchema,
  nonce: z.string().optional(),
  response_mode: responseModeSchema.optional(),
  jar_mode: jarModeSchema.optional(),
  presentation_definition_mode: presentationDefinitionModeSchema.optional(),
  wallet_response_redirect_uri_template: z.string().optional(),
});

/**
 * Represents a type of PresentationType
 */
export type PresentationType = z.infer<typeof presentationTypeSchema>;

/**
 * Represents a type of ResponseMode
 */
export type ResponseMode = z.infer<typeof responseModeSchema>;

/**
 * Represents a type of JarMode
 */
export type JarMode = z.infer<typeof jarModeSchema>;

/**
 * Represents a type of PresentationDefinitionMode
 */
export type PresentationDefinitionMode = z.infer<
  typeof presentationDefinitionModeSchema
>;

/**
 * Represents a type of InitTransactionRequest JSON
 */
export type InitTransactionRequestJSON = z.infer<
  typeof InitTransactionRequestSchema
>;

/**
 * Represents a type of InitTransactionRequest
 * @class
 * @property {PresentationType} type - The type
 * @property {PresentationDefinition} presentationDefinition - The presentation definition
 * @property {string} nonce - The nonce
 * @property {ResponseMode} responseMode - The response mode
 * @property {JarMode} jarMode - The jar mode
 * @property {PresentationDefinitionMode} presentationDefinitionMode - The presentation definition mode
 * @property {string} walletResponseRedirectUriTemplate - The wallet response redirect uri template
 */
export class InitTransactionRequest {
  /**
   * Creates a new InitTransactionRequest
   * @param {PresentationType} type - The type
   * @param {PresentationDefinition} presentationDefinition - The presentation definition
   * @param {string} nonce - The nonce
   * @param {ResponseMode} responseMode - The response mode
   * @param {JarMode} jarMode - The jar mode
   * @param {PresentationDefinitionMode} presentationDefinitionMode - The presentation definition mode
   * @param {string} walletResponseRedirectUriTemplate - The wallet response redirect uri template
   */
  constructor(
    public readonly type: PresentationType,
    public readonly presentationDefinition: PresentationDefinition,
    public readonly nonce?: string,
    public readonly responseMode?: ResponseMode,
    public readonly jarMode?: JarMode,
    public readonly presentationDefinitionMode?: PresentationDefinitionMode,
    public readonly walletResponseRedirectUriTemplate?: string
  ) {}

  /**
   * Creates a new InitTransactionRequest from a JSON object
   * @param {unknown} json - The JSON object
   * @returns {InitTransactionRequest} The InitTransactionRequest
   */
  static fromJSON(json: unknown): InitTransactionRequest {
    const parsed = InitTransactionRequestSchema.parse(json);
    return new InitTransactionRequest(
      parsed.type,
      PresentationDefinition.fromJSON(parsed.presentation_definition),
      parsed.nonce,
      parsed.response_mode,
      parsed.jar_mode,
      parsed.presentation_definition_mode,
      parsed.wallet_response_redirect_uri_template
    );
  }

  /**
   * Converts the InitTransactionRequest to a JSON object
   * @returns {InitTransactionRequestJSON} The JSON object
   */
  toJSON(): InitTransactionRequestJSON {
    return {
      type: this.type,
      presentation_definition: this.presentationDefinition.toJSON(),
      nonce: this.nonce,
      response_mode: this.responseMode,
      jar_mode: this.jarMode,
      presentation_definition_mode: this.presentationDefinitionMode,
      wallet_response_redirect_uri_template:
        this.walletResponseRedirectUriTemplate,
    };
  }
}

/**
 * Zod schema for the InitTransactionResponse.
 * This schema ensures that the InitTransactionResponse is valid.
 * @type {z.ZodObject}
 * @throws {z.ZodError} If the InitTransactionResponse is invalid
 */
export const initTransactionResponseSchema = z.object({
  presentation_id: presentationIdSchema,
  client_id: z.string(),
  request: z.string().optional(),
  request_uri: z.string().url().optional(),
});

/**
 * Represents a type of InitTransactionResponse JSON
 */
export type InitTransactionResponseJSON = z.infer<
  typeof initTransactionResponseSchema
>;

/**
 * Represents a type of WalletRedirectParams
 */
export type WalletRedirectParams = Omit<
  InitTransactionResponseJSON,
  'presentation_id'
>;

/**
 * Represents a type of InitTransactionResponse
 * @class
 * @property {string} presentationId - The presentation id
 * @property {string} clientId - The client id
 * @property {string} request - The request
 * @property {string} requestUri - The request uri
 */
export class InitTransactionResponse {
  /**
   * Creates a new InitTransactionResponse
   * @param {string} presentationId - The presentation id
   * @param {string} clientId - The client id
   * @param {string} request - The request
   * @param {string} requestUri - The request uri
   */
  constructor(
    public readonly presentationId: PresentationId,
    public readonly clientId: string,
    public readonly request?: string,
    public readonly requestUri?: string
  ) {}

  /**
   * Creates a new InitTransactionResponse from a JSON object
   * @param {unknown} json - The JSON object
   * @returns {InitTransactionResponse} The InitTransactionResponse
   */
  static fromJSON(json: unknown): InitTransactionResponse {
    const parsed = initTransactionResponseSchema.parse(json);
    return new InitTransactionResponse(
      parsed.presentation_id,
      parsed.client_id,
      parsed.request,
      parsed.request_uri
    );
  }

  /**
   * Converts the InitTransactionResponse to a JSON object
   * @returns {InitTransactionResponseJSON} The JSON object
   */
  toJSON(): InitTransactionResponseJSON {
    return {
      presentation_id: this.presentationId,
      client_id: this.clientId,
      request: this.request,
      request_uri: this.requestUri,
    };
  }

  /**
   * Converts the InitTransactionResponse to WalletRedirectParams
   * @returns {WalletRedirectParams} The WalletRedirectParams
   */
  toWalletRedirectParams(): WalletRedirectParams {
    return {
      client_id: this.clientId,
      request: this.request,
      request_uri: this.requestUri,
    };
  }
}

/**
 * Represents a type of InitTransaction return value
 */
export interface InitTransactionResult {
  walletRedirectUri: string;
  isMobile: boolean;
}
