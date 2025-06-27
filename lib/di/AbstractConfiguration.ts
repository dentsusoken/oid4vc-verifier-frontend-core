import { Configuration } from './Configuration';

/**
 * Abstract class that implements the Configuration interface
 * @implements {Configuration}
 */
export abstract class AbstractConfiguration implements Configuration {
  abstract get apiBaseUrl(): string;
  abstract get initTransactionPath(): string;
  abstract get getWalletResponsePath(): string;
  abstract get publicUrl(): string;
  abstract get walletUrl(): string;

  get homePath(): string {
    return '/home';
  }
  get initPath(): string {
    return '/init';
  }
  get resultPath(): string {
    return '/result';
  }
}
