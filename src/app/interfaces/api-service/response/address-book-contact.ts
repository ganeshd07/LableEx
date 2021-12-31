import { CompanyName } from './company-name';
import { PersonName } from './person-name';
import { PhoneNumberDetails } from './phone-number-details';

export interface AddressBookContact {
    contactId: string;
    nickName: string;
    personName: PersonName;
    phoneNumberDetails: PhoneNumberDetails[];
    companyName: CompanyName;
}
