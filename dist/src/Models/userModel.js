'use strict'
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k
        var desc = Object.getOwnPropertyDescriptor(m, k)
        if (
          !desc ||
          ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k]
            },
          }
        }
        Object.defineProperty(o, k2, desc)
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k
        o[k2] = m[k]
      })
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v })
      }
    : function (o, v) {
        o['default'] = v
      })
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod
    var result = {}
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k)
    __setModuleDefault(result, mod)
    return result
  }
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value)
          })
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value))
        } catch (e) {
          reject(e)
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value))
        } catch (e) {
          reject(e)
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected)
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next())
    })
  }
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
const mongoose_1 = __importStar(require('mongoose'))
const bcryptjs_1 = __importDefault(require('bcryptjs'))
const crypto_1 = __importDefault(require('crypto'))
const userSchema = new mongoose_1.Schema(
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
userSchema.pre('save', function (next) {
  return __awaiter(this, void 0, void 0, function* () {
    if (!this.isModified('password') || !this.password) return next()
    this.password = yield bcryptjs_1.default.hash(this.password, 12)
    next()
  })
})
userSchema.pre('save', function (next) {
  return __awaiter(this, void 0, void 0, function* () {
    if (this.isModified('otp')) {
      this.otp_verify_attempts = 0
      // @ts-ignore
      if (this.otp_attempts >= 6) {
        this.otp_attempts = 0
        // @ts-ignore
        this.otp_request_date = Date.now() + 24 * 60 * 60 * 1000 // 1 day from now
      } else {
        this.otp_attempts = this.otp_attempts + 1
      }
      this.otp_expiry_time = Date.now() + 10 * 60 * 1000
    }
    if (this.otp) {
      this.otp = yield bcryptjs_1.default.hash(this.otp.toString(), 12)
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
})
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew || !this.password)
    return next()
  // @ts-ignore
  this.password_changed_at = Date.now() - 1000
  next()
})
userSchema.methods.correctPassword = function (
  candidatePassword,
  userPassword,
) {
  return __awaiter(this, void 0, void 0, function* () {
    return yield bcryptjs_1.default.compare(candidatePassword, userPassword)
  })
}
userSchema.methods.correctOTP = function (candidateOTP, userOTP) {
  return __awaiter(this, void 0, void 0, function* () {
    return yield bcryptjs_1.default.compare(candidateOTP, userOTP)
  })
}
userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.password_changed_at) {
    const changedTimeStamp = parseInt(
      (this.password_changed_at.getTime() / 1000).toString(),
      10,
    )
    return JWTTimeStamp < changedTimeStamp
  }
  return false
}
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto_1.default.randomBytes(32).toString('hex')
  this.password_reset_token = crypto_1.default
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')
  this.password_reset_expires = Date.now() + 10 * 60 * 1000
  return resetToken
}
const User = mongoose_1.default.model('User', userSchema)
exports.default = User
