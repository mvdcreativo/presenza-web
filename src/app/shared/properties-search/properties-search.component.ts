import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { AppService } from '../../app.service';
import { PropertyTypes, TransactionTypes, State, City, Neighborhood, Municipality, Feature } from 'src/app/app.models';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-properties-search',
  templateUrl: './properties-search.component.html',
  styleUrls: ['./properties-search.component.scss']
})
export class PropertiesSearchComponent implements OnInit, OnDestroy {
  @Input() variant: number = 1;
  @Input() vertical: boolean = false;
  @Input() searchOnBtnClick: boolean = false;
  @Input() removedSearchField: string;
  @Output() onSearchChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() onSearchClick: EventEmitter<any> = new EventEmitter<any>();
  public showMore: boolean = false;
  public form: FormGroup;
  public propertyTypes: Observable<PropertyTypes[]>;
  public propertyStatuses: Observable<TransactionTypes[]>;
  public states: Observable<State[]>;
  public cities: Observable<City[]>;
  public neighborhoods: Observable<Neighborhood[]>;
  public municipalities: Observable<Municipality[]>;
  public streets = [];
  public features: Feature[];
  public subscriptions: Subscription[] = [];
  featurePrimary: any[];
  featureSecondary: any[];

  public val100 = [
    { name: "0 a 100", value: "0-100" },
    { name: "100 a 200", value: "100-200" },
    { name: "200 a 300", value: "200-300" },
    { name: "300 a 400", value: "300-400" },
    { name: "400 a 500", value: "400-500" },
    { name: "500 a 600", value: "500-600" },
    { name: "600 a 700", value: "600-700" },
    { name: "700 a 800", value: "700-800" },
    { name: "800 a 900", value: "800-900" },
    { name: "900 a 1000", value: "900-1000" },
    { name: "1000 a 2000", value: "1000-2000" },
    { name: "2000 a 3000", value: "2000-3000" },
    { name: "3000 a 4000", value: "3000-4000" },
  ]

  public propertyStatus = [
    { "value": 1,"name": "Bueno"},
    {"value": 2,"name": "A estrenar"},
    {"value": 3,"name": "Exelente"},
    {"value": 4,"name": "Para reciclar"},
    {"value": 5,"name": "Malo"},
    {"value": 6,"name": "Detalles"},
    {"value": 7,"name": "Con mejoras"}
  ]

  constructor(public appService: AppService, public fb: FormBuilder) {

  }

  ngOnInit() {
    if (this.vertical) {
      this.showMore = true;
    };
    this.propertyTypes = this.appService.getPropertyTypes();
    this.propertyStatuses = this.appService.getPropertyStatuses();
    this.states = this.appService.getStates();
    this.cities = this.appService.getCities();
    this.municipalities = this.appService.getMunicipality();

    this.neighborhoods = this.appService.getNeighborhoods();
    this.streets = this.appService.getStreets();


    this.subscriptions.push(
      this.appService.getFeatures().subscribe(
        res => {
          // this.features = res
          this.featurePrimary = res.filter(
            fprimary => fprimary.features?.length > 0 && fprimary.type === "MULTI"
          )
          this.featureSecondary = res.filter(
            f => f.type !== "MULTI"
          )
          if (this.featureSecondary) {
            console.log(this.featureSecondary)

            this.featureSecondary.forEach(featureSecondary => {
              this.form.addControl(featureSecondary.slug, new FormControl(null));
            })
            
            this.onSearchChange.emit(this.form);
            // features:
          }
        }
      )
    )


    this.crateForm()

  }

  crateForm() {
    this.form = this.fb.group({
      propertyType: null,
      propertyStatus: null,
      price: this.fb.group({
        from: null,
        to: null
      }),
      state: null,
      municipality: null,
      city: null,
      // zipCode: null,
      neighborhood: null,
      
    });

  }
  public buildFeaturesPrimary() {
    const arr = this.featurePrimary?.map(featurePrimary => {

      return this.fb.group({
        features: this.buildFeatures(featurePrimary)
      })

    })
    console.log(arr);
    // return arr
    return this.fb.array(arr);
  }

  public buildFeatures(featurePrimary) {
    const arr = featurePrimary.features.map(
      feature => {
        return this.fb.group({
          [feature.slug]: null

        })
      }
    )

    return this.fb.array(arr);
  }


  ngOnChanges() {
    if (this.removedSearchField) {
      if (this.removedSearchField.indexOf(".") > -1) {
        let arr = this.removedSearchField.split(".");
        this.form.controls[arr[0]]['controls'][arr[1]].reset();
      }
      else if (this.removedSearchField.indexOf(",") > -1) {
        let arr = this.removedSearchField.split(",");
        this.form.controls[arr[0]]['controls'][arr[1]]['controls']['selected'].setValue(false);
      }
      else {
        this.form.controls[this.removedSearchField].reset();
      }
    }
  }

  public reset() {
    this.form.reset({
      propertyType: null,
      propertyStatus: null,
      price: {
        from: null,
        to: null
      },
      city: null,
      zipCode: null,
      neighborhood: null,
      street: null,
      bedrooms: {
        from: null,
        to: null
      },
      bathrooms: {
        from: null,
        to: null
      },
      garages: {
        from: null,
        to: null
      },
      area: {
        from: null,
        to: null
      },
      yearBuilt: {
        from: null,
        to: null
      },
      features: this.features
    });
  }

  public search() {
    this.onSearchClick.emit();
  }

  public onSelectState() {
    this.form.controls['city'].setValue(null, { emitEvent: false });
    this.form.controls['municipality'].setValue(null, { emitEvent: false });
    this.form.controls['neighborhood'].setValue(null, { emitEvent: false });
  }
  public onSelectCity() {
    this.form.controls['municipality'].setValue(null, { emitEvent: false });
    this.form.controls['neighborhood'].setValue(null, { emitEvent: false });

  }
  public onSelectMunicipality() {
    this.form.controls['neighborhood'].setValue(null, { emitEvent: false });
  }
  public onSelectNeighborhood() {
    // this.form.controls['street'].setValue(null, {emitEvent: false});
  }

  public getAppearance() {
    return (this.variant != 3) ? 'outline' : '';
  }
  public getFloatLabel() {
    return (this.variant == 1) ? 'always' : '';
  }


  ngOnDestroy() {
    this.subscriptions.map(sub => sub.unsubscribe())
  }

}
