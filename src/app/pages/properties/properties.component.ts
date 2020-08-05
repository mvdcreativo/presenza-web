import { Component, OnInit, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { Subscription } from 'rxjs'; 
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'; 
import { Settings, AppSettings } from '../../app.settings';
import { AppService } from '../../app.service';
import { Property, Pagination, Publication, Feature } from '../../app.models'; 
import { isPlatformBrowser } from '@angular/common';


@Component({
  selector: 'app-properties',
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.scss']
})
export class PropertiesComponent implements OnInit {
  @ViewChild('sidenav') sidenav: any;
  public sidenavOpen:boolean = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  public psConfig: PerfectScrollbarConfigInterface = {
    wheelPropagation:true
  };
  public properties: Publication[];
  public viewType: string = 'grid';
  public viewCol: number = 33.3;
  public count: number = 12;
  public sort: string;
  public searchFields: any;
  public removedSearchField: string;
  public pagination:Pagination = new Pagination(1, this.count, null, 2, 0, 0); 
  public message:string;
  public watcher: Subscription;

  public settings: Settings
  public features: Feature[];
  constructor(public appSettings:AppSettings, 
              public appService:AppService, 
              public mediaObserver: MediaObserver,
              @Inject(PLATFORM_ID) private platformId: Object) {
    this.settings = this.appSettings.settings;    
    this.watcher = mediaObserver.media$.subscribe((change: MediaChange) => { 
      if (change.mqAlias == 'xs') {
        this.sidenavOpen = false;
        this.viewCol = 100;
      }
      else if(change.mqAlias == 'sm'){
        this.sidenavOpen = false;
        this.viewCol = 50;
      }
      else if(change.mqAlias == 'md'){
        this.viewCol = 50;
        this.sidenavOpen = true;
      }
      else{
        this.viewCol = 33.3;
        this.sidenavOpen = true;
      }
    });

  }

  ngOnInit() {
    this.appService.getFeatures().subscribe(
      resFeatures => {
        this.features = resFeatures.filter(
          feature => {
            return feature.features.length === 0 && feature.type !== "MUTY"
          }
          )
        this.getProperties();
      })
    
  }

  ngOnDestroy(){ 
    this.watcher.unsubscribe();
  }

  public getProperties(){   
    this.appService.getProperties().subscribe(data => { 
      console.log(data);
      
      let result = this.filterData(data); 
      if(result.data.length == 0){
        this.properties.length = 0;
        this.pagination = new Pagination(1, this.count, null, 2, 0, 0);  
        this.message = 'No se encontro resultados';
        return false;
      } 
      console.log(result);
      
      this.properties = result.data; 
      console.log(this.properties);
      
      this.pagination = result.pagination;
      this.message = null;
    })
  }

  public resetPagination(){ 
    if(this.paginator){
      this.paginator.pageIndex = 0;
    }
    this.pagination = new Pagination(1, this.count, null, null, this.pagination.total, this.pagination.totalPages);
  }

  public filterData(data){
    return this.appService.filterData(data, this.searchFields, this.sort, this.pagination.page, this.pagination.perPage, this.features);
  }

  public searchClicked(){ 
    this.properties.length = 0;
    this.getProperties(); 
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo(0,0);
    } 
  }
  public searchChanged(event){
    event.valueChanges.subscribe(() => {   
      this.resetPagination(); 
      this.searchFields = event.value;
      console.log(this.searchFields);
      
      setTimeout(() => {      
        this.removedSearchField = null;
      });
      if(!this.settings.searchOnBtnClick){     
        this.properties.length = 0;  
      }            
    }); 
    event.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe(() => { 
      if(!this.settings.searchOnBtnClick){     
        this.getProperties(); 
      }
    });       
  } 
  public removeSearchField(field){ 
    this.message = null;   
    this.removedSearchField = field; 
  } 


  public changeCount(count){
    this.count = count;   
    this.properties.length = 0;
    this.resetPagination();
    this.getProperties();
  }
  public changeSorting(sort){    
    this.sort = sort; 
    this.properties.length = 0;
    this.getProperties();
  }
  public changeViewType(obj){ 
    this.viewType = obj.viewType;
    this.viewCol = obj.viewCol; 
  } 


  public onPageChange(e){ 
    this.pagination.page = e.pageIndex + 1;
    this.getProperties();
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo(0,0);
    } 
  }

}