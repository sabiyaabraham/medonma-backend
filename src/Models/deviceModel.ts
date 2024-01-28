/**
 * @description      : Device Model
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

interface IDevice extends Document {
  name?: string
  token: string
  deviceID?: string
  user: mongoose.Types.ObjectId
  publicIP?: string
  timeZone?: string
  location?: {
    latitude: string
    longitude: string
  }
  location_?: string
  browser?: {
    isBrowser: boolean
    isMobile: boolean
    userAgent: string
    browserName: string
    browserVersion: string
  }
  os?: string
  device?: string
  created: Date
  updated: Date
  verified: boolean
  otp?: string
  otp_expiry_time?: Date
  otp_request_date?: Date
  otp_attempts?: number
  otp_verify_attempts?: number
  status?: 'Online' | 'Offline'
}

const deviceSchema: Schema<IDevice> = new Schema(
  {
    name: String,
    token: {
      type: String,
      required: true,
      unique: true,
    },
    deviceID: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    publicIP: String,
    timeZone: String,
    location: {
      latitude: String,
      longitude: String,
    },
    location_: String,
    browser: {
      isBrowser: Boolean,
      isMobile: Boolean,
      userAgent: String,
      browserName: String,
      browserVersion: String,
    },
    os: String,
    device: String,
    created: {
      type: Date,
      default: Date.now,
    },
    updated: {
      type: Date,
      default: Date.now,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    otp: String,
    otp_expiry_time: Date,
    otp_request_date: {
      type: Date,
      default: Date.now,
    },
    otp_attempts: {
      type: Number,
      default: 0,
    },
    otp_verify_attempts: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Online', 'Offline'],
    },
  },
  {
    timestamps: {
      createdAt: 'created',
      updatedAt: 'updated',
    },
  },
)

deviceSchema.pre<IDevice>('save', async function (next) {
  if (this.isModified('otp')) {
    if (this.otp) {
      this.otp = await bcrypt.hash(this.otp.toString(), 12)
    }

    this.otp_verify_attempts = 0

    // @ts-ignore
    if (this.otp_attempts >= 6) {
      this.otp_attempts = 0
      // @ts-ignore
      this.otp_request_date = Date.now() + 24 * 60 * 60 * 1000 // 1 day from now
    } else {
      // @ts-ignore
      this.otp_attempts = this.otp_attempts + 1
    }
    // @ts-ignore
    this.otp_expiry_time = Date.now() + 10 * 60 * 1000
  }

  if (!this.isModified('otp') || !this.otp) return next()

  next()
})

deviceSchema.methods.correctOTP = async function (
  candidateOTP: string,
  userOTP: string,
): Promise<boolean> {
  return await bcrypt.compare(candidateOTP, userOTP)
}

const Device: Model<IDevice> = mongoose.model('Device', deviceSchema)

export default Device
