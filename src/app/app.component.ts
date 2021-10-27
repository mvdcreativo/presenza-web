import { Component, PLATFORM_ID, Inject } from '@angular/core';
import { Settings, AppSettings } from './app.settings';
import { Router, NavigationEnd } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { fromEvent, Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
   
  scroll: boolean = false;

  public settings: Settings;
  constructor(
    public appSettings:AppSettings, 
    public router:Router,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object
    ){

      iconRegistry.addSvgIcon(
        'ico-wsp',
        sanitizer.bypassSecurityTrustResourceUrl('../assets/images/ico-wsp.svg')
    );

    this.settings = this.appSettings.settings;

  }

  

  ngAfterViewInit(){ 
    this.subscribeToObservables()
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {   
        setTimeout(() => {
          if (isPlatformBrowser(this.platformId)) {
            window.scrollTo(0,0);
          }
        }); 
      }            
    });    
  }

  scroll$: Observable<any> = fromEvent(document, 'scroll');

  private subscribeToObservables() {
      this.scroll$.subscribe(() => {
          // console.log(this.scroll);

          this.scroll = true
          setTimeout(()=>{
              this.scroll = false
              // console.log(this.scroll);
          }, 2000);

      })

  }

}
