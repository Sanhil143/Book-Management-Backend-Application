const express = require('express')
const mongoose = require('mongoose')
const multer = require('multer')
const dotenv = require('dotenv')
const router = require("./routers/router")


mongoose.set('strictQuery', true)
const app = express()
app.use(express.json())
app.use(multer().any())

dotenv.config()

mongoose.connect(process.env.MY_DB_URL)
.then(() => console.log("My mongoDB is connected"))
.catch((err) => console.error(err))


app.use("/", router)


app.listen(process.env.PORT || 5000, () => {
      console.log("Express app running on port " + process.env.PORT || 5000);
})

//create review = delete something
// update review handle edge cases
