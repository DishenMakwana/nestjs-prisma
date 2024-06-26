import { actionSeed } from './actions';
import { adminSeed } from './admin';

const seed = async () => {
  await actionSeed();
  await adminSeed();
};

(async () => {
  try {
    await seed();
    console.log('Seed successfully completed.');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed: ', error);
    process.exit(1);
  }
})();
