// By using `data-qa` selectors, we can separate
// CSS selectors used for styling from those used
// exclusively for testing our application.
// See: https://docs.cypress.io/guides/references/best-practices.html#Selecting-Elements

describe('The Institutions Page', () => {
  beforeEach(() => {
    cy.login('e.meesters@picturae.com', 'Qwerty123');
    cy.visit('/institutions');
  });

  afterEach(() => {
    cy.logout();
  });

  it('successfully loads the institutions page', () => {
    cy.get('[data-cy=table]').should('be.visible');
  });

  it('successfully selects the first institution', () => {
    cy.get('[data-cy=table]').should('be.visible');
    cy.get('[data-cy=table] tbody tr').first().click();
    cy.url().should('include', '/grid');
  });
});
