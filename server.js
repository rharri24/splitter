import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import hbs from 'hbs';
hbs.registerHelper('json', function (context) {
  return JSON.stringify(context);
});

hbs.registerHelper('ifCond', function (v1, operator, v2, options) {
  switch (operator) {
    case '===':
      return v1 === v2 ? options.fn(this) : options.inverse(this);
    default:
      return options.inverse(this);
  }
});

//pw encription stuff
import cors from 'cors';
import bcrypt from 'bcrypt';

import { StudentService } from './StudentService.js';
import { studentDatabase } from './StudentDatabase.js';
import TravelTimeService from './TravelTimeService.js';
import { studentModel } from './StudentSchema.js';





const app = express();
const PORT = 3000;
// const router = express.Router();
// app.use(router);

// These two lines recreate __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



app.set('view engine', 'hbs'); // or 'handlebars' depending on your setup
app.set('views', path.join(__dirname, 'views')); // adjust to match your folder


//mongo db and services
studentDatabase.connect();
const travelTimeService = new TravelTimeService();
const studentService = new StudentService(travelTimeService);


//middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));



app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/index.html'));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/register.html'));
});

// app.use(express.static(path.join(__dirname, 'frontend')));






//register sutdent endpoint
app.post("/api/register-student", async (req, res) => {
  const { name, email, phoneNumber, uid, password, confirmPassword } = req.body;

  if (!name || !email || !phoneNumber || !uid || !password || !confirmPassword) {
    return res.status(400).send("<p> All fields are required.</p>");
  }

  if (password !== confirmPassword) {
    return res.status(400).send("<p> Passwords do not match.</p>");
  }

  if (password.length < 6) {
    return res.status(400).send("<p> Password must be at least 6 characters.</p>");
  }

  try {
    const existingStudent = await studentService.findStudentByEmail(email);
    if (existingStudent) {
      return res.status(409).send("<p> Student already exists.</p>");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const student = await studentService.addNewStudent(name, email, phoneNumber, uid, hashedPassword);

    if (!student) {
      return res.status(500).send("<p>Error saving student.</p>");
    }

    console.log("Student added successfully");
    // return res.send(`
    //   <h2>Registration successful!</h2>
    //   <p>Welcome, ${name}! Your email is ${email}.</p>
    //   <a href="/mainPage.html">continue</a>
    // `);
    return res.send(`
      <script>
        window.location.href = '/mainPage?email=${encodeURIComponent(email)}&uid=${encodeURIComponent(uid)}';
      </script>
    `);


  } catch (err) {
    console.error("Registration error:", err);
    // Only send a response if we haven't already
    if (!res.headersSent) {
      return res.status(500).send("<p> Server error. Please try again later.</p>");
    }
  }
});


//login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/login.html'));
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const student = await studentService.findStudentByEmail(email);
    if (!student) {
      console.warn(`❌ Login failed — no student found for ${email}`);
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, student.password);
    if (!passwordMatch) {
      console.warn(`❌ Login failed — wrong password for ${email}`);
      return res.status(401).json({ error: "Invalid email or password" });
    }

    console.log(`✅ Login successful for ${email}`);
    //console.log("Redirecting to mainPage with:", result.student);


    const { password: _, ...studentWithoutPassword } = student;

    res.status(200).json({
      message: "Login successful",
      student: studentWithoutPassword
    });

  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
});







