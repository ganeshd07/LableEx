import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/**
 * Transform military format to 12 hour format.
 * This pipe can be further expand.
 *
 * Author: Carlo Oseo
 * Date: Sept 28 2020
 */
@Pipe({
    name: 'timeFormat'
})
export class TimeFormatPipe implements PipeTransform {
    constructor(private translate: TranslateService){ }
    transform(time: any): string {
        if (time) {
            const timeAM = ' ' + this.translate.instant('constants.AM');
            const timePM = ' ' + this.translate.instant('constants.PM');
            const b = time.split(/\D/);
            return (b[0] % 12 || 12) + ':' + b[1] +
                (b[0] < 11 ? timeAM : timePM);
        }

    }
}
