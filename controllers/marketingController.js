const CompanyUser = require("../Model/CompanyUser");
const Location = require("../Model/Location");
const bcrypt = require('bcrypt');

// Your default data arrays
const defaultLocationData = { 
    states: ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli", "Daman and Diu", "Delhi", "Jammu and Kashmir", "Lakshadweep", "Pondicherry"], 
    districts: ['Adilabad','Agar-Malwa','Agra','Ahilyanagar','Ahmedabad','Aizawl','Ajmer','Akola','Alappuzha','Aligarh','Alipurduar','Alirajpur','Alluri Sitharama Raju','Almora','Alwar','Ambala','Ambedkar Nagar','Amethi','Amravati','Amreli','Amritsar','Amroha','Anakapalli','Anand','Ananthapuramu','Anantnag','Anjaw','Annamayya','Anugul','Anupgarh','Anuppur','Araria','Ariyalur','Arvalli','Arwal','Ashoknagar','Auraiya','Aurangabad','Ayodhya','Azamgarh','Bagalkote','Bageshwar','Baghpat','Bahraich','Bajali','Baksa','Balaghat','Balangir','Baleshwar','Ballari','Ballia','Balod','Balodabazar-Bhatapara','Balotra','Balrampur','Balrampur-Ramanujganj','Banas Kantha','Banda','Bandipora','Banka','Bankura','Banswara','Bapatla','Bara Banki','Baramulla','Baran','Bareilly','Bargarh','Barmer','Barnala','Barpeta','Barwani','Bastar','Basti','Bathinda','Beawar','Beed','Begusarai','Belagavi','Bemetara','Bengaluru Rural','Bengaluru Urban','Betul','Bhadohi','Bhadradri Kothagudem','Bhadrak','Bhagalpur','Bhandara','Bharatpur','Bharuch','Bhavnagar','Bhilwara','Bhind','Bhiwani','Bhojpur','Bhopal','Bichom Bidar','Bijapur','Bijnor','Bikaner','Bilaspur','Bilaspur','Birbhum','Bishnupur','Biswanath','Bokaro','Bongaigaon','Botad','Boudh','Budaun','Budgam','Bulandshahr','Buldhana','Bundi','Burhanpur','Buxar','Cachar','Central','Chamarajanagar','Chamba','Chamoli','Champawat','Champhai','Chandauli','Chandel','Chandigarh','Chandrapur','Changlang','Charaideo','Charkhi Dadri','Chatra','Chengalpattu','Chennai','Chhatarpur','Chhatrapati Sambhajinagar','Chhindwara','Chhotaudepur','Chikkaballapura','Chikkamagaluru','Chirang','Chitradurga','Chitrakoot','Chittoor','Chittorgarh','Chumoukedima','Churachandpur','Churu','Coimbatore','Cooch Behar','Cuddalore','Cuttack','Dadra And Nagar Haveli','Dahod','Dakshin Bastar Dantewada','Dakshin Dinajpur','Dakshina Kannada','Daman','Damoh','Dangs','Darbhanga','Darjeeling','Darrang','Datia','Dausa','Davanagere','Deeg','Dehradun','Deogarh','Deoghar','Deoria','Devbhumi Dwarka','Dewas','Dhalai','Dhamtari','Dhanbad','Dhar','Dharashiv','Dharmapuri','Dharwad','Dhemaji','Dhenkanal','Dholpur','Dhubri','Dhule','Dibang Valley','Dibrugarh','Didwana-Kuchaman','Dima Hasao','Dimapur','Dindigul','Dindori','Diu','Doda','Dr. B.R. Ambedkar Konaseema','Dudu','Dumka','Dungarpur','Durg','East','East Garo Hills','East Godavari','East Jaintia Hills','East Kameng','East Khasi Hills','East Siang','East Singhbum','Eastern West Khasi Hills','Eluru','Ernakulam','Erode','Etah','Etawah','Faridabad','Faridkot','Farrukhabad','Fatehabad','Fatehgarh Sahib','Fatehpur','Fazilka','Ferozepur','Firozabad','Gadag','Gadchiroli','Gajapati','Ganderbal','Gandhinagar','Ganganagar','Gangapurcity','Gangtok','Ganjam','Garhwa','Gariyaband','Gaurela-Pendra-Marwahi','Gautam Buddha Nagar','Gaya','Ghaziabad','Ghazipur','Gir Somnath','Giridih','Goalpara','Godda','Golaghat','Gomati','Gonda','Gondia','Gopalganj','Gorakhpur','Gumla','Guna','Guntur','Gurdaspur','Gurugram','Gwalior','Gyalshing','Hailakandi','Hamirpur','Hamirpur','Hanumakonda','Hanumangarh','Hapur','Harda','Hardoi','Haridwar','Hassan','Hathras','Haveri','Hazaribagh','Hingoli','Hisar','Hnahthial','Hojai','Hooghly','Hoshiarpur','Howrah','Hyderabad','Idukki','Imphal East','Imphal West','Indore','Jabalpur','Jagatsinghapur','Jagitial','Jaipur','Jaipur (Gramin)','Jaisalmer','Jajapur','Jalandhar','Jalaun','Jalgaon','Jalna','Jalore','Jalpaiguri','Jammu','Jamnagar','Jamtara','Jamui','Jangoan','Janjgir-Champa','Jashpur','Jaunpur','Jayashankar Bhupalapally','Jehanabad','Jhabua','Jhajjar','Jhalawar','Jhansi','Jhargram','Jharsuguda','Jhunjhunu','Jind','Jiribam','Jodhpur','Jodhpur (Gramin)','Jogulamba Gadwal','Jorhat','Junagadh','Kabeerdham','Kachchh','Kaimur (Bhabua)','Kaithal','Kakching','Kakinada','Kalaburagi','Kalahandi','Kalimpong','Kallakurichi','Kamareddy','Kamjong','Kamle','Kamrup','Kamrup Metro','Kancheepuram','Kandhamal','Kangpokpi','Kangra','Kannauj','Kanniyakumari','Kannur','Kanpur Dehat','Kanpur Nagar','Kapurthala','Karaikal','Karauli','Karbi Anglong','Kargil','Karimganj','Karimnagar','Karnal','Karur','Kasaragod','Kasganj','Kathua','Katihar','Katni','Kaushambi','Kekri','Kendrapara','Kendujhar','Keyi Panyor','Khagaria','Khairagarh-Chhuikhadan-Gandai','Khairthal-Tijara','Khammam','Khandwa (East Nimar)','Khargone (West Nimar)','Khawzawl','Kheda','Kheri','Khordha','Khowai','Khunti','Kinnaur','Kiphire','Kishanganj','Kishtwar','Kodagu','Koderma','Kohima','Kokrajhar','Kolar','Kolasib','Kolhapur','Kolkata','Kollam','Kondagaon','Koppal','Koraput','Korba','Korea','Kota','Kotputli-Behror','Kottayam','Kozhikode','Kra Daadi','Krishna','Krishnagiri','Kulgam','Kullu','Kumuram Bheem Asifabad','Kupwara','Kurnool','Kurukshetra','Kurung Kumey','Kushinagar','Lahaul And Spiti','Lakhimpur','Lakhisarai','Lakshadweep District','Lalitpur','Latehar','Latur','Lawngtlai','Leh Ladakh','Leparada','Lohardaga','Lohit','Longding','Longleng','Lower Dibang Valley','Lower Siang','Lower Subansiri','Lucknow','Ludhiana','Lunglei','MAUGANJ','Madhepura','Madhubani','Madurai','Mahabubabad','Mahabubnagar','Mahasamund','Mahendragarh','Mahesana','Mahisagar','Mahoba','Mahrajganj','Maihar','Mainpuri','Majuli','Malappuram','Malda','Malerkotla','Malkangiri','Mamit','Mancherial','Mandi','Mandla','Mandsaur','Mandya','Manendragarh-Chirmiri-Bharatpur(M C B)','Mangan','Mansa','Marigaon','Mathura','Mau','Mayiladuthurai','Mayurbhanj','Medak','Medchal Malkajgiri','Meerut','Mirzapur','Moga','Mohla-Manpur-Ambagarh Chouki','Mokokchung','Mon','Moradabad','Morbi','Morena','Mulugu','Mumbai','Mumbai Suburban','Mungeli','Munger','Murshidabad','Muzaffarnagar','Muzaffarpur','Mysuru','Nabarangpur','Nadia','Nagaon','Nagapattinam','Nagarkurnool','Nagaur','Nagpur','Nainital','Nalanda','Nalbari','Nalgonda','Namakkal','Namchi','Namsai','Nanded','Nandurbar','Nandyal','Narayanpet','Narayanpur','Narmada','Narmadapuram','Narsimhapur','Nashik','Navsari','Nawada','Nayagarh','Neem Ka Thana','Neemuch','New Delhi','Nicobars','Nirmal','Niuland','Niwari','Nizamabad','Noklak','Noney','North 24 Parganas','North And Middle Andaman','North East','North Garo Hills','North Goa','North Tripura','North West','Ntr','Nuapada','Nuh','Pakke Kessang','Pakur','Pakyong','Palakkad','Palamu','Palghar','Pali','Palnadu','Palwal','Panch Mahals','Panchkula','Pandhurna','Panipat','Panna','Papum Pare','Parbhani','Parvathipuram Manyam','Paschim Bardhaman','Paschim Medinipur','Pashchim Champaran','Patan','Pathanamthitta','Pathankot','Patiala','Patna','Pauri Garhwal','Peddapalli','Perambalur','Peren','Phalodi','Phek','Pherzawl','Pilibhit','Pithoragarh','Poonch','Porbandar','Prakasam','Pratapgarh','Pratapgarh','Prayagraj','Puducherry','Pudukkottai','Pulwama','Pune','Purba Bardhaman','Purba Medinipur','Purbi Champaran','Puri','Purnia','Purulia','Rae Bareli','Raichur','Raigad','Raigarh','Raipur','Raisen','Rajanna Sircilla','Rajgarh','Rajkot','Rajnandgaon','Rajouri','Rajsamand','Ramanagara','Ramanathapuram','Ramban','Ramgarh','Rampur','Ranchi','Ranga Reddy','Ranipet','Ratlam','Ratnagiri','Rayagada','Reasi','Rewa','Rewari','Ri Bhoi','Rohtak','Rohtas','Rudra Prayag','Rupnagar','S.A.S Nagar','Sabar Kantha','Sagar','Saharanpur','Saharsa','Sahebganj','Saitual','Sakti','Salem','Salumbar','Samastipur','Samba','Sambalpur','Sambhal','Sanchore','Sangareddy','Sangli','Sangrur','Sant Kabir Nagar','Saraikela Kharsawan','Saran','Sarangarh-Bilaigarh','Satara','Satna','Sawai Madhopur','Sehore','Senapati','Seoni','Sepahijala','Serchhip','Shahdara','Shahdol','Shahid Bhagat Singh Nagar','Shahjahanpur','Shahpura','Shajapur','Shamator','Shamli','Sheikhpura','Sheohar','Sheopur','Shi Yomi','Shimla','Shivamogga','Shivpuri','Shopian','Shrawasti','Siaha','Siang','Siddharthnagar','Siddipet','Sidhi','Sikar','Simdega','Sindhudurg','Singrauli','Sirmaur','Sirohi','Sirsa','Sitamarhi','Sitapur','Sivaganga','Sivasagar','Siwan','Solan','Solapur','Sonbhadra','Sonepur','Sonipat','Sonitpur','Soreng','South 24 Parganas','South Andamans','South East','South Garo Hills','South Goa','South Salmara Mancachar','South Tripura','South West','South West Garo Hills','South West Khasi Hills','Sri Muktsar Sahib','Sri Potti Sriramulu Nellore','Sri Sathya Sai','Srikakulam','Srinagar','Sukma','Sultanpur','Sundargarh','Supaul','Surajpur','Surat','Surendranagar','Surguja','Suryapet','Tamenglong','Tamulpur','Tapi','Tarn Taran','Tawang','Tehri Garhwal','Tengnoupal','Tenkasi','Thane','Thanjavur','The Nilgiris','Theni','Thiruvallur','Thiruvananthapuram','Thiruvarur','Thoothukkudi','Thoubal','Thrissur','Tikamgarh','Tinsukia','Tirap','Tiruchirappalli','Tirunelveli','Tirupathur','Tirupati','Tiruppur','Tiruvannamalai','Tonk','Tseminyu','Tuensang','Tumakuru','Udaipur','Udalguri','Udam Singh Nagar','Udhampur','Udupi','Ujjain','Ukhrul','Umaria','Una','Unakoti','Unnao','Upper Siang','Upper Subansiri','Uttar Bastar Kanker','Uttar Dinajpur','Uttar Kashi','Uttara Kannada','Vadodara','Vaishali','Valsad','Varanasi','Vellore','Vidisha','Vijayanagara','Vijayapura','Vikarabad','Viluppuram','Virudhunagar','Visakhapatnam','Vizianagaram','Wanaparthy','Warangal','Wardha','Washim','Wayanad','West','West Garo Hills','West Godavari','West Jaintia Hills','West Kameng','West Karbi Anglong','West Khasi Hills','West Siang','West Singhbhum','West Tripura','Wokha','Y.S.R.','Yadadri Bhuvanagiri','Yadgir','Yamunanagar','Yavatmal','Zunheboto'],
    cities: ['Adilabad','Agartala','Agra','Ahmedabad','Ahmednagar','Aizawl','Ajmer','Akola','Alappuzha / Alleppey','Aligarh','Allahabad','Alwar','Ambala','Amravati','Amritsar','Anand','Anantapur','Angul','Ankleshwar','Asansol','Aurangabad','Baddi','Bahraich','Bangalore / Bengaluru','Banswara','Banur','Baramati','Bareilly','Barmer','Barnala','Baroda (Vadodara)','Bathinda','Bawal','Belgaum','Bellary','Bhagalpur','Bharuch','Bhavnagar','Bhilai','Bhilwara','Bhiwadi','Bhiwani','Bhopal','Bhubaneshwar','Bhuj','Bidar','Bijnor','Bikaner','Bilaspur','Bokaro','Burdwan','Calicut','Cannannore','Chamba','Chandrapur','Chennai','Chiplun','Cochin','Coimbatore','Cuddalore','Cuddapah','Cuttack','Dahej','Dalhousie','Davangere','Dehradun','Dhanbad','Dharmasala','Dharuhera','Dharwad','Dhule','Dibrugarh','Dimapur','Durgapur','Ernakulam','Erode','Faizabad','Faridabad','Faridkot','Firozpur','Gajraula','Gandhidham','Gandhinagar','Ganganagar','Gangtok','Gaya','Ghaziabad','Gir','Godhra','Gorakhpur','Greater Noida','Gulbarga','Guntakal','Guntur','Gurdaspur','Gurgaon (Gurugram)','Guwahati','Gwalior','Haldia','Haldwani','Haridwar','Hisar','Hoshiarpur','Hospet','Hosur','Hubli','Hyderabad','Idukki','Imphal','Indore','Itanagar','Jabalpur','Jaipur','Jaisalmer','Jalandhar','Jalgaon','Jammu','Jamnagar','Jamshedpur','Jhansi','Jharsuguda','Jind','Jodhpur','Junagadh','Kakinada','Kala','Kalpakkam','Kamalapuram','Kanchipuram','Kandla','Kannur','Kanpur','Kapurthala','Karimnagar','Karnal','Karur','Kasargode','Kashipur','Katni','Khammam','Kharagpur','Khopoli','Kochi','Kohima','Kolar','Kolhapur','Kolkata','Kollam','Koppal','Korba','Kota','Kottayam','Kozhikode','Kullu','Kurnool','Kurukshetra','Lakhtar','Lucknow','Ludhiana','Madurai','Malappuram','Mamandur','Manali','Mandi','Manesar','Mangalore','Mathura','Meerut','Mehsana','Moga','Mohali','Moradabad','Morinda','Mount Abu','Mumbai Suburbs','Mumbai','Mundra','Munger','Muzaffarpur','Mysore','Nagar','Nagercoil','Nagpur','Nasik','Navi Mumbai','Neemrana','Nellore','Nizamabad','Ooty','Orai','Palakkad / Palghat','Palwal','Panaji / Panjim','Panchkula','Panipat','Pantnagar','Paradeep','Pathanamthitta','Pathankot','Patiala','Patna','Phagwara','Porbandar','Port Blair','Pune','Puri','Quilon','Raigad','Raigarh','Raipur','Rajahmundry','Rajkot','Rajpura','Ranchi','Ratlam','Ratnagiri','Rewa','Rewari','Rohtak','Roorkee','Rourkela','Rudrapur','Rupnagar','Saharanpur','Salem','Sangrur','Satara','Satna','Secunderabad','Shillong','Shimla','Shimoga','Silchar','Siliguri','Silvassa','Solapur','Sonepat','Srinagar','Surat','Surendranagar','Tarapur','Tezpur','Thane','Thanjavur','Thrissur','Tirunelveli','Tirupati','Trichur','Trichy','Trivandrum','Tumkur','Tuticorin','Udaipur','Ujjain','Vadodara','Valsad','Vapi','Varanasi','Vasai','Vasco Da Gama','Vellore','Veraval','Vijayawada','Visakhapatnam (Vizag)','Warangal','Wayanad','Yamunanagar']
};


