import { describe, it, expect } from 'vitest';
import { AbstractConfiguration } from './AbstractConfiguration';

class TestConfiguration extends AbstractConfiguration {
    get apiBaseUrl(): string {
        return 'https://api.example.com';
    }
    get initTransactionPath(): string {
        return '/transaction/init';
    }
    get getWalletResponsePath(): string {
        return '/wallet/response';
    }
    get publicUrl(): string {
        return 'https://public.example.com';
    }
    get walletUrl(): string {
        return 'https://wallet.example.com';
    }
}

describe('AbstractConfiguration', () => {
    const config = new TestConfiguration();

    it('should return correct homePath', () => {
        expect(config.homePath).toBe('/home');
    });

    it('should return correct initPath', () => {
        expect(config.initPath).toBe('/init');
    });

    it('should return correct resultPath', () => {
        expect(config.resultPath).toBe('/result');
    });

    it('should return correct apiBaseUrl', () => {
        expect(config.apiBaseUrl).toBe('https://api.example.com');
    });

    it('should return correct initTransactionPath', () => {
        expect(config.initTransactionPath).toBe('/transaction/init');
    });

    it('should return correct getWalletResponsePath', () => {
        expect(config.getWalletResponsePath).toBe('/wallet/response');
    });

    it('should return correct publicUrl', () => {
        expect(config.publicUrl).toBe('https://public.example.com');
    });

    it('should return correct walletUrl', () => {
        expect(config.walletUrl).toBe('https://wallet.example.com');
    });
});