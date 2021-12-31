import { KeyTexts } from 'src/app/interfaces/api-service/response/key-texts';
import { ItemsTypeObj } from 'src/app/interfaces/items-type-obj.interface';
import { KeyValuePair } from 'src/app/interfaces/key-value-pair.interface';
import { QuantityUnitObj } from 'src/app/interfaces/quantity-unit-obj';
import { ItemsType } from '../enum/items-type.enum';


export class CustomsDetails {

    public static getShipmentPurposeOptions(): KeyValuePair[] {
        return [
            {
                key: 'commercial',
                value: 'Commercial'
            },
            {
                key: 'gift',
                value: 'Gift'
            },
            {
                key: 'sample',
                value: 'Sample'
            },
            {
                key: 'repairAndReturn',
                value: 'Repair and Return'
            },
            {
                key: 'personalEffects',
                value: 'Personal Effects',
            },
            {
                key: 'personalUse',
                value: 'Personal Use',
            }
        ];
    }

    public static getDocumentTypes(): KeyTexts[] {
        return [
            {
                key: 'CORRESPONDENCE_NO_COMMERCIAL_VALUE',
                displayText: 'Correspondence/No Commercial Value'
            },
            {
                key: 'PERSONAL_DOCUMENT',
                displayText: 'Personal Document'
            },
            {
                key: 'INTEROFFICE_DOCUMENT',
                displayText: 'Interoffice Document'
            },
            {
                key: 'BUSINESS_DOCUMENT',
                displayText: 'Business Document'
            },
            {
                key: 'OTHER',
                displayText: 'Other',
            }
        ];
    }

    public static getDocumentTypeByCode(docTypeCode: string): KeyTexts {
        return this.getDocumentTypes().find(docType => docType.key === docTypeCode);
    }

    public static getQuantityUnitLabel(unit: string) {
        return this.getQuantityUnits().find(qty => qty.unit === unit).label;
    }

    public static getWeightUnitLabel(unit: string) {
        return this.getWeightUnits().find(weightObj => weightObj.unit === unit).label;
    }

    public static getQuantityUnits(): QuantityUnitObj[] {
        return [
            {
                unit: 'pcs',
                label: 'Pieces'
            },
            {
                unit: 'bbl',
                label: 'Barrels'
            },
            {
                unit: 'ct',
                label: 'Carat'
            },
            {
                unit: 'cg',
                label: 'Centigram'
            },
            {
                unit: 'cm',
                label: 'Centimeters'
            },
            {
                unit: 'm3',
                label: 'Cubic Meters'
            },
            {
                unit: 'Ci',
                label: 'Curie'
            },
            {
                unit: 'dz',
                label: 'Dozen'
            },
            {
                unit: 'gal',
                label: 'Gallon'
            },
            {
                unit: 'GBq',
                label: 'Giga Becquerels'
            },
            {
                unit: 'grl',
                label: 'Gross Lines'
            },
            {
                unit: 'ptg',
                label: 'Plutonium Content Grams'
            },
            {
                unit: 'lb',
                label: 'Pound'
            },
            {
                unit: 'sqin',
                label: 'Square Inches'
            },
            {
                unit: 'km',
                label: 'Thousand Meters'
            },
            {
                unit: 'mtrv',
                label: 'Ton Raw Value'
            },
            {
                unit: 'toz',
                label: 'Troy Ounce'
            },
            {
                unit: 'yd',
                label: 'Yard'
            }
        ];
    }

    public static getWeightUnits() {
        return [
            {
                unit: 'kg',
                label: 'Kilogram'
            },
            {
                unit: 'lb',
                label: 'Pound'
            }
        ];
    }

    // For main commodity page's items type
    public static initialItemsTypeObj(): ItemsTypeObj[] {
        return [
            {
                typeKey: ItemsType.ELECTRONICS,
                selected: false
            },
            {
                typeKey: ItemsType.JEWELLERY,
                selected: false
            },
            {
                typeKey: ItemsType.HEALTH_CARE,
                selected: false
            },
            {
                typeKey: ItemsType.GARMENTS,
                selected: false
            },
            {
                typeKey: ItemsType.LITHIUM_BATTERY,
                selected: false
            },
            {
                typeKey: ItemsType.OTHERS,
                selected: false
            }
        ];
    }

    // Commodity Main Item Types
    public static mainCommodityItemTypes(): KeyTexts[] {
        return [
            {
                key: ItemsType.ELECTRONICS,
                displayText: 'Electronics'
            },
            {
                key: ItemsType.JEWELLERY,
                displayText: 'Jewellery'
            },
            {
                key: ItemsType.HEALTH_CARE,
                displayText: 'Health Care'
            },
            {
                key: ItemsType.GARMENTS,
                displayText: 'Garments'
            },
            {
                key: ItemsType.LITHIUM_BATTERY,
                displayText: 'Lithium Battery'
            },
            {
                key: ItemsType.OTHERS,
                displayText: 'Others'
            }
        ];
    }


    public static Currency = 'CURRENCY';
    public static CountryOfManufacture = 'COM';
    public static CountryType = 'manufacture';
    public static UOM = 'UOM';
    public static APAC = 'APAC';
    public static MinQuantity = 1;
    public static MaxQuantity = 9999;

}