async function getLocations(req, res) {
    try {
        // Check if a document already exists
        let locationData = await Location.findOne({});
        if (!locationData) {
          // If not, create one using the default data
          locationData = await Location.create(defaultLocationData);
        }
        res.json(locationData);
      } catch (error) {
        console.error('Error fetching location data:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
}

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

async function updateMember(req, res) {
    const { id } = req.params;
    try {
        const updatedUser = await CompanyUser.findByIdAndUpdate(
            id,
            { $set: req.body }, // Update with request body
            { new: true, runValidators: true } // Return updated document & run validation
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "Member not found" });
        }

        res.status(200).json({ success: true, message: "Member updated successfully", user: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}

async function deleteMember(req, res) {
    const { id } = req.params;
    try {
        const deletedUser = await CompanyUser.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ success: false, message: "Member not found" });
        }

        res.status(200).json({ success: true, message: "Member deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}

async function getFranchiseDetails(req, res) {
    const { role } = req.body;
    const userRole = req.user.role;
    if(!userRole) return res.status(400).send({message: "Some error with role"});
    if (!role) return res.status(400).send({ message: "Missing required information" })
    let query = {};
    let selectFields = "_id name role"; 
    try {
        if (role === "State Franchise" && (userRole ==='Admin')) {
            query.role = role; 
            selectFields = "_id name role state";
        } else if (role === "District Franchise" && (userRole ==='Admin' || userRole ==='State Franchise')) {
            query.role = role; 
            query.parent = req.body.id
            selectFields = "_id name role district parent";
        } else if (role === "City Franchise" && (userRole ==='Admin' || userRole ==='State Franchise' || userRole ==='District Franchise')) {
            query.role = role; 
            query.parent = req.body.id
            selectFields = "_id name role city parent";
        } else if (role === "Marketing Manager" && (userRole ==='Admin' || userRole ==='State Franchise' || userRole ==='District Franchise' || userRole ==='City Franchise')) {
            query.role = role; 
            query.parent = req.body.id
            selectFields = "_id name role schoolName parent";
        } else if (role === "School Franchise" && (userRole ==='Admin' || userRole ==='State Franchise' || userRole ==='District Franchise' || userRole ==='City Franchise' || userRole ==='Marketing Manager')) {
            query.role = role; 
            query.parent = req.body.id
            selectFields = "_id name role class parent";
        } else if (role === "Teacher Franchise" && (userRole ==='Admin' || userRole ==='State Franchise' || userRole ==='District Franchise' || userRole ==='City Franchise' || userRole ==='Marketing Manager' || userRole ==='School Franchise')) {
            query.role = role; 
            query.parent = req.body.id
            selectFields = "_id name role class parent";
        } else if (role === "Direct Downline" && (userRole ==='Admin' || userRole ==='State Franchise' || userRole ==='District Franchise' || userRole ==='City Franchise' || userRole ==='School Franchise')) {
            query.parent = req.body.id
            selectFields = "_id name role parent";
        } else return res.status(400).send({ message: "Invalid role. Only Franchise role is supported." });

        let users = await CompanyUser.find(query).select(selectFields).lean();
0
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
    updateMember,
    deleteMember,
    getFranchiseDetails,
    getLocations
};