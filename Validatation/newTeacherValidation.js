const Joi = require("joi");
const CompanyUser = require("../Model/CompanyUser");
const School = require("../Model/School");
const Teacher = require("../Model/Teacher");

async function checkIsPhoneNumberUnique(phone) {
    const existingUser = await CompanyUser.findOne({ phone });
    if(existingUser) return false;
    const existingSchool = await School.findOne({ phone });
    if(existingSchool) return false;
    const existingTeacher = await Teacher.findOne({ phone });
    if(existingTeacher) return false;
    return true;
}

async function checkIsEmailUnique(email) {
    const existingUser = await CompanyUser.findOne({ email });
    if(existingUser) return false; 
    const existingSchool = await School.findOne({ email });
    if(existingSchool) return false;
    const existingTeacher = await Teacher.findOne({ email });
    if(existingTeacher) return false; 
    return true;
}

const newTeacherValidation = async (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().min(3).required(),
        phone: Joi.number().min(1000000000).max(9999999999).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(100).required(),
        class: Joi.string().required(),
        subject: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: "Bad request", error });

    try {
        const isPhoneUnique = await checkIsPhoneNumberUnique(req.body.phone);
        if (!isPhoneUnique) return res.status(400).json({ message: 'Phone number is already used' });
        const isEmailUnique = await checkIsEmailUnique(req.body.email);
        if (!isEmailUnique) return res.status(400).json({ message: 'Email is already used' });
        
        const currentUserRole = req.user.role;
        const allowedRoles = ["Admin", "School"];
        if (!allowedRoles.includes(currentUserRole)) {
          return res.status(403).json({ message: "You are not authorized to create a teacher." });
        }

        next();
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

module.exports = {
  newTeacherValidation,
};
