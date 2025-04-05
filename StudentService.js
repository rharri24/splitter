import { StudentModel } from './StudentModel.js';
import { studentModel } from './StudentSchema.js';
import { studentDatabase } from './StudentDatabase.js';

/**
 * This file handles all logic and database interactions with students
 */
class StudentService {
  constructor(travelTimeService) {
    this.travelTimeService = travelTimeService;
  }

  async connect() {
    await studentDatabase.connect();
  }

  /* ADD NEW STUDENT WILL BE DIFFERENT FROM THE ONE BELOW BECAUSE WIL INITIALLY SET DESTINASTION AND TIME TO NULL AND THEN AFTER DESTINATION PAGE LOADS WE UPDATE*/
//now includes password 
async addNewStudent(name, email, phoneNumber, uid, password) {
    try {
      await this.connect();
      
      // Check if student already exists
      const existingStudent = await studentModel.findOne({ email });
      if (existingStudent) {
        throw new Error('Student with this email already exists');
      }
      
      // Create new student with password
      const newStudent = new studentModel({
        name,
        email,
        phoneNumber,
        uid,
        password,
        destinations: []
      });
      
      await newStudent.save();
      return StudentModel.fromDocument(newStudent, this.travelTimeService);
    } catch (error) {
      console.error('Error adding new student:', error);
      throw error;
    }
  }


//   async addOrUpdateStudent(name, email, phoneNumber, uid, destination, arrivalTime) {
//     try {
//       await this.connect();
  
//       // Check if student exists
//       let studentDoc = await studentModel.findOne({ name, email, phoneNumber, uid });
      
//       if (studentDoc) {
//         // Student exists, add new destination if it doesn't already exist
//         console.log(`Student found: ${name}. Adding new destination: ${destination}`);
        
//         // Check if this exact destination and arrival time already exists
//         const destinationExists = studentDoc.destinations.some(
//           dest => dest.location === destination && 
//                   new Date(dest.arrivalTime).getTime() === new Date(arrivalTime).getTime()
//         );
        
//         if (!destinationExists) {
//           // Create destination object
//           const newDestination = {
//             location: destination,
//             arrivalTime: new Date(arrivalTime)
//           };
          
//           // Add travel time data
//           try {
//             const travelTime = await this.travelTimeService.getTravelTime(destination);
//             if (travelTime) {
//               newDestination.travelTime = travelTime;
              
//               // Calculate departure window
//               const travelMinutes = parseInt(travelTime.match(/\d+/)[0]);
//               const bufferMinutes = 60; // 1-hour window for ride matching

//               newDestination.departureWindow = {
//                 earliest: new Date(new Date(arrivalTime).getTime() - (travelMinutes + bufferMinutes) * 60000),
//                 latest: new Date(new Date(arrivalTime).getTime() - travelMinutes * 60000)
//               };
//             }
//           } catch (error) {
//             console.error(`Error getting travel time for ${destination}:`, error);
//           }
          
//           // Add to student's destinations
//           studentDoc.destinations.push(newDestination);
//           await studentDoc.save();
//           console.log(`Added destination ${destination} for ${name}`);

//         } else { // Destination already exists
//           console.log(`Destination ${destination} with arrival time ${new Date(arrivalTime).toLocaleString()} already exists for ${name}`);
//         }
        
//         return StudentModel.fromDocument(studentDoc, this.travelTimeService);
        
//       } else { // Student does not exist then we create one
//         // Create new student
//         console.log(`Creating new student: ${name}`);
        
//         // Create student model instance
//         const student = new StudentModel(name, email, phoneNumber, uid, this.travelTimeService);
//         await student.addDestination(destination, arrivalTime);
        
//         // Convert to document and save
//         studentDoc = new studentModel(student.toDocument());
//         await studentDoc.save();
//         console.log(`Created new student: ${name} with destination: ${destination}`);
        
//         return student;
//       }
      
//     } catch (error) {
//       console.error('Error adding/updating student:', error);
//       throw error;
//     }
//   }

/**redo without requiring password  */
async addOrUpdateStudent(name, email, phoneNumber, uid, destination = null, arrivalTime = null, password = null) {
    try {
        await this.connect();

        // Check if student exists
        let studentDoc = await studentModel.findOne({ email });

        if (studentDoc) {
            // Student exists, add new destination if needed
            console.log(`Student found: ${email}. Adding new destination: ${destination}`);

            if (destination && arrivalTime) {
                // Check if this exact destination and arrival time already exists
                const destinationExists = studentDoc.destinations.some(
                    dest => dest.location === destination &&
                            new Date(dest.arrivalTime).getTime() === new Date(arrivalTime).getTime()
                );

                if (!destinationExists) {
                    const newDestination = {
                        location: destination,
                        arrivalTime: new Date(arrivalTime)
                    };

                    // Get travel time
                    try {
                        if (this.travelTimeService) {
                            const travelTime = await this.travelTimeService.getTravelTime(destination);
                            if (travelTime) {
                                newDestination.travelTime = travelTime;
                                const travelMinutes = parseInt(travelTime.match(/\d+/)[0]);
                                const bufferMinutes = 60;

                                newDestination.departureWindow = {
                                    earliest: new Date(new Date(arrivalTime).getTime() - (travelMinutes + bufferMinutes) * 60000),
                                    latest: new Date(new Date(arrivalTime).getTime() - travelMinutes * 60000)
                                };
                            }
                        } else {
                            console.warn("⚠ travelTimeService is not available.");
                        }
                    } catch (error) {
                        console.error(`Error getting travel time for ${destination}:`, error);
                    }

                    studentDoc.destinations.push(newDestination);
                    console.log("New destination array:", studentDoc.destinations);

                    await studentDoc.save(); //  Ensure save is executed
                    console.log(`Destination ${destination} added successfully to student ${name}`);
                } else {
                    console.log(`Destination ${destination} already exists for ${name}`);
                }
            }

            return studentDoc;
        } else {
            // Student does not exist, create a new one
            if (!password) {
                throw new Error("❌ Password is required when creating a new student.");
            }

            console.log(`Creating new student: ${name}`);

            const studentData = {
                name,
                email,
                phoneNumber,
                uid,
                password, // Ensure password is saved
                destinations: []
            };

            if (destination && arrivalTime) {
                const newDestination = {
                    location: destination,
                    arrivalTime: new Date(arrivalTime)
                };

                try {
                    if (this.travelTimeService) {
                        const travelTime = await this.travelTimeService.getTravelTime(destination);
                        if (travelTime) {
                            newDestination.travelTime = travelTime;
                            const travelMinutes = parseInt(travelTime.match(/\d+/)[0]);
                            const bufferMinutes = 60;

                            newDestination.departureWindow = {
                                earliest: new Date(new Date(arrivalTime).getTime() - (travelMinutes + bufferMinutes) * 60000),
                                latest: new Date(new Date(arrivalTime).getTime() - travelMinutes * 60000)
                            };
                        }
                    } else {
                        console.warn("⚠ travelTimeService is not available.");
                    }
                } catch (error) {
                    console.error(`Error getting travel time for ${destination}:`, error);
                }

                studentData.destinations.push(newDestination);
            }

            studentDoc = new studentModel(studentData);
            await studentDoc.save();
            console.log(`Created new student: ${name} with destination: ${destination}`);
            return studentDoc;
        }
    } catch (error) {
        console.error("❌ Error adding/updating student:", error);
        throw error;
    }
}

/**
 * Find a student by email
 */
async findStudentByEmail(email) {
    try {
        await this.connect();
        const studentDoc = await studentModel.findOne({ email }).select("+password"); // Ensure password is retrieved
        return studentDoc; // ✅ Do NOT convert to StudentModel.fromDocument
    } catch (error) {
        console.error("❌ Error finding student by email:", error);
        throw error;
    }
}


/**
 * 
 * @param {*} uid 
 * @returns nun
 */
  async findStudentByUID(uid) {
    try {
      await this.connect();
      const studentDoc = await studentModel.findOne({ uid });
      if (studentDoc) {
        return StudentModel.fromDocument(studentDoc, this.travelTimeService);
      }
      return null;
    } catch (error) {
      console.error('Error finding student by UID:', error);
      throw error;
    }
  }

