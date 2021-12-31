import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { AppSupportedCountry } from 'src/app/types/enum/app-supported-country.enum';
import { OAuthEnum } from 'src/app/types/enum/oauth-enum.enum';
import { SessionItems } from 'src/app/types/enum/session-items.enum';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardShipmentDetailsService implements CanActivate {
  subs = new Subscription();

  constructor(
    private router: Router
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    return new Observable<boolean>((observer) => {
      const selectedCountry = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
      const oAuth = sessionStorage.getItem(OAuthEnum.STORE_KEY);
      const localAuth = sessionStorage.getItem(OAuthEnum.LOCAL_STORE_KEY);
      const termsConditionAccepted = sessionStorage.getItem(SessionItems.TERMSANDCONDITIONACCEPTED);
      if (selectedCountry?.length > 0 && oAuth?.length > 0 && localAuth?.length > 0) {
        if (selectedCountry === AppSupportedCountry.KR_COUNTRYCODE) {
          if (termsConditionAccepted) {
            observer.next(true);
          } else {
            this.router.navigate(['/terms-and-conditions-kr']);
            observer.next(false);
          }
        } else {
          observer.next(true);
        }

      }
      else if (environment.mock) {
        observer.next(true);
      }
      else {
        this.router.navigate(['/message-centre']);
        observer.next(false);
      }
      observer.complete();
    });
  }
}
