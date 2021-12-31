export interface MatchedAddresses {
    city: string;
    stateOrProvinceCode: string;
    postalCode: string;
    countryCode: string;
    residential?: boolean;
    primary?: boolean;
}