import { IAddress } from './address';

export interface ISender extends IAddress {
    companyName?: string;
    emailAddress?: string;
}
