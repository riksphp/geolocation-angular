import { GeocodingService } from './geocoding.service';
import { RestService } from './rest.service';
import { Component } from '@angular/core';
import { } from '@types/googlemaps';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // Center map. Required.
  center: google.maps.LatLng;
  // Marker position. Required.
  position: google.maps.LatLng;


  title = 'Welcome to outlet finder.';
  currentLat: any;
  currentLng: any;
  address: string;
  outputData: any;
  diagnostics: any;

  constructor(
    private restService: RestService,
    private geocoding: GeocodingService
  ) {

    // Initialise with my address
    this.center = new google.maps.LatLng(77.7014244, 12.937216699999999);
    this.initialiseData();
  }

  findMe() {
    this.initialiseData();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.center = new google.maps.LatLng(
          position.coords.latitude,
          position.coords.longitude
        );
        this.getOutletData();
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }

  initialiseData() {
    this.currentLat = "Please enter address.";
    this.currentLng = "Please enter address.";
    this.outputData = "";
    this.diagnostics = "";
  }


  onSubmit() {
    this.initialiseData();
    this.search(this.address);
  }

  getOutletData() {
    this.currentLat = this.center.lat();
    this.currentLng = this.center.lng();
    this.restService.getLocation(this.currentLat, this.currentLng)
      .subscribe(data => {
        this.outputData = (data && data[0] && data[0].length > 0) ? data : "Not Found";
      });
  }

  search(address: string): void {
    if (address != "") {
      // Converts the address into geographic coordinates.
      // Here 'forEach' resolves the promise faster than 'subscribe'.
      this.geocoding.codeAddress(address).forEach(
        (results: google.maps.GeocoderResult[]) => {
          if (!this.center.equals(results[0].geometry.location)) {
            // New center object: triggers OnChanges.
            this.center = new google.maps.LatLng(
              results[0].geometry.location.lat(),
              results[0].geometry.location.lng()
            );
          }
        })
        .then(() => {
          this.address = "";
          console.log('Geocoding service: completed.');
          this.getOutletData();
        })
        .catch((error: google.maps.GeocoderStatus) => {
          if (error === google.maps.GeocoderStatus.ZERO_RESULTS) {
            console.log("Zero results for given address.");
          }
        });
    }
  }
}
