import { createRefreshTokenForDoctor, createRefreshTokenForPatient } from "../repositories/auth.Repository.js";
import { getDoctorById } from "../repositories/doctor.Repository.js";
import { getPatientById } from "../repositories/patient.Repository.js";
import { ApiError } from "./ApiError.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefereshTokensForPatient = async (patientId) => {
    try {
        const patient = await getPatientById(patientId);

        if(!patient) {
            throw new ApiError(404, "patient not found")
        }

        const accessToken = await generateAccesstoken(patient, "patient")
        const refreshToken = await generateRefreshtoken(patient, "patient")
        const expiresAt = getExpiryTimestamp(process.env.REFRESH_TOKEN_EXPIRY)

        await createRefreshTokenForPatient(patientId, refreshToken, expiresAt)
        
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Token generation failed");
    }
}


const generateAccessAndRefereshTokensForDoctor = async (doctorId) => {
    try {
        const doctor = await getDoctorById(doctorId);

        if(!doctor) {
            throw new ApiError(404, "patient not found")
        }

        const accessToken = await generateAccesstoken(doctor, "doctor")
        const refreshToken = await generateRefreshtoken(doctor, "doctor")
        const expiresAt = getExpiryTimestamp(process.env.REFRESH_TOKEN_EXPIRY)

        const refresh = await createRefreshTokenForDoctor(doctorId, refreshToken, expiresAt)
        
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Token generation failed");
    }
}

const generateAccesstoken = async (user, role) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: role
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

const generateRefreshtoken = async (user, role) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: role
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

const getExpiryTimestamp = (expiryValue) => {
    if (!expiryValue) throw new ApiError(500, "Refresh token expiry value is not configured");

    const date = new Date(/^(\d+)d$/i.test(expiryValue)
        ? Date.now() + parseInt(expiryValue, 10) * 86400000
        : expiryValue);

    if (Number.isNaN(date.getTime())) throw new ApiError(500, "Invalid refresh token expiry timestamp");
    return date.toISOString().replace("T", " ").replace("Z", "");
};

export { generateAccessAndRefereshTokensForDoctor, generateAccessAndRefereshTokensForPatient }