import { GeneratePresentationDefinition } from '../../../ports';

/**
 * Mock implementation of presentation definition generator for testing purposes
 *
 * Provides a test-friendly implementation that returns a predefined presentation
 * definition structure. This can be used in unit tests and integration tests
 * where a consistent, predictable presentation definition is needed.
 *
 * @example
 * ```typescript
 * import { mcokGeneratePresentationDefinition } from './McokGeneratePresentationDefinition';
 *
 * const presentationDef = mcokGeneratePresentationDefinition();
 * console.log(presentationDef.name); // 'Test Presentation'
 * ```
 *
 * @public
 */
export const mcokGeneratePresentationDefinition: GeneratePresentationDefinition =
  () => {
    return {
      id: '123',
      name: 'Test Presentation',
      purpose: 'Test Purpose',
      input_descriptors: [
        {
          id: '123',
          name: 'Test Input Descriptor',
          purpose: 'Test Purpose',
          constraints: {
            fields: [
              {
                path: ['$.credentialSubject.name'],
                filter: { type: 'string', const: 'Test Name' },
              },
            ],
          },
        },
      ],
    };
  };
