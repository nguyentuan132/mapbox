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
  marker;
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
      this.marker = this.createMarker(res);

      this.map.on('mousedown', (e) => {
        console.log('===click', e.originalEvent.button);
        // console.log('click', e.lngLat);
        // console.log('maker', this.maker.getLngLat());
        switch (e.originalEvent.button) {
          case 0: this.getDirection(this.marker.getLngLat(), e.lngLat).subscribe(res => {
            console.log(res);
            let coords = res.routes[0].geometry;
            console.log("coords", JSON.stringify(coords));
            let distance = res.routes[0].distance; // m
            let duration = res.routes[0].duration; // seconds
            console.log("distance", distance);
            console.log("duration", duration);
            this.drawRoute(coords);
          });
            break;
          case 2:
            this.marker.setLngLat([e.lngLat.lng, e.lngLat.lat]);
            if (this.map.getLayer('route')) {
              this.map.removeLayer('route');
              this.map.removeSource('route');
            }
            break;
        }


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

  private createMarker(pos) {
    let makerElement = document.createElement('i');
    makerElement.className = 'marker material-icons';
    makerElement.style.color = 'blue';
    makerElement.style.fontSize = '30px';
    let icon = document.createTextNode("directions_walk");
    makerElement.appendChild(icon);

    let popup = new mapboxgl.Popup({ closeButton: false, anchor: 'top-left' })
      .setHTML('<h3>Right to choose your location</h3>')
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

    return marker;
  }


  public getDirection(dapart, arrive): Observable<any> {
    let d = `${dapart.lng},${dapart.lat}`
    let a = `${arrive.lng},${arrive.lat}`
    let url = `https://api.mapbox.com/directions/v5/mapbox/walking/${d};${a}?alternatives=true&geometries=geojson&steps=true&access_token=${environment.mapbox.accessToken}`
    return this.http.get(url);
  }

  private drawRoute(coords) {
    let dataSource = {
      "type": "Feature",
      "properties": {},
      "geometry": coords

    }
    if (this.map.getLayer('route')) {
      this.map.getSource('route').setData(dataSource)
    } else {
      this.map.addLayer({
        "id": "route",
        "type": "line",
        "source": {
          "type": "geojson",
          "data": dataSource
        },
        "layout": {
          "line-join": "round",
          "line-cap": "round"
        },
        "paint": {
          "line-color": "#3b9ddd",
          "line-width": 8,
          "line-opacity": 0.8
        }
      });
    };
  }
}


