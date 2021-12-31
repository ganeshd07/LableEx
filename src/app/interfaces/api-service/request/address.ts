export interface Address {
    streetLines: string[];
    city: string;
    stateOrProvinceCode?: string;
    postalCode: string;
    countryCode: string;
    residential?: boolean;
    addressVerificationId?: string;
    addressClassification?: string;
    addressClassificationConfidence?: string;
    shareId?: string;
    visitor?: boolean;
}
