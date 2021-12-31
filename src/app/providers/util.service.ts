import { Injectable } from '@angular/core';
import { KeyValuePair } from '../interfaces/key-value-pair.interface';
import { HttpHeaders } from '@angular/common/http';
import { SessionItems } from '../types/enum/session-items.enum';
import { ConfigService } from '@ngx-config/core';
/**
 * This is a global utility class. 
 * All reusable methods such as string manipulations,
 * type conversions and/or object parsing must be placed here.
 * 
 */
@Injectable({
    providedIn: 'root'
})
export class Util {

    constructor(
        private readonly config: ConfigService
    ) { }

    /**
     * This method converts any model/objects into a JSON formatted object.
     * 
     * @param model 
     */
    public toJSON(model: any) {
        let jsonStr = JSON.stringify(model);
        let formattedStr = jsonStr.replace(/[/_/]/g, '');
        return JSON.parse(formattedStr);
    }

    /**
     * This method creates/forms an http request header
     * 
     * @param contentType  
     * @param additionalHeaders 
     */
    public getHttpRequestHeaders(contentType: string, additionalHeaders: KeyValuePair[]) {
        let httpReqHeader = {
            headers: new HttpHeaders({
                'Content-Type': contentType
            })
        };

        if (additionalHeaders.length > 0) {
            for (let header of additionalHeaders) {
                httpReqHeader.headers.append(header.key, header.value);
            }
        }

        return httpReqHeader;
    }

    /**
     * This method concatenates all the strings or objects in the parameters with or without delimeter
     *
     * @param delimeter - any delimeter. If NO delimeter, put '' (empty string).
     * @param args - no parameter limitation (args is separated by comma) 
     *
     * e.g use:  this.util.joinStrings('/', 'route1', 'route2', 'route3', ...so the list goes on);
     *
     */
    public joinStrings(delimeter: string, ...args: string[]) {
        return args.join(delimeter);
    }

    /**
     * This method will apply Arial font to Select Option Alert Popup
     */

    public applyArialFontToSelectPopup() {
        const applyArialFont = this.config.getSettings('ARIAL_FONT_LANGUAGE_LIST').includes(sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE)) ? true : false;
        if (applyArialFont) {
            setTimeout(() => {
                const elementsBtns = document.querySelectorAll('.alert-button');
                const elementsOptios = document.querySelectorAll('.alert-radio-label');
                if (elementsBtns) {
                    elementsBtns.forEach(el => {
                        el.classList.add('arial-font');
                    })
                }
                if (elementsOptios) {
                    elementsOptios.forEach(el => {
                        el.classList.add('arial-font');
                    })
                }

            }, 500)
        }
    }
}
