import { Error } from './error';

export interface SystemCommodity {
    commodityId: string;
    description?: string;
    errors?: Error[];
    error?: string;
}
