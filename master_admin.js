/*const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
require('dotenv').config()
const Staff = require('./models/admin') // adjust path

mongoose.connect(process.env.MONGO_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(async () => {
    console.log('Connected to MongoDB Atlas')
    
    // Check if an Owner already exists
    const existingOwner = await Staff.findOne({ role: 'Admin' })
    if (existingOwner) {
        console.log('Owner already exists:', existingOwner.email)
        return mongoose.disconnect()
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('ownerpassword123', 10)

    const owner = new Staff({
      fullname: 'Master Admin',
      email: 'globalkapacitydev@gmail.com',
      password: hashedPassword,
      role: 'Master Admin'
    });

    await owner.save();
    console.log('Master Admin account created!');
    mongoose.disconnect();
  })
  .catch(err => console.log(err));
  */