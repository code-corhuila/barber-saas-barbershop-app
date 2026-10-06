# barber-saas-barbershop-app

> barbershop bounded context: mobile UI (remote)

Part of the **Barber Saas** distributed system — team `barber-saas`, Grupo 2.
Governance and documentation live in [`barber-saas-docs`](https://github.com/code-corhuila/barber-saas-docs).

## Branching

Three permanent branches. **None of them accepts a direct commit** — you enter through a child
branch and leave through a Pull Request.

```
develop  <--PR--  feat/... fix/... chore/...
qa       <--PR--  qa/...
main     <--PR--  release/...  hotfix/...
```

Promotion happens **by re-application** (`git cherry-pick -x`), never by merging one permanent
branch into another: `merge develop -> qa` and `merge qa -> main` do not exist in this model.

`main` requires **1 approval from `ariel5253`**. On `develop` and `qa` the team sets its own review
rule.

Full policy: `00-governance/branching-policy.md` in `barber-saas-docs`.

---

## BarberSaaS — what this repository is

The barbershop screens of BarberSaaS: an **Ionic React** domain app (ADR-013) mounted by the
Angular shell (`barber-saas-front`) at `/barbershops`. It exposes only `./mount` through Native
Federation and shares nothing: it receives the shell's HTTP client and session in the mount
context, so it never creates a client or stores a token itself (norm 5.4.1). Screens ported from
the prototype (`(client)/home`, `(client)/barbershop/[id]`, `(admin)/services`, `(admin)/employees`):
same dark and gold look, Ionic components.

| Screen | Who | Calls (`barbershop-service.yaml`) |
|---|---|---|
| Search: near the client or by city | anyone signed in | `GET /api/v1/barbershops` |
| Detail: services, barbers, *Continuar* to booking | anyone signed in | `GET /api/v1/barbershops/{id}`, `/services`, `/barbers` |
| Services: create, edit, activate / deactivate | `ADMIN_BARBERSHOP` | `/api/v1/services` |
| Barbers: profiles and specialties | `ADMIN_BARBERSHOP` | `/api/v1/barbers` |
| Barbers: *Agregar barbero* (name, e-mail, phone, initial password) | `ADMIN_BARBERSHOP` | `POST /api/v1/auth/barbers` (`auth-service.yaml`), then `POST /api/v1/barbers` |

```
src/mount.tsx              ./mount(element, context) — what the shell calls
src/shell-contract.ts      the types of the contract with the shell (copied, never imported)
src/catalog/               typed calls through context.api, forms with the contract's limits, money in cents
src/navigation/routes.ts   the routes inside /barbershops and the hand-over to booking
src/pages/                 SearchPage, DetailPage, ServicesPage, BarbersPage and their forms
src/ui/                    the four states of every view, fields, styles
```

Every view shows its four states (loading, error with retry, empty, data); API errors show the
`userMessage` the shell decided. Every creation carries an `Idempotency-Key` kept while the same
form is retried.

### How to start it

```bash
npm ci
npm start      # builds and serves dist/barbershop at http://localhost:4302 (CORS on)
```

Then start the shell (`npm start` in `barber-saas-front`) and the platform (`./scripts/up.sh dev`
in `barber-saas-infra-postgres`), and open `/barbershops`. The gateway accepts the shell's origins
`http://localhost:4200` and `http://localhost:8100`.

### Where the data is

Nowhere in this app: barbershops, services and barbers live in the `barbershop` schema
(`barbershop-api`), the session in the shell.

### How it is tested

`npm test` (Vitest): the calls to the API, the forms, money, the routes and the error messages.
CI also checks the types and builds the remote. Seen in the browser mounted by the shell, with the
owner's services read from `barbershop-api` through the gateway.

### What is missing

- **Booking.** *Continuar* hands over to `/appointments/new?barbershopId=…&serviceId=…`; the
  address must be agreed with `appointment-app`.
- **An account left without a profile.** If the profile fails and the owner closes the form instead
  of retrying, the account exists in identity-auth without a profile (clients do not see it); there
  is no screen yet to finish it later.
- **Editing my barbershop** (`PATCH /api/v1/barbershops/me`) has no screen yet.
- **Reviews, favourites, gallery and promotions** of the prototype are out of scope
  (`06-data/models.md` §11).
