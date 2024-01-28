import crypto from 'crypto'
import { promisify } from 'util'
import { Request } from 'express'
import fs from 'fs'
import path from 'path'
import { User } from '../Models'
import protect from '../utils/protect'
import filterObj from '../lib/filterObj'

/**
 * Generates a unique filename based on timestamp and a random string.
 * @returns {string} Unique filename.
 */
const generateUniqueFileName = (): string => {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  return `${timestamp}-${randomString}`
}

/**
 * Retrieves user information.
 * @param {object} data - Unused parameter.
 * @param {Request} req - Express request object.
 * @returns {object} Object containing user information or an error response.
 */
export const userInfo = async (data: any, req: Request): Promise<any> => {
  try {
    // @ts-ignore
    const email = req.user.email

    // Find the user with the provided email
    const user = await User.findOne({ email })

    // @ts-ignore
    const protectInfo = await protect(user)

    if (protectInfo.error) return protectInfo

    // @ts-ignore
    await user.save({ new: true, validateModifiedOnly: true })

    return {
      status: 200,
      error: false,
      message: 'User information.',
      data: user,
    }
  } catch (error: any) {
    return {
      status: 500,
      error: true,
      message: `Internal Server Error`,
      data: { errorDetails: error.message || '' },
    }
  }
}

/**
 * Updates user information.
 * @param {object} data - Object containing user information to be updated.
 * @param {Request} req - Express request object.
 * @returns {object} Object containing updated user information or an error response.
 */
export const updateInfo = async (data: any, req: Request): Promise<any> => {
  try {
    // @ts-ignore
    const email = req.user.email

    // Find the user with the provided email
    const user = await User.findOne({ email })

    // @ts-ignore
    const protectInfo = await protect(user)

    if (protectInfo.error) return protectInfo

    // Filter out unnecessary fields
    const filteredBody = filterObj(
      data,
      'firstName',
      'lastName',
      'about',
      'dob',
      'age',
      'address',
    )

    // @ts-ignore
    user.set({
      ...filteredBody,
    })

    // @ts-ignore
    await user.save({ new: true, validateModifiedOnly: true })

    return {
      status: 200,
      error: false,
      message: 'User information updated.',
      data: { ...user },
    }
  } catch (error: any) {
    return {
      status: 500,
      error: true,
      message: `Internal Server Error`,
      data: { errorDetails: error.message || '' },
    }
  }
}

/**
 * Updates user profile picture.
 * @param {object} data - Unused parameter.
 * @param {Request} req - Express request object.
 * @returns {object} Object containing updated profile picture information or an error response.
 */
export const updatePic = async (data: any, req: Request): Promise<any> => {
  try {
    // @ts-ignore
    const email = req.user.email || req.user

    const avatarFile: any = req.file

    // Find the user with the provided email
    const user = await User.findOne({ email })

    // @ts-ignore
    const protectInfo = await protect(user)

    if (protectInfo.error) return protectInfo

    if (avatarFile) {
      // Generate a unique file name with a file extension
      const fileExtension = avatarFile.originalname.split('.').pop()
      const uniqueFileName = generateUniqueFileName() + `.${fileExtension}`

      // Save the file to the specified path
      const filePath = `tmp/profile/${uniqueFileName}`

      const directoryPath = path.dirname(filePath)

      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true })
      }

      // Now you can safely write the file
      await fs.promises.writeFile(filePath, avatarFile.buffer)

      // Save the image and get the new avatar name
      //   const newAvatarName = await saveImage(user, filePath, uniqueFileName, avatarFile.buffer);

      // Update user avatar with the new file name
      // @ts-ignore
      user.avatar = uniqueFileName

      // Read the image file as a buffer
      const imageBuffer = fs.readFileSync(filePath)

      // Convert the buffer to base64
      const base64Image = imageBuffer.toString('base64')

      // @ts-ignore
      await user.save({ new: true, validateModifiedOnly: true })

      return {
        status: 200,
        error: false,
        message: 'Profile updated!',
        data: {
          avatar: `data:image/${fileExtension};base64,${base64Image}`,
          extension: fileExtension,
        },
      }
    }

    return {
      status: 200,
      error: false,
      message: 'No profile given',
      data: null,
    }
  } catch (error: any) {
    console.error(error)
    return {
      status: 500,
      error: true,
      message: `Internal Server Error`,
      data: { errorDetails: error.message || '' },
    }
  }
}

/**
 * Removes user profile picture.
 * @param {object} data - Unused parameter.
 * @param {Request} req - Express request object.
 * @returns {object} Object containing updated profile picture information or an error response.
 */
export const removeProfile = async (data: any, req: Request): Promise<any> => {
  try {
    // @ts-ignore
    const { email } = req.user

    // Find the user with the provided email
    const user = await User.findOne({ email })

    // @ts-ignore
    const protectInfo = await protect(user)

    if (protectInfo.error) return protectInfo

    const avatar = 'aa.jpeg'
    // @ts-ignore
    user.avatar = avatar

    // @ts-ignore
    await user.save({ new: true, validateModifiedOnly: true })

    return {
      status: 200,
      error: false,
      message: 'Profile updated!',
      data: { avatar: avatar },
    }
  } catch (error: any) {
    return {
      status: 500,
      error: true,
      message: `Internal Server Error`,
      data: { errorDetails: error.message || '' },
    }
  }
}
