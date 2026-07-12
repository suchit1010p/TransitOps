import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { getDoctorById } from "../repositories/doctor.Repository.js"


export const verifyDoctorJWT = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        // console.log(token);
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const doctor = await getDoctorById(decodedToken?.id)
    
        if (!doctor) {
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.doctor = doctor;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
}