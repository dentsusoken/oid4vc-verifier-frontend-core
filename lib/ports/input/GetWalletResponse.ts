import { GetWalletResponseResult } from './GetWalletResponse.types';

/**
 * Represents a function to get a wallet response from backend
 *
 * @param {Request} request - The request
 * @returns {Promise<GetWalletResponseResult>} The wallet response
 */
export interface GetWalletResponse {
  (request: Request): Promise<GetWalletResponseResult>;
}
