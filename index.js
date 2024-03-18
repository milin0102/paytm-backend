const express = require("express");
const app = express()
const rootRouter = require("./routes/index")
const port = process.env.port || 3000
const cookieParser = require("cookie-parser");
const cors = require('cors')

import('./db.js')
app.use(cors());
app.use(express.json())
app.use("/api/v1",rootRouter);
app.use(cookieParser())

app.listen(port,function (err) {
    if (err) console.log(err);
    console.log("Server listening on PORT", port);
})


