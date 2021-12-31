export interface IAddressBookResponse {
    address: {
        city: string;
        countryCode: string;
        postalCode: string;
        residential: boolean;
        stateOrProvinceCode: string;
        streetlines: string[];
        visitor: string;
    },
    contact: {
        companyName: string;
        emailAddress: string;
        passportNo: string;
        personName: string;
        phoneNumber: string;
        taxId: string;
        phoneExtension?: string
    },
    partyId: string
}