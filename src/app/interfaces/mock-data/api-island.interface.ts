import { IslandVersion } from './island-version.interface';

export interface ApiIsland {
    islandRoute: string;
    islandVersionList: IslandVersion[];
}