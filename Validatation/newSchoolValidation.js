const Joi = require("joi");
const CompanyUser = require("../Model/CompanyUser");
const School = require("../Model/School");

async function checkIsPhoneNumberUnique(phone) {
    const existingUser = await CompanyUser.findOne({ phone });
    if(existingUser) return false;
    const existingSchool = await School.findOne({ phone });
    if(existingSchool) return false;
    return true;
}

async function checkIsEmailUnique(email) {
    const existingUser = await CompanyUser.findOne({ email });
    if(existingUser) return false; 
    const existingSchool = await School.findOne({ email });
    if(existingSchool) return false; 
    return true;
}

const newSchoolValidation = async (req, res, next) => {
    const schema = Joi.object({
        schoolName: Joi.string().min(3).required(),
        principalName: Joi.string().min(3).required(),
        phone: Joi.number().min(1000000000).max(9999999999).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(100).required(),
        city: Joi.string().required(),
        district: Joi.string().required(),
        state: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: "Bad request", error });

    try {
        const isPhoneUnique = await checkIsPhoneNumberUnique(req.body.phone);
        if (!isPhoneUnique) return res.status(400).json({ message: 'Phone number is already used' });
        const isEmailUnique = await checkIsEmailUnique(req.body.email);
        if (!isEmailUnique) return res.status(400).json({ message: 'Email is already used' });
        
        const currentUserRole = req.user.role;
        const allowedRoles = ["Admin", "State Franchise", "District Franchise", "City Franchise", "Marketing Manager"];
        if (!allowedRoles.includes(currentUserRole)) {
          return res.status(403).json({ message: "You are not authorized to create a school." });
        }

        next();
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

module.exports = {
  newSchoolValidation,
};
