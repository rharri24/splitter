import express from "express";
import cors from "cors";
import { StudentService } from "./StudentService.js";
import { studentDatabase } from "./StudentDatabase.js";
import TravelTimeService from "./TravelTimeService.js"; //would be { TravelTimeService } if it didnt export default
import { studentModel } from "./StudentSchema.js";

import bcrypt from 'bcrypt'

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Services
const travelTimeService = new TravelTimeService();
const studentService = new StudentService(travelTimeService);

// Connect to MongoDB
studentDatabase.connect();

/**
 * Register Student
 */
app.post("/api/register-student", async (req, res) => {
    const { name, email, phoneNumber, uid, password } = req.body;

    // Ensure all required fields are present
    if (!name || !email || !phoneNumber || !uid || !password) {
        return res.status(400).json({ error: "All fields including password are required" });
    }

    console.log("Registration attempt for:", email);
    
    try {
        console.log("Checking if student exists...");
        const existingStudent = await studentService.findStudentByEmail(email);
        if (existingStudent) {
            console.log("Student already exists");
            return res.status(409).json({ error: "Student with this email already exists" });
        }

        console.log("Hashing password...");
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        console.log("Adding new student...");
        const student = await studentService.addNewStudent(name, email, phoneNumber, uid, hashedPassword);
        
        if (!student) {
            return res.status(500).json({ error: "Error creating student" });
        }

        console.log("Student added successfully");
        res.status(201).json({ message: "Student registered successfully" });
    } catch (error) {
        console.error("❌ Registration error:", error);
        res.status(500).json({ error: "Error registering student" });
    }
});

 

/**
 * Login
 */
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    
    try {
      // Find student by email
      const student = await studentService.findStudentByEmail(email);
      
      if (!student) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      
      // Compare password with stored hash
      const passwordMatch = await bcrypt.compare(password, student.password);
      
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      
      // Login successful
      // Don't send the password back in the response
      const { password: _, ...studentWithoutPassword } = student;
      res.status(200).json({ 
        message: "Login successful", 
        uid: student.uid,
        student: studentWithoutPassword 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Error during login" });
    }
  });

/**
 * Register or Update Student
 */
app.post("/api/update-student", async (req, res) => {
  const { name, email, phoneNumber, uid } = req.body;
  
  try {
    const student = await studentService.addOrUpdateStudent(name, email, phoneNumber, uid);
    res.status(201).json({ message: "Student registered successfully", student });
  } catch (error) {
    res.status(500).json({ error: "Error registering student" });
  }
});

/**
 * Add Destination for a Student
 */
app.post("/api/add-destination", async (req, res) => {
  const { uid, location, arrivalTime } = req.body;
  
  try {
    // Ensure destination data is provided
    if (!uid || !location || !arrivalTime) {
      return res.status(400).json({ error: "Missing required destination fields." });
    }
    
    // Update existing student by adding the destination
    const student = await studentService.addOrUpdateStudent(name, email, phoneNumber, uid, location, arrivalTime);
    res.status(200).json({ message: "Destination added successfully", student });
  } catch (error) {
    res.status(500).json({ error: "Error adding destination" });
  }
});
  
/**
 * Get student
 */
app.get("/api/get-student", async (req, res) => {
    const { email } = req.query; // Only get the uid parameter
    
    try {
      const student = await studentService.findStudentByEmail(email);
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }
      res.json(student);
    } catch (error) {
      res.status(500).json({ error: "Error fetching student" });
    }
  });

/**
 * ADD or update student
 */
// app.post("/api/add-or-update-student", async (req, res) => {
//   const { name, email, phoneNumber, uid, destination, arrivalTime } = req.body;
  
//   try {
//     const student = await studentService.addOrUpdateStudent(name, email, phoneNumber, uid, destination, arrivalTime);
//     res.status(200).json({ message: "Student updated successfully", student });
//   } catch (error) {
//     res.status(500).json({ error: "Error updating student" });
//   }
// });

/**redo withoiut password */
// app.post("/api/add-or-update-student", async (req, res) => {
//     const { name, email, phoneNumber, uid, destination, arrivalTime } = req.body;
//     console.log(email);
//     try {
//         const student = await studentService.addOrUpdateStudent(name, email, phoneNumber, uid, destination, arrivalTime, null);

//         if (!student) {
//             return res.status(404).json({ error: "❌ Student not found or update failed." });
//         }

//         // Verify data saved in the DB
//         const updatedStudent = await studentModel.findOne({ email });
//         console.log("📌 Updated student from DB:", updatedStudent);

//         if (updatedStudent.destinations.length === 0) {
//             return res.status(500).json({ error: "⚠ Destination was not saved properly. Please try again." });
//         }

//         res.status(200).json({ message: "✅ Student updated successfully", student: updatedStudent });
//     } catch (error) {
//         console.error("❌ Error updating student:", error);
//         res.status(500).json({ error: "⚠ Error updating student. Check console for details." });
//     }
// });

app.post("/api/add-or-update-student", async (req, res) => {
    const { name, email, phoneNumber, uid, destination, arrivalTime } = req.body;

    console.log("📌 API Received Email:", email); // ✅ Ensure email is received correctly

    try {
        // 🔹 Add or update student using email
        const student = await studentService.addOrUpdateStudent(name, email, phoneNumber, uid, destination, arrivalTime);

        if (!student) {
            return res.status(404).json({ error: "❌ Student not found or update failed." });
        }

        // 🔹 Fetch the updated student using email instead of uid
        const updatedStudent = await studentModel.findOne({ email });

        console.log("📌 Updated student from DB:", updatedStudent);

        // 🔹 Check if destinations array exists before accessing it
        if (!updatedStudent || !updatedStudent.destinations || updatedStudent.destinations.length === 0) {
            return res.status(500).json({ error: "⚠ Destination was not saved properly. Please try again." });
        }

        res.status(200).json({ message: "✅ Student updated successfully", student: updatedStudent });
    } catch (error) {
        console.error("❌ Error updating student:", error);
        res.status(500).json({ error: "⚠ Error updating student. Check console for details." });
    }
});

  
/**
 * Start Express Server
 */
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));