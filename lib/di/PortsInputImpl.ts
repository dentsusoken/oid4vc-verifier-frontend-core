import { Configuration, PortsInput, PortsOut } from '.';
import {
  createGetWalletResponseService,
  createInitTransactionService,
} from '../services';

export class PortsInputImpl implements PortsInput {
  readonly #config: Configuration;
  readonly #portsOut: PortsOut;

  constructor(config: Configuration, portsOut: PortsOut) {
    this.#config = config;
    this.#portsOut = portsOut;
  }

  initTransaction() {
    return createInitTransactionService({
      apiBaseUrl: this.#config.apiBaseUrl(),
      apiPath: this.#config.initTransactionApiPath(),
      publicUrl: this.#config.publicUrl(),
      walletUrl: this.#config.walletUrl(),
      walletResponseRedirectPath: this.#config.resultViewPath(),
      generatePresentationDefinition:
        this.#portsOut.generatePresentationDefinition(),
      session: this.#portsOut.session(),
      walletResponseRedirectQueryTemplate:
        this.#config.walletResponseRedirectQueryTemplate(),
      isMobile: this.#portsOut.isMobile(),
      tokenType: this.#config.tokenType(),
      generateNonce: this.#portsOut.generateNonce(),
      generateWalletResponseRedirectUriTemplate:
        this.#portsOut.generateWalletResponseRedirectUriTemplate(),
      post: this.#portsOut.fetcher().post,
      generateWalletRedirectUri: this.#portsOut.generateWalletRedirectUri(),
      logger: this.#portsOut.logger(),
      generateEphemeralECDHPrivateJwk:
        this.#portsOut.generateEphemeralECDHPrivateJwk(),
    });
  }

  getWalletResponse() {
    return createGetWalletResponseService({
      apiBaseUrl: this.#config.apiBaseUrl(),
      apiPath: this.#config.getWalletResponseApiPath(),
      session: this.#portsOut.session(),
      get: this.#portsOut.fetcher().get,
      logger: this.#portsOut.logger(),
      mdocVerifier: this.#portsOut.mdocVerifier(),
      verifyJarmJwt: this.#portsOut.verifyJarmJwt(),
      jarmOption: this.#config.jarmOption(),
    });
  }
}
