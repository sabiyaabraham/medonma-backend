/**
 * @description      : Handle the response
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
import { Response } from 'express'

const handleResponse = async (promise: Promise<any>, res: Response) => {
  try {
    const output = await promise
    const { status, error } = output

    if (error) {
      return res.status(status).json(output)
    }

    return res.status(status).json(output)
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: true,
      message: 'Internal server error',
      // @ts-ignore
      data: error.message || null,
    })
  }
}

export default handleResponse
