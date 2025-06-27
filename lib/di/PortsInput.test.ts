import { describe, it, expect } from 'vitest';
import { PortsIn } from './PortsInput';
import { InitTransaction, GetWalletResponse } from '../ports/input';

class MockPortsIn implements PortsIn {
    get initTransaction(): InitTransaction {
        return {} as InitTransaction;
    }
    get getWalletResponse(): GetWalletResponse {
        return {} as GetWalletResponse;
    }
}

class InvalidPortsIn implements PortsIn {
    get initTransaction(): InitTransaction {
        throw new Error('Invalid InitTransaction');
    }
    get getWalletResponse(): GetWalletResponse {
        throw new Error('Invalid GetWalletResponse');
    }
}

describe('PortsIn', () => {
    it('should return the correct InitTransaction instance', () => {
        const portsIn = new MockPortsIn();
        expect(portsIn.initTransaction).toBeInstanceOf(Object);
    });

    it('should return the correct GetWalletResponse instance', () => {
        const portsIn = new MockPortsIn();
        expect(portsIn.getWalletResponse).toBeInstanceOf(Object);
    });

    it('should throw an error for invalid InitTransaction', () => {
        const portsIn = new InvalidPortsIn();
        expect(() => portsIn.initTransaction).toThrow('Invalid InitTransaction');
    });

    it('should throw an error for invalid GetWalletResponse', () => {
        const portsIn = new InvalidPortsIn();
        expect(() => portsIn.getWalletResponse).toThrow('Invalid GetWalletResponse');
    });
});
