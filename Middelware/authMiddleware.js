const { getUser } = require("../services/auth");

const ensureAutheticated = (req, res, next) => {
    const auth = req.cookies?.userToken;
    if (!auth) return res.status(403).json({ message: "Unauthorized, JWT token is required" });
    
    try{
        const decoded = getUser(auth);
        if (!decoded) return res.status(403).json({ message: "Unauthorized, JWT token is wrong" });
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Unauthorized, JWT token is wrong or expired" });
    }

    // For cookies authentication

    // const tokenCookie = req.cookies?.token;
    // if(!tokenCookie) return res.redirect("/login");
    // const user = getUser(userUid);
    // if(!user) return res.redirect("/login");
    // req.user = user;
    // next();
}

module.exports = {
    ensureAutheticated,
}
