const bcrypt = require("bcrypt")
const jwt= require("jsonwebtoken")

const info = {
    name: "Teklit",
    email: "teklit@gmail.com"
}

const token = jwt.sign(info, "@#")

console.log(token)

const verify = jwt.verify(token, "@#")

console.log(verify)