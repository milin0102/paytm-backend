const express = require("express")
const userRoute = require("./user")
const accountRoute = require("./accounts")
const router = express.Router()

router.use(express.json());

router.get('/', (req, res,next) => {
    res.send('Welcome to the homepage');
  });
  
router.use( "/user", userRoute)

router.use("/account" , accountRoute)

module.exports = router




