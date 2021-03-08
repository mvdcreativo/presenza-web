import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FilterByIdPipe } from './filter-by-id.pipe';
import { FilterNeighborhoodsPipe } from './filter-neighborhoods';
import { FilterStreetsPipe } from './filter-streets.pipe';
import { FilterCityPipe } from './filter-city.pipe';
import { FilterMunicipalityPipe } from './filter-municipality.pipe';
import { SanitizerPipe } from './sanitizer.pipe';

@NgModule({
    imports: [ 
        CommonModule 
    ],
    declarations: [
        FilterByIdPipe,
        FilterNeighborhoodsPipe,
        FilterStreetsPipe,
        FilterCityPipe,
        FilterMunicipalityPipe,
        SanitizerPipe,
        
    ],
    exports: [
        FilterByIdPipe,
        FilterNeighborhoodsPipe,
        FilterStreetsPipe,
        FilterCityPipe,
        FilterMunicipalityPipe,
        SanitizerPipe
    ]
})
export class PipesModule { }
