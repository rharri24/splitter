import { studentModel } from './StudentSchema.js';

class StudentModel {
  constructor(name, email, phoneNumber, uid, password, travelTimeService) {
    this.name = name;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.uid = uid;
    this.password = password;
    this.destinations = [];
    this.travelTimeService = travelTimeService;
  }

  async addDestination(destination, arrivalTime) {
    // Create destination object
    const newDestination = {
      location: destination,
      arrivalTime: new Date(arrivalTime)
    };
    
    // Add travel time data
    try {
      const travelTime = await this.travelTimeService.getTravelTime(destination);
      if (travelTime) {
        newDestination.travelTime = travelTime;
        
        // Calculate departure window
        const travelMinutes = parseInt(travelTime.match(/\d+/)[0]);
        const bufferMinutes = 60; // 1-hour window for ride matching

        newDestination.departureWindow = {
          earliest: new Date(new Date(arrivalTime).getTime() - (travelMinutes + bufferMinutes) * 60000),
          latest: new Date(new Date(arrivalTime).getTime() - travelMinutes * 60000)
        };
      }
    } catch (error) {
      console.error(`Error getting travel time for ${destination}:`, error);
    }
    
    this.destinations.push(newDestination);
  }

  toDocument() {
    return {
      name: this.name,
      email: this.email,
      phoneNumber: this.phoneNumber,
      uid: this.uid,
      destinations: this.destinations
    };
  }

  displayUserInfo() {
    console.log(`Name: ${this.name}`);
    console.log(`Email: ${this.email}`);
    console.log(`Phone: ${this.phoneNumber}`);
    console.log(`Destinations:`);
    this.destinations.forEach((dest, i) => {
      console.log(`  ${i+1}. ${dest.location} - Arrival: ${new Date(dest.arrivalTime).toLocaleString()}`);
      if (dest.travelTime) {
        console.log(`     Travel time: ${dest.travelTime}`);
        console.log(`     Departure window: ${new Date(dest.departureWindow.earliest).toLocaleString()} - ${new Date(dest.departureWindow.latest).toLocaleString()}`);
      }
    });
  }

  static fromDocument(doc, travelTimeService) {
    return new StudentModel(
      doc._id.toString(),
      doc.name,
      doc.email,
      doc.phoneNumber,
      doc.uid,
      doc.password,
      doc.destinations || [],
      travelTimeService
    );
  }
  
}

export { StudentModel };