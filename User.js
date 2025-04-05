
/* 
    destination is where the user wants to go
    time is the time they want to arrive there 
        -its ok to reach within 1 hour early
        - after the user enters the time they want to reach 
            we will have to find out how long it will take for them to reach that destination and subtrach it from the time and also give a 
            1HR  window so it will be easier to find matchs with people
        -ex. User1 wans to go to BWI(destinaiton) at 6AM(time) 1hr(travelTime) calculated  
*/
class User {
    constructor(name, email, phoneNumber, destination, arrivalTime, travelTimeService) {
        this.name = name;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.destination = destination;

        this.arrivalTime = new Date(arrivalTime);
        this.travelTime = null; //stores how long it takes to travel from A -> B
        this.departureTime = null;

        /* this is different from travel time */
        this.travelTimeService = travelTimeService; //fetches travel time, its an instance of TravelTime Service


    }


    async fetchTravelTime() {
        this.travelTime = await this.travelTimeService.getTravelTime(this.destination);
        if (this.travelTime) {
            this.calculateDepartureTime();
        }
        
    }


    calculateDepartureTime() {
        if (!this.travelTime) {
            console.error("Travel time not available yet.");
            return;
        }

        const travelMinutes = parseInt(this.travelTime.match(/\d+/)[0]); // Convert "45 mins" → 45
        const bufferMinutes = 60; // 1-hour window for ride matching

        const earliestDeparture = new Date(this.arrivalTime.getTime() - (travelMinutes + bufferMinutes) * 60000);
        const latestDeparture = new Date(this.arrivalTime.getTime() - travelMinutes * 60000);

        console.log(`Recommended departure window: ${earliestDeparture.toLocaleTimeString()} - ${latestDeparture.toLocaleTimeString()}`);
    }





    /*Not implemented yet*/    
    emailIsValid() {
        return false;
    }

    /*display user info????*/
    displayUserInfo() {
        console.log(`Name: ${this.name}`);
        console.log(`Email: ${this.email}`);
        console.log(`Phone: ${this.phoneNumber}`);
        console.log(`Destination: ${this.destination}`);
        console.log(`Travel time:  ${this.travelTime}`)
        console.log(`Arrival Time: ${this.arrivalTime.toLocaleTimeString()}`);
    }


    // Convert from StudentModel to MongoDB document
  toDocument() {
    return {
      name: this.name,
      email: this.email,
      phoneNumber: this.phoneNumber,
      uid: this.uid,
      destinations: this.destinations
    };
  }

  // Create StudentModel from MongoDB document
  static fromDocument(doc, travelTimeService) {
    const student = new StudentModel(
      doc.name,
      doc.email,
      doc.phoneNumber,
      doc.uid,
      travelTimeService
    );
    
    student.destinations = doc.destinations || [];
    return student;
  }



}


class Student extends User {
    constructor(name, email, phoneNumber, destination, arrivalTime, uid) {
        super(name, email, phoneNumber, destination, arrivalTime);
        this.uid = uid;
    }

    displayUserInfo() {
        super.displayUserInfo();
        console.log(`User Type: Student (UID: ${this.uid})`);
    }
}





export default User;