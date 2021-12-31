import { ICommodity } from './commodity';

export interface ICustomsInfo {
    commodityList: ICommodity[];
    customsType: string;
    productType: string;
    productPurpose: string;
    documentType: string;
    documentTypeCode: string;
    documentValue: number;
    documentValueUnits: string;
}
