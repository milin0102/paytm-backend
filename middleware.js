const jwt = require("jsonwebtoken");
const JWT_SECRET = require("./config")

const authenticateToken = function(req, res, next) {
    const  auth = req.headers["authorization"];
    if(!auth || !auth.startsWith('Bearer ')){
        return res.status(403).json("Access Denied")
    }
    const token = auth.split(' ')[1]
    try {
        const decoded = jwt.verify(token,JWT_SECRET);
        req.userID = decoded.userID
        next()
    } catch (error) {
        return res.status(403).json("Access Denied");
    }
}

module.exports = {authenticateToken}