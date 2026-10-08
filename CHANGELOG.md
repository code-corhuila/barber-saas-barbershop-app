# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-10-08

User stories: code-corhuila/barber-saas-docs#4, code-corhuila/barber-saas-docs#59, code-corhuila/barber-saas-docs#67, code-corhuila/barber-saas-docs#76

### Added

- **federation:** build the remote with native federation exposing ./mount
- **app:** copy the types of the contract with the shell
- **federation:** mount the app in the element the shell provides
- **catalog:** add the types of barbershop-service.yaml
- **catalog:** call barbershop-api only through the shell client
- **catalog:** show prices in pesos and send them in cents
- **catalog:** check the forms with the limits of the contract
- **navigation:** add the routes of the domain and the hand-over to booking
- **ui:** show loading, error with retry, empty and data in every view
- **ui:** search barbershops near the client or by city
- **ui:** show a barbershop with its services and barbers and hand over to booking
- **navigation:** route between search and detail and follow the back button
- **ui:** add a labelled field whose error is tied to it
- **ui:** create and edit a service with one idempotency key per intent
- **ui:** list the owner's services and activate or deactivate them
- **navigation:** give the owner tabs for services and the catalog
- **ui:** create and edit a barber profile for an existing barber user
- **ui:** list the owner's barbers and manage their specialties
- **navigation:** add the barbers tab for the owner
- **deploy:** serve the built remote for development and review
- **team:** add a barber with its account first and retry only the profile
- **ui:** add barbers from the team screen with an initial password
- **catalog:** read the barber's name with a spanish fallback
- **ui:** show the barber's name in the team and the public catalog
- **app:** copy the shell's enterBarbershop and barbershopId into the contract

### Fixed

- **ui:** show the selected tab in gold so it stays readable
- **ui:** give the owner's section the title Mi barbería
- **ui:** set the new specialty field apart from the barber card

### Documentation

- **readme:** explain the barbershop app, how to run it with the shell and how to test it
- **readme:** explain adding a barber and what is still missing
- **readme:** drop the missing barber names
- **readme:** point the header to Barber Saas and barber-saas-docs

### Tests

- **ci:** run the tests, check the types and build the remote on every pull request
- **catalog:** specify the api calls, the forms, money and the routes
- **ui:** specify the error message shown and the idempotency keys
- **team:** specify adding a barber with an account first and a retried profile
- **catalog:** specify the barber name and its fallback

### Maintenance

- **app:** ignore dependencies, build output and env files
- **github:** add the pull request template
- **github:** track the story environment on the board
- **build:** add ionic react 8, react 19 and typescript with the shell's versions
- **ui:** keep the dark and gold look of the prototype
- use the new repository name barber-saas-infra-postgres

[2.0.0]: https://github.com/code-corhuila/barber-saas-barbershop-app/releases/tag/v2.0.0
