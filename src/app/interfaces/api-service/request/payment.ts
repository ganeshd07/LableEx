import { Payor } from './payor';

export interface Payment {
    paymentType: string;
    payor?: Payor;
    accountNumber?: string;
    // creditCard?: {}; // uncomment incase needed
    // creditCardTransactionDetail?: {}; // uncomment incase needed
}
