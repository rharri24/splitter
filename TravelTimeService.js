import "dotenv/config";
import fetch from "node-fetch";
import LocationService from "./LocationService.js";

class TravelTimeService {
    constructor(apiKey = process.env.OPENROUTE_API_KEY) {
        if (!apiKey) {
            throw new Error("HERE API key is missing!");
        }
        this.apiKey = apiKey;
        this.LocationService = new LocationService();
    }

    async getTravelTime(destination) {
        try {
            const userCoordinates = await this.LocationService.getUserLocation();
            
            if (!userCoordinates) {
                throw new Error("Couldn't determine user's location");
            }

            console.log("Requesting Route from HERE API...");
            console.log("User Coordinates:", userCoordinates);
            console.log("Destination:", destination);

            // First, geocode the destination if it's not already coordinates
            let destinationCoords;
            if (typeof destination === 'string' && !destination.match(/^-?\d+\.\d+,-?\d+\.\d+$/)) {
                console.log("Geocoding", destination)
                destinationCoords = await this.geocodeAddress(destination);
                console.log("Geocoded Destination:", destinationCoords);
            } else {
                // Assuming destination is already in format "lat,lng"
                destinationCoords = destination;
            }
            
            if (!destinationCoords) {
                throw new Error("Could not geocode destination address");
            }

            // HERE Routing API v8 URL
            const routeUrl = `https://router.hereapi.com/v8/routes?transportMode=car&origin=${userCoordinates.latitude},${userCoordinates.longitude}&destination=${destinationCoords}&return=summary&apiKey=${this.apiKey}`;

            const response = await fetch(routeUrl);
            const data = await response.json();

            console.log("HERE API Response Summary:", 
                data.routes ? `Found ${data.routes.length} routes` : "No routes found");

            if (data.routes && data.routes.length > 0 && data.routes[0].sections) {
                // Extract duration in seconds and convert to minutes
                const durationInSeconds = data.routes[0].sections[0].summary.duration;
                return `${Math.round(durationInSeconds / 60)} mins`;
            } else {
                throw new Error("No valid route found in response");
            }

        } catch (error) {
            console.error("Error when trying to fetch travel time:", error);
            return null;
        }
    }

    async geocodeAddress(address) {
        try {
            // HERE Geocoding API URL
            const geocodeUrl = `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(address)}&apiKey=${this.apiKey}`;
            
            const response = await fetch(geocodeUrl);
            const data = await response.json();

            if (data.items && data.items.length > 0) {
                const position = data.items[0].position;
                return `${position.lat},${position.lng}`;
            } else {
                console.log("truied to geocode but failed:", address)
                throw new Error("No geocoding results found");
            }
        } catch (error) {
            console.error("Error geocoding address:", error);
            return null;
        }
    }
}

export default TravelTimeService;