import { KeyValuePair } from '../../key-value-pair.interface';
import { Customer } from './customer';
import { ExpandedAccounts } from './expanded-accounts';
import { RegisteredContactAndAddress } from './registered-contact-and-address';
import { SiteWideProfile } from './site-wide-profile';

export interface UserProfile {
    registeredContactAndAddress: RegisteredContactAndAddress;
    isManaged: boolean;
    defaultAccount: KeyValuePair;
    customer: Customer;
    expandedAccounts: ExpandedAccounts[];
    siteWideProfile: SiteWideProfile;
}
