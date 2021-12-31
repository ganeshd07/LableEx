import { Recipient } from './recipient';
import { Sender } from './sender';


export interface PackageAndServiceOptionsRequestParams {
    sender: Sender;
    recipient: Recipient;
    shipdate?: string;
    systemOfMeasureType: string;
}
