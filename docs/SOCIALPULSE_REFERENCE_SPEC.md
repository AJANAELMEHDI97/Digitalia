# SocialPulse Reference Spec

## Objective

Build the local application in `Digitalia-clone` so it behaves like the real
`app.socialpulse.pro` product, without relying on the private production
backend. The real application is the product reference. The local repository is
the implementation workspace.

## Product reasoning

- The public frontend of the real app can be observed.
- The private backend cannot be recovered as source code.
- The local backend must therefore be rebuilt so that its behavior matches the
  real product as closely as possible.
- The zip provided by the manager is useful as a UI and feature reference, but
  the final reasoning must follow the real SocialPulse product.

## Core roles

### `super_admin`

- Full platform control
- Can create users
- Can manage roles
- Can supervise organizations and global settings
- Can simulate other views for support or supervision

### `community_manager`

- Creates content
- Plans publications
- Submits content for validation
- Manages editorial workflow

### `lawyer`

- Reviews and validates content
- Rejects or requests changes
- Publishes approved content
- Monitors visibility, compliance and cabinet-level performance

## Permission baseline

### `super_admin`

- Access admin area
- Access user management
- Create user accounts
- Change user roles
- View all organizations
- Manage platform settings

### `community_manager`

- Access editorial workspace
- Create and edit content
- Use calendar
- Use media, blog, emailing and Google Business modules when enabled
- Cannot create users
- Cannot access platform admin area

### `lawyer`

- Access cabinet workspace
- Review and validate publications
- Publish approved items
- Access metrics, calendar, media, blog and Google Business modules when enabled
- Cannot create users
- Cannot access platform admin area

## Backend rules to mirror

1. The backend stores canonical roles:
   - `super_admin`
   - `community_manager`
   - `lawyer`
2. Legacy roles must be normalized:
   - `admin` -> `super_admin`
   - `editor` -> `community_manager`
   - `reader` -> `lawyer`
3. User management routes must be restricted to `super_admin`.
4. The local frontend may keep a simplified UI role layer, but it must map to
   the canonical backend roles correctly.

## User stories to drive implementation

### Super Admin

- As a Super Admin, I want to create user accounts so that I can onboard new
  team members.
- As a Super Admin, I want to assign a role to each user so that access matches
  operational responsibilities.
- As a Super Admin, I want to review all users in one place so that I can
  supervise platform usage.

### Community Manager

- As a Community Manager, I want to create a publication so that I can prepare
  editorial content for a cabinet.
- As a Community Manager, I want to submit a post for validation so that a
  lawyer can approve it before publication.

### Lawyer

- As a Lawyer, I want to review pending publications so that I can approve,
  reject or request modifications before a post goes live.
- As a Lawyer, I want to access Google Business and visibility modules so that I
  can monitor my online reputation.

## Immediate implementation order

1. Role normalization in the backend
2. Super Admin-only user management routes
3. Frontend user creation connected to the local backend
4. UI labels aligned with `Super Admin / Community Manager / Avocat`
5. Module-by-module refinement against the real SocialPulse product
