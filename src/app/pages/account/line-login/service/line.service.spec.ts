import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { LineService } from './line.service';
import { AuthenticationService } from '../../../../core/providers/apim/authentication.service';
import { ConfigModule, ConfigLoader } from '@ngx-config/core';
import { environment } from 'src/environments/environment';
import { configFactory } from 'src/app/app.module';
import { HttpClient } from '@angular/common/http';

describe('LineService', () => {
  /*const mockConfig = {
    "APIM": {
      "HOST": "https://apidrt.idev.fedex.com",
      "OAUTH_CREDENTIALS": {
        "grantType": "client_credentials",
        "clientId": "l7xx8659261c4bca4878b43cc7b367a0e1ec",
        "clientSecret": "2b91742cb98d4d4a909ec11e5338c4fa",
        "scope": "oob",
        "tokenType": "Bearer"
      },
      "AUTH_ISLAND_API": {
        "token": "/auth/oauth/v2/token"
      }
    },
    "LINE":{
        "ACCESS_TOKEN_API":"https://api.line.me/oauth2/v2.1/token",
        "USER_TOKEN_API":"https://api.line.me/v2/profile",
        "VERIFY_TOKEN_API":"https://api.line.me/oauth2/v2.1/verify"
    }
  }*/

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ConfigModule.forRoot({
          provide: ConfigLoader,
          useFactory: configFactory,
          deps: [HttpClient]
        }),
        HttpClientTestingModule
      ],
      providers: [
        AuthenticationService
      ]
    });
  });


  it('should be created', () => {
    const service: LineService = TestBed.get(LineService);
    expect(service).toBeTruthy();
  });
});
