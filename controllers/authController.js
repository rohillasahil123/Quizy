const CompanyUser = require("../Model/CompanyUser");
const { setUser } = require("../services/auth")
const bcrypt = require('bcrypt');

async function handleUserLogin(req, res) {
    const { email, password } = req.body;
    const user = await CompanyUser.findOne({ email });    
    if (!user) return res.status(403).json({ success: false, message: "Invalid email or password" });

    const isPasswordSame = await bcrypt.compare(password, user.password);
    if (!isPasswordSame) return res.status(403).json({ success: false, message: "Invalid email or password" });

    const token = setUser(user);

    // res.cookie("token", token, {
    //     httpOnly: true,
    //     secure: false, 
    //     sameSite: "None", 
    //     maxAge: 24 * 60 * 60 * 1000, 
    // });

    res.status(200).json({ 
        message: "Login successful", 
        success: true,
        token ,
        user: { email: user.email, name: user.name, role: user.role }
    });
}

module.exports = { handleUserLogin };