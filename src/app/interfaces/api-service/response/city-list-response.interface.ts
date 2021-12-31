import { MatchedAddresses } from './matched-addresses.interface';

export interface CityListResponse {
     totalResults: number;
     resultsReturned: number;
     matchedAddresses: MatchedAddresses[];
}