  /**
   * 
   * @param {} name 
   * @param {*} email 
   * @param {*} phoneNumber 
   * @param {*} uid 
   * @returns 
   */

  async findStudent(name, email, phoneNumber, uid) {
    try {
      await this.connect();
      const studentDoc = await studentModel.findOne({ name, email, phoneNumber, uid });
      if (studentDoc) {
        return StudentModel.fromDocument(studentDoc, this.travelTimeService);
      }
      return null;
    } catch (error) {
      console.error('Error finding student:', error);
      throw error;
    }
  }

  async findMatchingStudents(destination, arrivalTime) {
    try {
      await this.connect();
      
      const targetTime = new Date(arrivalTime);
      const oneHourInMs = 60 * 60 * 1000;
      
      console.log(`Searching for students going to ${destination} around ${targetTime.toLocaleString()}`);
      
      // Find all students that have the specified destination
      const studentsWithDestination = await studentModel.find({
        'destinations.location': destination
      });
      
      console.log(`Found ${studentsWithDestination.length} students with destination ${destination}`);
      
      const matches = [];
      
      // Process each student to find matching arrival times
      studentsWithDestination.forEach(studentDoc => {
        const student = StudentModel.fromDocument(studentDoc, this.travelTimeService);
        
        // Check all destinations for this student
        studentDoc.destinations.forEach(dest => {
          if (dest.location === destination) {
            const destArrivalTime = new Date(dest.arrivalTime);
            const timeDifference = Math.abs(destArrivalTime - targetTime);
            
            // Debug logging
            console.log(`Student: ${student.name} (${student.uid}), Arrival: ${destArrivalTime.toLocaleString()}, Difference: ${Math.round(timeDifference/60000)} minutes`);
            
            // Include if within the time window
            if (timeDifference <= oneHourInMs) {
              matches.push({
                student,
                destination: dest
              });
              console.log(`Added ${student.name} (${student.uid}) to matches`);
            } else {
              console.log(` Excluded ${student.name} (${student.uid}) - outside time window`);
            }
          }
        });
      });
      
      console.log(`Total matching students: ${matches.length}`);
      return matches;
    } catch (error) {
      console.error('Error finding matching students:', error);
      throw error;
    }
  }

