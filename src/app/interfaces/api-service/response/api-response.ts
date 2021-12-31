import { Config } from './config';

export interface ApiResponse {
    configlist: Config[];
    error?: string;
}
