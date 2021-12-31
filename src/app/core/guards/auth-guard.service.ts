import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { BrowserService } from '../providers/browser.service';
import { SessionItems } from 'src/app/types/enum/session-items.enum';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(
    private router: Router,    
    private browserService: BrowserService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    Observable<boolean> | Promise<boolean> | boolean {
    // TODO: put authentication/check login service here
    if (this.browserService.isbrowser) {
      if (sessionStorage.getItem(SessionItems.ISLOGGEDIN)) {
        return true;
      }
    }

    this.router.navigate(['/login']);
    return false;
  }
}