  async getAllStudents() {
    try {
      await this.connect();
      const studentDocs = await studentModel.find({});
      return studentDocs.map(doc => StudentModel.fromDocument(doc, this.travelTimeService));
    } catch (error) {
      console.error('Error getting all students:', error);
      throw error;
    }
  }

  async displayAllStudents() {
    try {
      const students = await this.getAllStudents();
      console.log(`Total students in database: ${students.length}`);
      students.forEach((student, index) => {
        console.log(`\n--- Student #${index + 1} ---`);
        student.displayUserInfo();
      });
    } catch (error) {
      console.error('Error displaying students:', error);
    }
  }


  //remove student
  async removeStudent(name, uid) {
    try { 
        await this.connect();
        
        const result = await studentModel.deleteOne({ name, uid});

        if (result.deletedCount > 0)  {
            console.log(`Successfully removed student: ${name} (${uid})`);
          } else {
            console.log(`No student found with name: ${name} and UID: ${uid}`);
          }
        } catch (error) {
          console.error("Error removing student:", error);
          throw error;

    }
  }

  //remove all students 
  async removeAllStudents() {
    try {
      await this.connect();
      
      const result = await studentModel.deleteMany({});
      
      console.log(`Removed ${result.deletedCount} students from the database.`);
    } catch (error) {
      console.error("Error removing all students:", error);
      throw error;
    }
  }


  /**
   * group students max of 3 students per  (ride)
   * will find the earliest departure time  from the group window
   * will also determine the groups arrival times and display them
   * console loging everything when i make front end wont need
   */

