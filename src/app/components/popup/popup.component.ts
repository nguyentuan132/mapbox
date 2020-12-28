import { Component, OnInit } from '@angular/core';
import { MapboxService } from '../../services/mapbox.service';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements OnInit {

  constructor(private mapboxService: MapboxService) { }

  ngOnInit(): void {
  }

}
