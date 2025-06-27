/**
 * Represents a function to load a presentation id
 * @param {string} sessionId - The session id
 * @returns {Promise<string | undefined>} The presentation id
 */
export interface LoadPresentationId {
  (sessionId: string): Promise<string | undefined>;
}
