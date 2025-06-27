/**
 * Represents a function to store a presentation id
 * @param {string} sessionId - The session id
 * @param {string} presentationId - The presentation id
 * @returns {Promise<void>} The result
 */
export interface StorePresentationId {
  (sessionId: string, presentationId: string): Promise<void>;
}
