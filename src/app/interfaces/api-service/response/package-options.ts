
import { Amount } from '../common/amount';
import { Dimension } from '../common/dimension';
import { KeyTexts } from './key-texts';
import { SubpackageInfoList } from './subpackage-info-list';
import { Weight } from './weight';

export interface PackageOptions {
    packageType: KeyTexts;
    rateTypes: string[];
    subpackageInfoList: SubpackageInfoList[];
    maxMetricWeightAllowed: Weight;
    maxWeightAllowed: Weight;
    maxDeclaredValue: Amount;
    maximumDimensions?: Dimension[];
    maximumLengthPlusGirths?: Weight[];
}
