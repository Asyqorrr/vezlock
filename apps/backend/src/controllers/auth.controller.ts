import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { z } from 'zod';

const registerSchema = z.object({
    email: z.string().email(),
    authHash: z.string(),
    authSalt: z.string(),
    vaultSalt: z.string(),
});

const loginSchema = z.object({
    email: z.string().email(),
    authHash: z.string(),
});

export const register = async (req: Request, res: Response) => {
    try {
        const validatedData = registerSchema.parse(req.body);

        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email },
        });

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Note: In Zero-Knowledge, the client hashes the password.
        // We hash it again on the server for defense-in-depth.
        const serverHash = await bcrypt.hash(validatedData.authHash, 10);

        const user = await prisma.user.create({
            data: {
                email: validatedData.email,
                authHash: serverHash,
                authSalt: validatedData.authSalt,
                vaultSalt: validatedData.vaultSalt,
            },
        });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const validatedData = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({
            where: { email: validatedData.email },
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(validatedData.authHash, user.authHash);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                authSalt: user.authSalt,
                vaultSalt: user.vaultSalt,
            },
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: error.message });
    }
};

export const preLogin = async (req: Request, res: Response) => {
    try {
        const { email } = z.object({ email: z.string().email() }).parse(req.body);

        const user = await prisma.user.findUnique({
            where: { email },
            select: { authSalt: true, vaultSalt: true },
        });

        if (user) {
            return res.json(user);
        }

        // --- Deterministic Fake Salt Generation ---
        const seed = process.env.SALT_SEED || 'default-secret-seed';
        const crypto = require('crypto');

        const generateFakeSalt = (purpose: string) => {
            return crypto
                .createHmac('sha256', seed)
                .update(`${email}:${purpose}`)
                .digest('hex')
                .substring(0, 32);
        };

        res.json({
            authSalt: generateFakeSalt('auth'),
            vaultSalt: generateFakeSalt('vault'),
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: error.message });
    }
};
