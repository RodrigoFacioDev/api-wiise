import { db } from '../src/db/index.js';
import { users, reservations, contributions, reservationImpacts, impactCategories } from '../src/db/schema/index.js';

async function seed() {
  console.log('🌱 Seeding 10 reservations...');

  // 1. Get a user and a category
  const userList = await db.select().from(users).limit(1);
  const categoryList = await db.select().from(impactCategories).limit(1);

  if (userList.length === 0 || categoryList.length === 0) {
    console.error('❌ Error: No users or categories found in database. Please register a user first.');
    process.exit(1);
  }

  const user = userList[0];
  const category = categoryList[0];

  const titles = [
    'Workshop de React', 'Encontro de Design', 'Gravação de Podcast', 
    'Aula de Yoga Social', 'Mentoria de Carreira', 'Reunião Comunitária',
    'Palestra sobre Sustentabilidade', 'Curso de Culinária', 'Evento de Networking',
    'Oficina de Artesanato'
  ];

  for (let i = 0; i < 10; i++) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + i + 1);
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 2);

    const [res] = await db.insert(reservations).values({
      userId: user.id,
      startDate,
      endDate,
      usageType: i % 2 === 0 ? 'course' : 'social_event',
      eventTitle: titles[i],
      eventDescription: `Descrição detalhada para o evento ${titles[i]} que acontecerá em breve.`,
      estimatedValue: '1000',
      status: i < 3 ? 'pending' : 'approved' // Algumas pendentes, outras aprovadas
    }).returning();

    await db.insert(contributions).values({
      reservationId: res.id,
      type: 'donation',
      subtype: 'cestas_basicas',
      quantity: '10',
      unit: 'unidades',
      equivalentValue: '1000'
    });

    await db.insert(reservationImpacts).values({
      reservationId: res.id,
      impactCategoryId: category.id
    });

    console.log(`✅ Created: ${titles[i]}`);
  }

  console.log('✨ Seed finished successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
