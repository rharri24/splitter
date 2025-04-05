import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const Destination = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [location, setLocation] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [uid, setUid] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    let emailParam = searchParams.get("email") || localStorage.getItem("currentUserEmail");
    let uidParam = searchParams.get("uid") || localStorage.getItem("currentUserUID");
  
    if (emailParam) {
      setEmail(emailParam);
      fetchStudentDetails(emailParam);
    } else {
      alert("Missing student ID. Redirecting to login.");
      navigate("/login");
    }
  }, [searchParams]);

  const fetchStudentDetails = async (emailParam) => {
    try {
      console.log("📌 Fetching details for email:", emailParam);

      const response = await fetch(`http://localhost:5000/api/get-student?email=${encodeURIComponent(emailParam)}uid=${encodeURIComponent(uidParam)}`);

      if (response.ok) {
        const student = await response.json();
        console.log("✅ Student data fetched:", student);
        setName(student.name);
        setEmail(student.email);
        setPhoneNumber(student.phoneNumber);
        setUid(student.id);
      } else {
        alert("⚠ Error fetching student details.");
      }
    } catch (error) {
      console.error("❌ Error fetching student:", error);
    }
  };

  const handleAddDestination = async (e) => {
    e.preventDefault();

    if (!location || !arrivalTime) {
      alert("Please enter both a location and arrival time.");
      return;
    }

    console.log("Email Before Sending Request:", email);

    const studentData = { name, email, phoneNumber, uid, destination: location, arrivalTime };

    try {
      const response = await fetch("http://localhost:5000/api/add-or-update-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData),
      });
      console.log(studentData);

      if (response.ok) {
        alert("✅ Destination added successfully!");
        navigate("/");
      } else {
        const errorMessage = await response.text();
        alert(`❌ Error adding destination: ${errorMessage}`);
      }
    } catch (error) {
      console.error("❌ Error:", error);
      alert("⚠ Failed to add destination. Check console for details.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Add Destination</h2>
      <p>For: {email} {uid}</p> 
      <form onSubmit={handleAddDestination}>
        <input
          type="text"
          placeholder="Destination (e.g., BWI)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
        <input
          type="datetime-local"
          value={arrivalTime}
          onChange={(e) => setArrivalTime(e.target.value)}
          required
        />
        <button type="submit">Add Destination</button>
      </form>

      <h2>List of current destinations</h2>
      <ul>
        <li>BWI(ex)</li>
        <li>MJB(ex)</li>
      </ul>
      <button>Map(will link to api that shows realtime curr locations)</button>
    </div>

    

 


  );
};

export default Destination;