import { EphemeralECDHPublicJwk, Nonce } from '../domain';
import {
  JarMode,
  PresentationDefinitionMode,
  PresentationType,
  ResponseMode,
} from '../ports/input';
import {
  GenerateWalletRedirectUri,
  GenerateWalletResponseRedirectUriTemplate,
} from '../ports/out/cfg';
import { GenerateNonce } from '../ports/out/cfg/GenerateNonce';
import { PostRequest } from '../ports/out/http';
import { IsMobile } from '../ports/out/http/isMobile';
import { GenerateEphemeralECDHPrivateJwk } from '../ports/out/jose';
import type { Logger } from '../ports/out/logging';
import { GeneratePresentationDefinition } from '../ports/out/prex';
import { Session, SessionSchemas } from '../ports/out/session';

/**
 * Parameters required for generating an InitTransaction request
 *
 * @public
 */
export interface GenerateRequestParams {
  /** The public URL of the verifier application */
  publicUrl: string;

  /** The path for wallet response redirect */
  walletResponseRedirectPath: string;

  /** The query template for wallet response redirect */
  walletResponseRedirectQueryTemplate: string;

  /** Whether the request is from a mobile device */
  isMobile: boolean;

  /** The type of presentation requested */
  tokenType: PresentationType;

  /** The generated nonce for this transaction */
  nonce: Nonce;

  /** Function to generate presentation definition */
  generatePresentationDefinition: GeneratePresentationDefinition;

  /** Optional response mode */
  responseMode?: ResponseMode;

  /** Optional JAR mode */
  jarMode?: JarMode;

  /** Optional presentation definition mode */
  presentationDefinitionMode?: PresentationDefinitionMode;

  /** Function to generate wallet response redirect URI template */
  generateWalletResponseRedirectUriTemplate: GenerateWalletResponseRedirectUriTemplate;

  /** Ephemeral ECDH public JWK for encrypted communication */
  ephemeralECDHPublicJwk: EphemeralECDHPublicJwk;
}

/**
 * Configuration parameters for creating an InitTransaction service
 *
 * @public
 */
export interface CreateInitTransactionServiceConfig {
  /** Base URL of the API endpoint */
  apiBaseUrl: string;

  /** API path for InitTransaction endpoint */
  apiPath: string;

  /** Public URL of the verifier application */
  publicUrl: string;

  /** URL of the wallet application */
  walletUrl: string;

  /** Path for wallet response redirect */
  walletResponseRedirectPath: string;

  /** Query template for wallet response redirect */
  walletResponseRedirectQueryTemplate: string;

  /** Function to detect mobile devices */
  isMobile: IsMobile;

  /** Type of presentation to request */
  tokenType: PresentationType;

  /** Function to generate nonces */
  generateNonce: GenerateNonce;

  /** Function to generate presentation definitions */
  generatePresentationDefinition: GeneratePresentationDefinition;

  /** Optional response mode */
  responseMode?: ResponseMode;

  /** Optional JAR mode */
  jarMode?: JarMode;

  /** Optional presentation definition mode */
  presentationDefinitionMode?: PresentationDefinitionMode;

  /** Function to generate wallet response redirect URI templates */
  generateWalletResponseRedirectUriTemplate: GenerateWalletResponseRedirectUriTemplate;

  /** HTTP POST request function */
  post: PostRequest;

  /** Session management interface */
  session: Session<SessionSchemas>;

  /** Function to generate wallet redirect URIs */
  generateWalletRedirectUri: GenerateWalletRedirectUri;

  /** Logger instance for logging events */
  logger: Logger;

  /** Function to generate ephemeral ECDH private JWK */
  generateEphemeralECDHPrivateJwk: GenerateEphemeralECDHPrivateJwk;
}
