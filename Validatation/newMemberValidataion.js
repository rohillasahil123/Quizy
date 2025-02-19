const Joi = require("joi");
const CompanyUser = require("../Model/CompanyUser");

async function checkIsPhoneNumberUnique(phone) {
    const existingUser = await CompanyUser.findOne({ phone });
    return !existingUser;
}

async function checkIsEmailUnique(email) {
    const existingUser = await CompanyUser.findOne({ email });
    return !existingUser; 
}

const roleHierarchy = {
    "Admin": ["State Franchise", "District Franchise", "City Franchise", "Marketing Manager"],
    "State Franchise": ["District Franchise", "City Franchise", "Marketing Manager"],
    "District Franchise": ["City Franchise", "Marketing Manager"],
    "City Franchise": ["Marketing Manager"],
    "Marketing Manager":[]
};

const newMemberValidation = async (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().min(3).required(),
        phone: Joi.number().min(1000000000).max(9999999999).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(100).required(),
        dob: Joi.date().required(),
        gender: Joi.string().valid('Male', 'Female', 'Other').required(),
        city: Joi.string().required(),
        district: Joi.string().required(),
        state: Joi.string().required(),
        role: Joi.string().valid(...Object.keys(roleHierarchy)).required(),
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: "Bad request", error });

    try {
        const isPhoneUnique = await checkIsPhoneNumberUnique(req.body.phone);
        if (!isPhoneUnique) return res.status(400).json({ message: 'Phone number is already used' });
        const isEmailUnique = await checkIsEmailUnique(req.body.email);
        if (!isEmailUnique) return res.status(400).json({ message: 'Email is already used' });
        
        const currentUserRole = req.user.role;
        const newUserRole = req.body.role;
        if (!roleHierarchy[currentUserRole]?.includes(newUserRole)) {
            return res.status(403).json({ message: "You are not authorized to assign this role." });
        }
        next();
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

module.exports = {
    newMemberValidation,
};
