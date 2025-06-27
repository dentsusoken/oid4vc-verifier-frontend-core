import { describe, it, expect } from 'vitest';
import { Configuration } from './Configuration';

class TestConfiguration implements Configuration {
    get apiBaseUrl(): string {
        return 'https://api.example.com';
    }
    get initTransactionPath(): string {
        return '/init';
    }
    get getWalletResponsePath(): string {
        return '/wallet-response';
    }
    get publicUrl(): string {
        return 'https://example.com';
    }
    get homePath(): string {
        return '/home';
    }
    get initPath(): string {
        return '/init';
    }
    get resultPath(): string {
        return '/result';
    }
    get walletUrl(): string {
        return 'wallet://example';
    }
}

describe('Configuration', () => {
    const config = new TestConfiguration();

    it('should return correct apiBaseUrl', () => {
        expect(config.apiBaseUrl).toBe('https://api.example.com');
    });

    it('should return correct initTransactionPath', () => {
        expect(config.initTransactionPath).toBe('/init');
    });

    it('should return correct getWalletResponsePath', () => {
        expect(config.getWalletResponsePath).toBe('/wallet-response');
    });

    it('should return correct publicUrl', () => {
        expect(config.publicUrl).toBe('https://example.com');
    });

    it('should return correct homePath', () => {
        expect(config.homePath).toBe('/home');
    });

    it('should return correct initPath', () => {
        expect(config.initPath).toBe('/init');
    });

    it('should return correct resultPath', () => {
        expect(config.resultPath).toBe('/result');
    });

    it('should return correct walletUrl', () => {
        expect(config.walletUrl).toBe('wallet://example');
    });
});