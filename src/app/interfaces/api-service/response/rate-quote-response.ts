import { RateReplyDetail } from './rate-reply-detail';

export interface RateQuoteResponse {
    rateReplyDetails: RateReplyDetail[];
    servicesAvailableAndFiltered: boolean;
    quoteDate: string;
    encoded: boolean;
}
