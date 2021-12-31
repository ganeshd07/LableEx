import { DateDetail } from './date-detail';

export interface Commit {
    dateDetail: DateDetail;
    daysInTransit?: string;
    label?: string;
    commitMessageDetails?: string;
    commodityName: string;
}
