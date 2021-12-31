import { ISignatureOption } from './signature-option';

export interface ISpecialServices {
    selectedSignatureOption: ISignatureOption;
    handlingTypes?: string[]; 
}
