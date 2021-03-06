// Global Variables
var map, clientID, clientSecret,infoWindow;

function AppViewModel() {
    var currentLocation = this;

    this.searchOption = ko.observable("");
    this.markers = [];

    // This function populates the infowindow when the marker is clicked. We'll only allow
    // one infowindow which will open at the marker that is clicked, and populate based
    // on that markers position.
    this.populateInfoWindow = function(marker, infowindow) {
        infoWindow = infowindow;
        if (infowindow.marker != marker) {
            infowindow.setContent('');
            infowindow.marker = marker;
            // Foursquare API Client
            clientID = "4BCYT21WBNSSAS4VW2QS5XDF4ZJXH3Y4W1JFGLMJ2L4WKEK2";
            clientSecret = "3ZRSNTBHSRV3IGMEUBP4C1UITRLK0M3RNNEFLZD1I33SQHSD";
            // URL for Foursquare API
            var apiUrl = 'https://api.foursquare.com/v2/venues/search?ll=' +
                marker.lat + ',' + marker.lng + '&client_id=' + clientID +
                '&client_secret=' + clientSecret + '&query=' + marker.title +
                '&v=20170708' + '&m=foursquare';

            // Foursquare API
            $.getJSON(apiUrl).done(function (marker) {
                var foundMarker = marker.response.venues[0];
                var venueId = foundMarker.id;
                var photoApiUrl = 'https://api.foursquare.com/v2/venues/'+ venueId +'/photos?ll=40.7,-74&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20220612';
                // AJAX call to retrieve photo info
                $.getJSON(photoApiUrl).done(function (photoInfo) {
                    var firstPhoto = photoInfo.response.photos.items[0];
                    fillInfoWindow(foundMarker, firstPhoto);
                }).fail(function () {
                    alert('There was an issue calling the Foursquare API please refresh and try again');
                });
            }).fail(function() {
                // Send alert
                alert(
                    "There was an issue loading the Foursquare API. Please refresh your page to try again."
                );
                });

            
            this.htmlContent = '<div>' + '<h4 class="iw_title">' + marker.title +
                '</h4>' + '</div>';

            infowindow.open(map, marker);

            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });
        }
    };

    function fillInfoWindow(foundMarker, photo) {
        currentLocation.street = foundMarker.location.formattedAddress[0];
        currentLocation.city = foundMarker.location.formattedAddress[1];
        currentLocation.zip = foundMarker.location.formattedAddress[3];
        currentLocation.country = foundMarker.location.formattedAddress[4];
        currentLocation.category = foundMarker.categories[0].shortName;
            
        if(photo === undefined){
            firstPhotoUrl = 'https://image.flaticon.com/icons/svg/462/462949.svg'
        }else{
            var firstPhotoUrl = photo.prefix + 'cap150' + photo.suffix;
        }
        

        currentLocation.htmlContentFoursquare =
            '<div>' + '<h5 class="iw_subtitle">(' + currentLocation.category +
            ')</h5>' + '<div>' + '<img src="' + firstPhotoUrl + '">' + '</div>' +
            '<div>' +
            '<h6 class="iw_address_title"> Address: </h6>' +
            '<p class="iw_address">' + currentLocation.street + '</p>' +
            '<p class="iw_address">' + currentLocation.city + '</p>' +
            '</div>' + '</div>';

        infoWindow.setContent(currentLocation.htmlContent + currentLocation.htmlContentFoursquare);
    }

    this.populateAndBounceMarker = function() {
        currentLocation.populateInfoWindow(this, currentLocation.largeInfoWindow);
        this.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout((function() {
            this.setAnimation(null);
        }).bind(this), 1400);
    };

    this.initMap = function() {
        var mapCanvas = document.getElementById('map');
        var mapOptions = {
            center: new google.maps.LatLng(37.422621, -122.083970),
            zoom: 15,
            styles: styles
        };
        // Constructor creates a new map - only center and zoom are required.
        map = new google.maps.Map(mapCanvas, mapOptions);

        // Set InfoWindow
        this.largeInfoWindow = new google.maps.InfoWindow();
        for (var i = 0; i < myLocations.length; i++) {
            this.markerTitle = myLocations[i].title;
            this.markerLat = myLocations[i].lat;
            this.markerLng = myLocations[i].lng;
            // Google Maps marker setup
            this.marker = new google.maps.Marker({
                map: map,
                position: {
                    lat: this.markerLat,
                    lng: this.markerLng
                },
                title: this.markerTitle,
                lat: this.markerLat,
                lng: this.markerLng,
                id: i,
                animation: google.maps.Animation.DROP
            });
            this.marker.setMap(map);
            this.markers.push(this.marker);
            this.marker.addListener('click', currentLocation.populateAndBounceMarker);
        }
    };

    this.initMap();

    // This block appends our locations to a list using data-bind
    // It also serves to make the filter work
    this.myLocationsFilter = ko.computed(function() {
        var result = [];
        for (var i = 0; i < this.markers.length; i++) {
            var markerLocation = this.markers[i];
            if (markerLocation.title.toLowerCase().includes(this.searchOption()
                    .toLowerCase())) {
                result.push(markerLocation);
                this.markers[i].setVisible(true);
            } else {
                this.markers[i].setVisible(false);
            }
        }
        return result;
    }, this);
}

googleError = function googleError() {
    alert(
        'Oops. Google Maps did not load. Please refresh the page and try again!'
    );
};

function startApp() {
    ko.applyBindings(new AppViewModel());
}