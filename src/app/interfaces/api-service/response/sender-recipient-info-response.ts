import { CommercialInvoiceSupport } from './commercial-invoice-support';
import { CustomsValueSupport } from './customs-value-support';
import { TaxIdInfo } from './tax-id-info';

export interface SenderRecipientInfoResponse {
    packageContentsIndicator: string;
    taxIdInfo: TaxIdInfo;
    customsClearance: string;
    commercialInvoiceSupport: CommercialInvoiceSupport;
    notaFiscal: string;
    customsValueSupport: CustomsValueSupport;
    goodsInFreeCirculation: string;
    itemDescriptionForClearanceIndicator: string;
    documentDescriptionIndicator: string;
    shipmentPurposeIndicator: string;
    shipmentPurposeForServiceTypeSelectionIndicator: string;
    freightOnValueIndicator: string;
    recipientResidentialIndicator: string;
    deliveryInstructionsIndicator: string;
    notAllowedDeclaredValueDocumentDescriptions: string[];
}
