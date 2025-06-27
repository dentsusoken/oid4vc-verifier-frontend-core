import {
  LoadPresentationId,
  StorePresentationId,
} from '../../../ports/out/session';

/**
 * In memory implementation of the session store
 */
export class SessionInMemory {
  private sessions: Map<string, string> = new Map();

  storePresentationId: StorePresentationId = async (
    sessionId,
    presentationId
  ) => {
    this.sessions.set(sessionId, presentationId);
  };

  loadPresentationId: LoadPresentationId = async (sessionId) => {
    return this.sessions.get(sessionId);
  };
}

const store = new SessionInMemory();

export const createLoadPresentationIdInvoker = (): LoadPresentationId => {
  return store.loadPresentationId;
};

export const createStorePresentationIdInvoker = (): StorePresentationId => {
  return store.storePresentationId;
};
