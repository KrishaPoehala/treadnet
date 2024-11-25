import { Component, Input, OnInit } from '@angular/core';
import { Post } from 'src/app/models/post/post';
import { Reaction } from 'src/app/models/reactions/reaction';

@Component({
  selector: 'app-reactions-info',
  templateUrl: './reactions-info.component.html',
  styleUrls: ['./reactions-info.component.css']
})
export class ReactionsInfoComponent implements OnInit {

  constructor() { }
  @Input() reactions!:Reaction[]
  ngOnInit(): void {
  }

}
