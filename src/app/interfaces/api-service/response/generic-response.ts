import { Error } from './error';

export interface GenericResponse<T> {
    transactionId: string;
    output: T;
    errors?: Error[];
    error?: string;
}
