import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardShipmentDetailsService } from 'src/app/core/guards/auth-guard-shipment-details.service';
import { AuthGuardShowRatesService } from 'src/app/core/guards/auth-guard-show-rates.service';
import { AuthGuardCustomDetailsService } from 'src/app/core/guards/auth-guard-custom-details.service';
import { AuthGuardSenderDetailsService } from 'src/app/core/guards/auth-guard-sender-details.service';
import { AuthGuardRecipientDetailsService } from 'src/app/core/guards/auth-guard-recipient-details.service';
import { AuthGuardBillingDetailsService } from 'src/app/core/guards/auth-guard-billing-details.service';
import { AuthGuardSummaryService } from 'src/app/core/guards/auth-guard-summary.service';
import { AuthGuardThankYouService } from 'src/app/core/guards/auth-guard-thank-you.service';
import { AuthGuardThankYouSummaryService } from 'src/app/core/guards/auth-guard-thank-you-summary.service';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                redirectTo: 'shipment-details',
                pathMatch: 'full'
            },
            {
                path: 'shipment-details',
                data: { preload: true },
                loadChildren: () => import('./step1-shipment-details/step1-shipment-details.module').then(m => m.Step1ShipmentDetailsPageModule),
                canActivate: [AuthGuardShipmentDetailsService]
            },
            {
                path: 'show-rates',
                data: { preload: true },
                loadChildren: () => import('./rate-and-delivery-option/rate-and-delivery-option.module').then(m => m.RateAndDeliveryOptionPageModule),
                canActivate: [AuthGuardShipmentDetailsService, AuthGuardShowRatesService]
            },
            {
                path: 'customs-details',
                data: { preload: true },
                loadChildren: () => import('./step2-customs-details/step2-customs-details.module').then(m => m.Step2CustomsDetailsPageModule),
                canActivate: [AuthGuardShipmentDetailsService, AuthGuardShowRatesService, AuthGuardCustomDetailsService]
            },
            {
                path: 'add-item',
                loadChildren: () => import('./customs-commodity-details/customs-commodity-details.module').then(m => m.CustomsCommodityDetailsPageModule),
                canActivate: [AuthGuardShipmentDetailsService, AuthGuardShowRatesService, AuthGuardCustomDetailsService]
            },
            {
                path: 'edit-item/:id',
                loadChildren: () => import('./customs-commodity-details/customs-commodity-details.module').then(m => m.CustomsCommodityDetailsPageModule),
                canActivate: [AuthGuardShipmentDetailsService, AuthGuardShowRatesService, AuthGuardCustomDetailsService]
            },
            {
                path: 'sender-details',
                data: { preload: true },
                loadChildren: () => import('./step3-sender-details/step3-sender-details.module').then(m => m.Step3SenderDetailsPageModule),
                canActivate: [AuthGuardShipmentDetailsService, AuthGuardShowRatesService, AuthGuardCustomDetailsService, AuthGuardSenderDetailsService]
            },
            {
                path: 'recipient-details',
                data: { preload: true },
                loadChildren: () => import('./step4-recipient-details/step4-recipient-details.module').then(m => m.Step4RecipientDetailsPageModule),
                canActivate: [AuthGuardShipmentDetailsService, AuthGuardShowRatesService, AuthGuardCustomDetailsService, AuthGuardSenderDetailsService,
                    AuthGuardRecipientDetailsService]
            },
            {
                path: 'billing-details',
                data: { preload: true },
                loadChildren: () => import('./step5-billing-details/step5-billing-details.module').then(m => m.Step5BillingDetailsPageModule),
                canActivate: [AuthGuardShipmentDetailsService, AuthGuardShowRatesService, AuthGuardCustomDetailsService, AuthGuardSenderDetailsService,
                    AuthGuardRecipientDetailsService, AuthGuardBillingDetailsService]
            },
            {
                path: 'summary',
                data: { preload: true },
                loadChildren: () => import('./summary-details/summary-details.module').then(m => m.SummaryDetailsPageModule),
                canActivate: [AuthGuardShipmentDetailsService, AuthGuardShowRatesService, AuthGuardCustomDetailsService, AuthGuardSenderDetailsService,
                    AuthGuardRecipientDetailsService, AuthGuardBillingDetailsService, AuthGuardSummaryService, AuthGuardThankYouSummaryService]
            },
            {
                path: 'thank-you',
                data: { preload: true },
                loadChildren: () => import('./thank-you/thank-you.module').then(m => m.ThankYouPageModule),
                canActivate: [AuthGuardShipmentDetailsService, AuthGuardShowRatesService, AuthGuardCustomDetailsService, AuthGuardSenderDetailsService,
                    AuthGuardRecipientDetailsService, AuthGuardBillingDetailsService, AuthGuardSummaryService, AuthGuardThankYouService]
            },
            {
                path: 'my-shipments',
                data: { preload: true },
                loadChildren: () => import('./my-shipments/my-shipments.module').then(m => m.MyShipmentsPageModule)
            },
            {
                path: 'address-book',
                data: { preload: true },
                loadChildren: () => import('./recipient-address-book/recipient-address-book.module').then(m => m.RecipientAddressBookPageModule)
            },
            {
                path: '**',
                redirectTo: 'shipment-details'
            },

        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ShippingRoutingModule { }