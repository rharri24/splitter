import User from "./User.js";
//import Student from "./Student.js";
import TravelTimeService from "./TravelTimeService.js";
import "dotenv/config";

//MAIN PURPOSE WAS TO TEST CREATING AND SEE IF I CAN GET LOCATION AND TIME TRAVEL WORKDS
// Initialize the travel service 
const travelService = new TravelTimeService();

async function main() {
    const user = new User("Rick", "me@gmail.com", "123-456-7890", "germantown, MD", "2025-03-16T05:30:00", travelService);
    
    await user.fetchTravelTime();  // Get travel time dynamically
    user.calculateDepartureTime(); // Calculate departure window
    user.displayUserInfo(); // Show user details

    try {
        const db = new StudentDatabase();
        
        // Add a student with a destination
        await db.addOrUpdateStudent(
          'Ayo',
          'john@university.edu',
          '555-123-4567',
          'S12345',
          'BWI',
          '2025-03-30T06:00:00'
        );
        
        // Add another destination for the same student
        await db.addOrUpdateStudent(
          'John Doe',
          'john@university.edu',
          '555-123-4567',
          'S12345',
          'Union Station',
          '2025-03-18T14:00:00'
        );
        
        // Add a different student
        await db.addOrUpdateStudent(
          'Jane Smith',
          'jane@university.edu',
          '555-987-6543',
          'S67890',
          'BWI',
          '2025-03-17T06:30:00'  // Within 1 hour of John's arrival
        );
        
        // Display all students
        await db.displayAllStudents();
        
        // Find matching students for ride sharing
        console.log("\n--- Potential Ride Matches for BWI at 6:00 AM ---");
        const matches = await db.findMatchingStudents('BWI', '2025-03-17T06:00:00');
        matches.forEach(match => {
          console.log(`Match found: ${match.student.name} (${match.student.uid})`);
          console.log(`  Arrival time: ${match.destination.arrivalTime.toLocaleTimeString()}`);
          if (match.destination.departureWindow && match.destination.departureWindow.earliest) {
            console.log(`  Departure window: ${match.destination.departureWindow.earliest.toLocaleTimeString()} - ${match.destination.departureWindow.latest.toLocaleTimeString()}`);
          }
        });

        
        // Disconnect from MongoDB
        await db.disconnect();
        
      } catch (error) {
        console.error('Main function error:', error);
      }


      

}

main();
