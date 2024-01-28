/**
 * @description      : Admin model
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

interface IAdmin extends Document {
  firstName: string
  lastName: string
  email: string
  avatar?: string
  status: 'active' | 'inactive' | 'blocked' | 'deleted'
  blocked: boolean
  deleted: boolean
  created: Date
  updated: Date
  password: string
  passwordChangedAt?: Date
  passwordResetToken?: string
  passwordResetExpires?: Date

  correctPassword(
    candidatePassword: string,
    adminPassword: string,
  ): Promise<boolean>
  createPasswordResetToken(): string
}

const adminSchema: Schema<IAdmin> = new Schema(
  {
    // Basic admin information
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (email: string) {
          return String(email)
            .toLowerCase()
            .match(
              /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            )
        },
        message: (props: { value: string }) =>
          `Email (${props.value}) is invalid!`,
      },
    },
    avatar: {
      type: String,
    },

    // Admin status and related flags
    status: {
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

    // Timestamps for created and updated fields
    created: {
      type: Date,
      default: Date.now,
    },
    updated: {
      type: Date,
      default: Date.now,
    },

    // Password-related fields
    password: {
      type: String,
      required: true,
    },
    passwordChangedAt: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
  },
  {
    timestamps: {
      createdAt: 'created',
      updatedAt: 'updated',
    },
  },
)

// Hash the password before saving it to the database
adminSchema.pre<IAdmin>('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next()

  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Set passwordChangedAt field when the password is modified
adminSchema.pre<IAdmin>('save', function (next) {
  if (!this.isModified('password') || this.isNew || !this.password)
    return next()

  // @ts-ignore
  this.passwordChangedAt = Date.now() - 1000
  next()
})

// Method to compare the provided password with the stored password
adminSchema.methods.correctPassword = async function (
  candidatePassword: string,
  adminPassword: string,
) {
  return await bcrypt.compare(candidatePassword, adminPassword)
}

// Method to create a password reset token
adminSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex')

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000

  return resetToken
}

const Admin: Model<IAdmin> = mongoose.model('Admin', adminSchema)

export default Admin
