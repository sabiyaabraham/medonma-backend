class AppError extends Error {
  public statusCode: number
  public status: string
  public isOperational: boolean

  constructor(message: string, statusCode: number) {
    super(message)

    this.statusCode = statusCode
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'err'
    this.isOperational = true
    // Use Reflect.setPrototypeOf to set the prototype of the instance to match the original Error class
    Reflect.setPrototypeOf(this, AppError.prototype)
    Error.captureStackTrace(this, this.constructor)
  }
}

export default AppError
