import { Amount } from '../common/amount';
import { Dimension } from '../common/dimension';
import { PackageSpecialServices } from './package-special-services';
import { Units } from './units';
import { VariableHandlingChargeDetail } from './variable-handling-charge-detail';

export interface RequestedPackageLineItem {
    groupPackageCount: number;
    physicalPackaging: string;
    weight: Units;
    insuredValue?: Amount;
    dimension?: Dimension;
    packageSpecialServices?: PackageSpecialServices;
    itemDescription?: string;
    itemDescriptionForClearance?: string;
    variableHandlingChargeDetail?: VariableHandlingChargeDetail;
    dimensions?: Dimension;
}
