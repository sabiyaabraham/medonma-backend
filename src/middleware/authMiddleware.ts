/**
 * @description      : Auth Middleware
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
import { Request, Response, NextFunction } from 'express'
import asyncHandler from 'express-async-handler'
import {
  protectUser as protectUser_,
  protectAdmin as protectAdmin_,
} from '../services/authService'
import jwt from 'jsonwebtoken'

const JWT_SECRET: string = process.env.JWT_SECRET
  ? process.env.JWT_SECRET
  : 'medonma'
interface DecodedToken {
  id: string
  email: string
}

// Authentication middleware for users
export const protectUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      try {
        const token = req.headers.authorization.split(' ')[1]

        let decoded

        try {
          // Verify the authentication token
          decoded = jwt.verify(token, JWT_SECRET) as DecodedToken
        } catch (error: any) {
          // Handle JWT verification errors
          if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({
              status: 400,
              error: true,
              message: 'Invalid token.',
              data: null,
            })
          }

          if (error.name === 'TokenExpiredError') {
            return res.status(400).json({
              status: 400,
              error: true,
              message: 'Token has expired.',
              data: null,
            })
          }

          // Handle other JWT verification errors if needed

          return res.status(500).json({
            status: 500,
            error: true,
            message: 'Internal Server Error',
            data: error.message || '',
          })
        }

        const { id, email } = decoded

        const response = await protectUser_({
          id,
          email,
          token,
        })

        if (response.error) {
          return res.status(response.status).json(response)
        } else {
          // @ts-ignore
          req.user = response?.data?.user
          next()
        }
      } catch (error: any) {
        return res.status(401).json({
          status: 401,
          error: true,
          message: 'Not authorized, token failed',
          data: null,
        })
      }
    } else {
      return res.status(401).json({
        status: 401,
        error: true,
        message: 'Not authorized, no token',
        data: null,
      })
    }
  },
)

// Authentication middleware for admins
export const protectAdmin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      try {
        const token = req.headers.authorization.split(' ')[1]

        let decoded

        try {
          // Verify the authentication token
          decoded = jwt.verify(token, JWT_SECRET) as DecodedToken
        } catch (error: any) {
          // Handle JWT verification errors
          if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({
              status: 400,
              error: true,
              message: 'Invalid token.',
              data: null,
            })
          }

          if (error.name === 'TokenExpiredError') {
            return res.status(400).json({
              status: 400,
              error: true,
              message: 'Token has expired.',
              data: null,
            })
          }

          // Handle other JWT verification errors if needed

          return res.status(500).json({
            status: 500,
            error: true,
            message: 'Internal Server Error',
            data: error.message || '',
          })
        }

        const { id, email } = decoded

        const response = await protectAdmin_({
          id,
          email,
          token,
        })

        if (response.error) {
          return res.status(response.status).json(response)
        } else {
          req.body['Auth'] = response.data
          next()
        }
      } catch (error: any) {
        return res.status(401).json({
          status: 401,
          error: true,
          message: 'Not authorized, token failed',
          data: null,
        })
      }
    } else {
      return res.status(401).json({
        status: 401,
        error: true,
        message: 'Not authorized, no token',
        data: null,
      })
    }
  },
)
