import { Amount } from '../common/amount';

export interface Surcharge {
    type: string;
    description: string;
    amount: Amount[];
}
