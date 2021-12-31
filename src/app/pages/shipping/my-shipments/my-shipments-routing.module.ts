import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyShipmentsPage } from './my-shipments.page';
import { RecentlyShippedComponent } from './components/recently-shipped/recently-shipped.component';
import { PendingShipmentsComponent } from './components/pending-shipments/pending-shipments.component';

const routes: Routes = [
  {
    path: '',
    component: MyShipmentsPage,
    children: [
      {
        path: 'recent',
        component:RecentlyShippedComponent
        // loadChildren:() => import('../my-shipments/my-shipments.module').then(m => m.MyShipmentsPageModule)
      },
      {
        path:'pending',
        component: PendingShipmentsComponent
      },
      {
        path:'',
        redirectTo:'/shipping/my-shipments/recent',
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyShipmentsPageRoutingModule {}
