import { Amount } from '../common/amount';

export interface VariableHandlingChargeDetail {
    fixedValue: Amount;
    percentValue: number;
    rateElementBasis?: string;
    rateType: string;
    rateLevelType?: string;
}
