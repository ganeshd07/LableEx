import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { AppState } from 'src/app/+store/app.state';
import * as fromShippingSelector from '../../../+store/shipping.selectors';
import { SystemCommodity } from 'src/app/interfaces/api-service/response/system-commodity';
import { getSystemCommodityListBegin, getUserCommodityListBegin, removeSystemCommodityListOnSelection, saveMergedSubCategoryCommodityListAction } from '../../../+store/shipping.actions';
import { ItemsType } from 'src/app/types/enum/items-type.enum';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IUser } from 'src/app/interfaces/shipping-app/user';
import { InputTypeConstants } from 'src/app/types/constants/input-type-constants';

@Component({
  selector: 'search-commodity-item',
  templateUrl: './search-commodity-item.component.html',
  styleUrls: ['./search-commodity-item.component.scss'],
})
export class SearchCommodityItemComponent implements OnInit {
  selectedValue: string;
  selectedItem: string;
  itemSubCategoryList: SystemCommodity[];
  systemCommodityList: SystemCommodity[];
  userCommodityList: SystemCommodity[];
  eItemsType: typeof ItemsType = ItemsType;
  @Input() itemSelectedType: string;
  private subs: Subscription;
  otherCategoryForm: FormGroup;
  userId: string = null;
  inputConstants = InputTypeConstants;

  constructor(
    public modalController: ModalController,
    public formBuilder: FormBuilder,
    private appStore: Store<AppState>) {
    this.subs = new Subscription();
  }

  ngOnInit() {
    this.otherCategoryForm = this.formBuilder.group({
      itemDescription: ['', [Validators.required, Validators.minLength(6)]]
    });
    this.getUserAccountDetails();
    this.handleSystemCommodityApiSuccess();
    this.handleUserCommodityApiSuccess();
    this.getSystemCommodityList();
    this.getUserCommodityList();
  }

  ngOnDestroy() {
    if (this.subs) {
      this.subs.unsubscribe();
    }
  }

  getUserAccountDetails() {
    this.appStore.pipe(select(fromShippingSelector.selectUserLoginDetails))
      .subscribe((userloginDetails: IUser) => {
        if (userloginDetails) {
          this.userId = userloginDetails.userId;
        }
      });
  }

  handleSystemCommodityApiSuccess() {
    this.subs.add(
      this.appStore.pipe(select(fromShippingSelector.selectSystemCommodityList)).subscribe((systemCommodityList: SystemCommodity[]) => {
        if (systemCommodityList) {
          this.systemCommodityList = systemCommodityList;
          this.mergeSystemAndUserCommodity();
        }
      })
    );
  }

  handleUserCommodityApiSuccess() {
    this.subs.add(
      this.appStore.pipe(select(fromShippingSelector.selectUserCommodityList)).subscribe((userCommodityList: any[]) => {
        if (userCommodityList) {
          this.userCommodityList = this.mapUserCommodity(userCommodityList);
          this.mergeSystemAndUserCommodity();
        }
      })
    );
  }

  mapUserCommodity(userCommodityList) {
    let userCommodityMappedList: SystemCommodity[] = [];
    if (userCommodityList && userCommodityList.length > 0) {
      for (let i = 0; i < userCommodityList.length; i++) {
        let commodityItem = {
          commodityId: userCommodityList[i].commodityId,
          description: userCommodityList[i].commodityDetail.description
        };
        userCommodityMappedList.push(commodityItem);
      }
    }
    return userCommodityMappedList;
  }

  mergeSystemAndUserCommodity() {
    this.itemSubCategoryList = [];
    if (this.systemCommodityList && this.userCommodityList) {
      this.itemSubCategoryList = [...this.systemCommodityList, ...this.userCommodityList];
      this.itemSubCategoryList.sort((item1, item2) => {
        let strItem1 = item1.description.toLowerCase().trim();
        let strItem2 = item2.description.toLowerCase().trim();
        if (strItem1 < strItem2) {
          return -1;
        } else if (strItem1 > strItem2) {
          return 1;
        } else {
          return 0;
        }
      });
    } else if (this.systemCommodityList) {
      this.itemSubCategoryList = [...this.systemCommodityList];
    } else if (this.userCommodityList) {
      this.itemSubCategoryList = [...this.userCommodityList];
    }
    this.saveMergedSubCategoryToStore();
  }

  saveMergedSubCategoryToStore() {
    this.appStore.dispatch(saveMergedSubCategoryCommodityListAction({
      mergedSubCategoryCommodityList: this.itemSubCategoryList
    }));
  }

  getSystemCommodityList() {
    if (this.itemSelectedType !== this.eItemsType.OTHERS) {
      this.appStore.dispatch(getSystemCommodityListBegin({
        category: this.itemSelectedType
      }));
    }
  }

  getUserCommodityList() {
    if (this.userId) {
      this.appStore.dispatch(getUserCommodityListBegin({
        uid: this.userId,
        category: this.itemSelectedType
      }));
    }
  }

  assignSystemCommodityList() {
    this.mergeSystemAndUserCommodity();
  }

  onCancel() {
    this.assignSystemCommodityList();
  }

  onSearch(evnt) {
    const searchTerm = evnt.target.value;
    if (searchTerm && searchTerm.trim() !== '') {
      this.assignSystemCommodityList();
      if (searchTerm.length >= 2 && this.itemSubCategoryList.length) {
        this.itemSubCategoryList = this.itemSubCategoryList.filter((item) =>
          (item.description.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1)
        );
        if (this.itemSubCategoryList.length === 0) {
          this.itemSubCategoryList.push({
            commodityId: (this.itemSubCategoryList.length + 1).toString(),
            description: searchTerm
          });
        }
      }
    } else {
      this.assignSystemCommodityList();
    }
  }

  checkInputValue() {
    this.otherCategoryForm.controls.itemDescription.setValue(this.otherCategoryForm.controls.itemDescription.value.trim());
    this.otherCategoryForm.markAllAsTouched();
  }

  addOtherCategoryItem() {
    this.checkInputValue();
    if (this.otherCategoryForm.valid) {
      const itemObj = {
        commodityId: '',
        description: this.otherCategoryForm.controls.itemDescription.value
      };
      this.closeNavigation(itemObj);
    }
  }

  closeNavigation(item) {
    this.appStore.dispatch(removeSystemCommodityListOnSelection());
    this.modalController.dismiss(item);
  }
}
