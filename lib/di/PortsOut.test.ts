import { describe, it, expect } from 'vitest';
import { PortsOut } from './PortsOut';
import { LoadPresentationId, StorePresentationId } from '../ports/out/session';

class MockPortsOut implements PortsOut {
    get storePresentationId(): StorePresentationId {
        return {} as StorePresentationId;
    }
    get loadPresentationId(): LoadPresentationId {
        return {} as LoadPresentationId;
    }
}

class InvalidPortsOut implements PortsOut {
    get storePresentationId(): StorePresentationId {
        throw new Error('Invalid StorePresentationId');
    }
    get loadPresentationId(): LoadPresentationId {
        throw new Error('Invalid LoadPresentationId');
    }
}

describe('PortsOut', () => {
    it('should return the correct StorePresentationId and LoadPresentationId instances', () => {
        const portsOut = new MockPortsOut();
        expect(portsOut.storePresentationId).toBeInstanceOf(Object);
        expect(portsOut.loadPresentationId).toBeInstanceOf(Object);
    });

    it('should throw an error for invalid StorePresentationId', () => {
        const portsOut = new InvalidPortsOut();
        expect(() => portsOut.storePresentationId).toThrow('Invalid StorePresentationId');
    });

    it('should throw an error for invalid LoadPresentationId', () => {
        const portsOut = new InvalidPortsOut();
        expect(() => portsOut.loadPresentationId).toThrow('Invalid LoadPresentationId');
    });
});
