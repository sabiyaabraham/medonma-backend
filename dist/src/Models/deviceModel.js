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
const deviceSchema = new mongoose_1.Schema(
  {
    name: String,
    token: {
      type: String,
      required: true,
      unique: true,
    },
    deviceID: String,
    user: {
      type: mongoose_1.default.Schema.Types.ObjectId,
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
deviceSchema.pre('save', function (next) {
  return __awaiter(this, void 0, void 0, function* () {
    if (this.isModified('otp')) {
      if (this.otp) {
        this.otp = yield bcryptjs_1.default.hash(this.otp.toString(), 12)
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
})
deviceSchema.methods.correctOTP = function (candidateOTP, userOTP) {
  return __awaiter(this, void 0, void 0, function* () {
    return yield bcryptjs_1.default.compare(candidateOTP, userOTP)
  })
}
const Device = mongoose_1.default.model('Device', deviceSchema)
exports.default = Device
