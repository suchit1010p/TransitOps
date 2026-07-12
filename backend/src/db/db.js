import { neon } from "@neondatabase/serverless"

export const sql = neon(process.env.DATABASE_URL);

const connectDB = async () => {
    try {
        const result = await sql`SELECT version()`;
        if(result) {
            console.log("\nPostgreSQL is connected....!!")
        }
    } catch (error) {
        console.log(`PostgreSQL connection error: \n ${error}`)
        throw error
    }
}

export default connectDB