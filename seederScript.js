const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require('dotenv')
dotenv.config();
const Admin = require("./models/admin");

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const hashedPassword = await bcrypt.hash("Master@123", 10);
    const masterAdmin = new Admin({
      username: "masteradmin",
      email: "globalkapacity@gmail.com",
      password: hashedPassword,
      role: "master admin",
    });

    await masterAdmin.save();
    console.log("Master admin created!");
    process.exit(0);
  })
  .catch(err => console.error(err))