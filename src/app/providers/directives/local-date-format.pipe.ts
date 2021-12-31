import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { LangLocale } from 'src/app/types/enum/lang-locale.enum';
import { SessionItems } from 'src/app/types/enum/session-items.enum';

/**
 * Transform FedEx rates local date format
 *
 * Author: Marlon Micael J. Cuevas
 * Date: July 12, 2021
 */
@Pipe({
    name: 'localDateFormat'
})

export class LocalDateFormatPipe implements PipeTransform {
    constructor(private datePipe: DatePipe){ }
    transform(value: string): string {
        const language = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
        const convertCXSDate = (language === LangLocale.ZH_CN || language === LangLocale.ZH_TW) ? true : false;
        const regexTester = /\d/;
        const isDate = regexTester.test(value);
        value = convertCXSDate && isDate ? this.datePipe.transform(value, 'M dd, yyyy') : value;
        const valueSplit = isDate ? value.split(',')[0] : value;
        switch (language){
            // FOR ZH LANGUAGE (CHINA AND TAIWAN)
            case LangLocale.ZH_CN: case LangLocale.ZH_TW: {
                return isDate ? valueSplit.split(' ')[0] + '月' + valueSplit.split(' ')[1] + '日' : valueSplit;
            }
            // FOR ZH LANGUAGE (HONG KONG ONLY)
            case LangLocale.ZH_HK: {
                return isDate ? valueSplit + '日' : '周' + valueSplit;
            }
            // FOR JA LANGUAGE (JAPAN)
            case LangLocale.JA_JP: {
                return isDate ? valueSplit.split(' ')[0] + '月' + valueSplit.split(' ')[1] + '日' : valueSplit;
            }
            // FOR KR LANGUAGE (KOREA)
            case LangLocale.KO_KR: {
                return isDate ? valueSplit + '일' : valueSplit;
            }
            // Just return the value and do not alter anything
            default: {
                return valueSplit;
            }
        }
    }
}
