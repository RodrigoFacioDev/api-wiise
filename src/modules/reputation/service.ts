import { db } from '../../db/index.js';
import { users, reputationEvents } from '../../db/schema/index.js';
import { eq } from 'drizzle-orm';
import { AppError } from '../../shared/errors/AppError.js';

export async function recalculateReputation(userId: string) {
  const userList = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const user = userList[0];
  if (!user) throw new AppError('User not found', 'USER_NOT_FOUND', 404);
  
  let newLevel: 'bronze' | 'silver' | 'gold' = 'bronze';
  if (user.reputationScore >= 300) newLevel = 'gold';
  else if (user.reputationScore >= 100) newLevel = 'silver';

  if (newLevel !== user.reputationLevel) {
    await db.update(users).set({ reputationLevel: newLevel }).where(eq(users.id, userId));
  }
}

export async function awardReputation(userId: string, type: 'event_completed' | 'contribution_delivered' | 'impact_validated' | 'no_show', points: number, reservationId?: string) {
  await db.insert(reputationEvents).values({
    userId, type, points, reservationId
  });

  const userList = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const user = userList[0];
  const newScore = user.reputationScore + points;

  await db.update(users).set({ reputationScore: newScore }).where(eq(users.id, userId));
  await recalculateReputation(userId);
}
