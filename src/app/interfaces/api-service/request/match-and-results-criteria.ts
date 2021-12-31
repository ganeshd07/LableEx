import { Address } from "./address";

export interface MatchAndResultsCriteria {
    address: Address;
    matchConditions: string[];
    resultsToSkip: number;
    resultsRequested: number;
    resultConditions: string[];
}
