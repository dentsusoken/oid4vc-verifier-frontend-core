/**
 * Configuration interface
 */
export interface Configuration {
  /**
   * The base url of the api
   */
  get apiBaseUrl(): string;
  /**
   * The api path of the init transaction
   */
  get initTransactionPath(): string;
  /**
   * The api path of the get wallet response
   */
  get getWalletResponsePath(): string;
  /**
   * The public url of frontend
   */
  get publicUrl(): string;
  /**
   * The home path of frontend
   */
  get homePath(): string;
  /**
   * The init path of frontend
   */
  get initPath(): string;
  /**
   * The result path of frontend
   */
  get resultPath(): string;
  /**
   * The wallet deep link
   */
  get walletUrl(): string;
}
