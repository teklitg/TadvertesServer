const mongoose = require("mongoose")
const app = require("./app")
const {URL, PORT}= require("./utility/utility")

mongoose.connect(URL)
.then(()=> console.log("connected"))
.then(()=> console.log("connected with databas"))

app.listen(PORT,
  ()=>console.log(`server runing on port ${PORT}`))