// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add('login', (email, password) => {
  Cypress.log({
    name: 'login',
    message: `${email} | ${password}`
  });

  cy.visit('/');
  cy.get('[data-cy=login-btn]').should('be.visible');
  cy.get('[data-cy=login-btn]').click();
  cy.get('[data-cy=email-address]').type(email);
  cy.get('[data-cy=password]').type(password);
  cy.get('[data-cy=login-submit]').click();
  cy.get('[data-cy=profile]').should('be.visible');
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-cy=profile]').should('be.visible');
  cy.get('[data-cy=profile]').click();
  cy.get('[data-cy=logout]').should('be.visible');
  cy.get('[data-cy=logout]').click();
  cy.get('[data-cy=login-btn]').should('be.visible');
});
