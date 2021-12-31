export interface CommodityForm {
    itemType: string;
    itemDescription: string;
    quantity: number;
    quantityUnit: string;
    totalWeight: number;
    totalWeightUnit: string;
    totalCustomsValue: number;
    customsValueCurrency: string;
    countryOfManufacture: string;
    hsCode: string;
}
