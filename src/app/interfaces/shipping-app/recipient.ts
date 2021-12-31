import { IAddress } from './address';

export interface IRecipient extends IAddress {
    address3?: string;
    residential: boolean;
    companyName: string;
    emailAddress?: string;
    phoneExt?: string;
}
