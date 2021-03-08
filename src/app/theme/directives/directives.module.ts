import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnlyNumberDirective } from './only-number.directive';
import { StikyElementDirective } from './stiky-element.directive';

@NgModule({
  declarations: [
    OnlyNumberDirective,
    StikyElementDirective
  ],
  exports: [
    OnlyNumberDirective,
    StikyElementDirective
  ],
  imports: [
    CommonModule
  ]
})
export class DirectivesModule { }
