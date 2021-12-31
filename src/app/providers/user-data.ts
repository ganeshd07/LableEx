import { Injectable } from '@angular/core';
import { BrowserService } from '../core/providers/browser.service';
import { of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UserData {
  _favorites: string[] = [];
  HAS_LOGGED_IN = 'hasLoggedIn';
  HAS_SEEN_TUTORIAL = 'hasSeenTutorial';

  constructor(
    private browserService: BrowserService
  ) { }

  hasFavorite(sessionName: string): boolean {
    return (this._favorites.indexOf(sessionName) > -1);
  }

  addFavorite(sessionName: string) {
    this._favorites.push(sessionName);
  }

  removeFavorite(sessionName: string) {
    const index = this._favorites.indexOf(sessionName);
    if (index > -1) {
      this._favorites.splice(index, 1);
    }
  }

  login(username: string): Promise<any> {
    if (this.browserService.isbrowser) {
      localStorage.setItem(this.HAS_LOGGED_IN, 'true');
      this.setUsername(username);
      return of(window.dispatchEvent(new CustomEvent('user:login'))).toPromise();

    }
  }

  signup(username: string): Promise<any> {
    if (this.browserService.isbrowser) {
      localStorage.setItem(this.HAS_LOGGED_IN, 'true');
      this.setUsername(username);
      return of(window.dispatchEvent(new CustomEvent('user:signup'))).toPromise();

    }
  }

  logout(): void {
    // return localStorage.remove(this.HAS_LOGGED_IN).then(() => {
    //   return localStorage.remove('username');
    // }).then(() => {
    // window.dispatchEvent(new CustomEvent('user:logout'));
    // });
  }

  setUsername(username: string): Promise<any> {
    if (this.browserService.isbrowser) {
      localStorage.setItem('username', username);
      return of(true).toPromise();
    }
  }

  getUsername(): Promise<string> {
    if (this.browserService.isbrowser) {
      return of(localStorage.getItem('username')).toPromise();
    }
  }

  isLoggedIn(): Promise<boolean> {
    if (this.browserService.isbrowser) {
      return of(localStorage.getItem(this.HAS_LOGGED_IN) == 'true').toPromise();
    }
  }

  checkHasSeenTutorial(): Promise<string> {
    if (this.browserService.isbrowser) {
      return of(localStorage.getItem(this.HAS_SEEN_TUTORIAL)).toPromise();
    }
  }
}
