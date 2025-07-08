import { PresentationDefinitionJSON } from '@vecrea/oid4vc-prex';

/**
 * Interface for presentation definition generation functionality
 *
 * Defines the contract for creating presentation definitions according to
 * the DIF (Decentralized Identity Foundation) Presentation Exchange specification.
 * Presentation definitions describe the requirements for credential presentations
 * that verifiers expect from credential holders (wallets).
 *
 * A presentation definition specifies:
 * - **Input descriptors**: What types of credentials are required
 * - **Constraints**: Rules for credential validation and filtering
 * - **Submission requirements**: How credentials should be combined or presented
 * - **Format preferences**: Supported credential formats (JWT, LD-Proof, etc.)
 *
 * ## Use Cases
 *
 * Presentation definitions are used throughout the OID4VC verification flow:
 * - **Identity verification**: Requesting identity documents or attributes
 * - **Access control**: Requiring specific permissions or memberships
 * - **Age verification**: Checking minimum age without revealing exact birthdate
 * - **Professional credentials**: Verifying licenses, certifications, or qualifications
 * - **Composite requirements**: Combining multiple credential types
 *
 * ## Implementation Considerations
 *
 * - **Schema compliance**: Ensure generated definitions follow DIF PE v2.0+ specifications
 * - **Wallet compatibility**: Consider what formats and features target wallets support
 * - **Privacy**: Design constraints to minimize disclosed personal information
 * - **Flexibility**: Allow for different credential issuers and schema variations
 * - **Validation**: Include proper error handling for malformed or incompatible credentials
 *
 * @example
 * ```typescript
 * // Implementation for identity verification
 * const generatePresentationDefinition: GeneratePresentationDefinition = (): PresentationDefinitionJSON => {
 *   return {
 *     id: 'identity-verification-req',
 *     purpose: 'We need to verify your identity to complete this transaction',
 *     input_descriptors: [
 *       {
 *         id: 'government-id',
 *         name: 'Government-issued ID',
 *         purpose: 'Verify your legal identity',
 *         constraints: {
 *           fields: [
 *             {
 *               path: ['$.credentialSubject.type'],
 *               filter: {
 *                 type: 'string',
 *                 enum: ['GovernmentID', 'DriversLicense', 'Passport']
 *               }
 *             },
 *             {
 *               path: ['$.credentialSubject.birthDate'],
 *               filter: {
 *                 type: 'string',
 *                 format: 'date'
 *               }
 *             }
 *           ]
 *         }
 *       }
 *     ],
 *     format: {
 *       jwt_vc: {
 *         alg: ['ES256', 'RS256']
 *       }
 *     }
 *   };
 * };
 *
 * // Usage in verification request
 * const presDefn = generatePresentationDefinition();
 * const authRequest = {
 *   presentation_definition: presDefn,
 *   client_id: 'verifier-app',
 *   response_type: 'vp_token',
 *   // ... other parameters
 * };
 * ```
 *
 * @see {@link https://identity.foundation/presentation-exchange/} - DIF Presentation Exchange Specification
 * @see {@link https://openid.net/specs/openid-4-verifiable-presentations-1_0.html} - OpenID4VP Specification
 * @see {@link https://www.w3.org/TR/vc-data-model/} - W3C Verifiable Credentials Data Model
 *
 * @public
 */
export interface GeneratePresentationDefinition {
  /**
   * Generates a presentation definition for credential verification
   *
   * Creates a structured definition that specifies what types of verifiable
   * credentials the verifier requires from the credential holder. The definition
   * must conform to the DIF Presentation Exchange specification and be compatible
   * with the target wallet applications.
   *
   * @returns A complete presentation definition in JSON format
   *
   * @throws {Error} If the presentation definition generation fails
   * @throws {ValidationError} If the generated definition is invalid or malformed
   *
   * @example
   * ```typescript
   * // Generate definition for age verification
   * const presDefn = generatePresentationDefinition();
   *
   * // The returned definition might look like:
   * // {
   * //   id: 'age-verification',
   * //   purpose: 'Verify you are over 18 years old',
   * //   input_descriptors: [
   * //     {
   * //       id: 'age-credential',
   * //       constraints: {
   * //         fields: [
   * //           {
   * //             path: ['$.credentialSubject.over18'],
   * //             filter: { type: 'boolean', const: true }
   * //           }
   * //         ]
   * //       }
   * //     }
   * //   ]
   * // }
   * ```
   *
   * @remarks
   * - The returned object should be serializable to JSON for HTTP transmission
   * - Consider wallet capabilities when designing constraints and format requirements
   * - Include human-readable purposes and names for better user experience
   * - Validate the generated definition against the DIF PE schema if possible
   * - Consider internationalization for purpose and name strings
   */
  (): PresentationDefinitionJSON;
}
