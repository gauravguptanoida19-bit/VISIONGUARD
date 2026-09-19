import { initializeDatabase, StorageRepository } from '../repositories/storage';
import { SEED_CAMERAS, SEED_INCIDENTS, SEED_USERS } from './seedData';

async function runSeed() {
  console.log('🌱 Seeding VisionGuard Database...');
  await initializeDatabase();

  for (const user of SEED_USERS) {
    const existing = await StorageRepository.getUserByEmail(user.email);
    if (!existing) {
      await StorageRepository.createUser(user);
    }
  }

  for (const camera of SEED_CAMERAS) {
    const existing = await StorageRepository.getCameraById(camera.id);
    if (!existing) {
      await StorageRepository.createCamera(camera);
    }
  }

  for (const incident of SEED_INCIDENTS) {
    const existing = await StorageRepository.getIncidentById(incident.id);
    if (!existing) {
      await StorageRepository.createIncident(incident);
    }
  }

  console.log('✅ VisionGuard Database successfully seeded with 8 cameras, 20+ incidents, and 3 default role accounts!');
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
