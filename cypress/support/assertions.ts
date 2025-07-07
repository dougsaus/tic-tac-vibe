// Explicitly import Chai types and create our own expect
import { expect as chaiExpect } from 'chai';

// Re-export for use in tests
export const expect = chaiExpect;

// Also make it available globally for Cypress
(globalThis as any).expect = chaiExpect;