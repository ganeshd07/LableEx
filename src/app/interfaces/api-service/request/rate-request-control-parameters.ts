export interface RateRequestControlParameters {
    rateSortOrder: string;
    returnTransitTimes: boolean;
    variableOptions?: string[]; // ServiceOptionType array
    servicesNeededOnRateFailure: boolean;
}
