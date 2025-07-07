/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    // Add any custom commands here if needed
  }
}

// Ensure we're using Chai's expect, not Jest's
declare const expect: Chai.ExpectStatic;