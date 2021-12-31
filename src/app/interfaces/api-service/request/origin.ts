import { Address } from './address';
import { AddressAncillaryDetail } from './address-ancillary-detail';
import { Contact } from './contact';
import { ContactAncillaryDetail } from './contact-ancillary-detail';

export interface Origin {
    contact: Contact;
    contactAnciallaryDetail?: ContactAncillaryDetail;
    address: Address;
    addressAncillaryDetail?: AddressAncillaryDetail;
}
