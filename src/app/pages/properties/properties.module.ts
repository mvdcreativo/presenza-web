import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AgmCoreModule } from '@agm/core'; 
import { MatVideoModule } from 'mat-video';
import { SharedModule } from '../../shared/shared.module';
import { PropertiesComponent } from './properties.component';
import { PropertyComponent } from './property/property.component';
import { SwiperConfigInterface, SWIPER_CONFIG } from 'ngx-swiper-wrapper';
import { GaleryComponent } from './property/galery/galery.component';

const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
  direction: 'horizontal',
  slidesPerView: 'auto'
};

export const routes = [
  { path: '', component: PropertiesComponent, pathMatch: 'full' },
  { path: ':id', component: PropertyComponent }
];

@NgModule({
  declarations: [
    PropertiesComponent, 
    PropertyComponent, GaleryComponent
  ],
  exports: [
    PropertiesComponent, 
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    AgmCoreModule, 
    MatVideoModule,
    SharedModule
  ],
  providers: [
    {
      provide: SWIPER_CONFIG,
      useValue: DEFAULT_SWIPER_CONFIG
    }
  ]
})
export class PropertiesModule { }
