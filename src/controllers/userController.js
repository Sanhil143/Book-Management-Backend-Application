const UserModel = require("../models/userModel")
const jwt = require("jsonwebtoken")
const { isValid, isValidTitle, isValidMobileNo, isValidPassword, isValidPincode,
  isValidEmail, isValidName } = require("../Validations/Validator");

const createUser = async function (req, res) {
  try {
    let userData = req.body

    const { title, name, phone, email, password, address } = req.body

    if (!title) {
      return res.status(400).send({ status: false, message: "title is required" })
    }
    if (!(["Mr", "Mrs", "Miss"].includes(title))) {
      return res.status(400).send({ status: false, message: "Can only use Mr, Mrs and Miss" })
    }



    if (!name) {
      return res.status(400).send({ status: false, message: "name is required" })
    }
    if (!isValidName(name) || !isValid(name)) {
      return res.status(400).send({ status: false, message: "Please enter valid name" })
    }

    if (!phone) {
      return res.status(400).send({ status: false, message: "phone is required" })
    }
    if (!isValidMobileNo(phone)) {
      return res.status(400).send({ status: false, message: "Phone Number is not Valid" })
    }

    let checkPhone = await UserModel.findOne({ phone: phone })
    if (checkPhone) {
      return res.status(400).send({ status: false, message: "phone no. is already exist" })
    }

    if (!email) {
      return res.status(400).send({ status: false, message: "email is required" })
    }
    if (!isValidEmail(email)) {
      return res.status(400).send({ status: false, message: "Invalid Email" })
    }
    let checkEmail = await UserModel.findOne({ email: email })
    if (checkEmail) {
      return res.status(400).send({ status: false, message: "email is already exist" })
    }
    if (!password) {
      return res.status(400).send({ status: false, message: "password is required" })
    }
    if (!isValidPassword(password)) {
      return res.status(400).send({ status: false, message: "Password requirements didn't match" })
    }

    if (pincode) {
      if (!isValidPincode(address.pincode)) {
        return res.status(400).send({ status: false, message: "Pincode requirements didn't match" })
      }
    }

    let savedData = await UserModel.create(userData)
    res.status(201).send({ status: true, message: "Success", data: savedData })
  }
  catch (err) {
    res.status(500).send(err.message)
  }
}

//---------------------------------------  Login User    -------------------------------------------------

const loginUser = async function (req, res) {
  try {
    let { email, password } = req.body;

    if (Object.keys(req.body).length === 0) {
      return res.status(400).send({ status: false, message: "please input user Details" });
    }

    if (!email) {
      return res.status(400).send({ status: false, message: "EmailId is mandatory" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).send({ status: false, message: "EmailId should be Valid" });
    }
    if (!password) {
      return res.status(400).send({ status: false, message: "Password is mandatory" });
    }
    if (password.length < 8 || password.length > 15) {
      return res.status(400).send({ status: false, message: "the length of password must be min:- 8 or max: 15" });
    }

    let verifyUser = await UserModel.findOne({ email: email, password: password });
    if (!verifyUser)
      return res.status(400).send({ status: false, message: "Invalid Login Credential" });   

    const userToken = jwt.sign({ userId: verifyUser._id }, process.env.SECUKEY, { expiresIn: 30000 })

    const userTokenData = jwt.decode(userToken)
    userTokenData.iat = new Date(userTokenData.iat*1000).toGMTString()
    userTokenData.exp = new Date(userTokenData.exp*1000).toGMTString()

    return res.status(200).send({status: true,message: 'Success',data: {userToken: userToken,...userTokenData
        }
    })
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { loginUser, createUser }




// const userToken = jwt.sign({ userId: isUserExist._id }, 'secretKey', { expiresIn: 30000 })

//     const userTokenData = jwt.decode(userToken)
//     userTokenData.iat = new Date(userTokenData.iat*1000).toGMTString()
//     userTokenData.exp = new Date(userTokenData.exp*1000).toGMTString()

//     return res.status(200).send({status: true,message: 'Success',data: {userToken: userToken,...userTokenData
//         }
//     })