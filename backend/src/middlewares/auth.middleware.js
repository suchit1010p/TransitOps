import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js"
import { ROLES } from "../utils/roles.js"

// General middleware for any authenticated user with a valid role (Used for GET requests)
export const verifyAuth = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const validRoles = Object.values(ROLES)

        // Also support potential unspaced role formats just in case
        const validRolesUnspaced = validRoles.map(r => r.replace(" ", ""));

        if (!validRoles.includes(decodedToken?.role) && !validRolesUnspaced.includes(decodedToken?.role)) {
            throw new ApiError(403, "Access denied. Valid role required.")
        }

        req.user = decodedToken;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
}

// Smart middleware for role-specific access (Used for POST/PUT/DELETE requests)
export const verifyRole = (requiredRole) => {
    return async (req, res, next) => {
        try {
            const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

            if (!token) {
                throw new ApiError(401, "Unauthorized request")
            }

            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

            if (decodedToken?.role !== requiredRole && decodedToken?.role !== requiredRole.replace(" ", "")) {
                throw new ApiError(403, `Access denied. You must be a ${requiredRole}.`)
            }

            req.user = decodedToken;
            next()
        } catch (error) {
            throw new ApiError(401, error?.message || "Invalid access token")
        }
    }
}
