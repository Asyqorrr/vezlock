import { z } from 'zod';

export const UserSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    authHash: z.string(),
    vaultSalt: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

export const VaultEntrySchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    title: z.string(),
    cipher: z.string(), // Encrypted JSON blob
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type VaultEntry = z.infer<typeof VaultEntrySchema>;
