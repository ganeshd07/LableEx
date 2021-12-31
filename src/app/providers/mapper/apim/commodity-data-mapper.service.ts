import { Injectable } from '@angular/core';
import { Util } from '../../util.service';
import { DatePipe } from '@angular/common';
import { CommodityDescriptionRequest } from 'src/app/interfaces/api-service/request/commodity-description-request';

/**
 * This class contains all data mappers of Commodity APIM Services
 * 
 * Author: Carlo Oseo
 * Date Created: June 11, 2020 
 */
@Injectable({
    providedIn: 'root'
})
export class APIMCommodityDataMapper {

    constructor(private util: Util, private datePipe: DatePipe) { }

    /**
     * Mapper for Commodity Description request
     * 
     * @param description 
     */
    public mapCommodityDescriptionRequest(_description: string) {
        let commodityDescriptionRequest: CommodityDescriptionRequest = {
            description: _description
        };

        let requestBody = this.util.toJSON(commodityDescriptionRequest);
        return JSON.stringify(requestBody);
    }
    
}