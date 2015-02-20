/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

 // Specify your beacon UUIDs here.
var regions =
[
    // Estimote Beacon factory UUID.
    {uuid:'B9407F30-F5F8-466E-AFF9-25556B57FE6D'},
    // Sample UUIDs for beacons in our lab.
    {uuid:'F7826DA6-4FA2-4E98-8024-BC5B71E0893E'},
    {uuid:'8DEEFBB9-F738-4297-8040-96668BB44281'},
    {uuid:'A0B13730-3A9A-11E3-AA6E-0800200C9A66'},
    {uuid:'A4950001-C5B1-4B44-B512-1370F02D74DE'}
];

// Dictionary of beacons.
var beacons = {};

// Timer that displays list of beacons.
var updateTimer = null;

var lastkey = null;
var nearkey = null;

var app = {

    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');


        //Beacon
        // Specify a shortcut for the location manager holding the iBeacon functions.
        window.locationManager = cordova.plugins.locationManager;
        startScan();
        updateTimer = setInterval(loopBeaconList, 1000);


        function startScan()
        {
            // The delegate object holds the iBeacon callback functions
            // specified below.
            var delegate = new locationManager.Delegate();

            // Called continuously when ranging beacons.
            delegate.didRangeBeaconsInRegion = function(pluginResult)
            {
                //console.log('didRangeBeaconsInRegion: ' + JSON.stringify(pluginResult))
                for (var i in pluginResult.beacons)
                {
                    // Insert beacon into table of found beacons.
                    var beacon = pluginResult.beacons[i];
                    beacon.timeStamp = Date.now();
                    var key = beacon.uuid + ':' + beacon.major + ':' + beacon.minor;
                    beacons[key] = beacon;
                }
            };

            // Called when starting to monitor a region.
            // (Not used in this example, included as a reference.)
            delegate.didStartMonitoringForRegion = function(pluginResult)
            {
                //console.log('didStartMonitoringForRegion:' + JSON.stringify(pluginResult))
            };

            // Called when monitoring and the state of a region changes.
            // (Not used in this example, included as a reference.)
            delegate.didDetermineStateForRegion = function(pluginResult)
            {
                //console.log('didDetermineStateForRegion: ' + JSON.stringify(pluginResult))
            };

            // Set the delegate object to use.
            locationManager.setDelegate(delegate);

            // Request permission from user to access location info.
            // This is needed on iOS 8.
            locationManager.requestAlwaysAuthorization();

            // Start monitoring and ranging beacons.
            for (var i in regions)
            {
                var beaconRegion = new locationManager.BeaconRegion(
                    i + 1,
                    regions[i].uuid);

                // Start ranging.
                locationManager.startRangingBeaconsInRegion(beaconRegion)
                    .fail(console.error)
                    .done();

                // Start monitoring.
                // (Not used in this example, included as a reference.)
                locationManager.startMonitoringForRegion(beaconRegion)
                    .fail(console.error)
                    .done();
            }
        }

        
        function loopBeaconList(){
            var nearest = null;
           
            for (var key in beacons) {
                var beacon = beacons[key];

                // Map the RSSI value to a width in percent for the indicator.
                var rssiWidth = 1; // Used when RSSI is zero or greater.
                if (beacon.rssi < -100) { rssiWidth = 100; }
                else if (beacon.rssi < 0) { rssiWidth = 100 + beacon.rssi; }

                if(nearest == null || (beacon.rssi > nearest.rssi && beacon.rssi != 0)){
                    nearest = beacon;
                    nearkey = key;
                }

            }

            if(lastkey != nearkey ){
                navigator.tts.speak("You are near to Beacon " + nearest.major);
                lastkey = nearkey;
            }
            
        }




        // TTS
        navigator.tts.startup(startupWin, fail);
        function startupWin(result) {
            console.log("Startup win");
            // When result is equal to STARTED we are ready to play
            console.log("Result "+result);
            //TTS.STARTED==2 use this once so is answered
            if (result == 2) {
                navigator.tts.getLanguage(win, fail);
                navigator.tts.speak("Hello team Relexaflex");                                     
            }
        }                               

        function win(result) {
            console.log(result);
        }

        function fail(result) {
            console.log("Error = " + result);
        }
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};



app.initialize();