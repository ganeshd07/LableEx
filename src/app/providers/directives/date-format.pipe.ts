import { Pipe, PipeTransform } from '@angular/core';

/**
 * Transform FedEx date format (MMM DD, YYYY) to (MMM DD).
 * This pipe can be further expand.
 * 
 * Author: Carlo Oseo
 * Date: Sept 28 2020
 */
@Pipe({
    name: 'dateFormat'
})
export class DateFormatPipe implements PipeTransform {
    transform(value: string): string {
        return value.split(',')[0];
    }
}