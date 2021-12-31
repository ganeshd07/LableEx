import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { AppState } from 'src/app/+store/app.state';
import * as fromShippingSelector from '../+store/shipping.selectors';
import { IUser } from 'src/app/interfaces/shipping-app/user';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { saveRecipientAddressSelectedAction } from '../+store/shipping.actions';
import { IRecipient } from 'src/app/interfaces/shipping-app/recipient';
import { LocalAddressService } from '../../../../app/core/providers/local/address.service';
import { IAddressDataList } from '../../../interfaces/mock-data/address-data-list.interface';
import { Subscription } from 'rxjs';
import { AddressTypes } from '../../../types/enum/address-type.enum';
import { IAddressBookResponse } from 'src/app/interfaces/mock-data/address-book-response.interface';
import { SessionItems } from 'src/app/types/enum/session-items.enum';

@Component({
  selector: 'recipient-address-book',
  templateUrl: './recipient-address-book.page.html',
  styleUrls: ['./recipient-address-book.page.scss'],
})
export class RecipientAddressBookPage implements OnInit, OnDestroy {
  hideVal: boolean;
  hideAddressBook: boolean;
  mySelectedVal: string;
  recipientAddressbookForm: FormGroup;
  recipientData: IRecipient;
  recipientListMaster: any[] = [];
  recipientList: any[] = [];
  @Input() backNavigation = '/shipping/shipment-details';
  subs = new Subscription();

  constructor(private appStore: Store<AppState>, private router: Router,
              private formBuilder: FormBuilder, private localAddressService: LocalAddressService) { }

  ngOnInit() {
    this.recipientAddressbookForm = this.formBuilder.group({
      recipientSearchBar: new FormControl('')
    });
    this.subs.add(
      this.appStore.pipe(select(fromShippingSelector.selectUserLoginDetails))
        .subscribe((details: IUser) => {
          if (details ) {
            this.initialiseRecipientList(details.userId);
            if(details.lastLogin === null){
              this.hideAddressBook = true;
            }
          }
          // TODO -  This is for NO Contacts available scenario
          // this.hideAddressBook = true;
        })
    );
  }

  initialiseRecipientList(userId) {
    // TODO - Handle userId later
    this.subs.add(
      this.localAddressService.getRecipientList(userId, AddressTypes.ADDRESS_RECIPIENT).subscribe(
        (recipientResponse: IAddressDataList) => {
          this.recipientListMaster = recipientResponse.partylist;
          // tslint:disable-next-line: max-line-length
          this.recipientList = this.recipientListMaster.slice(); // Master copy need to be separate for filtering, no need to hit service everytime
        })
    );
  }

  filterRecipientList(ev: any) {
    const val = ev.target.value;
    if (val && val.trim() !== '') {
      const textToBeSearched = val.toLowerCase();
      this.recipientList = this.recipientListMaster.filter((recipient: any) => {
        return (recipient?.contact?.personName?.toLowerCase().indexOf(textToBeSearched) > -1 ||
          recipient?.contact?.companyName?.toLowerCase().indexOf(textToBeSearched) > -1 ||
          recipient?.address?.streetlines?.filter(address => address?.toLowerCase().indexOf(textToBeSearched) > -1).length > 0 ||
          recipient?.address?.city?.toLowerCase().indexOf(textToBeSearched) > -1 ||
          recipient?.address?.postalCode?.toLowerCase().indexOf(textToBeSearched) > -1 ||
          recipient?.address?.countryCode?.toLowerCase().indexOf(textToBeSearched) > -1);
      });
    } else {
      this.recipientList = this.recipientListMaster.slice();
    }
  }

  toggle() {
    this.hideVal = false;
  }

  recipientSelected(val: IAddressBookResponse) {
    this.mySelectedVal = val.contact.personName;
    this.recipientData = {
      countryName: undefined, // TODO - Country name is not missing here, need to handle at destination page
      city: val.address.city,
      postalCode: val.address.postalCode,
      residential: val.address.residential === true ? true : false,
      companyName: val.contact.companyName,
      address1: val.address.streetlines && val.address.streetlines.length > 0 ? val.address.streetlines[0] : '',
      contactName: val.contact.personName,
      countryCode: val.address.countryCode,
      postalAware: val.address.postalCode && val.address.postalCode !== '' ? true : false,
      stateAware: false,
      phoneNumber: val.contact.phoneNumber,
      stateOrProvinceCode: val.address.stateOrProvinceCode,
      phoneExt: val.contact.phoneExtension, // TODO - provide value for phoneExt (old value is val.address.phoneExt)
      emailAddress: val.contact.emailAddress,
      taxId: val.contact.taxId,
      passportNumber: val.contact.passportNo,
      partyId: val.partyId
    };

    this.recipientData.address2 = val.address.streetlines && val.address.streetlines.length > 1 ? val.address.streetlines[1] : undefined;
    this.recipientData.address3 = val.address.streetlines && val.address.streetlines.length > 2 ? val.address.streetlines[2] : undefined;
    sessionStorage.setItem(SessionItems.RECIPIENTADDRESSBOOK, 'true');
    this.appStore.dispatch(saveRecipientAddressSelectedAction({ selectedRecipient: this.recipientData }));
    this.router.navigate(['/shipping/shipment-details']);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
