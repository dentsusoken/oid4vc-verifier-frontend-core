import { LoadPresentationId, StorePresentationId } from '../ports/out/session';
import { Fetcher } from '../ports/out/http';

export interface PortsOut {
  get storePresentationId(): StorePresentationId;
  get loadPresentationId(): LoadPresentationId;
  get fetcher(): Fetcher;
}
