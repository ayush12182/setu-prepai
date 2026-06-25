import { PHYSICS_CURRICULUM } from './physics';
import { CHEMISTRY_CURRICULUM } from './chemistry';
import { MATHEMATICS_CURRICULUM } from './mathematics';
import { BIOLOGY_CURRICULUM } from './biology';

export * from './physics/index';
export * from './chemistry/index';
export * from './mathematics/index';
export * from './biology/index';

export const UNIVERSAL_CURRICULUM_GRAPH = {
  physics: PHYSICS_CURRICULUM,
  chemistry: CHEMISTRY_CURRICULUM,
  mathematics: MATHEMATICS_CURRICULUM,
  biology: BIOLOGY_CURRICULUM
};
