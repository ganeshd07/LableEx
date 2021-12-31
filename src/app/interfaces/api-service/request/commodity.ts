import { Amount } from '../common/amount';
import { Excise } from './excise';
import { Units } from './units';
import { UnitsOfMeasure } from './units-of-measure';

export interface Commodity {
    name: string;
    numberOfPieces: number;
    description: string;
    countryOfManufacture: string;
    harmonizedCode?: string;
    harmonizedCodeDescription?: string;
    weight: Units;
    quantity: number;
    quantityUnits: string;
    unitPrice: Amount;
    unitsOfMeasures?: UnitsOfMeasure[];
    excises?: Excise[];
    customsValue: Amount;
    itemDescriptionForClearance?: string;
}
