import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo'
})
export class TimeAgoPipe implements PipeTransform {

  transform(value: Date): unknown {
    value = new Date(value)
    const now = new Date();
    const timeDiff = now.getTime() - value.getTime();

    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
      return 'now';
    }

    if (minutes < 60) {
      return `${minutes} minutes ago`;
    }  

    if (hours < 24) {
      return `${hours} hours ago`;
    } 

    if (days < 365) {
      return `${days} days ago`;
    }

    const formattedDate = value.toLocaleDateString(undefined, { 
      day: 'numeric',
      month: 'long',
      year: 'numeric'
     });

    return formattedDate;
  }
}
