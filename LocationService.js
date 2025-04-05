import fetch from "node-fetch";

//this can be done in a whole different way if i wana switch apis, but for not only gona use google maps so mmore simple implementation
class LocationService { 
    constructor(){
        /*gets the ip to put into google maps*/
        /* works but is less accurate*/
        /*better way can be implemented later*/
        this.ipApiUrl = "http://ip-api.com/json/"; // Free IP-based location API
    }

    async getBrowserLocation() {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    position => resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    }),
                    error => reject(error)
                );
            } else {
                reject(new Error("Geolocation is not supported by this browser."));
            }
        });
    }


    async getIpLocation() {
        try {
            let response = await fetch(this.ipApiUrl);
            let data = await response.json();
            return {
                latitude: data.lat,
                longitude: data.lon
            };
        } catch (error) {
            console.error("Error fetching location from IP API:", error);
            return null;
        }
    }


    /*
    more accureate than the func righ tbelow it
    I dont think it will work in terminal i think it needs a browser
    When I bring it to the web implementatino and it comes to that time switch back
    but for now use the one below
    */
    // async getUserLocation() {
    //     try {
    //         return await this.getBrowserLocation(); // Try browser first
    //     } catch (error) {
    //         console.warn("Falling back to IP-based location...");
    //         return await this.getIpLocation(); // Use IP-based if browser fails
    //     }
    // }

    /*WORKS WITHOUT USER ZPERMISSION LOL???*/
    async getUserLocation() {
        try {
            const location = await this.getIpLocation(); // Using IP-based location
            console.log("📍 User Coordinates:", location); // ✅ Log user location
    
            return location;
        } catch (error) {
            console.error("Error retrieving user location:", error);
            return null;
        }
    }


}

//need this or else other files cant import
export default LocationService;
