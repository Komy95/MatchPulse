import { z } from "zod";

const predictionInputSchema = z.object({
  matchId: z.string().trim().min(1),
  homeGoals: z.number().int().min(0).max(20),
  awayGoals: z.number().int().min(0).max(20),
  booster: z.boolean().default(false),
});

export const bulkPredictionSchema = z.object({
  predictions: z
    .array(predictionInputSchema)
    .min(1)
    .max(64)
    .superRefine((predictions, context) => {
      const seen = new Set<string>();

      predictions.forEach((prediction, index) => {
        if (seen.has(prediction.matchId)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: [index, "matchId"],
            message: "Duplicate match prediction in request.",
          });
        }

        seen.add(prediction.matchId);
      });
    }),
});

export type BulkPredictionInput = z.infer<typeof bulkPredictionSchema>;
