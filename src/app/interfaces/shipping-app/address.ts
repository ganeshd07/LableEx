export interface IAddress {
    address1: string;
    address2?: string;
    city: string;
    contactName: string;
    contactId?: string;
    countryCode: string;
    countryName: string;
    postalCode: string;
    stateOrProvinceCode?: string;
    postalAware?: boolean;
    stateAware?: boolean;
    phoneNumber: string;
    saveContact?: boolean;
    taxId?: string;
    passportNumber?: string;
    dialingPrefix?: string;
    partyId?: string;
}
