const User = require("../model/userModel");
const bcrypt = require("bcrypt");

module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const usernameCheck = await User.findOne({ username });
    if (usernameCheck)
      return res.json({ msg: "Username already used", status: false });
    const emailCheck = await User.findOne({ email });
    if (emailCheck)
      return res.json({ msg: "Email already used", status: false });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      username,
      password: hashedPassword,
    });
    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};

module.exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const loginUser = await User.findOne({ username });
    if (!loginUser){
      return res.json({ msg: "Incorrect username or password", status: false });
    }
    const isPasswordValid = await bcrypt.compare(password, loginUser.password);
    if(!isPasswordValid) {
      return res.json({ msg: "Incorrect username or password", status: false });
    }
    delete loginUser.password;
    return res.json({ status: true, loginUser });
  } catch (ex) {
    next(ex);
  }
};

module.exports.setProfile = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const profileImageData = req.body.image;
    console.log(req.body);
    const userData = await User.findByIdAndUpdate(
      userId,
      {
        profileImageSet: true,
        profileImage: profileImageData,
      },
      { new: true }
    );
    return res.json({
      profileImageSet: true,
      profileImageData
    });
  } catch(ex) {
    next(ex);
  }
}

module.exports.getAllUsers = async (req, res, next) => {
  try { 
    const users = await User.find({ _id: { $ne: req.params.id }}).select([
      "email", 
      "username", 
      "profileImage", 
      "_id",
    ]);
    return res.json(users);
  } catch(ex) {
    next(ex);
  }
}