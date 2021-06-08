const { parsePhoneNumberFromString } = require("libphonenumber-js/mobile");
const { countryCode } = require('./countryCode');

const validateMobile = (isd, mobile) => {
  const pattern = /^[0-9]{8}$/;
  if(!pattern.test(mobile))
    return "Mobile Number has to be a valid 8 digit number"

  const ccode = countryCode[isd];
  if(!ccode)
    return "Sorry we have no support for this country!";

  const phoneNumber = parsePhoneNumberFromString(mobile, ccode);

  if (!phoneNumber)
    return "The phone number entered is not valid";

  const isValidMob = ( phoneNumber.isPossible() && phoneNumber.isValid() && phoneNumber.getType() == "MOBILE" )

  if(!isValidMob)
    return "Sorry looks like the mobile number you entered is not Valid !";

  return null;
}

const validatePassword = (password) => {
  // at least one number, one lowercase and one uppercase letter at least six characters that are letters, numbers or the underscore
  // const pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])\w{6,}$/;
  // at least one number, one letter at least six characters that are letters, numbers or the underscore
  const pattern = /^(?=.*\d)(?=.*[a-z])\w{6,}$/;
  return pattern.test(password);
}

const getAge = (timestamp) => {
  const ageTs = new Date(timestamp).getTime();
  if(Date.now() < ageTs){
    return false;
  }
  const myAge = ~~((Date.now() - ageTs) / (31557600000));
  return myAge;
}

const validateBirthDay = (timestamp, age) => {
  const myAge = getAge(timestamp);
	return (myAge > age)
}

module.exports = {
  validateMobile,
  validatePassword,
  getAge,
  validateBirthDay,
}
