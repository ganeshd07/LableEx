import { KeyValuePair } from '../../key-value-pair.interface';
import { Address } from './address';
import { Contact } from './contact';
import { Tin } from './tin';

export interface ResponsibleParty {
    address?: Address;
    contact?: Contact;
    accountNumber?: KeyValuePair;
    tins?: Tin[];
    deliveryInstructions?: string;
}
