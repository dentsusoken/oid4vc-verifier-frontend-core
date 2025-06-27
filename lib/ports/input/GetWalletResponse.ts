import { GetWalletResponseResult } from './GetWalletResponse.types';

/**
 * Represents a function to get a wallet response from backend
 *
 * @param {string} sessionId - The session id
 * @param {string} responseCode - The response code
 * @returns {Promise<GetWalletResponseResult>} The wallet response
 */
export interface GetWalletResponse {
  (sessionId: string, responseCode?: string): Promise<GetWalletResponseResult>;
}
