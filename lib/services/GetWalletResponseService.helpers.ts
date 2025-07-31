import { PresentationId } from '../domain';
import { Session, SessionSchemas } from '../ports/out/session';
import { GetWalletResponseServiceError } from './GetWalletResponseService.errors';

/**
 * Retrieves presentation ID from session
 *
 * @param session - The session interface
 * @returns The presentation ID from session
 * @throws {GetWalletResponseServiceError} When presentation ID is missing
 *
 * @internal
 */
export const getPresentationIdFromSession = async (
  session: Session<SessionSchemas>
): Promise<PresentationId> => {
  const presentationId = await session.get('presentationId');

  if (!presentationId) {
    try {
      await session.keys();
    } catch (error) {
      throw new GetWalletResponseServiceError(
        'SESSION_ERROR',
        'Failed to retrieve session keys for debugging',
        error instanceof Error ? error : new Error(String(error))
      );
    }

    throw new GetWalletResponseServiceError(
      'MISSING_PRESENTATION_ID',
      'Presentation ID not found in session. The session may have expired or the transaction was not properly initialized.'
    );
  }

  return presentationId;
};
