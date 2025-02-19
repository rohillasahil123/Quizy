const { default: axios } = require("axios");
const CompanyUser = require("../Model/CompanyUser");
const School = require("../Model/School");
const Teacher = require("../Model/Teacher");
const { setUser } = require("../services/auth")
const bcrypt = require('bcrypt');
const crypto = require("crypto");
const otpGenerator = require("otp-generator");

const fast2smsAPIKey = "kuM9ZYAPpRt0hFqVW71UbOxygli64dDrQzew3JLojN5HTfaIvskCR4bYSDAznIa6VxGmuq0ytT72LZ5f";

async function handleUserLogin(req, res) {
    const { email, password } = req.body;

    let user;
    let userDetails = {};

    user = await CompanyUser.findOne({ email });
    if (user) {
        userDetails = { name: user.name, role: user.role };
    } else {
        user = await School.findOne({ email });
        if (user) {
            userDetails = { name: user.schoolName, role: "School" };
        } else {
            user = await Teacher.findOne({ email });
            if (user) userDetails = { name: user.name, role: "Teacher" };
        }
    }
    
    if (!user) return res.status(403).json({ success: false, message: "Invalid email or password" });

    const isPasswordSame = await bcrypt.compare(password, user.password);
    if (!isPasswordSame) return res.status(403).json({ success: false, message: "Invalid email or password" });

    const token = setUser({ id: user._id, email: user.email, ...userDetails});

    // res.cookie("token", token, {
    //     httpOnly: true,
    //     secure: false, 
    //     sameSite: "None", 
    //     maxAge: 24 * 60 * 60 * 1000, 
    // });

    res.status(200).json({
        message: "Login successful",
        success: true,
        token,
        user: { id: user._id, email: user.email, ...userDetails }
    });
}

async function handleSendOtp (req, res) {
    const { phone } = req.body;
    const phoneRegex = /^\d{10}$/;

    if (!phoneRegex.test(phone)) return res.status(400).json({ success: false, message: "Invalid phone number" });

    const otp = otpGenerator.generate(4, {
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
        upperCase: false,
        digits: true
    });

    const tokenExpiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiration

    try {
        let user = await CompanyUser.findOne({ phone }) || await School.findOne({ phone }) || await Teacher.findOne({ phone });
        if (!user) return res.status(403).json({ success: false, message: "Phone number not found" });

        user.otp = otp;
        user.tokenExpiration = tokenExpiration;
        await user.save();

        await axios.get("https://www.fast2sms.com/dev/bulkV2", {
            params: {
                authorization: fast2smsAPIKey,
                variables_values: otp,
                route: "otp",
                numbers: phone,
            },
        });

        res.json({
            success: true,
            message: "OTP sent successfully",
        });
    } catch (err) {
        console.error("Error generating OTP:", err);
        res.status(500).json({
            success: false,
            message: "Failed to generate OTP. Try again later",
        });
    }
};

async function handleVerifyOtp(req, res) {
    try {
        const { phone, otp } = req.body;
        if (!phone || !otp) return res.status(400).json({ success: false, message: "Phone number and OTP are required" });

        let user = await CompanyUser.findOne({ phone }) || await School.findOne({ phone }) || await Teacher.findOne({ phone });
        if (!user) return res.status(403).json({ success: false, message: "Phone number not found" });

        if (!user.otp || !user.tokenExpiration || user.tokenExpiration < Date.now()) {
            return res.status(400).json({ success: false, message: "OTP expired or invalid" });
        }

        if (user.otp !== otp) return res.status(400).json({ success: false, message: "Incorrect OTP" });

        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetToken = resetToken;
        user.tokenExpiration = Date.now() + 15 * 60 * 1000; 
        // user.otp = null;

        await user.save();

        res.json({ 
            success: true, 
            message: "OTP verified.", 
            resetToken 
        });
    } catch (err) {
        console.error("Error verifying OTP:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

async function handleResetPassword(req, res) {
    try {
        const { resetToken, newPassword } = req.body;
        if (!resetToken || !newPassword) return res.status(400).json({ success: false, message: "Reset token and new password are required" });

        const user = await CompanyUser.findOne({ resetToken }) || await School.findOne({ resetToken }) || await Teacher.findOne({ resetToken });
        if (!user || !user.tokenExpiration || user.tokenExpiration < Date.now()) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
        }

        const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);    

        user.password = hashedPassword; 
        user.resetToken = null;
        user.tokenExpiration = null;

        await user.save();

        res.json({ success: true, message: "Password reset successful. You can now log in." });

    } catch (err) {
        console.error("Error resetting password:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

module.exports = { 
    handleUserLogin,
    handleSendOtp,
    handleVerifyOtp,
    handleResetPassword
};