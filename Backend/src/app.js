const express = require('express')
const db = require('../utils/database')

const app = express()

db().then(() => {
    console.log("Connection Done....")
    app.listen(3000, () => {
        console.log(`App listening on port 300`)
    })
})
.catch((err)=>
    {
        console.log("Error in Connection with Database:",err)
    })