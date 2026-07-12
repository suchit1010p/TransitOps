import dotenv from "dotenv";
import path from "path";

if (process.env.NODE_ENV !== "production") {
    const envPath = path.join(process.cwd(), ".env");
    dotenv.config({ path: envPath });
}

export default process.env;