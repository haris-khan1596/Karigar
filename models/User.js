const mongoose = require('mongoose')
const { createHmac, randomBytes } = require('crypto')
const { createTokenForUser } = require('../services/authentication')
const log = require('../utils/logger')
const { createDownloadPresignedUrl } = require('../services/fileService')

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    profile: {
      type: String,
      unique: true
    },
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE'],
      default: 'MALE'
    },
    mobile_no: {
      type: String,
      required: true,
      unique: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    salt: {
      type: String
    },
    role: {
      type: String,
      enum: ['CUSTOMER', 'WORKER', 'ADMIN'],
      default: 'CUSTOMER'
    },
    worker_details: {
      type: mongoose.Schema.Types.ObjectId,
      required: this.role === 'WORKER'
    }
  },
  {
    timestamps: true
  }
)

UserSchema.methods.toJSON = async function () {
  const user = this
  const userObject = user.toObject()
  delete userObject.password
  delete userObject.salt
  userObject.profile = userObject.profile
    ? createDownloadPresignedUrl(userObject.profile, 120)
    : 'https://static.vecteezy.com/system/resources/previews/020/765/399/non_2x/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg'
  if (user.role == 'WORKER') {
    userObject.worker_details = await WorkerDetails.findById(userObject.worker_details)
  }
  return userObject
}

UserSchema.pre('save', function (next) {
  log('info', 'Encrypting password')
  const user = this

  if (!user.isModified('password')) return

  const salt = randomBytes(16).toString()
  const hashedPassword = createHmac('sha256', salt)
    .update(user.password)
    .digest('hex')

  this.salt = salt
  this.password = hashedPassword
  log('info', 'Password encrypted successfully')

  next()
})

UserSchema.static(
  'matchPasswordAndGenerateToken',
  async function (email, password) {
    log('info', 'Logging in user')
    const user = await this.findOne({ email })
    if (!user) {
      log('error', 'User not found')
      throw new Error('User not found!')
    }

    const salt = user.salt
    const hashedPassword = user.password

    const userProvidedHash = createHmac('sha256', salt)
      .update(password)
      .digest('hex')

    if (hashedPassword !== userProvidedHash) {
      log('error', 'Incorrect Password')
      throw new Error('Incorrect Password')
    }

    const token = createTokenForUser(user)
    const userData = user.toJSON()
    return { user: userData, token }
  }
)

UserSchema.static(
  'resetPassword',
  async function (email, password) {
    log('info', 'Resetting password')
    const user = await this.findOne({ email })
    if (!user) {
      log('error', 'User not found')
      throw new Error('User not found!')
    }
    user.password = password
    await user.save()
    log('info', 'Password reset successfully')
    return user
  }
)

module.exports = mongoose.model('User', UserSchema)
