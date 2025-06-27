import { InputDescriptorJSON } from 'oid4vc-prex';

export const mDLDifinition: InputDescriptorJSON = {
  id: 'org.iso.18013.5.1.mDL',
  name: 'Mobile Driving Licence',
  purpose: 'We need to verify your mobile driving licence',
  format: {
    mso_mdoc: {
      alg: ['ES256', 'ES384', 'ES512'],
    },
  },
  constraints: {
    fields: [
      {
        path: ["$['org.iso.18013.5.1']['family_name']"],
        intent_to_retain: false,
      },
    ],
  },
};

export const presentationDefinition = {
  id: 'test-presentation-id',
  input_descriptors: [mDLDifinition],
};
