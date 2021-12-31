import { IAmount } from './amount';

export interface ISurcharge {
    amount: IAmount[];
    description: string;
    type: string;
}
