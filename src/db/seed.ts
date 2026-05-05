import { db } from './index.js';
import { users, reservations, contributions, impactCategories, reservationImpacts } from './schema/index.js';
import crypto from 'crypto';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function seed() {
  console.log('Starting seed...');

  // 1. Impact Categories
  const categories = await db.insert(impactCategories).values([
    { name: 'food', label: 'Food Security' },
    { name: 'education', label: 'Education & Training' },
    { name: 'community', label: 'Community Support' }
  ]).returning();

  const foodCat = categories.find(c => c.name === 'food')!;
  const eduCat = categories.find(c => c.name === 'education')!;

  // 2. Users (1 admin, 3 users)
  const usersCreated = await db.insert(users).values([
    { name: 'Admin', email: 'admin@impacthub.com', passwordHash: hashPassword('admin123'), role: 'admin' },
    { name: 'User 1', email: 'user1@example.com', passwordHash: hashPassword('user123'), role: 'user', reputationScore: 120, reputationLevel: 'silver' },
    { name: 'User 2', email: 'user2@example.com', passwordHash: hashPassword('user123'), role: 'user', reputationScore: 50, reputationLevel: 'bronze' },
    { name: 'User 3', email: 'user3@example.com', passwordHash: hashPassword('user123'), role: 'user', reputationScore: -10, reputationLevel: 'bronze' }, // Low score to test block
  ]).returning();

  const u1 = usersCreated[1];
  const u2 = usersCreated[2];

  // 3. Reservations
  const date = new Date();
  const nextDate = new Date();
  nextDate.setDate(date.getDate() + 1);

  const resList = await db.insert(reservations).values([
    { userId: u1.id, startDate: date, endDate: nextDate, usageType: 'course', eventTitle: 'Programming 101', eventDescription: 'Free coding course', estimatedValue: '1000', status: 'approved' },
    { userId: u1.id, startDate: date, endDate: nextDate, usageType: 'social_event', eventTitle: 'Community Meeting', eventDescription: 'Discussing local issues', estimatedValue: '1000', status: 'pending' },
    { userId: u2.id, startDate: date, endDate: nextDate, usageType: 'content_recording', eventTitle: 'Podcast Rec', eventDescription: 'Recording impact podcast', estimatedValue: '1000', status: 'completed' },
    { userId: u2.id, startDate: date, endDate: nextDate, usageType: 'course', eventTitle: 'Math 101', eventDescription: 'Basic math', estimatedValue: '1000', status: 'rejected' },
    { userId: u2.id, startDate: date, endDate: nextDate, usageType: 'social_event', eventTitle: 'Food Distribution', eventDescription: 'Giving food to homeless', estimatedValue: '2000', status: 'completed' },
  ]).returning();

  // 4. Contributions and Impacts
  await db.insert(contributions).values([
    { reservationId: resList[0].id, type: 'time_impact', subtype: 'aula_gratuita', quantity: '4', unit: 'hours', equivalentValue: '1000', status: 'pending' },
    { reservationId: resList[1].id, type: 'donation', subtype: 'cestas_basicas', quantity: '10', unit: 'units', equivalentValue: '1000', status: 'pending' },
    { reservationId: resList[2].id, type: 'content_impact', subtype: 'video_educativo', quantity: '5', unit: 'videos', equivalentValue: '1000', status: 'validated' },
    { reservationId: resList[3].id, type: 'time_impact', subtype: 'aula_gratuita', quantity: '4', unit: 'hours', equivalentValue: '1000', status: 'pending' },
    { reservationId: resList[4].id, type: 'donation', subtype: 'cestas_basicas', quantity: '20', unit: 'units', equivalentValue: '2000', status: 'validated' },
  ]);

  await db.insert(reservationImpacts).values([
    { reservationId: resList[0].id, impactCategoryId: eduCat.id },
    { reservationId: resList[1].id, impactCategoryId: foodCat.id },
    { reservationId: resList[2].id, impactCategoryId: eduCat.id },
    { reservationId: resList[3].id, impactCategoryId: eduCat.id },
    { reservationId: resList[4].id, impactCategoryId: foodCat.id },
  ]);

  console.log('Seed completed successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
