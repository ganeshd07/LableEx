import { KeyTexts } from './key-texts';
import { PackageOptions } from './package-options';


export interface PackageAndServiceOptionsResponseParams {
    serviceOptions: KeyTexts[];
    packageOptions: PackageOptions[];
    oneRate: boolean;
    pricingOptions: KeyTexts[];
}