/**
 * @description      : User Model
 * @author           : Sabiya Abraham
 * @group            : Team MEDONMA
 * @created          : 27/01/2024 - 14:05:15
 *
 * MODIFICATION LOG
 * - Version         : 1.0.0
 * - Date            : 27/01/2024
 * - Author          : Sabiya Abraham
 * - Modification    :
 **/
import mongoose, { Document, Schema, Model } from 'mongoose'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

interface IUser extends Document {
  firstName: string
  lastName: string
  about?: string
  avatar?: string
  dob?: Date
  age?: number
  sex: String
  address?: string
  blood_group: String
  user_type: 'user' | 'admin' | 'hospital'
  email: string
  phoneNumber: string
  password: string
  password_changed_at?: Date
  password_reset_token?: string
  password_reset_expires?: Date
  verified: boolean
  otp?: string | undefined
  otp_expiry_time?: Date
  otp_request_date?: Date
  otp_attempts?: number
  otp_verify_attempts?: number
  account: 'active' | 'inactive' | 'blocked' | 'deleted'
  blocked: boolean
  deleted: boolean

  createdAt: Date
  updatedAt: Date

  correctPassword(
    candidatePassword: string,
    userPassword: string,
  ): Promise<boolean>
  correctOTP(candidateOTP: string, userOTP: string): Promise<boolean>
  changedPasswordAfter(JWTTimeStamp: number): boolean
  createPasswordResetToken(): string
}

const userSchema: Schema<IUser> = new Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First Name is required'],
    },
    lastName: {
      type: String,
      required: [true, 'Last Name is required'],
    },
    about: String,
    avatar: String,
    dob: Date,
    age: Number,
    address: String,
    blood_group: String,
    sex: String,
    user_type: {
      type: String,
      required: [true, 'user type is required'],
      enum: ['user', 'admin', 'hospital'],
      default: 'user',
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Invalid email format',
      ],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone Number is required'],
      unique: true,
    },
    password: {
      type: String,
      select: false,
    },
    password_changed_at: Date,
    password_reset_token: String,
    password_reset_expires: Date,
    verified: {
      type: Boolean,
      default: false,
    },
    otp: String,
    otp_expiry_time: Date,
    otp_request_date: {
      type: Date,
      default: Date.now(),
    },
    otp_attempts: {
      type: Number,
      default: 0,
    },
    otp_verify_attempts: {
      type: Number,
      default: 0,
    },
    account: {
      type: String,
      enum: ['active', 'inactive', 'blocked', 'deleted'],
      default: 'active',
    },
    blocked: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  },
)

userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next()

  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.pre<IUser>('save', async function (next) {
  if (this.isModified('otp')) {
    this.otp_verify_attempts = 0

    // @ts-ignore
    if (this.otp_attempts >= 6) {
      this.otp_attempts = 0
      // @ts-ignore
      this.otp_request_date = Date.now() + 24 * 60 * 60 * 1000 // 1 day from now
    } else {
      this.otp_attempts = this.otp_attempts ? this.otp_attempts + 1 : 1
    }

    // @ts-ignore
    this.otp_expiry_time = Date.now() + 10 * 60 * 1000
  }

  if (this.otp) {
    this.otp = await bcrypt.hash(this.otp.toString(), 12)
  } else {
    this.otp = undefined
    // @ts-ignore
    this.otp_attempts = 0
    // @ts-ignore
    this.otp_request_date = 0
    // @ts-ignore
    this.otp_expiry_time = Date.now()
  }

  if (!this.isModified('otp') || !this.otp) return next()

  next()
})

userSchema.pre<IUser>('save', function (next) {
  if (!this.isModified('password') || this.isNew || !this.password)
    return next()

  // @ts-ignore
  this.password_changed_at = Date.now() - 1000
  next()
})

userSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.correctOTP = async function (
  candidateOTP: string,
  userOTP: string | undefined,
): Promise<boolean> {
  if (!userOTP) return false
  return await bcrypt.compare(candidateOTP, userOTP)
}

userSchema.methods.changedPasswordAfter = function (
  JWTTimeStamp: number,
): boolean {
  if (this.password_changed_at) {
    const changedTimeStamp = parseInt(
      (this.password_changed_at.getTime() / 1000).toString(),
      10,
    )
    return JWTTimeStamp < changedTimeStamp
  }
  return false
}

userSchema.methods.createPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString('hex')
  this.password_reset_token = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')
  this.password_reset_expires = Date.now() + 10 * 60 * 1000
  return resetToken
}

const User: Model<IUser> = mongoose.model('User', userSchema)

export default User
