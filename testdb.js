import { StudentService } from "./StudentService.js";
import { studentDatabase } from "./StudentDatabase.js";
import TravelTimeService from "./TravelTimeService.js";
import "dotenv/config";

async function main() {
    const travelService = new TravelTimeService();
    const studentService = new StudentService(travelService);

    await studentService.addOrUpdateStudent("Ayo2", 
        "john@university.edu", 
        "555-123-4567", 
        "S12345", 
        "BWI", 
        "2025-03-17T06:00:00", "12345678");
    await studentService.addOrUpdateStudent("Ayo", 
        "jane@university.edu", 
        "555-987-6543", "S67890", 
        "BWI", 
        "2025-03-17T06:30:00", "12345678");
    await studentService.addOrUpdateStudent("Ayo3", 
        "killa@182.edu", 
        "555-123-4567", 
        "killa99", 
        "BWI", 
        "2025-03-17T06:19:00", "12345678");

    
        //Rick wana go to bwi at 7:00 AM
    await studentService.addOrUpdateStudent("Ayo4", 
        "rick@umd.edu", 
        "123-456-8978", "ID1", 
        "BWI", 
        "2025-03-17T07:00:00", "12345678")

        //Rick wana go to party in DC at 10PM
    await studentService.addOrUpdateStudent("Ayo6", 
        "rick@umd.edu", 
        "123-456-8978", "ID1", 
        "1223 Connecticut Ave NW, Washington DC, Maryland, 20036", 
        "2025-03-17T22:00:00", "12345678")

        //Rick wana go to DCA(ronald regan airport) next week
    await studentService.addOrUpdateStudent("Ayo7", 
        "rick@umd.edu", 
        "123-456-8978", "ID1", 
        "DCA", 
        "2025-03-22T06:30:00", "12345678");

        //rick go to bwi at 5 should pair with at least jane going at 6
    await studentService.addOrUpdateStudent("8 Ayo", 
        "rick@umd.edu", 
        "123-456-8978", "ID2", 
        "BWI", 
        "2025-03-17T05:00:00", "12345678");

    console.log("\nDisplaying all students:");
    await studentService.displayAllStudents();


    console.log("```````````````````````````````````````````")

    // now that weve added 4 studends 2 ricks are diffferent because they have same UID
    //time to test findMatchingStudents(destination, arrivalTime)

    console.log("\n--- Potential Ride Matches for BWI at 6:30 AM (Plus or Minus 1HR)---");
    const matches = await studentService.findMatchingStudents("BWI", "2025-03-17T06:30:00");
    
    console.log("MATCHESSSSSSSSSSSS");
    console.log(matches);
    
    console.log("MATCHES LENGTH");
    console.log(matches.length);

    //console.log(matches); /****works great */
    if (matches.length === 0) {
        console.log("No matching students found.");
      } else {
        matches.forEach(match => {
          console.log(`Match found: ${match.student.name} (${match.student.uid})`);
          console.log(`  Arrival time: ${new Date(match.destination.arrivalTime).toLocaleTimeString()}`);
          
          if (match.destination.departureWindow && match.destination.departureWindow.earliest) {
            console.log(`  Departure window: ${new Date(match.destination.departureWindow.earliest).toLocaleTimeString()} - ${new Date(match.destination.departureWindow.latest).toLocaleTimeString()}`);
          }
        });
      }

  //test groups
      console.log("~~~~~~~~~~~~~~~~~~NOW TESTING FROUPS~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
      
if (matches.length > 0) {
  const groups = await studentService.groupRiders(matches);
  //console.log(groups);
} else {
  console.log("No matching students found for grouping.");
}




console.log("RETRYING FINDING STUDENTS DESTINATION...");
const destinationMatches = await studentService.findMatchingStudentsDestination("BWI");

console.log("\n--- Students Traveling to BWI ---");
console.log(destinationMatches);

console.log("Total Matches:", destinationMatches.length);

console.log("~~~~~~~~~~~~~~~~~~RETEST NOW TESTING FROUPS~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
      
if (matches.length > 0) {
  const destinationMatches = await studentService.groupRiders(matches);
  console.log(destinationMatches);
} else {
  console.log("No matching students found for grouping.");
}

const destinationMatches2 = await studentService.findMatchingStudentsDestination("BWI");

if (destinationMatches2.length > 0) {
    const deez = await studentService.groupThem(destinationMatches2);
    console.log(deez)
} else {
    console.log("No matching students found for grouping.");
}


    //Needs to await here or else it disconneccts too fast
    await studentService.removeStudent("Rick ", "differentID119"); //rick w/ ' ' "Rick " not "Rick" lol

    
    await studentService.removeAllStudents();

    await studentDatabase.disconnect();
}

main();
