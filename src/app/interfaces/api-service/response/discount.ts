import { Amount } from '../common/amount';

export interface Discount {
    type: string;
    description: string;
    amount: Amount[];
    percent: number;
}
