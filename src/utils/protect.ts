interface User {
  // Define the properties of your user object here
  deleted: boolean
  blocked: boolean
  verified: boolean
}

interface ApiResponse {
  status: number
  error: boolean
  message: string
  data: any // Update the type based on your data structure
}

const checkUserStatus = async (user: User): Promise<ApiResponse> => {
  if (!user) {
    return {
      status: 400,
      error: true,
      message: 'User not found. Token error',
      data: null,
    }
  }

  if (user.deleted) {
    return {
      status: 400,
      error: true,
      message: 'Account is deleted.',
      data: null,
    }
  }

  if (user.blocked) {
    return {
      status: 400,
      error: true,
      message: 'Account is blocked.',
      data: null,
    }
  }

  if (!user.verified) {
    return {
      status: 400,
      error: true,
      message: 'Account is not verified.',
      data: null,
    }
  }

  return {
    error: false,
    status: 200,
    message: 'account verified',
    data: null,
  }
}

export default checkUserStatus
