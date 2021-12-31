import { EndpointGroup } from './endpoint-group.interface';

export interface IslandVersion {
    versionRoute: string;
    endpointGroupList: EndpointGroup[];
}