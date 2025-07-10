import { PresentationId } from '../domain';
import type { Logger } from '../ports/out/logging';
import { Session, SessionSchemas } from '../ports/out/session';
import { GetWalletResponseServiceError } from './GetWalletResponseService.errors';

/**
 * Retrieves presentation ID from session
 *
 * @param session - The session interface
 * @param logger - Logger instance for logging events
 * @returns The presentation ID from session
 * @throws {GetWalletResponseServiceError} When presentation ID is missing
 *
 * @internal
 */
export const getPresentationIdFromSession = async (
  session: Session<SessionSchemas>,
  logger: Logger
): Promise<PresentationId> => {
  logger.debug(
    'GetWalletResponseService',
    'Retrieving presentation ID from session'
  );

  const presentationId = await session.get('presentationId');

  if (!presentationId) {
    // Get session keys for debugging
    let sessionKeys: Array<keyof SessionSchemas> = [];
    try {
      sessionKeys = await session.keys();
    } catch (error) {
      logger.debug(
        'GetWalletResponseService',
        'Failed to retrieve session keys for debugging',
        {
          error: {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : String(error),
          },
        }
      );
    }

    logger.logSecurity(
      'error',
      'GetWalletResponseService',
      'Presentation ID not found in session',
      {
        context: {
          sessionKeys: sessionKeys.map(String),
        },
      }
    );

    throw new GetWalletResponseServiceError(
      'MISSING_PRESENTATION_ID',
      'Presentation ID not found in session. The session may have expired or the transaction was not properly initialized.'
    );
  }

  logger.debug(
    'GetWalletResponseService',
    'Presentation ID retrieved successfully',
    {
      context: {
        presentationId: presentationId.toString(),
      },
    }
  );

  return presentationId;
};
