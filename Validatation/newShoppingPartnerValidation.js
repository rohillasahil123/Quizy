const Joi = require("joi");
const ShoppingPartner = require("../Model/ShoppingPartner");

async function checkIsPhoneNumberUnique(phone) {
    const existingUser = await ShoppingPartner.findOne({ phone });
    return !existingUser;
}

async function checkIsEmailUnique(email) {
    const existingUser = await ShoppingPartner.findOne({ email });
    return !existingUser; 
}

const newShoppingPartnerValidation = async (req, res, next) => {
    const schema = Joi.object({
        ownerName: Joi.string().min(3).required(),
        phoneNumber: Joi.number().min(1000000000).max(9999999999).required(),
        email: Joi.string().email().required(),
        shopName: Joi.string().required(),
        localAddress: Joi.string().required(),
        category: Joi.string().required(),
        city: Joi.string().required(),
        district: Joi.string().required(),
        state: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: "Bad request", error });

    try {
        const isPhoneUnique = await checkIsPhoneNumberUnique(req.body.phoneNumber);
        if (!isPhoneUnique) return res.status(400).json({ message: 'Phone number is already used' });
        const isEmailUnique = await checkIsEmailUnique(req.body.email);
        if (!isEmailUnique) return res.status(400).json({ message: 'Email is already used' });
        next();
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

module.exports = {
    newShoppingPartnerValidation,
};
