export interface RecipientForm {
    addressLine1: string;
    addressLine2?: string;
    addressLine3?: string;
    residential: boolean;
    contactName: string;
    companyName: string;
    phoneNumber: string;
    phoneExt: string;
    email?: string;
    taxId?: string;
    passportNo?: string;
}
