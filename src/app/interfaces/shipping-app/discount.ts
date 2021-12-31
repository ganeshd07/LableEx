import { IAmount } from './amount';
import { IAmountList } from './amount-list';

export interface IDiscount {
    amountList: IAmountList[];
    description: string;
    percent: number;
    type: string;
}
