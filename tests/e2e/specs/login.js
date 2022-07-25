// By using `data-qa` selectors, we can separate
// CSS selectors used for styling from those used
// exclusively for testing our application.
// See: https://docs.cypress.io/guides/references/best-practices.html#Selecting-Elements

describe('Login to Elvis', () => {
  it('should be possible to login', () => {
    cy.visit('/');
    cy.get('[data-cy=login-btn]').should('be.visible');
    cy.get('[data-cy=login-btn]').click();
    cy.get('[data-cy=email-address]').type('e.meesters@picturae.com');
    cy.get('[data-cy=password]').type('Qwerty123');
    cy.get('[data-cy=login-submit]').click();
    cy.get('[data-cy=profile]').should('be.visible');
  });
});
