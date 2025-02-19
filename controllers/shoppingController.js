const ShoppingPartner = require("../Model/ShoppingPartner");

async function addShoppingPartner(req, res) {
    try {
        const newShop = new ShoppingPartner({
            ...req.body,
            createdBy: req.user._id
        });
        await newShop.save();
        res.status(201).json({ success: true, message: "New shopping partner added" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error", error });
    }
}

async function getShoppingPartner(req, res) {
    try {
        let shops = await ShoppingPartner.find();

        if (shops.length === 0) return res.status(400).send({ success: false, message: "Shops are not found", shops });
        return res.status(200).send({
            message: "Shops fetched successfully",
            shops,
            success: true
        });
    } catch (error) {
        console.error("Error fetching franchise details: ", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
}

async function updateShoppingPartner(req, res) {
    const { id } = req.params;
    try {
        const updatedDetails = await ShoppingPartner.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (!updatedDetails) {
            return res.status(404).json({ success: false, message: "Shop not found" });
        }
        res.status(200).json({ success: true, message: "Shop updated successfully", user: updatedDetails });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}

async function deleteShoppingPartner(req, res) {
    const { id } = req.params;
    try {
        const deletedDetails = await ShoppingPartner.findByIdAndDelete(id);
        if (!deletedDetails) {
            return res.status(404).json({ success: false, message: "Shop not found" });
        }
        res.status(200).json({ success: true, message: "Shop deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}

module.exports = {
    addShoppingPartner,
    getShoppingPartner,
    updateShoppingPartner,
    deleteShoppingPartner
};
