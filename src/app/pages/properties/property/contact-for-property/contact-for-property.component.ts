import { Component, HostListener, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { Property } from 'src/app/app.models';
import { emailValidator } from 'src/app/theme/utils/app-validators';

@Component({
  selector: 'app-contact-for-property',
  templateUrl: './contact-for-property.component.html',
  styleUrls: ['./contact-for-property.component.scss']
})
export class ContactForPropertyComponent implements OnInit {

  @Input() property: Property;

  public psConfig: PerfectScrollbarConfigInterface = {
    wheelPropagation: true
  };
  
  contactForm: FormGroup;

  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {

    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.compose([Validators.required, emailValidator])],
      phone: ['', Validators.required],
      message: ['', Validators.required]
    });
  }


  public onContactFormSubmit(values: Object) {
    if (this.contactForm.valid) {
      console.log(values);
    }
  }

}
