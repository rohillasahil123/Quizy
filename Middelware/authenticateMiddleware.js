const { getUser } = require("../services/auth");

const ensureAuthenticated = (req, res, next) => {
    // const token = req.cookies?.userToken;
    // if (!token) return res.status(403).json({ message: "Unauthorized, JWT token is required" });

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).json({ message: "Unauthorized, JWT token is required" });
    }
    const token = authHeader.split(" ")[1];
    
    try{
        const decoded = getUser(token);
        if (!decoded) return res.status(403).json({ message: "Unauthorized, JWT token is wrong" });
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Unauthorized, JWT token is wrong or expired" });
    }
}

module.exports = {
    ensureAuthenticated,
}