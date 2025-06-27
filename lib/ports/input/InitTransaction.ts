import {
  InitTransactionRequest,
  InitTransactionResponse,
} from './InitTransaction.types';

/**
 * Represents a type of InitTransaction return value
 */
export interface InitTransactionResult {
  sessionId: string;
  response: InitTransactionResponse;
}

/**
 * Represents a function to initialize a transaction
 * @param {InitTransactionRequest} request - The request
 * @returns {Promise<InitTransactionResult>} The result
 */
export interface InitTransaction {
  (request: InitTransactionRequest): Promise<InitTransactionResult>;
}
