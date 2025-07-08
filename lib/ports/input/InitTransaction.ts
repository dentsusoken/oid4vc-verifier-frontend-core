import { InitTransactionResult } from './InitTransaction.types';

/**
 * Represents a function to initialize a transaction
 * @param {Request} request - The request
 * @returns {Promise<InitTransactionResult>} The result
 */
export interface InitTransaction {
  (request: Request): Promise<InitTransactionResult>;
}
