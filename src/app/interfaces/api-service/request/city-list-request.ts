import { MatchAndResultsCriteria } from "./match-and-results-criteria";

export interface CityListRequest {
    matchAndResultsCriteria: MatchAndResultsCriteria;
    carrierCode: string;
}
