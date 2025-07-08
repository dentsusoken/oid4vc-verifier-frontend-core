import { GetWalletResponseResult } from './GetWalletResponse.types';

/**
 * Represents a function to get a wallet response from backend
 *
 * @param {string} presentationId - The presentation id
 * @param {string} responseCode - The response code
 * @returns {Promise<GetWalletResponseResult>} The wallet response
 */
export interface GetWalletResponse {
  (responseCode?: string): Promise<GetWalletResponseResult>;
}
