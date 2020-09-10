// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @system_console

import * as TIMEOUTS from '../../../fixtures/timeouts';

describe('Customization', () => {
    beforeEach(() => {
        // # as many of the tests logout the user, ensure it's logged
        // in as an admin before each test
        cy.apiAdminLogin();

        // # Visit customization system console page
        cy.visit('/admin_console/site_config/customization');
        cy.get('.admin-console__header').should('be.visible').and('have.text', 'Customization');
    });

    it('MM-T1024 - Can change name and desc with Custom Branding set to false', () => {
        // # Make sure necessary field is false
        cy.apiUpdateConfig({TeamSettings: {EnableCustomBrand: false}});
        cy.reload();

        // * Verify that setting is visible and matches text content
        cy.findByTestId('TeamSettings.SiteNamelabel').scrollIntoView().should('be.visible').and('have.text', 'Site Name:');

        // # Update both Site Name and Description to store test values
        const siteName = 'Mattermost_Text';
        const siteDescription = 'This is a testing Mattermost site';
        cy.findByTestId('TeamSettings.SiteNameinput').clear().type(siteName);
        cy.findByTestId('TeamSettings.CustomDescriptionTextinput').clear().type(siteDescription);

        // # Save setting
        saveSetting();

        // # Logout
        cy.apiLogout();

        // * Ensure that the user was redirected to the login page after the logout
        cy.url().should('include', '/login');

        // * Ensure Site Name and Description are shown the updated values in the login screen
        cy.get('#site_name').should('have.text', siteName);
        cy.get('#site_description').should('have.text', siteDescription);
    });

    it('MM-T1028 - Custom brand image and text - true, and uploaded / updated', () => {
        // # Make sure necessary field is false
        cy.apiUpdateConfig({TeamSettings: {EnableCustomBrand: false}});

        // # Ensure that the brand image is deleted
        cy.apiDeleteBrandImage();
        cy.reload();

        // # Enable custom branding
        cy.findByTestId('TeamSettings.EnableCustomBrandtrue').check();

        // # Upload the image
        cy.findByTestId('CustomBrandImage').should('be.visible').within(() => {
            cy.get('input').attachFile('mattermost-icon.png');
        });

        // * Verify that custom brand image setting is visible and matches text content
        cy.findByTestId('TeamSettings.CustomBrandTextlabel').scrollIntoView().should('be.visible').and('have.text', 'Custom Brand Text:');

        // # Update custom brand text
        const customBrandText = 'This is a custom brand text';
        cy.findByTestId('TeamSettings.CustomBrandTextinput').clear().type(customBrandText);

        // # Save setting
        saveSetting();

        // # Logout from the current user
        cy.apiLogout();

        // * Ensure that the user was redirected to the login page after the logout
        cy.url().should('include', '/login');

        cy.get('.signup__markdown').within(() => {
            // * Ensure that the signup is loaded and the img is visible
            cy.get('img').should('be.visible');

            // * Ensure that the custom brand text has been updated
            cy.get('p').should('have.text', customBrandText);
        });
    });
});

function saveSetting() {
    // # Click save button, and verify text and visibility
    cy.get('#saveSetting').
        should('have.text', 'Save').
        and('be.enabled').
        click().
        should('be.disabled').
        wait(TIMEOUTS.HALF_SEC);
}
