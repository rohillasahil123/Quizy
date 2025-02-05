const CompanyUser = require("../Model/CompanyUser");
const bcrypt = require('bcrypt');

async function getMemberDetails(req, res) {
    const userId = req.params.id;
    const userDetails = await CompanyUser.findOne({_id: userId}).select("-password -__v -_id -parent");
    if (!userDetails) return res.status(404).send({ message: "Employee not found" });
    res.status(200).send({ 
        message: "Details fetched successfully", 
        userDetails ,
        success: true
    });
}

// async function getAllUsersByRole(req, res){
//     const role = req.params.role;
//     const users = await CompanyUser.find({role: role});
//     if (!userDetails) return res.status(404).send({ message: "Employee not found" });
//     return res.status(200).send(users);
// }

async function addNewMember(req, res) {
    console.log("🚀 ~  req.user._id:",  req.user._id)
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10);        
        const newUser = new CompanyUser({ 
            ...req.body,
            password: hashedPassword,
            parent: req.user._id
        });
        await newUser.save();
        res.status(201).json({ success: true, message: "New employee added", user: newUser });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error", error });
    }
}

async function getFranchiseDetails(req, res) {
    const { role } = req.body;
    const userRole = req.user.role;
    if(userRode=0) return res.status(400).send({message: "Some error with role"});
    if (!role) return res.status(400).send({ message: "Missing required information" })
    let query = {};
    let selectFields = "_id name role"; 
    try {
        if (role === "State Franchise" && userRole ==='Admin') {
            query.role = "State Franchise"; 
            selectFields = "_id name role state";
        }
        else if (role === "District Franchise" && userRole ==='Admin' || userRole ==='State Franchise') {
            query.role = "District Franchise"; 
            const parentId = req.body.id
            query.parent = parentId
            selectFields = "_id name role district parent";
        }
        else if (role === "City Franchise" && userRole ==='Admin' || userRole ==='State Franchise' || userRole ==='District Franchise') {
            query.role = "City Franchise"; 
            const parentId = req.body.id
            query.parent = parentId
            selectFields = "_id name role city parent";
        } else if (role === "School Franchise" && userRole ==='Admin' || userRole ==='State Franchise' || userRole ==='District Franchise' || userRole ==='City Franchise') {
            query.role = "School Franchise"; 
            const parentId = req.body.id
            query.parent = parentId
            selectFields = "_id name role district parent";
        } 
        else return res.status(400).send({ message: "Invalid role. Only State Franchise is supported." });

        let users = await CompanyUser.find(query).select(selectFields).lean();

        if (users.length === 0) return res.status(404).send({ message: "Franchise users not found" });
        users = users.map(({state, district, city, school, ...user })=> ({
            ...user,
            region: state || district || city,
        }));
        return res.status(200).send({
            message: "Details fetched successfully",
            users,
            success: true
        });
    } catch (error) {
        console.error("Error fetching franchise details: ", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
}

module.exports = { 
    getMemberDetails, 
    // getAllUsersByRole, 
    addNewMember, 
    getFranchiseDetails 
};