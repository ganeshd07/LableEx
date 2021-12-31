import { MessageDescs } from './message-descs.interface';

export interface MessageCentreResponse {
    messageId: number;
    category: string;
    countryCode: string;
    endDate: string;
    pin: boolean;
    startDate: string;
    isExpanded?: boolean;
    imgPath?: string;
    messageDescs: MessageDescs[];
}
