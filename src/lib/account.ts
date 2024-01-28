/**
 * @description      : Account manager
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
import mongoose from 'mongoose'
import 'colors'
// Define the ACCOUNT class
class ACCOUNT {
  USER: {
    url: string
    name: string
    password: string
  }

  mongo_url: string

  constructor() {
    // Initialize the USER object with default values
    this.USER = {
      url: process.env.MONGO_URL || '',
      name: process.env.MONGO_USERNAME || '',
      password: process.env.MONGO_PASSWORD || '',
    }

    // Replace the placeholders in the MongoDB URL with USER's name and password
    this.mongo_url = this.USER.url
      .replace('<username>', this.USER.name)
      .replace('<password>', this.USER.password)
  }

  // Method to connect to the MongoDB database
  async connect(): Promise<void> {
    try {
      // Connect to the MongoDB database using the constructed URL
      await mongoose.connect(this.mongo_url, {}).then(() => {
        console.log(
          `Connected To Mongodb Database ${mongoose.connection.host}`.bgMagenta
            .white,
        )
        mongoose.set('strictQuery', true)
      })
    } catch (error) {
      console.log(`Mongodb Database Error ${error}`.bgRed.white)
      // Handle any connection error by throwing it
      throw error
    }
  }
}

// Export the ACCOUNT class to make it available for use in other parts of the application
async function main(): Promise<void> {
  await new ACCOUNT().connect()
}

// Call the main function to initiate the connection
main()

export default main
