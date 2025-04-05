import { StudentService } from "./StudentService.js";
import { studentDatabase } from "./StudentDatabase.js";
import TravelTimeService from "./TravelTimeService.js";

import "dotenv/config";async function main(){

    const travelService = new TravelTimeService();
    const studentService = new StudentService(travelService);
    await studentService.removeAllStudents();

    await studentDatabase.disconnect();
}

main()