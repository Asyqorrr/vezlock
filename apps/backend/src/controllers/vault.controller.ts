import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../lib/prisma';
import { z } from 'zod';

const vaultEntrySchema = z.object({
    title: z.string(),
    username: z.string(),
    cipher: z.string(),
    note: z.string().optional(),
});

export const createEntry = async (req: AuthRequest, res: Response) => {
    try {
        const validatedData = vaultEntrySchema.parse(req.body);
        const userId = req.user?.userId;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const entry = await prisma.vaultEntry.create({
            data: {
                ...validatedData,
                userId,
            },
        });

        res.status(201).json(entry);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: error.message });
    }
};

export const getEntries = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const entries = await prisma.vaultEntry.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        res.json(entries);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteEntry = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const entry = await prisma.vaultEntry.findUnique({
            where: { id },
        });

        if (!entry || entry.userId !== userId) {
            return res.status(404).json({ error: 'Entry not found' });
        }

        await prisma.vaultEntry.delete({
            where: { id },
        });

        res.json({ message: 'Entry deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
