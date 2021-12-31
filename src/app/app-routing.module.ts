import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardThankYouSummaryService } from './core/guards/auth-guard-thank-you-summary.service';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'message-centre',
        pathMatch: 'full'
      },
      {
        path: 'account',
        children: [
          {
            path: '',
            data: { preload: true },
            loadChildren: () => import('./pages/account/account.module').then(m => m.AccountModule)
          },
          {
            path: 'otp',
            data: { preload: true },
            loadChildren: () => import('./pages/account/otp-login/otp-login.module').then(m => m.OtpLoginPageModule)
          },
          {
            path: 'otp-verification',
            loadChildren: () => import('./pages/account/otp-verification/otp-verification.module').then(m => m.OtpVerificationPageModule),
            canActivate: [AuthGuardThankYouSummaryService]
          },
          {
            path: '',
            redirectTo: '/account',
            pathMatch: 'full'
          }
        ]
      },
      {
        path: 'login',
        loadChildren: () => import('./pages/account/login/login.module').then(m => m.LoginModule)
      },
      {
        path: 'terms',
        loadChildren: () => import('./pages/non-shipping/terms-and-conditions/terms-and-conditions.module').then(m => m.TermsAndConditionsPageModule),
      },
      {
        path: 'message-centre',
        loadChildren: () => import('./pages/non-shipping/message-centre/message-centre.module').then(m => m.MessageCentrePageModule)
      },
      {
        path: 'shipping',
        loadChildren: () => import('./pages/shipping/shipping.module').then(m => m.ShippingModule)
      },
      {
        path: 'terms-and-conditions-kr',
        loadChildren: () => import('./pages/non-shipping/terms-and-conditions-kr/terms-and-conditions-kr.module').then(m => m.TermsAndConditionsKrPageModule)
      },
      {
        path: '**', redirectTo: 'message-centre'
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })
  ],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }