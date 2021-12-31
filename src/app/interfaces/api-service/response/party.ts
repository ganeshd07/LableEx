import { Address } from "../request/address";
import { Tin } from "../request/tin";
import { AddressBookContact } from "./address-book-contact";

export interface Party {
    tins: Tin[];
    contact: AddressBookContact;
    address: Address;
}
