import { AddressAncillaryDetail } from './address-ancillary-detail';
import { AddressCheckDetail } from './address-check-detail';
import { Party } from './party';

export interface AddressBookParty {
    party: Party;
    addressCheckDetail: AddressCheckDetail;
    partyType: string;
    addressAncillaryDetail: AddressAncillaryDetail;
}
