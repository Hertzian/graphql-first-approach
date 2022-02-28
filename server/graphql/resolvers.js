const User = require('../models/user')
const bcrypt = require('bcryptjs')

module.exports = {
  //createUser(args, req) {
  createUser: async function ({ userInput }, req) {
    //const email = args.userInput.email
    //return User.findOne().then() // if promises are used
    const existingUser = await User.findOne({ email: userInput.email })
    if (existingUser) {
      const err = new Error('User exists already!')
      throw err
    }
    const hashedPwd = await bcrypt.hash(userInput.password, 10)
    const user = new User({
      email: userInput.email,
      name: userInput.name,
      password: hashedPwd
    })
    const createdUser = await user.save()
    return { ...createdUser._doc, _id: createdUser._id.toString() }
  }
}
