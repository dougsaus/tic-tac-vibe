/// <reference types="cypress" />

declare namespace Chai {
  interface Assertion {
    (target: any, message?: string): Assertion;
  }
}

// Explicitly declare the expect function for Cypress
declare const expect: Chai.ExpectStatic;

// Ensure we don't pick up Jest types in Cypress files
declare global {
  namespace jest {
    // @ts-ignore - Hide Jest matchers in Cypress context
    interface Matchers<R> {}
  }
}