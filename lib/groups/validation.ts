import { z } from "zod";

export const createGroupSchema = z.object({
  name: z.string().trim().min(1, "Group name is required.").max(80),
});

export const createInviteSchema = z.object({
  refresh: z.boolean().optional(),
});

export const joinGroupSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Invite code is required.")
    .transform((value) => value.toUpperCase().replace(/[^A-Z0-9]/g, "")),
});
