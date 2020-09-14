import { Component, OnInit, Input, ViewChild, SimpleChange } from '@angular/core';
import { SwiperDirective, SwiperConfigInterface, SwiperPaginationInterface } from 'ngx-swiper-wrapper'; 
import { Property, Publication } from '../../app.models';
import { Settings, AppSettings } from '../../app.settings';

import { AppService } from '../../app.service'; 
import { CompareOverviewComponent } from '../compare-overview/compare-overview.component'; 
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-property-item',
  templateUrl: './property-item.component.html',
  styleUrls: ['./property-item.component.scss'] 
})
export class PropertyItemComponent implements OnInit {
  @Input() publication: Publication;
  @Input() viewType: string = "grid";
  @Input() viewColChanged: boolean = false; 
  @Input() fullWidthPage: boolean = true;

  public storageAPI = environment.storageAPI;
  public defaulIconFeature = `${this.storageAPI}images/icons/tick.svg`
  public property : Property;
  public column:number = 4;
  // public address:string; 
  @ViewChild(SwiperDirective) directiveRef: SwiperDirective;
  public config: SwiperConfigInterface = {};
  private pagination: SwiperPaginationInterface = {
    el: '.swiper-pagination',
    clickable: true
  };
  public settings: Settings;
  featuresImportants: any;
  constructor(public appSettings:AppSettings, public appService:AppService) {
    this.settings = this.appSettings.settings;

  }

  ngOnInit() {
    if(this.publication){

      this.property = this.publication?.property;
      this.filterFeatureImportant()
    }
   }

  ngAfterViewInit(){
    this.initCarousel();
    // this.appService.getAddress(this.property.location.lat, this.property.location.lng).subscribe(data=>{
    //   console.log(data['results'][0]['formatted_address']);
    //   this.address = data['results'][0]['formatted_address'];
    // })
  } 
 
  ngOnChanges(changes: {[propKey: string]: SimpleChange}){  
    if(changes.viewColChanged){
      this.getColumnCount(changes.viewColChanged.currentValue);
      if(!changes.viewColChanged.isFirstChange()){
        if(this.property.images.length > 1){     
           this.directiveRef.update();  
        } 
      }
    } 

    for (let propName in changes) {      
      // let changedProp = changes[propName];
      // if (!changedProp.isFirstChange()) {
      //   if(this.property.gallery.length > 1){
      //     this.initCarousel();
      //     this.config.autoHeight = true;       
      //     this.directiveRef.update();  
      //   }       
      // }      
    }  
  }

  public getColumnCount(value){
    if(value == 25){
      this.column = 4;
    }
    else if(value == 33.3){
      this.column = 3;
    }
    else if(value == 50){
      this.column = 2
    }
    else{
      this.column = 1;
    }
  }

  public getStatusBgColor(status){
    switch (status) {
      case 1:
        return '#3e92cc';  
      case 3:
        return '#d8315b'; 
      case 4:
        return '#3e92cc';
      // case 'No Fees':
      //   return '#FFA000';
      // case 'Hot Offer':
      //   return '#F44336';
      // case 'Sold':
      //   return '#000';
      default: 
        return '#0a2463';
    }
  }


  public initCarousel(){
    this.config = {
      slidesPerView: 1,
      spaceBetween: 0,         
      keyboard: false,
      navigation: true,
      pagination: this.pagination,
      grabCursor: true,        
      loop: true,
      preloadImages: false,
      lazy: true,  
      nested: true,
      // autoplay: {
      //   delay: 5000,
      //   disableOnInteraction: false
      // },
      speed: 500,
      effect: "slide"
    }
  }
  

  public addToCompare(){
    this.appService.addToCompare(this.publication, CompareOverviewComponent, (this.settings.rtl) ? 'rtl':'ltr'); 
  }

  public onCompare(){
    return this.appService.Data.compareList.filter(item=>item.id == this.publication.id)[0];
  }

  public addToFavorites(){
    this.appService.addToFavorites(this.publication, (this.settings.rtl) ? 'rtl':'ltr');
  }

  public onFavorites(){
    return this.appService.Data.favorites.filter(item=>item.id == this.property.id)[0];
  }

  filterFeatureImportant(){
    this.featuresImportants = this.property?.features.filter(f => f.id === 5 || f.id === 7 || f.id === 11 || f.id === 5 || f.id === 16 || f.id === 17 )

  }


}
