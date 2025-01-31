const validateStudentData = (studentData) => {
    switch (studentData.selectEducation) {
      case "School":
      case "College":
      case "Institute":
        break;
      default:
        throw new Error("Invalid education type");
    }
  
    switch (studentData.role) {
      case "student":
      case "other":
        break;
      default:
        throw new Error("Invalid role");
    }
  
    // switch (studentData.boardOption) {
    //   case "CBSE_Board":
    //   case "ICSE_Board":
    //   case "Other":
    //     break;
    //   default:
    //     throw new Error("Invalid board option");
    // }
  
    // switch (studentData.mediumName) {
    //   case "English_Medium":
    //   case "Hindi_Medium":
    //   case "Other":
    //     break;
    //   default:
    //     throw new Error("Invalid medium name");
    // }
  
    // Additional validation logic can be added here if needed
  };
  
  module.exports = validateStudentData;
  