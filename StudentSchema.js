import mongoose from 'mongoose'


//THIS FILE CONTAINS THE SCHEMAS AND MONGOOSE MODEL

const destinationSchema = new mongoose.Schema({
    location: { type: String, required: true },
    arrivalTime: { type: Date, required: true },
    travelTime: { type: String },
    departureWindow: {
      earliest: { type: Date },
      latest: { type: Date }
    }
  });


  const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    uid: { type: String, required: true },
    password: { type: String, required: function() { return this.isNew; } }, // Only required when creating a new user
    destinations: [destinationSchema]
});

  studentSchema.index({ name: 1, email: 1, phoneNumber: 1, uid: 1 }, { unique: true });

    /*
    Syntax: mongoose.model(<Collectionname>, <CollectionSchema>)
    */
  const studentModel = mongoose.model('Students', studentSchema);

  export { studentModel };