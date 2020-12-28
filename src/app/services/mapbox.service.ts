import { Injectable } from '@angular/core';
import { environment } from './../../environments/environment';
import * as MapboxGeocoder from 'mapbox-gl-geocoder';
import * as mapboxgl from 'mapbox-gl';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MapboxService {
  map: mapboxgl.Map
  maker;
  constructor(private http: HttpClient) {
    mapboxgl.accessToken = environment.mapbox.accessToken;
    this.getLocation().subscribe(res => {
      console.log("location : ", res)
      this.map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/outdoors-v9',
        zoom: 15,
        center: res
      });

      this.map.addControl(
        new MapboxGeocoder({
          accessToken: mapboxgl.accessToken,
          mapboxgl: mapboxgl
        })
      );
      this.maker = this.createMaker(res);

      this.map.on('click', (e) => {
        console.log('click', e.lngLat);
        console.log('maker', this.maker.getLngLat());
        this.getDirection(this.maker.getLngLat(), e.lngLat).subscribe(res => {
          console.log(res);
        });
      });
    });
  }



  public getLocation() {
    return new Observable(obs => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          //[this.location.coords.longitude, this.location.coords.latitude]
          obs.next([position.coords.longitude, position.coords.latitude]);
          obs.complete();
        }, (error) => {
          console.error(error);
          obs.next(environment.mapbox.center);
        });
      } else {
        console.error("Geolocation is not supported by this browser.");
        obs.next(environment.mapbox.center);
      }
    });
  }

  private createMaker(pos) {
    let makerElement = document.createElement('i');
    makerElement.className = 'marker material-icons';
    makerElement.style.color = 'blue';
    makerElement.style.fontSize = '30px';
    let icon = document.createTextNode("directions_walk");
    makerElement.appendChild(icon);

    let popup = new mapboxgl.Popup({ closeButton: false, anchor: 'top-left' })
      .setHTML('<h3>Drag to chosen your location</h3>')
      .addTo(this.map);
    makerElement.addEventListener("mouseenter", (event) => {
      popup.setLngLat([marker.getLngLat().lng, marker.getLngLat().lat])
        .addTo(this.map);
    }, false);

    makerElement.addEventListener("mouseleave", (event) => {
      popup.remove();
    }, false);
    let marker = new mapboxgl.Marker({ draggable: true, element: makerElement })
      .setPopup(popup)
      .setLngLat(pos)
      .addTo(this.map);

    this.map.on("moveend", (e) => {
      console.log(e);
      marker.setLngLat([this.map.getCenter().lng, this.map.getCenter().lat]);
    });
    return marker;
  }


  getDirection(dapart, arrive) {
    let d = `${dapart.lng},${dapart.lat}`
    let a = `${arrive.lng},${arrive.lat}`
    let url = `https://api.mapbox.com/directions/v5/mapbox/walking/${d};${a}?alternatives=true&geometries=geojson&steps=true&access_token=${environment.mapbox.accessToken}`
    return this.http.get(url);
  }

}
