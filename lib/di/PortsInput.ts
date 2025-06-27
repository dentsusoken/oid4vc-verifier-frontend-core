import { GetWalletResponse, InitTransaction } from '../ports/input';

export interface PortsIn {
  get initTransaction(): InitTransaction;
  get getWalletResponse(): GetWalletResponse;
}
