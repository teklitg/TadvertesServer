const bcrypt = require("bcrypt")

bcrypt.hash("mariam", 10)
.then((r)=>{
    console.log(r)
    bcrypt.compare("mariam", r)
    .then((t)=> console.log(t))
})

