require("dotenv").config()

const PORT = process.env.PORT
const URL = process.env.URL
const SECRET_KEY = process.env.SECRET_KEY

module.exports = {PORT, URL, SECRET_KEY}