app.get('/mainPage', async (req, res) => {
  try {
    const { email, uid } = req.query;

    if (!email || !uid) {
      return res.redirect('/login?error=Missing+credentials');
    }

    // Clean up expired destinations on page load
    await studentService.cleanupExpiredDestinations();

    const student = await studentService.findStudentByEmail(email);

    if (!student) {
      return res.redirect('/login?error=Student+not+found');
    }

    const now = new Date();

    // Filter out past destinations from current student
    student.destinations = (student.destinations || []).filter(d => new Date(d.arrivalTime) > now);

    //// Get all other students' destinations
    const otherStudents = await studentModel.find({ email: { $ne: email } });

    // Flatten all their destinations FOR SCROLLABLE LIST, filtering out past ones
    const otherDestinations = otherStudents.flatMap(s => {
      return (s.destinations || [])
        .filter(d => new Date(d.arrivalTime) > now) // Only show future destinations
        .map(d => ({
          name: s.name,
          location: d.location,
          arrivalTime: d.arrivalTime
        }));
    });

    // Calculate hotspots - group by location and count
    const hotspotMap = {};

    otherStudents.forEach(s => {
      (s.destinations || [])
        .filter(d => new Date(d.arrivalTime) > now)
        .forEach(d => {
          if (!hotspotMap[d.location]) {
            hotspotMap[d.location] = {
              location: d.location,
              count: 0,
              students: []
            };
          }
          hotspotMap[d.location].count++;
          hotspotMap[d.location].students.push({
            name: s.name,
            arrivalTime: d.arrivalTime
          });
        });
    });

    // Convert to array and sort by count (descending)
    const hotspots = Object.values(hotspotMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 hotspots

    // Geocode hotspots for map display
    const hotspotPins = [];
    for (const hotspot of hotspots) {
      try {
        const geocoded = await travelTimeService.geocodeAddress(hotspot.location);
        if (geocoded) {
          const [lat, lng] = geocoded.split(',').map(Number);
          hotspotPins.push({
            location: hotspot.location,
            count: hotspot.count,
            lat,
            lng,
            students: hotspot.students.map(s => s.name).join(', ')
          });
        }
      } catch (error) {
        console.log(`Failed to geocode hotspot: ${hotspot.location}`);
      }
    }

    const studentData = {
      name: student.name,
      email: student.email,
      uid: student.uid,
      destinations: student.destinations || [],
      noDestinations: !student.destinations || student.destinations.length === 0,
      otherDestinations, //send to template for scrollable list
      hotspots, // Popular destinations sorted by count
      hotspotPins, // Geocoded hotspots for map
      suggestions: [
        { location: "BWI Airport" },
        { location: "Union Station" },
        { location: "Pentagon City Mall" },
        { location: "Tyson's Corner" },
        { location: "Georgetown" }
      ],
      randomDestinations: [
        "National Mall",
        "Smithsonian Museum",
        "National Harbor",
        "Adams Morgan",
        "Capitol Hill"
      ]
    };

    // 👇 Render the Handlebars template with data
    res.render('mainPage', studentData);
  } catch (error) {
    console.error("Error loading main page:", error);
    res.status(500).send("Server error. Please try again later.");
  }
});


app.post("/api/find-matches", async (req, res) => {
  try {
    const { email } = req.body;

    const student = await studentService.findStudentByEmail(email);
    if (!student) {
      return res.status(404).send("<p>Student not found</p>");
    }

    // Get the student's most recent destination
    const lastDestination = student.destinations[student.destinations.length - 1];
    if (!lastDestination) {
      return res.send("<p>No destination found for this student.</p>");
    }

    const matches = await studentService.findMatchingStudents(
      lastDestination.location,
      lastDestination.arrivalTime
    );

    if (matches.length === 0) {
      return res.send("<p>No matching students found.</p>");
    }

    const html = matches.map(match => `
      <div style="margin-bottom: 10px; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
        <strong>${match.student.name}</strong> (UID: ${match.student.uid})<br>
        <span>Destination: ${match.destination.location}</span><br>
        <small>Arrival: ${new Date(match.destination.arrivalTime).toLocaleString()}</small>
      </div>
    `).join("");

    res.send(`
      <div>
        <h3> Matching Students for ${lastDestination.location}</h3>
        ${html}
      </div>
    `);
  } catch (error) {
    console.error(" Error finding matches:", error);
    res.status(500).send("<p>Server error finding matches.</p>");
  }
});


// // went of srudents latest destination below is better(CAN DELETE)
// app.get('/matchResults', async (req, res) => {
//   try {
//     const { email } = req.query;
//     if (!email) {
//       return res.redirect('/login?error=Missing+credentials');
//     }

//     const student = await studentService.findStudentByEmail(email);
//     if (!student) {
//       return res.redirect('/login?error=Student+not+found');
//     }

//     // Use the student's latest destination to find matches
//     const lastDestination = student.destinations[student.destinations.length - 1];
//     if (!lastDestination) {
//       return res.send("<p>You have no destination. Please add one first.</p>");
//     }

//     // Find matching students
//     const matches = await studentService.findMatchingStudents(lastDestination.location, lastDestination.arrivalTime);

//     if (matches.length === 0) {
//       return res.send("<p>No matching students found.</p>");
//     }

//     // Render a new view for match results. You can send the matches array
//     // Here we pass along matches and also include the other students' emails
//     res.render('matchResults', {
//       email: student.email,
//       uid: student.id,
//       destination: lastDestination.location,
//       matches: matches.map(match => ({
//         studentName: match.student.name,
//         studentEmail: match.student.email,
//         arrivalTime: match.destination.arrivalTime,
//         // You can add more fields as needed
//       }))
//     });
//   } catch (error) {
//     console.error("Error finding match results:", error);
//     res.status(500).send("Server error finding matches.");
//   }
// });

app.get('/matchResults', async (req, res) => {
  const { email, location, arrivalTime, uid } = req.query;

  if (!email || !location || !arrivalTime) {
    return res.status(400).send("Missing data for matching.");
  }

  const student = await studentService.findStudentByEmail(email);
  if (!student) {
    return res.status(404).send("Student not found.");
  }

  const matches = await studentService.findMatchingStudents(location, arrivalTime);

  console.log('🔍 DEBUG - Raw matches from service:', JSON.stringify(matches, null, 2));

  const mappedMatches = matches.map(match => {
    console.log('🔍 DEBUG - Processing match:', {
      studentName: match.student?.name,
      studentEmail: match.student?.email,
      studentPhone: match.student?.phoneNumber,
      studentUid: match.student?.uid
    });

    return {
      studentName: match.student?.name || 'Unknown',
      studentEmail: match.student?.email || 'No email',
      studentPhone: match.student?.phoneNumber || 'No phone',
      arrivalTime: new Date(match.destination.arrivalTime).toLocaleString(),
      timeDiff: Math.round(Math.abs(new Date(match.destination.arrivalTime) - new Date(arrivalTime)) / 60000)
    };
  });

  console.log('🔍 DEBUG - Mapped matches:', JSON.stringify(mappedMatches, null, 2));

  res.render("matchResults", {
    destination: location,
    email,
    uid,
    arrivalTime: new Date(arrivalTime).toLocaleString(),
    matchCount: matches.length,
    matches: mappedMatches
  });
});




// Add new destination
app.post('/api/add-destination', async (req, res) => {
  try {
    const { email, uid, location, arrivalTime } = req.body;

    console.log("📥 Incoming destination data:", { email, uid, location, arrivalTime });

    if (!email || !location || !arrivalTime) {
      console.warn("⚠️ Missing required fields in request body");
      return res.status(400).send("Missing required fields");
    }

    const student = await studentService.findStudentByEmail(email);
    if (!student) {
      console.warn(`⚠️ No student found with email: ${email}`);
      return res.status(404).send("Student not found");
    }

    console.log("✅ Student found:", student.email);

    const updatedStudent = await studentService.addOrUpdateStudent(
      student.name,
      email,
      student.phoneNumber,
      uid,
      location,
      arrivalTime
    );

    if (!updatedStudent || !updatedStudent.destinations || updatedStudent.destinations.length === 0) {
      console.error("❌ Destination was not saved correctly.");
      return res.status(500).send("Failed to save destination.");
    }
    console.log(`✅ Destination added for ${email}:`, { location, arrivalTime });

    // Get other destinations for the response
    const now = new Date();
    const otherStudents = await studentModel.find({ email: { $ne: email } });
    const otherDestinations = otherStudents.flatMap(s => {
      return (s.destinations || [])
        .filter(d => new Date(d.arrivalTime) > now) // Only show future destinations
        .map(d => ({
          name: s.name,
          location: d.location,
          arrivalTime: d.arrivalTime
        }));
    });

    // Return updated HTML fragment with Find Matches button included
    res.send(`
      <div id="destinations-container">
        <div class="add-destination-container">
          <h3>Add a Destination</h3>
          <form
            hx-post="/api/add-destination"
            hx-trigger="submit"
            hx-target="#destinations-container"
            hx-swap="outerHTML"
          >
            <input type="hidden" name="email" value="${email}" />
            <input type="hidden" name="uid" value="${uid}" />
            <div class="form-group">
              <label for="location">Where are you going?</label>
              <input type="text" id="location" name="location" placeholder="e.g., BWI Airport" required />
            </div>
            <div class="form-group">
              <label for="arrivalTime">When do you need to arrive?</label>
              <input type="datetime-local" id="arrivalTime" name="arrivalTime" required />
            </div>
            <button type="submit" class="btn-primary">Add Destination</button>
          </form>
        </div>
    
        <div class="existing-destinations">
          <h3>Your Destinations</h3>
          <ul class="destination-list">
            ${updatedStudent.destinations.map((d, i) => `
              <li style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <h4>${d.location}</h4>
                  <p>Arrival: ${new Date(d.arrivalTime).toLocaleString()}</p>
                </div>
                <div style="display: flex; gap: 10px;">
                  <!-- Find Matches Button -->
                  <form action="/matchResults" method="GET">
                    <input type="hidden" name="email" value="${email}" />
                    <input type="hidden" name="uid" value="${uid}" />
                    <input type="hidden" name="location" value="${d.location}" />
                    <input type="hidden" name="arrivalTime" value="${d.arrivalTime}" />
                    <button type="submit" class="btn-secondary">Find Matches</button>
                  </form>
                  
                  <!-- Delete Button -->
                  <button 
                    class="btn-delete"
                    hx-delete="/api/delete-destination"
                    hx-vals='{"email": "${email}", "index": ${i}}'
                    hx-target="#destinations-container"
                    hx-swap="outerHTML"
                  >
                    Delete
                  </button>
                </div>
              </li>
            `).join('')}
          </ul>
        </div>
        
        <div class="other-destinations-section">
          <h3>Other Students' Destinations</h3>
          <div style="max-height: 200px; overflow-y: auto; border: 1px solid #ccc; padding: 10px;">
            ${otherDestinations.length > 0 ? `
              <ul style="list-style-type: none; padding: 0;">
                ${otherDestinations.map(dest => `
                  <li style="margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                    <strong>${dest.name}</strong><br />
                    <span>${dest.location}</span><br />
                    <small>Arrival: ${new Date(dest.arrivalTime).toLocaleString()}</small>
                  </li>
                `).join('')}
              </ul>
            ` : `<p>No destinations from other students yet.</p>`}
          </div>
        </div>
      </div>
    `);
    
  } catch (error) {
    console.error("Error adding destination:", error);
    res.status(500).send("Failed to add destination.");
  }
});

// Fix for the delete-destination endpoint
app.delete('/api/delete-destination', async (req, res) => {
  try {
    console.log("🗑️ DELETE request received:", req.body);

    const { email, index } = req.body;
    
    if (!email || index === undefined) {
      console.warn("⚠️ Missing required fields in delete request");
      return res.status(400).send("Missing required fields for deletion");
    }

    const student = await studentService.findStudentByEmail(email);
    if (!student || !student.destinations || student.destinations.length <= index) {
      return res.status(404).send("Destination not found.");
    }

    // Get uid before removing the destination
    const uid = student.uid;

    student.destinations.splice(index, 1);
    await student.save();

    console.log(`✅ Destination at index ${index} deleted for ${email}`);

    // Get other destinations for the response (after delete)
    const now = new Date();
    const otherStudents = await studentModel.find({ email: { $ne: email } });
    const otherDestinations = otherStudents.flatMap(s => {
      return (s.destinations || [])
        .filter(d => new Date(d.arrivalTime) > now) // Only show future destinations
        .map(d => ({
          name: s.name,
          location: d.location,
          arrivalTime: d.arrivalTime
        }));
    });

    res.send(`
      <div id="destinations-container">
        <div class="add-destination-container">
          <h3>Add a Destination</h3>
          <form
            hx-post="/api/add-destination"
            hx-trigger="submit"
            hx-target="#destinations-container"
            hx-swap="outerHTML"
          >
            <input type="hidden" name="email" value="${email}" />
            <input type="hidden" name="uid" value="${uid}" />
            <div class="form-group">
              <label for="location">Where are you going?</label>
              <input type="text" id="location" name="location" placeholder="e.g., BWI Airport" required />
            </div>
            <div class="form-group">
              <label for="arrivalTime">When do you need to arrive?</label>
              <input type="datetime-local" id="arrivalTime" name="arrivalTime" required />
            </div>
            <button type="submit" class="btn-primary">Add Destination</button>
          </form>
        </div>
    
        <div class="existing-destinations">
          <h3>Your Destinations</h3>
          ${student.destinations.length > 0 ? `
            <ul class="destination-list">
              ${student.destinations.map((d, i) => `
                <li style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <h4>${d.location}</h4>
                    <p>Arrival: ${new Date(d.arrivalTime).toLocaleString()}</p>
                  </div>
                  <div style="display: flex; gap: 10px;">
                    <!-- Find Matches Button -->
                    <form action="/matchResults" method="GET">
                      <input type="hidden" name="email" value="${email}" />
                      <input type="hidden" name="uid" value="${uid}" />
                      <input type="hidden" name="location" value="${d.location}" />
                      <input type="hidden" name="arrivalTime" value="${d.arrivalTime}" />
                      <button type="submit" class="btn-secondary">Find Matches</button>
                    </form>
                    
                    <!-- Delete Button -->
                    <button 
                      class="btn-delete"
                      hx-delete="/api/delete-destination"
                      hx-vals='{"email": "${email}", "index": ${i}}'
                      hx-target="#destinations-container"
                      hx-swap="outerHTML"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              `).join('')}
            </ul>
          ` : `<p>No destinations yet.</p>`}
        </div>
        
        <div class="other-destinations-section">
          <h3>Other Students' Destinations</h3>
          <div style="max-height: 200px; overflow-y: auto; border: 1px solid #ccc; padding: 10px;">
            ${otherDestinations.length > 0 ? `
              <ul style="list-style-type: none; padding: 0;">
                ${otherDestinations.map(dest => `
                  <li style="margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                    <strong>${dest.name}</strong><br />
                    <span>${dest.location}</span><br />
                    <small>Arrival: ${new Date(dest.arrivalTime).toLocaleString()}</small>
                  </li>
                `).join('')}
              </ul>
            ` : `<p>No destinations from other students yet.</p>`}
          </div>
        </div>
      </div>
    `);

  } catch (error) {
    console.error("❌ Error deleting destination:", error);
    res.status(500).send("Failed to delete destination.");
  }
});


app.use((req, res, next) => {
  if (req.method === 'DELETE') {
    express.json()(req, res, next);
  } else {
    next();
  }
});







//AUTOMATIC CLEANUP - Run every hour
setInterval(async () => {
  console.log('🧹 Running automatic cleanup of expired destinations...');
  try {
    const removed = await studentService.cleanupExpiredDestinations();
    if (removed > 0) {
      console.log(`🧹 Cleanup complete: Removed ${removed} expired destination(s)`);
    }
  } catch (error) {
    console.error('❌ Error during automatic cleanup:', error);
  }
}, 60 * 60 * 1000); // Run every hour

//START SERVER
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
  console.log(`🧹 Automatic cleanup scheduled to run every hour`);
});
