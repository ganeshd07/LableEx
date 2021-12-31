import { Address } from '../request/address';
import { Contact } from '../request/contact';

export interface RegisteredContactAndAddress {
    contact: Contact;
    address: Address;
}
