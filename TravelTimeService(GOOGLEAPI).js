import LocationService from "./LocationService.js";
import fetch from "node-fetch";


import "dotenv/config";


/*
TravelTimeService is responsible for fetching the estimated travel time 
 * from the user's current location to a specified destination using the Google Maps API.

functionality:
* 1. Uses `LocationService` to determine the user's current latitude and longitude.
 * 2. Calls the Google Maps Directions API to retrieve the estimated travel duration.
 * 3. Returns the travel time (e.g., "45 mins") if a route is found.
 * 4. Handles errors if the user's location is unavailable or no route exists.
 * 
 * Retrieves user's current location via `LocationService`.
 * Fetches real-time travel duration from Google Maps API.
 * Handels API errors and location failures
*/








/*  WAIT MAY HAVE FOUND WORKAROUNG???   
    Initially was gona use google maps api and stuff but gona use a different one for now google maps charges after $200 of useage
    If this blows up it may be cool to switch back to google maps instead of 
*/
class TravelTimeService {
    constructor(apiKey = process.env.GOOGLE_MAPS_API_KEY) {
        this.apiKey = apiKey;
       this.LocationService = new LocationService();
    }

    async getTravelTime(destination) {
        try {
            const userCoordinates = await this.LocationService.getUserLocation();
            
            if (!userCoordinates) {
                throw new Error("Couldn't determine user's location");
            }
    
            const origin = `${userCoordinates.latitude},${userCoordinates.longitude}`;
            
            console.log(" Requesting Route from Google Maps...");
            console.log(" Origin:", origin);
            console.log(" Destination:", destination);
    
            //  Google Maps API URL
            const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=driving&key=${this.apiKey}`;
    
            let response = await fetch(url);
            let data = await response.json();
    
            console.log(" Google Maps API Full Response:", JSON.stringify(data, null, 2)); // ✅ Log full response
    
            if (data.routes && data.routes.length > 0) {
                return data.routes[0].legs[0].duration.text; // Example: "45 mins"
            } else {
                console.error("🚨 Google Maps Error Message:", data);
                throw new Error("No route found!!!");
            }
    
        } catch (error) {
            console.error("Error when trying to fetch travel time", error);
            return null;
        }
    }

}

export default TravelTimeService;