  async groupRiders(matchingStudents) {
    if (matchingStudents.length === 0) {
      console.log("No matching students found to group.");
      return [];
    }
  
    console.log(`\nGrouping ${matchingStudents.length} students:`);
    matchingStudents.forEach(match => {
      console.log(`- ${match.student.name} (${match.student.uid}): Arrival at ${new Date(match.destination.arrivalTime).toLocaleTimeString()}`);
    });
  
    // Group students by arrival hour to ensure they're compatible time-wise
    const hourGroups = {};
    
    matchingStudents.forEach(match => {
      const arrivalHour = new Date(match.destination.arrivalTime).getHours();
      // Create key based on hour to group nearby arrivals
      const hourKey = arrivalHour;
      
      if (!hourGroups[hourKey]) {
        hourGroups[hourKey] = [];
      }
      hourGroups[hourKey].push(match);
    });
  
    console.log("\nHour groupings:");
    Object.entries(hourGroups).forEach(([hour, students]) => {
      console.log(`Hour ${hour}: ${students.length} students`);
      students.forEach(s => console.log(`  - ${s.student.name} (${s.student.uid})`));
    });
  
    // Create ride-sharing groups from each hour group
    let groups = [];
    
    // Process each hour group
    Object.values(hourGroups).forEach(hourGroup => {
      // Sort by arrival time within the hour group
      hourGroup.sort((a, b) => 
        new Date(a.destination.arrivalTime) - new Date(b.destination.arrivalTime)
      );
      
      // Create groups of up to 3 students
      let currentGroup = [];
      hourGroup.forEach(match => {
        currentGroup.push(match);
        
        if (currentGroup.length === 3) {
          groups.push([...currentGroup]);
          currentGroup = [];
        }
      });
      
      if (currentGroup.length > 0) {
        groups.push([...currentGroup]);
      }
    });
  
    console.log(`\nCreated ${groups.length} ride-sharing groups.`);
  
    groups.forEach((group, index) => {
      let latestDeparture = null;
      let earliestArrival = null;
  
      group.forEach(({ destination }) => {
        if (destination.departureWindow && destination.departureWindow.earliest) {
          const departureTime = new Date(destination.departureWindow.earliest);
          // We want the LATEST departure time (everyone must leave by this time)
          if (!latestDeparture || departureTime > latestDeparture) {
            latestDeparture = departureTime;
          }
        }
  
        const arrivalTime = new Date(destination.arrivalTime);
        // We want the EARLIEST arrival time (need to be there by this time)
        if (!earliestArrival || arrivalTime < earliestArrival) {
          earliestArrival = arrivalTime;
        }
      });
  
      console.log(`\nGroup ${index + 1}:`);
      group.forEach(({ student }) => {
        console.log(`- ${student.name} (UID: ${student.uid})`);
      });
  
      if (latestDeparture && earliestArrival) {
        console.log(`  Optimized Group Departure Time: ${latestDeparture.toLocaleTimeString()}`);
        console.log(`  Expected Arrival Time: ${earliestArrival.toLocaleTimeString()}`);
      } else {
        console.log("  Could not determine group travel times.");
      }
    });
  
    return groups;
  }

  
  async findMatchingStudentsDestination(destination) {
    try {
        await this.connect();

        console.log(`Searching for students going to ${destination}`);

        // Find all students who have the specified destination
        const studentsWithDestination = await studentModel.find({
            'destinations.location': destination
        });

        console.log(`Found ${studentsWithDestination.length} students traveling to ${destination}`);

        const matches = [];

        studentsWithDestination.forEach(studentDoc => {
            const student = StudentModel.fromDocument(studentDoc, this.travelTimeService);

            // Add all destinations of this student that match
            studentDoc.destinations.forEach(dest => {
                if (dest.location === destination) {
                    matches.push({
                        student,
                        destination: dest
                    });
                    console.log(`Added ${student.name} (${student.uid}) to matches`);
                }
            });
        });

        console.log(`Total matching students: ${matches.length}`);
        return matches;
    } catch (error) {
        console.error('Error finding matching students by destination:', error);
        throw error;
    }
}


async groupThem(students) {
    if (students.length === 0) {
        console.log("No students to group.");
        return [];
    }

    console.log(`\nGrouping ${students.length} students optimally (1-hour apart)...`);

    // Sort students by arrival time (earliest to latest)
    students.sort((a, b) => new Date(a.destination.arrivalTime) - new Date(b.destination.arrivalTime));

    const groups = [];
    let currentGroup = [];
    let groupStartTime = new Date(students[0].destination.arrivalTime); // Earliest arrival time

    students.forEach(student => {
        const arrivalTime = new Date(student.destination.arrivalTime);

        // If this student's arrival time is more than 1 hour apart, start a new group
        if (arrivalTime - groupStartTime > 60 * 60 * 1000) {
            groups.push([...currentGroup]);
            currentGroup = [];
            groupStartTime = arrivalTime; // Reset the start time for new group
        }

        currentGroup.push(student);
    });

    // Add the last group if it has students
    if (currentGroup.length > 0) {
        groups.push([...currentGroup]);
    }

    // Display groups
    console.log(`\n Created ${groups.length} ride-sharing groups (1-hour apart):`);

    groups.forEach((group, index) => {
        console.log(`\n Group ${index + 1}:`);
        group.forEach(({ student, destination }) => {
            console.log(`- ${student.name} (UID: ${student.uid}) - Arrival: ${new Date(destination.arrivalTime).toLocaleTimeString()}`);
        });

        // Determine earliest departure and latest arrival time in the group
        const earliestDeparture = new Date(Math.min(...group.map(g => new Date(g.destination.departureWindow.earliest).getTime())));
        const latestArrival = new Date(Math.max(...group.map(g => new Date(g.destination.arrivalTime).getTime())));

        console.log(` Group Departure Time: ${earliestDeparture.toLocaleTimeString()}`);
        console.log(` Expected Arrival Time: ${latestArrival.toLocaleTimeString()}`);
    });

    return groups;
}



}




export { StudentService };