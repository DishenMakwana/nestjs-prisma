import { actionSeed } from './actions';
import { adminSeed } from './admin';

const seed = async () => {
  await actionSeed();
  await adminSeed();
};

seed();
