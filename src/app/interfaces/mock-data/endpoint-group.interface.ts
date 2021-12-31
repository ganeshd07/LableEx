import { Endpoint } from './endpoint.interface';

export interface EndpointGroup {
    groupRoute: string;
    endpointList: Endpoint[];
}