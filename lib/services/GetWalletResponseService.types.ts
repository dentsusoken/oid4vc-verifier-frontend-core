import { JarmOption } from '../domain';
import { MdocVerifier } from '../ports';
import { GetRequest } from '../ports/out/http';
import { VerifyJarmJwt } from '../ports/out/jose';
import { Session, SessionSchemas } from '../ports/out/session';

/**
 * Configuration parameters for creating a GetWalletResponse service
 *
 * @public
 */
export interface CreateGetWalletResponseServiceConfig {
  /** Base URL of the API endpoint */
  apiBaseUrl: string;

  /** API path for GetWalletResponse endpoint */
  apiPath: string;

  /** HTTP GET request function */
  get: GetRequest;

  /** Session management interface */
  session: Session<SessionSchemas>;

  /** MDOC verifier instance */
  mdocVerifier: MdocVerifier;

  /** JARM verifier instance */
  verifyJarmJwt: VerifyJarmJwt;

  /** JARM option */
  jarmOption: JarmOption;
}
