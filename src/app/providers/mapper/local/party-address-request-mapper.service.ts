import { Injectable } from '@angular/core';
import { AddressTypes } from 'src/app/types/enum/address-type.enum';

@Injectable({
    providedIn: 'root'
})

export class PartyAddressRequestMapper {

    constructor(
    ) { }

    public getMappedPartyAddressForPost(partyAddressDetails: any, addressType: AddressTypes, userId: string) {
        const address = this.getMappedAddress(partyAddressDetails);
        const contact = this.getMappedContact(partyAddressDetails);
        const user = {
            uid: userId
        };
        const addressMapper = {
            addressType: addressType,
            user: user,
            contact: contact,
            address: address
        };
        return addressMapper;
    }

    public getMappedPartyAddressForUpdate(partyAddressDetails: any, partyId: string, userId: string) {
        const address = this.getMappedAddress(partyAddressDetails);
        const contact = this.getMappedContact(partyAddressDetails);
        const userDetails = {
            uid: userId
        };
        const addressMapper = {
            partyId: partyId,
            contact: contact,
            address: address,
            user: userDetails
        };
        return addressMapper;
    }

    private getMappedAddress(partyAddressDetails) {
        const addressLine1 = partyAddressDetails.address1;
        const addressLine2 = partyAddressDetails.address2 ? partyAddressDetails.address2 : undefined;
        const addressLine3 = partyAddressDetails.address3 ? partyAddressDetails.address3 : undefined;
        const address = {
            streetlines: this.getStreetLines(addressLine1, addressLine2, addressLine3),
            city: partyAddressDetails.city,
            stateOrProvinceCode: partyAddressDetails.stateOrProvinceCode,
            postalCode: partyAddressDetails.postalCode ? partyAddressDetails.postalCode : undefined,
            countryCode: partyAddressDetails.countryCode,
            residential: partyAddressDetails.residential,
            visitor: partyAddressDetails.visitor ? partyAddressDetails.visitor : false,
        };
        return address;
    }

    private getMappedContact(partyAddressDetails) {
        const contact = {
            personName: partyAddressDetails.contactName,
            phoneNumber: partyAddressDetails.phoneNumber,
            emailAddress: partyAddressDetails.emailAddress,
            companyName: partyAddressDetails.companyName ? partyAddressDetails.companyName : undefined,
            phoneExtension: partyAddressDetails.phoneExt ? partyAddressDetails.phoneExt : undefined,
            taxId: partyAddressDetails.taxId,
            passportNo: partyAddressDetails.passportNumber ? partyAddressDetails.passportNumber : undefined,
        };
        return contact;
    }

    private getStreetLines(addressLine1, addressLine2, addressLine3): any[] {
        let addressLines: any[] = [addressLine1];
        if (addressLine2 !== undefined) {
            addressLines.push(addressLine2);
        }
        if (addressLine3 !== undefined) {
            addressLines.push(addressLine3);
        }
        return addressLines;
    }
}
