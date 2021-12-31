import { KeyTexts } from './key-texts';

export interface SignatureOptionsResponse {
    availableSignatureOptions: KeyTexts[];
    recommendedSignatureOption: KeyTexts;
}