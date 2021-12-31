import { Injectable } from '@angular/core';
import { Util } from '../../util.service';
import { DatePipe } from '@angular/common';
import { Sender } from 'src/app/interfaces/api-service/request/sender';
import { PackageAndServiceOptionsRequestParams } from 'src/app/interfaces/api-service/request/package-and-service-options-request';
import { Recipient } from 'src/app/interfaces/api-service/request/recipient';
import { SystemOfMeasureType } from 'src/app/types/enum/system-of-measure-type';
import { RequestedPackageLineItem } from 'src/app/interfaces/api-service/request/requested-package-line-item';
import { ServiceType } from 'src/app/types/enum/service-type.enum';
import { Dimension } from 'src/app/interfaces/api-service/common/dimension';
import { IPackageDetails } from 'src/app/interfaces/shipping-app/package-details';
import { IShipmentDetails } from 'src/app/interfaces/shipping-app/shipment-details';
import { IRecipient } from 'src/app/interfaces/shipping-app/recipient';
import { ISender } from 'src/app/interfaces/shipping-app/sender';
import { ShippingInfo } from 'src/app/pages/shipping/+store/shipping.state';
import { ResponsibleParty } from 'src/app/interfaces/api-service/request/responsible-party';
import { SignatureOptionsParams } from 'src/app/interfaces/api-service/request/signature-option-params.interface';
import { SessionItems } from 'src/app/types/enum/session-items.enum';

/**
 * This class contains all data mappers of Availability APIM Services
 *
 * Author: Carlo Oseo
 * Date Created: June 11, 2020
 */
@Injectable({
  providedIn: 'root'
})
export class APIMAvailabilityDataMapper {

  constructor(private util: Util, private datePipe: DatePipe) { }

  /**
   * Mapper for Package and Service Options Request
   *
   * @param sender - Sender Details
   * @param recipient - Recipient Details
   * @param shipDate - Date of shipment
   */
  public mapPackageAndServiceOptionsRequest(sender: Sender, recipient: Recipient) {
    // systemOfMeasureType //TODO: get list of measure types and put into 1 file
    const packageAndServiceOptionsRequestParams: PackageAndServiceOptionsRequestParams = {
      sender,
      recipient,
      systemOfMeasureType: SystemOfMeasureType.METRIC
    };

    const requestBody = this.util.toJSON(packageAndServiceOptionsRequestParams);
    return JSON.stringify(requestBody);
  }

  /**
     * This method maps data from store for signature options  request
     *
     * @param shippingInfo - Full shippingApp object from store
     */

  public mapSignatureOptionRequestFromStore(shippingInfo: ShippingInfo): SignatureOptionsParams {
    const currentDate = this.datePipe.transform(new Date(), 'MMM-dd-yyyy');
    return {
      requestedShipment: {
        shipper: this.populateShipper(shippingInfo.senderDetails),
        recipients: this.populateRecipients(shippingInfo.recipientDetails),
        shipTimestamp: currentDate.toUpperCase(),
        pickupType: 'DROPOFF_AT_FEDEX_LOCATION',
        serviceType: (shippingInfo.shipmentDetails.serviceType) ? shippingInfo.shipmentDetails.serviceType : ServiceType.INTERNATIONAL_PRIORITY,
        customsClearanceDetail: {
          documentContent: null,
          commodities: []
        },
        requestedPackageLineItems: this.populateRequestPackageLineItems(shippingInfo.shipmentDetails)
      }
    };
  }

  /**
     * This method populates the shipper object
     * for rates service request
     *
     * @param senderInfo - sender details object from store
     */
  populateShipper(senderInfo: ISender): ResponsibleParty {
    return {
      contact: null,
      address: {
        city: (senderInfo.city) ? senderInfo.city : '',
        stateOrProvinceCode: (senderInfo.stateOrProvinceCode) ? senderInfo.stateOrProvinceCode : '',
        postalCode: (senderInfo.postalCode) ? senderInfo.postalCode : '',
        countryCode: (senderInfo.postalCode) ? senderInfo.countryCode : sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY),
        streetLines: [
          (senderInfo.address1) ? senderInfo.address1 : '',
          (senderInfo.address2) ? senderInfo.address2 : ''
        ],
        residential: (senderInfo.companyName) ? false : true
      }
    };
  }

  /**
     * This method populates the recipients object
     * for rates service request
     *
     * @param recipients - recipient details object from store
     */
  populateRecipients(recipients: IRecipient[]): ResponsibleParty[] {
    const responsibleParties: any[] = [];
    if (recipients.length > 0) {
      for (const recipient of recipients) {
        responsibleParties.push({
          contact: undefined,
          address: {
            city: (recipient.city) ? recipient.city : '',
            stateOrProvinceCode: (recipient.stateOrProvinceCode) ? recipient.stateOrProvinceCode : '',
            postalCode: (recipient.postalCode) ? recipient.postalCode : '',
            countryCode: (recipient.countryCode) ? recipient.countryCode : '',
            streetLines: [
              (recipient.address1) ? recipient.address1 : '',
              (recipient.address2) ? recipient.address2 : undefined,
              (recipient.address3) ? recipient.address3 : undefined
            ],
            residential: (recipient.companyName) ? true : false
          }
        });
      }
    }
    return responsibleParties;
  }

  /**
     * This method populates the packageLineItems object
     * for rates service request
     *
     * @param shipmentDetails - shipment details object from store
     */

  populateRequestPackageLineItems(shipmentDetails: IShipmentDetails): RequestedPackageLineItem[] {
    let packageLineItems: RequestedPackageLineItem[] = [];
    if (shipmentDetails) {
      const packages: IPackageDetails[] = shipmentDetails.packageDetails;
      if (packages.length > 0) {
        let ctr = 0;
        for (const item of packages) {
          packageLineItems.push({
            groupPackageCount: ctr,
            physicalPackaging: 'YOUR_PACKAGING',
            weight: {
              units: item.packageWeightUnit,
              value: item.packageWeight
            },
            insuredValue: {
              currency: 'USD',
              amount: 0
            },
            dimension: this.populateDimension(item)
          });
        }
      }
    } else {
      packageLineItems = [
        {
          groupPackageCount: 1,
          physicalPackaging: 'YOUR_PACKAGING',
          weight: {
            units: 'KG',
            value: '1'
          },
          insuredValue: {
            currency: 'USD',
            amount: 0
          }
        }
      ];
    }
    return packageLineItems;
  }

  populateDimension(item: IPackageDetails): Dimension {
    let hasPackageDimension = false;
    let dimensionObject: Dimension;
    if (item.packageDimensionLength && item.packageDimensionWidth && item.packageDimensionHeight) {
      hasPackageDimension = true;
      dimensionObject = {
        length: item.packageDimensionLength,
        width: item.packageDimensionWidth,
        height: item.packageDimensionHeight,
        units: (item.packageDimensionUnit) ? item.packageDimensionUnit : undefined
      };
    }
    return (hasPackageDimension) ? dimensionObject : undefined;
  }

}