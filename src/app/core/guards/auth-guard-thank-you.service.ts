import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../../app/+store/app.state';
import * as fromShippingSelector from './../../pages/shipping/+store/shipping.selectors';
import { ShippingInfo } from './../../pages/shipping/+store/shipping.state';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardThankYouService implements CanActivate {
  subs = new Subscription();

  constructor(
    private router: Router,
    private appStore: Store<AppState>
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    Observable<boolean> | Promise<boolean> | boolean {
    return new Observable<boolean>((observer) => {
      this.appStore
        .pipe(select(fromShippingSelector.selectShippingInfo))
        .subscribe((shippingInfo: ShippingInfo) => {
          let validFlag = true;
          if (!shippingInfo?.lookupData?.createShipmentSuccess){
            validFlag = validFlag && false;
          }
          if (!validFlag) {
            this.router.navigate(['/message-centre']);
          }
          observer.next(validFlag);
          observer.complete();
        }).unsubscribe();
    });
  }
}
