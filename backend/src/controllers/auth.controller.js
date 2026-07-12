import { ApiError } from "../utils/ApiError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sql } from "../db/db.js";
import { ROLES } from "../utils/roles.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const normalizeRole = (role) => {
    if (!role) return null;
    const cleanedRole = role.trim().toLowerCase();
    return Object.values(ROLES).find((validRole) => validRole.toLowerCase() === cleanedRole);
};

const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1h",
        }
    );
};

const updateLoginAttempts = async (userId, failedAttempts) => {
    await sql`
        UPDATE users
        SET failed_login_attempts = ${failedAttempts},
            last_login_attempt = ${new Date().toISOString()}
        WHERE id = ${userId}
    `;
};

const login = asyncHandler(async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        throw new ApiError(400, "Email, password and role are required.");
    }

    const normalizedRole = normalizeRole(role);
    if (!normalizedRole) {
        throw new ApiError(400, "Invalid role provided.");
    }

    const users = await sql`
        SELECT id, name, email, password_hash, role, status, failed_login_attempts, last_login_attempt
        FROM users
        WHERE email = ${email}
          AND role = ${normalizedRole}
    `;

    const user = users?.[0];
    if (!user) {
        throw new ApiError(401, "Invalid credentials.");
    }

    if (user.status !== "Active") {
        throw new ApiError(403, "Account is not active.");
    }

    const now = new Date();
    const failedAttempts = Number(user.failed_login_attempts || 0);
    const lastAttempt = user.last_login_attempt ? new Date(user.last_login_attempt) : null;

    if (failedAttempts >= 5 && lastAttempt) {
        const elapsedMs = now - lastAttempt;
        const lockoutMs = 24 * 60 * 60 * 1000;

        if (elapsedMs < lockoutMs) {
            throw new ApiError(429, "Too many failed login attempts. Please try again after 24 hours.");
        }

        await updateLoginAttempts(user.id, 0);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
        const nextFailedAttempts = failedAttempts + 1;
        await updateLoginAttempts(user.id, nextFailedAttempts);

        if (nextFailedAttempts >= 5) {
            throw new ApiError(429, "Too many failed login attempts. Please try again after 24 hours.");
        }

        throw new ApiError(401, "Invalid credentials.");
    }

    await updateLoginAttempts(user.id, 0);

    const accessToken = generateAccessToken(user);
    const responsePayload = {
        accessToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    };

    return res.status(200).json(new ApiResponse(200, responsePayload, "Login successful."));
});

const register = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        throw new ApiError(400, "Name, email, password and role are required.");
    }

    const normalizedRole = normalizeRole(role);
    if (!normalizedRole) {
        throw new ApiError(400, "Invalid role provided.");
    }

    const existingUser = await sql`
        SELECT id
        FROM users
        WHERE email = ${email}
    `;

    if (existingUser?.length) {
        throw new ApiError(409, "User already exists with this email.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [user] = await sql`
        INSERT INTO users (name, email, password_hash, role, status)
        VALUES (${name}, ${email}, ${hashedPassword}, ${normalizedRole}, 'Active')
        RETURNING id, name, email, role, status
    `;

    const accessToken = generateAccessToken(user);
    const responsePayload = {
        accessToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    };

    return res.status(201).json(new ApiResponse(201, responsePayload, "Registration successful."));
});

export { login, register };

