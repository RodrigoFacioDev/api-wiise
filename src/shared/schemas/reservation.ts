import { z } from 'zod';

export const createReservationSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  usageType: z.enum(['course', 'social_event', 'content_recording']),
  eventTitle: z.string().min(3),
  eventDescription: z.string().min(10),
  contributionType: z.enum(['donation', 'time_impact', 'content_impact']),
  contributionSubtype: z.string().min(2),
  contributionQuantity: z.number().positive(),
  contributionUnit: z.string().min(2),
  impactCategoryId: z.string().uuid()
});

export const updateReservationStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'completed', 'cancelled'])
});
