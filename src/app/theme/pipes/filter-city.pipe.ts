import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterCity'
})
export class FilterCityPipe implements PipeTransform {

  transform(items:Array<any>, id?) {
    if(id){
      return items.filter(item => item.province_id == id);
    } 
    return items;  
  }


}
