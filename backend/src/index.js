import "./config.js"
import { app } from "./app.js"
import connectDB from "./db/db.js"

const PORT = process.env.PORT || 8000;

connectDB()
.then(()=> {
    app.listen(PORT, () => {
        console.log(`server is running on ${process.env.PORT}`)
    })
})
.catch((error) => {
    console.error(`PostgreSQL connection fail !!!`, error)
    process.exit(1)
})