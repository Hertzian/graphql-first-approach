const User = require('../models/user')
const bcrypt = require('bcryptjs')
const validator = require('validator')

module.exports = {
  //createUser(args, req) {
  createUser: async function ({ userInput }, req) {
    //const email = args.userInput.email
    //return User.findOne().then() // if promises are used
    const errors = []
    if (!validator.isEmail(userInput.email)) {
      errors.push({ message: 'Email is invalid' })
    }
    if (
      validator.isEmpty(userInput.password) ||
      !validator.isLength(userInput.password, { min: 5 })
    ) {
      errors.push({ message: 'Password to short!' })
    }
    if (errors.length > 0) {
      const error = new Error('Invalid input')
      error.data = errors
      error.code = 422
      throw error
    }
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
