<!--
Cached raw source for the domain-model ingestion experiment.
See docs/domain-model-experiment.md for the full rationale.

Source: Confluence page "TS - Reference Domain Model - Domain Definitions"
Space: ARCH (Architecture)
Page ID: 1633976330
URL: https://tyropaymentsltd.atlassian.net/wiki/spaces/ARCH/pages/1633976330/TS+-+Reference+Domain+Model+-+Domain+Definitions
Page last modified (per Confluence, at cache time): 08 Apr, 2026
Cached: 2026-09-15

This is a verbatim cache of the page body at cache time. The lean domain
entities in components/kg-content/entities/domains.json deliberately do NOT
duplicate this full detail (JTBD, core data, invariants) inline — each
entity holds only a short purpose and short owns/not_authoritative_for
phrases, with relationships resolved against this file rather than a
transcription of it. When real use of the knowledge graph exposes a gap the
lean entity can't answer, compare against this file first; only re-query the
live Confluence page if this cache itself looks stale relative to it.

(Originally written against a since-superseded one-file-per-domain
structure at components/kg-content/entities/domains/ -- see
docs/domain-model-experiment.md's "Pivot" section. This note was updated
when that changed; the cached content below was not.)
-->

# Support & Experience Channels

## Customer Service & Support Domain

**Support Interaction, Case & Complaint Authority**

### Domain purpose

Provide Tyro’s authoritative capability for managing **customer support interactions** across the customer lifecycle, including:

- Support cases (incidents, service requests, troubleshooting)
- Complaints and dispute intake (non-scheme disputes; scheme chargebacks remain in Payments Processing)
- SLAs, queues, routing, and escalation
- Customer communications and resolution tracking
- Operational support knowledge capture (case-level)

This domain is the system of record for **support work and outcomes**, not for product configuration truth, transaction truth, or customer identity truth.

### Domain consumer personas & typical JTBD

- **Merchant / customer user** → “Get help; report an issue; track resolution.”
- **Support agent** → “Log, triage, diagnose, resolve, and communicate outcomes.”
- **Support team lead / operations** → “Manage queues, SLAs, capacity, and escalations.”
- **Specialist ops teams** (settlement, banking ops, fraud ops) → “Receive escalations with full context; provide resolution decisions.”
- **Product/platform teams** (indirect) → “Understand recurring issues; prioritise fixes; view incident impact.”
- **Compliance / risk** (indirect) → “Ensure complaints handling meets obligations.”

### Core data

- **Case record** (CaseID, type, severity, priority, category)
- **Customer context references** (CustomerID/UserID/MerchantID links; not master data)
- **Interaction timeline** (messages, calls, notes, attachments metadata)
- **Routing & assignment metadata** (queue, owner, escalation path)
- **SLA metrics** (response time, resolution time, breaches)
- **Complaint record** (ComplaintID, regulatory category, root cause, outcome)
- **Resolution artefacts** (actions taken, refunds/adjustments references, goodwill gestures references)
- **Knowledge capture references** (KB article links, runbooks used; not the KB itself unless you choose)

### Invariants

- Every support interaction that requires tracking has a CaseID.
- Case state transitions are deterministic and auditable.
- Customer/product “truth” is never edited here—only referenced.
- Complaints must meet retention and audit requirements.
- Support outcomes must link to the authoritative domain that executed the change (e.g., Payments Customer Configuration for config, Banking for ledger corrections).

### Capability authority

- **Case & complaint lifecycle management**
    - Create/triage/assign/escalate/resolve/close
    - Complaint intake and complaint resolution tracking
    - SLA tracking and breach management
- **Support routing and workforce workflows**
    - Queue management, skills-based routing, escalation rules
    - Ownership handoffs and collaboration workflows
- **Customer communication in the context of a case**
    - Case updates, status notifications, resolution messaging
    - Capture consent/preferences references (master preferences may live elsewhere)
- **Support diagnostics orchestration** *(not execution of product changes)*
    - Gather context from other domains via APIs
    - Trigger actions in authoritative domains (via tickets/tasks/events)
    - Record outcomes and references
- **Operational insight capture**
    - Categorisation/taxonomy of issues
    - Incident trend tagging and feedback loops to product/engineering

### Data authority

- Case records, complaint records, and their lifecycle state
- Interaction timeline and attachments metadata
- SLA metrics and routing/assignment metadata
- Resolution notes and references to authoritative actions taken

### Explicit non-authority (to keep boundaries clean)

- **Customer master, user identity, group hierarchy** → Customer & Identity
- **Merchant configuration (locations, enablement, terminal sharing groups)** → Payments Customer Configuration
- **Transaction truth, clearing, chargebacks lifecycle** → Payments Processing
- **Settlement batches and payout calculation** → Settlement & Reconciliation
- **Bank ledger entries and balances** → Banking Domain
- **Fraud decisions and compliance outcomes** → Fraud & Risk Decisioning / Risk, Compliance & Regulatory
- **Cross-domain workflow engines** (investigations, broader exceptions) → Operational Investigations & Exceptions (if kept separate)  
*(If you keep both domains, Support owns “customer support cases”; Case & Exception owns “operational exceptions/investigations”.)*

## Digital Channels & Experience Domain

**Digital Experience Composition & Channel Orchestration Authority**

### Domain purpose

Deliver Tyro’s **customer-facing digital experiences** (web, mobile, portals) by composing capabilities from authoritative domains into coherent journeys, including:

- Authentication/session handling (via Identity)
- Navigation and journey orchestration (onboarding, servicing, reporting)
- Presentation of product data and actions
- Channel-specific UX patterns and consistency

This domain owns the **experience layer and channel behaviour**, not the underlying product truth. It should be thin, API-driven, and orchestration-focused to support platformisation and reuse.

### Domain consumer personas & typical JTBD

- **Merchant owner/admin** → “Onboard, configure products, view reporting, manage users.”
- **Merchant staff/operator** → “Perform operational tasks quickly; view status and settlements.”
- **Enterprise head office** → “Manage multiple entities; view consolidated insights.”
- **Support agent** (internal channel) → “View customer context and perform assisted journeys.”
- **Product/design** → “Ship consistent experiences across channels.”
- **Engineering** → “Reuse patterns across apps; reduce duplicated logic.”

### Core data

- **Session and channel state** (sessions, navigation state, device context)
- **User preference and UI state** (saved views, dashboard layout preferences — channel-local)
- **Journey definitions** (step flows, content variants, feature flags)
- **Content and presentation models** (copy/templates references, UI config)
- **Telemetry and funnel metrics** (events, conversion tracking)
- **Cached read models** (non-authoritative, time-bounded cache for UX performance)

### Invariants

- This domain does not become a system of record for customers, merchants, transactions, or ledgers.
- All mutations of business state occur via authoritative domain APIs/events.
- Sensitive operations enforce Identity/RBAC and emit audit-relevant events (to appropriate domains).
- Journey logic is versioned and controlled (feature flags/rollouts).
- Channel state is disposable; source of truth is always downstream domains.

### Capability authority

- **Channel experience orchestration**
    - Compose end-to-end journeys spanning multiple domains
    - Present coherent workflows (e.g., manage users, enable products, configure settings)
    - Handle channel-specific UX differences (mobile vs web)
- **Session management & channel context**
    - Session and device context handling
    - Client-side state orchestration (where required)
- **Experience consistency & reusable UI patterns**
    - Shared components, design system implementation patterns
    - Cross-channel interaction standards (navigation, error handling, accessibility)
- **Telemetry & experimentation for experiences**
    - Funnel tracking, event instrumentation
    - Feature flagging and A/B experiments at UX layer
- **API composition layer (where needed)**
    - BFF (Backend-for-Frontend) patterns or orchestration gateways
    - Read-model shaping for UX (without owning truth)

### Data authority

- Session state and channel-local preferences
- Journey configuration and feature flag state (experience-level)
- UX telemetry/events (experience-level)
- Non-authoritative caches/read models for performance

### Explicit non-authority (to keep boundaries clean)

- **Authentication/identity master and RBAC truth** → Customer & Identity (experience consumes)
- **Merchant configuration truth** → Payments Customer Configuration
- **Payments runtime execution** → Payments Channel & Acceptance Runtime
- **Transaction truth & reporting truth** → Payments Processing / Settlement / Banking
- **Pricing and revenue policy** → Product Quoting & Pricing
- **Partner lifecycle** → Partner Ecosystem
- **Risk/compliance decisions** → Fraud & Risk Decisioning / Risk, Compliance & Regulatory
- **Notifications orchestration** (if separated) → Customer Notifications & Communications  
*(Digital Channels may display notifications; orchestration/dispatch is owned elsewhere.)*

## Payments Channels Domain

**Acceptance Runtime & Channel Execution Authority**

### Domain purpose

Provide and operate Tyro’s **payment acceptance channels** and runtime components that initiate payments and deliver the “take a payment” experience across:

- In-store terminals (various form factors)
- Tap-to-pay / SoftPOS (where applicable)
- Online channels (APIs, SDKs, payment links, widgets)
- Partner-embedded acceptance surfaces (POS-initiated flows, embedded checkout)

This domain owns **checkout/session lifecycle**, **channel runtime behaviour**, **device/app channel configuration at runtime**, and **request shaping/validation**. It is the execution layer that bridges merchant configuration and downstream processing.

It does **not** own transaction truth (Payments Processing), merchant configuration truth (Payments Customer Configuration), or settlement logic.

### Domain consumer personas & typical JTBD

- **Merchant operator / staff** → “Take a payment quickly and reliably.”
- **Merchant admin** → “Enable channels and ensure they work for my locations/devices.”
- **Merchant developer / integrator** → “Integrate Tyro payments into my app/site via APIs/SDKs.”
- **Support** → “Troubleshoot acceptance issues (device, checkout, session failures).”
- **Payments platform teams** → “Ship consistent channel experiences; maintain reliability and versioning.”
- **Vertical workflows (e.g., health)** → “Select provider at checkout (terminal sharing selection).”

### Core data

- **Channel definitions** (terminal, SoftPOS, API, SDK, payment link, widget)
- **Channel-to-merchant bindings** (runtime view of enabled channels, environment eligibility)
- **Checkout session state**
    - SessionID, amount, currency, references
    - Channel context (device/app, location, merchant)
    - Status (created/active/completed/expired/failed)
- **Request/response shaping metadata**
    - Canonical payment request format before processing
    - Validation outcomes, error codes
- **SDK/app version registry** (supported versions, deprecation states)
- **Runtime selection metadata** (session-scoped): e.g., selected MerchantID for terminal sharing, UI choices, idempotency/correlation IDs
- **Channel operational telemetry** (latency, error rates, conversion, drop-off)

### Invariants

- Runtime/session state is ephemeral and does not replace transaction truth.
- Channel runtime must not mutate settlement/ledger data.
- Every payment initiation must reference a valid MerchantID (directly or via runtime selection).
- Session lifecycle state transitions are deterministic and auditable (where required).
- Validation rules are versioned; behaviour changes are managed via compatibility and deprecation policies.
- Channel request shaping must produce canonical inputs suitable for Payments Processing.

### Capability authority

- **Checkout/session lifecycle management**
    - Create/maintain/expire sessions
    - Handle idempotency and correlation for initiation requests
    - Manage multi-step channel flows (e.g., 3DS initiation coordination at channel layer where applicable)
- **Channel runtime execution**
    - Terminal runtime flows, SoftPOS flows, API/SDK flows, payment links/widgets flows
    - Channel-specific UX orchestration (within the acceptance surface)
    - Offline/online operational behaviours at channel level (where applicable)
- **Validation & request shaping**
    - Validate requests against merchant/channel configuration constraints (read-only)
    - Normalize and shape payment requests into canonical processing inputs
    - Enforce channel-level rules (e.g., required metadata, limits, formatting)
- **Channel configuration consumption and effective runtime binding**
    - Consume Payments Customer Configuration configuration and apply to channel runtime decisions
    - Enforce enablement flags and per-channel constraints
    - Support constructs like **terminal sharing selection UX** using config from Payments Customer Configuration
- **SDK/app version governance (channel surface)**
    - SDK registry, supported version policies, deprecation schedules
    - Compatibility behaviours and migration guidance (channel-side)
- **Channel observability & operational controls**
    - Channel health monitoring, error classification, performance metrics
    - Feature flagging / rollout controls for channel behaviour

### Data authority

- Checkout/session records and lifecycle state
- Channel runtime metadata and bindings (runtime view)
- SDK/version registry and channel capability matrices (channel-side)
- Validation outcomes and request shaping artefacts (session-scoped)
- Channel operational telemetry (acceptance performance and reliability)

### Explicit non-authority (to keep boundaries clean)

- Merchant configuration truth (locations, enablement, terminal sharing groups, MIDs) → **Payments Customer Configuration Domain**
- Transaction truth (authorisation, clearing, disputes) → **Payments Processing Domain**
- Fraud scoring and allow/deny policy → **Fraud & Risk Decisioning Domain** *(channels may invoke, not own)*
- Scheme fee records and commercial pricing policy → **Payments Processing / Product Quoting & Pricing**
- Settlement batches and payout calculation → **Settlement & Reconciliation Domain**
- Funds transfer execution (BECS/NPP/internal) → **Funds Movement Domain**
- Banking ledger balances/postings → **Deposits Product Domain**
- Partner lifecycle/commercial agreements → **Partnerships Domain**
- Integration certification lifecycle → **Integration Enablement & Certification Domain**
- Customer identity master and access relationships → **Customer & Identity Domain**
- Customer-facing “portal” experience composition → **Digital Channels & Experience Domain** *(if kept separate; payments channels are acceptance surfaces)*

# Core Customer & Product Domains

These own operational and product truth.

## Customer Domain

**Party, Relationships & Customer Lifecycle Authority**

### **Domain purpose**

Provide Tyro’s authoritative capability for mastering **real-world parties** and their **relationships** so Tyro can maintain a single system of record for customers across products and services.

This domain exists to:

- Master **Customers (legal entities)**, **Persons**, **Groups/Enterprises**, and **Partners** as real-world parties
- Master the **relationships** between parties (e.g., person ↔ customer, customer ↔ group, partner ↔ customer) and the business meaning of those relationships
- Maintain customer lifecycle status at the **relationship level** (e.g., customer active/offboarded as a Tyro customer) independent of product-specific lifecycles
- Provide authoritative “who can act for whom” intent in business terms, which downstream domains can use for access enforcement and workflow gating

This domain is authoritative for **party identity and relationships**, not for authentication credentials, sessions/tokens, or low-level access control policy evaluation.

### **Domain consumer personas & typical JTBD**

- **Customer onboarding / servicing teams** → “Create and maintain customer parties and relationships; manage lifecycle changes.”
- **Product domains (Payments, Banking, Lending, Financial Management)** → “Link product entities to the correct customer and person records; consume relationship truth.”
- **Partner management teams** → “Associate partners to customers and manage partner↔customer relationship structure.”
- **Groups/enterprise teams** → “Manage group creation, membership and group-level relationship structures.”
- **Digital channels / portals** → “Resolve which customer/group/partner a person is acting for; show valid contexts.”
- **Risk, Compliance & Regulatory (indirect)** → “Link compliance outcomes to the correct party; consume party structure for risk assessment.”
- **Data/analytics (indirect)** → “Consume canonical party and relationship dimensions.”

### **Core data**

- **Party master records**
    - **Customer** (CustomerID/PartyID, legal entity attributes such as ABN/ACN, registered name, trading name, addresses, contacts, industry)
    - **Person** (PersonID/PartyID, name, DOB reference/metadata where applicable, contact methods, identity assurance references)
    - **Group / Enterprise** (GroupID/PartyID, group attributes, governance attributes where applicable)
    - **Partner** (PartnerPartyID/PartyID, partner identity attributes; commercial relationship mastered elsewhere)
- **Party identifiers and aliases**
    - External identifiers, scheme/customer references (as references), dedup/linking references
- **Party relationships (business meaning)**
    - Person ↔ Customer (e.g., director, beneficial owner, authorised representative, admin)
    - Customer ↔ Group (membership, franchise association, governance roles)
    - Partner ↔ Customer/Group (referral relationship linkage, service relationship linkage as references)
- **Relationship lifecycle and status**
    - Effective dating, start/end, reason codes, audit metadata
- **Customer relationship status (Tyro-level)**
    - Active/inactive/offboarded, restrictions flags as *derived attributes* (with references to authoritative decisions)
- **Business access grants (intent)**
    - “Person P is permitted to act as Role R for Party X” with effective dates and constraints
- **References to external evidence and decisions**
    - Links to compliance verification outcomes (KYC verification references, decision refs), without storing the compliance decision rationale here

### **Invariants (callouts to prevent overlap)**

- **Party vs account are different objects:** a **Person** is a real-world individual; a **User Account** is a system principal.
- A Person may have **0..n** associated User Accounts; a User Account links to **exactly one** Person (or is a non-human service principal with no Person).
- **Party relationships are authoritative here:** business meaning of “who can act for whom” is mastered in this domain.
- This domain publishes **business access intent**; it does not own technical enforcement artefacts (tokens, roles, policies).
- Customer/product status separation: this domain owns **customer relationship status** (Tyro-level), while each product domain owns its **product lifecycle status**.
- Compliance outcomes are referenced, not authored: AML/KYC/CDD decisions and rationales are authored in Risk, Compliance & Regulatory.

### **Capability authority**

- Create/update/deactivate party records (customers, persons, groups, partners)
- Manage party identity resolution and linking (dedupe workflow references; deterministic linking rules where applicable)
- Manage party relationships and roles (create, update, revoke; effective dating)
- Maintain customer relationship lifecycle status (active/offboarded) and derived restriction flags (by reference)
- Publish canonical party/relationship events for downstream consumers
    - e.g., PartyCreated, PersonLinkedToCustomer, GroupMembershipChanged, BusinessRoleGranted/Revoked
- Provide party/relationship query services for channels and operational domains (context resolution)
- Provide authoritative business access grant intent for User & Identity to materialise into enforceable entitlements

### **Data authority**

- Party master records (Customer/Person/Group/Partner as parties)
- Party identifiers/aliases and linkage references
- Party relationships, roles, and effective dating
- Customer relationship status (Tyro-level) and relationship lifecycle metadata
- Business access grant intent records (business meaning) and audit metadata

### **Explicit non-authority (to keep boundaries clean)**

- Authentication, credentials, MFA, identity provider linkage → **User & Identity Domain**
- Authorisation policy evaluation, token/session lifecycle, API keys/service principals → **User & Identity Domain**
- Commercial agreements, partner contracts, referral program lifecycle → Partnerships Domain
- Product onboarding/origination workflow state → Customer & Product Onboarding Domain
- Product-specific lifecycle status (merchant acquiring, accounts, loans, subscriptions) → Relevant product domains
- AML/KYC/CDD decision outcomes, customer risk ratings, monitoring alerts → Risk, Compliance & Regulatory Domain
- Case workflow for investigations/support → Operational Investigations & Exceptions / Customer Service & Support Domains
- Statutory corporate GL → Corporate Finance Domain

## User & Identity Domain

**System Principals, Authentication & Access Control Metadata Authority**

### **Domain purpose**

Provide Tyro’s authoritative capability for managing **system identities (principals)** and enforcing access through **authentication and authorisation controls** across customer, partner, and staff channels.

This domain exists to:

- Manage **User Accounts** (human principals) and **Service Principals** (non-human identities)
- Provide authentication capabilities (SSO/MFA/credentials), session/token lifecycle, and identity assurance controls
- Materialise business access intent from the Customer domain into enforceable authorisation artefacts (roles/scopes/policies)
- Provide auditable access governance and security telemetry for regulatory and internal assurance

This domain is authoritative for **system accounts and access control metadata**, not for real-world party relationships or customer master identity.

### **Domain consumer personas & typical JTBD**

- **Channel teams (web, mobile, partner portals, staff tools)** → “Authenticate users; authorise actions; manage sessions and step-up.”
- **Security / IAM engineers** → “Operate IAM controls, MFA, SSO, policy, and audit logging.”
- **Customer/partner admins** → “Invite users, manage access, revoke access, enforce least privilege.”
- **Operations / support staff** → “Access customer contexts safely with audit trails and approvals.”
- **Risk/compliance/audit (indirect)** → “Review access control evidence and user activity audit logs.”
- **Product domains (indirect)** → “Rely on consistent identity and authorisation enforcement patterns.”

### **Core data**

- **User accounts (human principals)**
    - AccountID, linked PersonID reference, status (active/suspended/removed)
    - Authentication methods (SSO/MFA/credential metadata), identity provider linkage
- **Service principals (non-human identities)**
    - ServiceAccountID, key material references, allowed scopes, rotation metadata
- **Authentication/session artefacts**
    - Sessions, tokens, refresh tokens, device binding metadata, step-up events
- **Authorisation artefacts**
    - Roles, permissions, scopes, policies, role bindings, context constraints
    - Derived claims/entitlements embedded in tokens (where applicable)
- **Business access grant mappings**
    - Mappings from Customer-domain “business access intent” to enforceable roles/scopes
- **Access change audit trail**
    - Who granted/revoked access, approvals, timestamps, reason codes
- **Security telemetry**
    - Login events, failed auth attempts, anomaly flags, policy evaluation logs

### **Invariants (callouts to prevent overlap)**

- **Party vs account are different objects:** User Accounts are system principals; Persons and party relationships are mastered in the Customer domain.
- A User Account links to **exactly one** Person (or is a service principal with no Person); it must not become a second “person profile”.
- Authorisation artefacts (roles/scopes/policies) are derived from **business access intent** published by the Customer domain (with controlled local admin actions).
- Access decisions must be auditable and enforce least privilege; sensitive actions require step-up/strong auth patterns where defined.
- This domain does not own operational workflow state (onboarding, servicing, settlements) — only access to perform actions in those workflows.

### **Capability authority**

- **Identity lifecycle management**
    - Create/update/suspend/remove user accounts and service principals
    - Manage identity provider integrations, MFA/step-up configuration, credential policies
- **Authentication services**
    - Login, session and token issuance/refresh/revocation
    - Device binding and identity assurance patterns (step-up, risk-based auth where applicable)
- **Authorisation enforcement**
    - Evaluate roles/scopes/policies for requests (centralised or shared library)
    - Materialise Customer-domain access grants into enforceable entitlements
    - Support delegated administration patterns (customer/group/partner admins) with audit trails
- **Access governance and auditability**
    - Capture and expose access change logs and access usage telemetry
    - Provide evidence for audits and compliance reviews
- **Service principal management**
    - API keys, certificates, secret rotation patterns, scoped access for integrations

### **Data authority**

- User accounts and service principals and their lifecycle status
- Authentication method metadata and identity provider linkage records
- Session/token lifecycle artefacts (as authoritative technical records)
- Roles, scopes, policies, bindings, and derived entitlement claims
- Access governance audit logs and security telemetry

### **Explicit non-authority (to keep boundaries clean)**

- Customer, person, group, partner party master data and relationships → **Customer Domain**
- Business meaning of roles (director, beneficial owner, authorised representative) → **Customer Domain**
- Commercial partner agreements and program lifecycle → Partnerships Domain
- Product configuration and lifecycle state → Relevant product domains / origination/servicing domains
- AML/KYC/CDD decisions and monitoring alerts → Risk, Compliance & Regulatory Domain
- Case workflow lifecycle → Operational Investigations & Exceptions / Customer Service & Support Domains
- Data products, analytics semantics, dashboards → Data Platform Domain

## Payments Product Domain

**Merchant Acquiring Product Authority**

### Domain purpose

Own Tyro’s **merchant acquiring product** as a coherent offering across channels (in-store and online), by defining the product-level rules, entitlements, and lifecycle that sit above merchant configuration and below commercial pricing.

This domain exists to clearly separate:

- **What the Payments product is** (features, entitlements, lifecycle, product rules)  
from
- **How a specific merchant is configured** (Payments Customer Configuration)
- **How payments run at checkout** (Payments Channels)
- **How transactions are processed** (Payments Processing)
- **How payouts are calculated** (Settlement)
- **How Tyro charges for it** (Product Quoting & Pricing)

It provides the authoritative “product view” for acquiring—what capabilities exist, how they’re packaged, and which features apply to which customer cohort—without becoming a system-of-record for transactions or balances.

### Domain consumer personas & typical JTBD

- **Product managers** → “Define acquiring features, packaging, entitlements, and lifecycle rules.”
- **Merchant admin** → “Understand what my payments product includes and which features are enabled.”
- **Sales / deal desk** (indirect) → “Know what product options exist and what’s eligible for a merchant.”
- **Payments Customer Configuration / Origination / Lifecycle** (indirect) → “Apply product rules consistently when configuring or changing merchants.”
- **Engineering/platform teams** → “Implement product behaviour consistently across channels without duplicating rules.”

### Core data

- **Payments product catalog** (capabilities and feature definitions)
    - e.g., refunds, tips, surcharging, offline mode, tokenisation, reporting tiers, multi-location support
- **Entitlements & feature flags (product-level)**
    - eligibility rules and constraints by segment/vertical/channel
    - feature bundles / product tiers
- **Product lifecycle policy**
    - activation prerequisites, suspension rules (product-level), deprecation policies
- **Product policy configuration** *(not merchant config)*
    - default behaviours and constraints (e.g., max refund window policy, surcharge policy constraints)
- **Compatibility policy references**
    - supported channels/surfaces for product features (e.g., terminal vs API vs SDK)
- **Links (references) to commercial pricing plans**
    - pointers to Product Quoting & Pricing plan IDs (but not fee rules themselves)

### Invariants

- Product definitions and entitlements are versioned and effective-dated.
- A merchant’s product eligibility must be explainable (rules + version).
- Product policy does not contain merchant-specific configuration; that stays in Payments Customer Configuration.
- Product domain does not own transaction truth or settlement outcomes.
- Product entitlements must be enforceable consistently across channels (same rules apply regardless of surface).

### Capability authority

- **Payments product definition and lifecycle policy**
    - define product tiers/bundles from a payments capability perspective
    - activation prerequisites and product lifecycle constraints (product-level)
    - deprecation/end-of-support policy for product features
- **Entitlements and eligibility rules (product-level)**
    - determine which capabilities are allowed for which customer cohorts/verticals
    - policy constraints that downstream domains must enforce (channels, merchant config, processing)
- **Cross-channel product consistency rules**
    - canonical interpretation of features across terminal / API / SDK / payment links
    - product-level defaults and guardrails used by Payments Customer Configuration and Channels
- **Product capability governance**
    - catalogue of supported payment methods and acceptance capabilities (product view)
    - rules around feature interactions (e.g., “surcharging requires X”, “refunds require Y”)
- **Product-level reporting semantics (definition, not analytics)**
    - define what “payments product KPIs” mean, as inputs to Data/AI semantic models

### Data authority

- Payments product catalog (capabilities, tiers) and versions
- Entitlements/eligibility rule sets and versions
- Product lifecycle policies and constraints
- Product-level defaults and guardrails
- References to pricing plan IDs / offer constructs (not pricing calculations)

### Explicit non-authority (to keep boundaries clean)

- Merchant-specific configuration (MerchantID, locations, terminal sharing groups, enablement flags) → **Payments Customer Configuration Domain**
- Checkout/session runtime and channel UX → **Payments Channels Domain**
- Transaction truth (authorisation, clearing, chargebacks) → **Payments Processing Domain**
- Scheme/network fee calculation → **Payments Processing Domain**
- Merchant payout calculation and settlement batches → **Settlement & Reconciliation Domain**
- Commercial fee rules and pricing calculations → **Product Quoting & Pricing Domain**
- Partner technical integration specs → **POS Integration / Payments VAS Integrations Domains**
- Integration certification status → **Integration Enablement & Certification Domain**
- Customer master identity and access model → **Customer & Identity Domain**
- Support case lifecycle → **Customer Service & Support Domain**
- Analytics datasets and model outputs → **Data, Intelligence & AI Domain**

## Payments Customer Configuration Domain

**Merchant Acquiring Configuration Authority (Merchant Setup & Control Plane)**

### Domain purpose

Maintain the authoritative configuration for **how a specific customer is set up to accept payments** across Tyro’s acquiring channels (in-store and online). This domain is the “control plane” for acquiring: it defines the merchant’s operational setup that downstream runtime and processing domains must follow.

It exists to provide a single, canonical source for:

- Merchant acquiring account setup (MerchantID / MID structures)
- Locations/premises and payment acceptance footprint
- Channel enablement (CP/CNP) and acceptance parameters
- Device/terminal bindings and configuration intent
- Multi-entity acceptance constructs (e.g., **Terminal Sharing Groups** for provider selection)

This domain is **merchant-specific configuration truth**. It does **not** run checkout sessions, does **not** own transaction truth, does **not** calculate payouts, and does **not** own commercial pricing rules.

### Domain consumer personas & typical JTBD

- **Merchant owner/admin** → “Set up payments, add locations, enable channels, manage devices.”
- **Enterprise/group admin** → “Standardise configuration across many sites; apply consistent acceptance setup.”
- **Support / operations** → “Update merchant configuration safely; troubleshoot configuration issues.”
- **Payments/channel engineering** (indirect) → “Retrieve effective configuration for runtime decisions.”
- **Risk/compliance** (indirect) → “Verify configuration prerequisites and control points are met.”
- **Vertical staff (e.g., health front desk)** → “Use terminal sharing configuration to select provider at checkout.”

### Core data

- **Merchant acquiring account**
    - MerchantID (acquiring identity) linked to CustomerID
    - Scheme/processor setup references (e.g., MID(s) per scheme/channel)
    - Merchant status (enabled/disabled) for acquiring capability
- **Locations / premises model**
    - LocationID, addresses, trading details
    - Location-to-merchant associations (multi-location support)
- **Channel enablement & acceptance configuration**
    - CP/CNP enablement flags by merchant/location
    - Accepted payment methods/schemes (as configured)
    - Acceptance parameters (e.g., tipping enabled, surcharge settings constraints, refund enablement flags)
    - Settlement destination references (not payout calculations)
- **Device/terminal binding intent**
    - Terminal/device association to MerchantID and LocationID
    - Assignment history and effective configuration snapshot references
    - (Physical asset truth remains outside this domain)
- **Terminal Sharing Groups** *(new construct)*
    - TerminalSharingGroupID
    - Premises/Location reference
    - Member MerchantIDs (e.g., doctors)
    - Display labels and selection rules (required/default/allowed roles)
    - Terminal bindings (which devices present selection)
- **Configuration governance**
    - Versioning/effective dating of configuration
    - Audit trail of changes, approvers (where required)

### Invariants

- Every MerchantID must reference a valid CustomerID (legal entity identity lives elsewhere).
- Configuration changes are auditable and versioned (effective configuration must be reproducible).
- A channel cannot be enabled unless required scheme/setup prerequisites are satisfied.
- Terminal Sharing Groups:
    - reference valid MerchantIDs
    - do not create a new legal entity or aggregate balances
    - require that each transaction resolves to **exactly one MerchantID**
- This domain does not store transaction records, settlement balances, or pricing rules.

### Capability authority

- **Merchant acquiring configuration lifecycle**
    - Create/maintain MerchantID and acquiring setup metadata
    - Enable/disable acquiring capability (configuration-level)
    - Maintain scheme/channel configuration prerequisites and readiness status
- **Location and acceptance footprint management**
    - Create/maintain locations and associate them to merchant acquiring setup
    - Configure what can be accepted where (channels, schemes, methods)
- **Channel enablement configuration (merchant-specific)**
    - Maintain enablement flags and acceptance parameters per merchant/location/channel
    - Validate configuration completeness for downstream runtime use
- **Terminal/device binding intent (control plane)**
    - Associate terminals/devices to merchant/location for acceptance purposes
    - Maintain the configuration intent that fleet/runtime domains apply and enforce
- **Terminal Sharing Group lifecycle**
    - Create/update membership and binding rules
    - Manage enablement of provider-selection experience on relevant terminals
    - Provide APIs to retrieve applicable group by terminal/location/merchant context
- **Effective configuration publishing**
    - Provide canonical “effective configuration” read models for runtime/processing
    - Emit configuration change events for downstream consumers

### Data authority

- Merchant acquiring configuration records (MerchantID configuration truth)
- Location configuration and merchant-location associations
- Channel enablement state and acceptance parameters (merchant-specific)
- Terminal binding intent records (merchant/location associations)
- Terminal Sharing Group records (membership, rules, bindings)
- Configuration versions and audit trail

### Explicit non-authority (to keep boundaries clean)

- Customer legal entity master, users, groups/franchises → **Customer & Identity Domain**
- Checkout/session runtime and channel UX → **Payments Channels Domain**
- Transaction truth (authorisation, clearing, disputes) → **Payments Processing Domain**
- Scheme/network fee records → **Payments Processing Domain**
- Commercial pricing rules/fee calculation (Tyro fees, discounts, commissions) → **Product Quoting & Pricing Domain**
- Settlement batch formation and net payout calculation → **Settlement & Reconciliation Domain**
- Transfer execution (BECS/NPP/internal) → **Funds Movement Domain**
- Banking ledger balances/postings → **Deposits Product Domain**
- Physical asset lifecycle (warehouse/shipping/ownership) → **Hardware & Asset Management Domain**
- Firmware/OTA/device runtime control → **Terminal Fleet & Device Management Domain**
- Partner technical certification and conformance state → **Integration Enablement & Certification Domain**
- POS protocol/spec authority → **POS Integration & Partner Connectivity Domain**

## Payments Processing Domain

**Transaction, Authorisation & Scheme Clearing Authority**

### **Domain purpose**

Process acquiring card payments from authorisation to clearing, and maintain the authoritative **“transaction truth”** required for reliable merchant acquiring operations.

This domain exists to:

- Switch and route transactions to the correct networks/schemes and upstream processors
- Execute authorisation logic and maintain authorisation state
- Ingest scheme clearing and reconcile authorisations to clearing outcomes
- Produce the canonical event stream and records consumed by **Settlement**, **Risk**, **Revenue**, **Support**, **Analytics** — and **Payments Accounting**
- Publish scheme dispute/chargeback **signals and evidence references** to the **Disputes & Chargebacks** domain (which owns the dispute case lifecycle)

It is the system of record for payment transaction lifecycle state and clearing evidence, not for merchant configuration, settlement calculation, disputes workflow, accounting journals, rail transfers, or banking ledgers.

### **Domain consumer personas & typical JTBD**

- **Merchant / operator** → “Get payments authorised reliably and quickly.”
- **Finance/settlements ops** → “Receive accurate clearing records; reconcile issues.”
- **Disputes ops** → “Receive dispute signals/evidence references linked to the original transaction.”
- **Risk/fraud teams (indirect)** → “Consume transaction events for monitoring; apply decisioning.”
- **Support** → “Investigate transaction issues and provide explanations.”
- **Product/platform engineers** → “Deliver resilient, scalable processing with deterministic lifecycle.”

### **Core data**

- **Transaction record (TransactionID)**
    - MerchantID, terminal/channel references, timestamps
    - Amount, currency, payment method, scheme/network
    - Correlation IDs (session/request IDs), idempotency keys (where applicable)
- **Authorisation state**
    - Request/response snapshots (canonical form)
    - Authorisation outcome, reason codes, approvals/declines
    - Reversals/voids/pre-auth completion state (if supported)
- **Clearing state**
    - Clearing file/message references and parsed records
    - Match keys (auth ↔ clearing) and reconciliation status
    - **Scheme/network fee records (scheme fees)**
- **Dispute/chargeback signals & evidence references (scheme-facing)**
    - Scheme dispute/chargeback message references (where received)
    - Links to TransactionID/Clearing references
    - Evidence artefact references required downstream
    - *Note: the dispute case lifecycle itself is mastered in Disputes & Chargebacks*
- **Processing controls & telemetry**
    - Routing tables/strategies (processing-time decisions; not merchant commercial pricing)
    - Processing health metrics (latency, error rates, retry counts)
    - Audit trail of lifecycle transitions

### **Invariants**

- Transaction lifecycle is deterministic and auditable (state machine enforced).
- Authorisation and clearing must reconcile (explicit matched/unmatched states).
- Transaction records are immutable in history; corrections are new lifecycle events.
- Scheme fee records reflect scheme/network charges (commercial Tyro fees are not authored here).
- Scheme dispute/chargeback **signals** must be traceable to transaction/clearing evidence and published reliably to the Disputes & Chargebacks domain.
- This domain does not compute merchant payouts or execute funds transfers.

### **Capability authority**

- **Transaction switching & routing**
    - Determine routing path based on channel, scheme, configuration inputs (read-only)
    - Manage network/proc integrations and resiliency patterns
    - Handle retries, timeouts, and idempotency at processing edge
- **Authorisation engine**
    - Validate and process authorisation requests
    - Apply processing rules and generate authorisation outcomes
    - Manage reversals, voids, completion flows where applicable
- **Scheme clearing ingestion & reconciliation**
    - Ingest and normalise clearing records
    - Reconcile authorisations to clearing
    - Produce clearing state and scheme fee records
- **Dispute/chargeback signal publishing (not workflow ownership)**
    - Ingest scheme dispute/chargeback signals (where applicable)
    - Publish canonical “dispute signal” events and evidence references to Disputes & Chargebacks
- **Authoritative transaction event publishing**
    - Emit canonical transaction/clearing events for downstream domains (incl. Payments Accounting)
    - Provide query APIs for transaction investigation and reporting use cases

### **Data authority**

- Transaction master record and lifecycle state
- Authorisation state records and reason codes
- Clearing records and reconciliation state
- Scheme/network fee records (scheme fees)
- Dispute/chargeback **signals** and evidence references (scheme-facing)
- Processing lifecycle audit trail and correlation metadata

### **Explicit non-authority (to keep boundaries clean)**

- **Merchant configuration, enablement, terminal sharing groups** → Payments Customer Configuration Domain
- **Checkout session UX and terminal/app runtime orchestration** → Payments Channel & Acceptance Runtime Domain
- **Fraud scoring / allow-deny-step-up decisions** → Fraud & Risk Decisioning Domain
- **AML/CTF monitoring, sanctions screening, regulatory reporting** → Risk, Compliance & Regulatory Domain
- **Commercial pricing and fee rules (Tyro fees/discounts/commissions)** → Product Quoting & Pricing Domain
- **Dispute/chargeback case lifecycle (stages, deadlines, representment, outcomes)** → **Disputes & Chargebacks Domain**
- **Merchant payout calculation and settlement batches** → Settlement & Reconciliation Domain
- **Payments sub-ledger journals, control accounts, accounting balances** → **Payments Accounting Domain**
- **Transfer execution (BECS/NPP/internal)** → Funds Movement Domain
- **Regulated deposit ledger balances/postings** → Deposits Product Domain
- **Customer support case workflow** → Customer Service & Support Domain
- **Analytics/feature store/model outputs** → Data, Intelligence & AI Domain

## Settlement & Reconciliation Domain

**Merchant Clearing, Net Payout & Settlement Truth Authority**

### **Domain purpose**

Aggregate cleared acquiring transactions, apply fees/adjustments, and produce the authoritative calculation of **what Tyro owes each merchant (and when)**, including settlement batch formation and reconciliation controls.

This domain exists to separate:

- Transaction truth (authorisation/clearing) in Payments Processing  
from
- Merchant payout obligations and settlement breakdowns (this domain)

…and to provide reproducible, auditable settlement outcomes suitable for a regulated environment.

It is the system of record for merchant settlement calculations, not for executing transfers (Funds Movement), not for maintaining the bank ledger (Banking), and not for maintaining payments accounting journals/control accounts (Payments Accounting).

### **Domain consumer personas & typical JTBD**

- **Merchant / finance admin** → “Understand my payout amount and breakdown; reconcile takings to deposits.”
- **Settlement/finance operations** → “Run settlement cycles; resolve reconciliation breaks; manage adjustments.”
- **Support** → “Explain payout differences; investigate missing/incorrect settlements.”
- **Risk/compliance (indirect)** → “Apply holds/restrictions policy outcomes to payouts; ensure auditability.”
- **Corporate finance (indirect)** → “Consume settlement outputs for revenue/GL reconciliation.”
- **Product/platform teams** → “Evolve settlement logic safely and reproducibly.”

### **Core data**

- **Settlement batch** (BatchID, cycle date/time, scheme/channel scope, status)
- **Settlement line items** (MerchantID, gross cleared amount, fees, adjustments, net payable)
- **Fee allocation records**
    - Scheme/network fees (**from Payments Processing references**)
    - Tyro commercial fees (**from Product Quoting & Pricing references**)
- **Adjustments** (manual/automated: dispute-driven corrections, reversals, goodwill refs)
    - Includes references to DisputeCaseID / dispute outcome events (where applicable)
- **Payable balance** (per MerchantID) and aging/hold state (if applicable)
- **Reconciliation artefacts**
    - Input set references (clearing files, transaction sets)
    - Control totals, variance records
    - Break investigation references (Case/Exception refs)
    - Settlement instruction references (destination account refs; execution owned elsewhere)

### **Invariants**

- Every cleared transaction is assigned to exactly one settlement outcome (or explicit exception state).
- Settlement results are reproducible from the same inputs + rule versions.
- Settlement is auditable: every fee and adjustment has traceable source references.
- Net payable is computed deterministically per MerchantID (terminal sharing does not aggregate across merchants).
- Settlement calculation does not execute money movement; it produces payable obligations and instruction references.
- Holds/restrictions are explicit, reason-coded, and time-bounded (where applicable).
- Dispute-driven settlement adjustments must reference an authoritative dispute case/outcome from Disputes & Chargebacks (no “local” dispute truth).

### **Capability authority**

- **Settlement batch formation and lifecycle**
    - Define settlement cycles, groupings, cut-offs
    - Produce batches and maintain batch status (draft/confirmed/released/closed)
- **Net payout calculation (merchant payable)**
    - Aggregate cleared transactions
    - Apply fees and adjustments
    - Compute merchant net payable per settlement cycle
    - Produce payout breakdown artefacts for channels/support
- **Reconciliation controls and break management (settlement-side)**
    - Validate input completeness (control totals, variance detection)
    - Produce reconciliation variance records and control reporting
    - Initiate exception cases (via Operational Investigations & Exceptions) when breaks occur
- **Hold and restriction application (settlement-side execution of policy)**
    - Apply holds based on consumed risk/compliance outcomes
    - Track hold state and release conditions (policy references)
- **Dispute outcome application (settlement impact only)**
    - Consume dispute outcomes/events from Disputes & Chargebacks
    - Apply dispute-driven adjustments/holds to merchant payables as per settlement rules
- **Payout instruction preparation (not execution)**
    - Prepare payout instruction sets for Funds Movement execution
    - Track linkage of payable → executed transfer references

### **Data authority**

- Settlement batches and settlement line items (**merchant settlement truth**)
- Fee allocation and adjustment records **as applied in settlement**
- Merchant payable balances and hold state (**settlement perspective**)
- Reconciliation control totals and variance records
- Links between settlement outcomes and transfer execution references

### **Explicit non-authority (to keep boundaries clean)**

- **Transaction truth and clearing state** → Payments Processing Domain
- **Dispute/chargeback case lifecycle and outcomes** → **Disputes & Chargebacks Domain**
- **Runtime checkout and payment initiation** → Payments Acceptance Runtime Domain
- **Commercial pricing policy and fee rule definitions** → Product Quoting & Pricing Domain
    - (Settlement consumes pricing outputs/fees; it does not define the rules.)
- **Payments sub-ledger journals, control accounts, accounting balances** → **Payments Accounting Domain**
- **Transfer execution on rails (BECS/NPP/internal)** → Funds Movement Domain
- **Deposit ledger entries and balances** → Deposits Product Domain
- **Customer identity master and merchant configuration truth** → Customer & Identity / Payments Customer Configuration
- **Regulatory compliance posture and decisions** → Risk, Compliance & Regulatory Domain
    - (Settlement enforces holds, but compliance owns the compliance decision.)
- **Case workflow lifecycle for investigation** → Operational Investigations & Exceptions Domain
    - (Settlement raises breaks; Case domain manages investigation workflow.)
- **Corporate statutory accounting** → Corporate Finance Domain

## Payments Accounting Domain

**Payments Sub-Ledger, Journals & Control Accounts Authority**

### **Domain purpose**

Provide Tyro’s authoritative capability for **payments-product accounting** by maintaining the **payments sub-ledger** (journals + balances) that represents the financial position and movements arising from acquiring, including:

- Scheme clearing and settlement-in **control accounts** (expected vs received), including accounting treatment of scheme fees where applicable
- Merchant settlement **payables control** (what Tyro owes merchants) including holds, adjustments and reversals where they have accounting impact
- Merchant fee accounting (recognition, accrual/deferral where applicable), including revenue share / commissions accounting where applicable
- Accounting adjustments and corrections (via controlled reversals)
- Traceable and reconcilable exports to **Corporate Finance** for statutory GL posting and period close support

This domain is the **system of record for operational accounting entries and balances** for the Payments product. It consumes authoritative source events from Payments Processing, Settlement & Reconciliation, and Product Quoting & Pricing and produces auditable double-entry accounting representations.

### **Domain consumer personas & typical JTBD**

- **Payments finance / reconciliation specialist** → “Explain balances; trace entries to source events; investigate variances; support audit.”
- **Corporate finance (GL owners)** → “Receive complete, reconciled, auditable sub-ledger exports for posting and close.”
- **Payments operations (settlement ops, scheme ops)** → “Validate that operational positions reconcile to accounting control accounts.”
- **Risk/compliance/audit (indirect)** → “Verify controls, immutability, traceability, and period-close integrity.”
- **Product/platform teams (indirect)** → “Assess accounting impact of product changes; validate treatment during launches/migrations.”
- **Data/BI (indirect)** → “Consume curated accounting facts without re-deriving from raw events.”

### **Core data**

- **Journal record** (JournalID, journal type, posting timestamp, accounting period, status, source system reference)
- **Journal lines** (LineID, debit/credit, amount, currency, sub-ledger account, dimensions: product/channel/merchant grouping)
- **Payments sub-ledger chart of accounts** (SubLedgerAccountID, account type, control vs P&L classification)
- **Mapping rules to corporate GL** (GLAccountID mapping reference, cost centre / legal entity references, effective dating)
- **Control balances and snapshots** (as-at timestamp, period, account balances, trial balance snapshots)
- **Source references** (immutable links to authoritative source events: ClearingEventID/TxnID, SchemeStatementRef, SettlementBatchID/SettlementLineID, FeeCalculationID, AdjustmentID)
- **Reversal / correction records** (ReversalID, reason, link to original journals, approval/audit metadata)
- **GL export batches** (ExportBatchID, scope/period, export status, downstream acknowledgements, reconciliation status)

### **Invariants**

- Every posted journal is **double-entry balanced** (sum debits == sum credits) at the journal boundary.
- Postings are **append-only**: corrections occur via **reversal + replacement**, never mutation of historical lines.
- Every journal line is **traceable to an authoritative source event** or an authorised accounting adjustment, with deterministic linkage.
- Posting is **idempotent** for a given *(source event, policy version, effective date)* tuple (replays do not create duplicates).
- Accounting period controls apply: once a period is closed, late postings require controlled post-close adjustments with audit trails.
- Sub-ledger account mappings are **time-effective**; the correct mapping applies for the posting date/period.
- Control account positions must be **reconcilable** to operational truths (clearing, settlement obligations, fee facts) within defined tolerances and exception workflows.

### **Capability authority**

- Execute payments accounting policy (apply approved accounting treatments to source events)
- Generate and post payments sub-ledger journals from authoritative events (clearing/settlement/fees/adjustments)
- Maintain payments sub-ledger account structures and GL mapping rules (time-effective)
- Manage reversals, corrections, and controlled adjustments with approvals and audit metadata
- Maintain operational trial balance and control account positions (scheme settlement-in control, merchant settlement payable control, fee-related control positions)
- Reconcile accounting control positions to operational sources (tie-out rules, variance detection, exception surfacing)
- Provide drill-down/explainability services (balance → journal → source references)
- Produce reconciled GL export feeds/batches to Corporate Finance and track downstream acknowledgements
- Support audit evidence retrieval for any entry or balance (who/what/when/why)

### **Data authority**

- Payments sub-ledger journals and journal lines (including lifecycle status and audit metadata)
- Payments sub-ledger chart of accounts and account metadata
- Mappings from payments sub-ledger accounts to corporate GL (including effective dating)
- Payments accounting balances, trial balances, and control account positions
- Reversal/correction records and approval/audit metadata
- GL export batch records and export/reconciliation status

### **Explicit non-authority (to keep boundaries clean)**

- **Transaction truth, clearing lifecycle, scheme chargebacks/disputes lifecycle** → Payments Processing Domain
- **Settlement obligation calculation, settlement batching, payout composition** (the “what we owe merchants” computation) → Settlement & Reconciliation Domain
- **Pricing plans, fee rules, discounts, commissions policy and fee calculation logic** → Product Quoting & Pricing Orchestration
- **Invoicing, AR balances, collections, credit notes, ageing** → Billing & Accounts Receivable Domain
- **Execution of money movement** (rail instruction lifecycle/outcomes) → Funds Movement Domain
- **Customer master, user identity, group hierarchy** → Customer & Identity Domain
- **Bank ledger entries and regulated account balances/statements** → Deposits Product Domain (Banking Ledger)
- **Statutory GL, external financial reporting, corporate close ownership** → Corporate Finance Domain
- **Merchant’s own bookkeeping** (merchant COA/journals/GST/BAS artefacts) → Accounting Product Domain

## Hardware & Asset Management Domain

**Physical Asset Lifecycle Authority**

### Domain Purpose

Manage Tyro’s **physical payment hardware assets** across their lifecycle — procurement to disposal — ensuring we have a canonical record of *what devices exist*, *who owns them*, *where they are*, and *their compliance/servicing status*.

This domain is the **system of record for physical assets**, not runtime behaviour.

### Consumer personas & typical JTBD

- **Operations / Supply chain** → “Order, receive, warehouse and distribute terminals.”
- **Field services / logistics** → “Ship replacements, track returns, manage repairs.”
- **Finance / asset accounting** → “Track assets for depreciation and write-offs.”
- **Support** → “Find a device by serial number and check its ownership/location.”
- **Risk / compliance** → “Ensure device handling and disposal meet obligations.”

### Core data

- Asset registry (AssetID)
- Serial number / hardware identifiers (IMEI, SIM ICCID, etc.)
- Device model / variant / certification identifiers (hardware)
- Ownership (Tyro-owned, merchant-owned, leased)
- Inventory status (in stock / shipped / deployed / returned / scrapped)
- Assignment history (to merchant/location/order)
- Repair/RMA records and outcomes
- Chain-of-custody + audit events

### Invariants

- Each physical device has a unique identity (serial) and a single AssetID.
- Asset lifecycle state is deterministic and auditable.
- A device cannot be simultaneously “in warehouse” and “deployed”.
- Chain-of-custody events are immutable/auditable.
- This domain does **not** contain runtime configuration or payment behaviour.

### Capability authority

- Procurement intake and inventory registration
- Warehousing and stock management
- Shipping, returns, and RMA workflow (asset-side)
- Ownership and assignment tracking (device-to-merchant/location associations as *logistics facts*)
- Physical compliance lifecycle (e.g., disposal, tamper handling as asset events)

### Data authority

- Asset registry and asset lifecycle state
- Device identity/metadata (physical)
- Assignment/shipping/return records
- RMA and repair history

### Explicit non-authority (to prevent overlap)

- Firmware versions and OTA updates → **Terminal Fleet & Device Management**
- Runtime device configuration (payment params, UI settings) → **Terminal Fleet & Device Management**
- Merchant eligibility/config to use devices → **Payments Customer Configuration**
- Payment runtime execution → **Payments Acceptance Runtime**
- Any transaction truth → **Payments Processing**

## Terminal Fleet & Device Management Domain

**Device Runtime Control & Configuration Authority**

### Domain Purpose

Manage terminals as **live runtime endpoints** in the acquiring ecosystem, including:

- Device provisioning into environments
- Firmware and software distribution (OTA)
- Connectivity configuration
- Runtime policy/config rollout
- Operational health and control-plane commands

This domain ensures terminals are **secure, up to date, correctly configured, and observable** — without owning financial transaction truth.

### Consumer personas & typical JTBD

- **Payments engineering / platform ops** → “Roll out firmware safely; manage fleet health.”
- **Support** → “Diagnose terminal connectivity/config issues; remotely reboot.”
- **Security / compliance** → “Ensure secure posture, patching, and configuration controls.”
- **Merchant ops** (indirect) → “Keep devices reliable and working.”

### Core data

- Device runtime identity (DeviceID) linked to AssetID
- Provisioning state (registered/activated/decommissioned)
- Firmware/software versions and rollout cohorts
- Connectivity state (SIM, network profile, last-seen)
- Runtime configuration state (effective config snapshot, applied-at timestamp)
- Command history (reboot, rotate keys, push config)
- Fleet health telemetry summaries (availability, failure codes)

### Invariants

- Device must be provisioned before it can receive runtime config or updates.
- Firmware rollouts are versioned, staged, and reversible (where feasible).
- Runtime configuration is auditable, reproducible, and applied deterministically.
- This domain cannot modify merchant commercial configuration truth; it only **applies** effective config sourced elsewhere.
- This domain does **not** own transaction records or settlement outcomes.

### Capability authority

- Device provisioning/registration into Tyro fleet systems
- OTA firmware/software distribution and rollout governance
- Connectivity management (profiles, monitoring, troubleshooting hooks)
- Remote device control commands (restart, diagnostics, config push)
- Runtime configuration deployment (apply “effective configuration” onto devices)
- Fleet observability and device health state management

### Data authority

- Fleet provisioning state
- Firmware versions, rollout plans/cohorts, rollout outcomes
- Device connectivity and last-seen status
- Applied configuration state (what is on the device now)
- Command and audit history
- Fleet health state

### Explicit non-authority (to prevent overlap)

- Physical asset lifecycle, warehousing, shipping → **Hardware & Asset Management**
- Merchant configuration truth (e.g., which MerchantIDs, terminal sharing groups, enablement rules) → **Payments Customer Configuration**
- Partner certification/testing frameworks → **Integration Enablement & Certification**
- Checkout session lifecycle and terminal UX flows → **Acceptance Runtime**
- Transaction switching, authorisation, clearing → **Payments Processing**

## Deposits Product Domain

**Regulated Deposit Products Authority (Product Policy + Customer Configuration + Ledger)**

### Domain purpose

Own Tyro’s regulated banking products and provide the authoritative capability set for deposit products by combining three bounded subcontexts within the Banking domain:

1. **Banking Product Policy** – defines what deposit products exist and their product rules
2. **Banking Customer Configuration** – defines how a specific customer’s banking is set up within product policy
3. **Banking Ledger** – maintains the regulated deposit ledger, postings, and balances

This domain is the system of record for **deposit account truth**, while still separating policy and customer configuration concerns to keep the ledger clean and stable.

### Domain consumer personas & typical JTBD

- **Merchant / business owner** → “Open/manage accounts, view balances, download statements, manage payees/limits.”
- **Banking operations** → “Maintain account state, resolve issues, manage holds/blocks, support servicing.”
- **Treasury / finance** (indirect) → “Understand deposit liabilities, interest accrual, maturity positions.”
- **Risk/compliance** (indirect) → “Apply compliance restrictions; confirm account posture.”
- **Product teams** → “Define banking product features, rules, and eligibility consistently.”

### Core data (by bounded subcontext)

#### 1) Banking Product Policy (bounded subcontext)

- Product catalog: transaction account, savings, term deposits
- Product terms and rules: eligibility rules (policy), fee/interest policy definitions (as rules), limits policies (as rules)
- Product lifecycle policies: open/close/block/unblock rules, deprecation policies for features
- References to commercial pricing plans (not fee calculations)

#### 2) Banking Customer Configuration (bounded subcontext)

- Customer banking profile and servicing preferences
- Payee/beneficiary lists (where applicable)
- Customer-specific limits/config within policy (e.g., transfer limits within allowed bands)
- Mandates/authorisations references (e.g., direct debit authority references if applicable)
- Notifications/preferences references (banking-specific, where not centralised elsewhere)
- Linkages to consent references for external services *(but consent lifecycle itself lives in Banking VAS Integrations)*

#### 3) Banking Ledger (bounded subcontext)

- Account records (AccountID linked to CustomerID)
- Ledger entries (immutable postings, double-entry)
- Derived balances
- Interest accrual schedules and postings
- Term deposit contracts (principal, term, maturity)
- Account status flags (active/blocked/frozen/closed) with reason codes
- Statements (authoritative outputs derived from ledger)

### Invariants

- **Ledger invariants (Banking Ledger)**
    - Double-entry ledger must balance.
    - Ledger entries are immutable; corrections are new postings.
    - Balances are derived from ledger, not edited directly.
- **Policy/config separation invariants**
    - Product rules live in Product Policy; customer-specific setup lives in Customer Configuration; neither may “rewrite” ledger truth.
    - Customer configuration must comply with product policy constraints.
- Account status transitions are auditable and reason-coded.
- This domain does not directly execute external payment rails; it records ledger effects of executed movements.

### Capability authority (by bounded subcontext)

#### Banking Product Policy

- Define deposit product types and capabilities
- Define eligibility and lifecycle policies (policy-level)
- Define interest/fee/limit policies (policy-level, versioned)
- Provide canonical interpretation of banking product features

#### Banking Customer Configuration

- Maintain customer-specific setup (payees, servicing preferences, limits within policy)
- Validate configuration against product policy
- Provide effective customer banking configuration to channels/servicing components

#### Banking Ledger

- Account lifecycle execution (open/maintain/block/unblock/close)
- Ledger posting and validation (double-entry controls)
- Interest accrual and term deposit lifecycle execution
- Statements and ledger-derived views

### Data authority

- Product policy definitions and versions (Banking Product Policy)
- Customer banking configuration records (Banking Customer Configuration)
- Account records, ledger entries, balances, term deposits, statements (Banking Ledger)
- Banking audit trail for account/config changes (within domain scope)

### Explicit non-authority (to keep boundaries clean)

- Transfer execution on rails (NPP/BECS/internal) → **Funds Movement Domain**
- Partner consent and external workflow orchestration → **Banking VAS Integrations Domain**
- Merchant payout calculation and settlement batches → **Settlement & Reconciliation Domain**
- Customer invoicing and AR → **Billing & Accounts Receivable Domain**
- Corporate statutory accounting → **Corporate Finance Domain**
- Customer identity master and group hierarchy → **Customer & Identity Domain**
- Credit decisions → **Credit & Underwriting Domain**
- Real-time fraud allow/deny decisions → **Fraud & Risk Decisioning Domain**
- AML/CTF posture and regulatory reporting → **Risk, Compliance & Regulatory Domain**  
*(Banking enforces blocks, but compliance owns the compliance outcome.)*

## Lending Product Domain

**Loan Products Authority (Product Policy + Customer Configuration + Contract/Sub-ledger)**

### Domain purpose

Own Tyro’s lending products and maintain authoritative loan product truth by combining three bounded subcontexts within the Lending domain:

1. **Lending Product Policy** – defines loan products, allowable terms, servicing policies
2. **Lending Customer Configuration** – defines borrower/loan-specific setup within policy (repayment method, mandates, servicing arrangements)
3. **Loan Contract & Loan Sub-ledger** – maintains loan contract truth, schedules, balances, and allocation rules

This domain is the system of record for **loan lifecycle and servicing truth**, while keeping product policy and customer configuration distinct from contract/sub-ledger truth.

### Domain consumer personas & typical JTBD

- **Merchant borrower** → “Accept offer, receive funds, view schedule, repay, manage servicing changes.”
- **Lending operations** → “Service loans, manage arrears/hardship configurations, handle restructures.”
- **Product teams** → “Define lending products and servicing policies safely.”
- **Support** (indirect) → “Explain repayments, balances, statements.”
- **Finance/treasury** (indirect) → “Understand exposures and repayment performance.”

### Core data (by bounded subcontext)

#### 1) Lending Product Policy (bounded subcontext)

- Lending product catalog (loan types)
- Allowed terms, fees types, repayment options (policy)
- Servicing policy definitions (arrears policy, hardship types supported, restructure policy)
- Eligibility policy references (high-level; decisions live in Credit & Underwriting)
- References to pricing policy inputs (risk grade references; commercial pricing rules live in Revenue)

#### 2) Lending Customer Configuration (bounded subcontext)

- Borrower preferences (repayment day, repayment method)
- Repayment account references (e.g., linked bank account)
- Mandates/authorisation references (e.g., direct debit authority references)
- Loan servicing configuration state (hardship plan parameters, repayment holiday config, restructure parameters)
- Notification/preferences references (loan servicing context)

#### 3) Loan Contract & Loan Sub-ledger (bounded subcontext)

- Loan contract (LoanID, borrower CustomerID, terms, conditions refs)
- Disbursement records (linked Funds Movement instruction refs)
- Repayment schedule (instalments, due dates, breakdowns)
- Balance components (principal outstanding, interest accrued, fees)
- Repayment transactions and allocation records
- Servicing state (active/in arrears/hardship/restructured/closed)
- Statements and borrower-facing servicing views (derived outputs)

### Invariants

- **Contract/sub-ledger invariants**
    - Loan cannot be activated without approved credit decision reference.
    - Repayment allocation is deterministic and auditable.
    - Balances are derived from the loan sub-ledger; no direct edits.
    - Contract amendments are explicit and traceable.
- **Policy/config separation invariants**
    - Product rules live in Product Policy; borrower setup lives in Customer Configuration; neither rewrites contract truth.
    - Customer configuration must comply with product policy constraints.
- Servicing state transitions are auditable and reason-coded.
- Loan servicing reconciles to actual executed cash movement (via Funds Movement references).

### Capability authority (by bounded subcontext)

#### Lending Product Policy

- Define loan products, terms options, and servicing policy (policy-level)
- Define allowed repayment methods and fee types (policy)
- Define servicing rule sets (arrears/hardship/restructure policy)

#### Lending Customer Configuration

- Maintain borrower/loan-specific setup (repayment method/day, mandates refs, servicing arrangements config)
- Validate borrower config against product policy
- Provide effective servicing configuration to contract/sub-ledger execution

#### Loan Contract & Loan Sub-ledger

- Loan contract lifecycle (create/amend/activate/close)
- Repayment schedule generation and servicing
- Repayment allocation and balance calculation
- Disbursement coordination (request execution; record outcomes)
- Loan statements and servicing views

### Data authority

- Lending product policy definitions and versions (Lending Product Policy)
- Borrower/loan configuration records (Lending Customer Configuration)
- Loan contracts, schedules, sub-ledger balances, allocation records, servicing state (Contract/Sub-ledger)
- Lending audit trail for changes within domain scope

### Explicit non-authority (to keep boundaries clean)

- Credit approval/decline and risk grade truth → **Credit & Underwriting Domain**
- Application workflow orchestration → **Customer & Product Onboarding Domain**
- Transfer execution for disbursement/repayments → **Funds Movement Domain**
- Regulated deposit ledger truth → **Deposits Product Domain**
- Commercial pricing and fee rule calculation → **Product Quoting & Pricing Domain**
- Customer identity master and group hierarchy → **Customer & Identity Domain**
- Fraud allow/deny decisions (operational) → **Fraud & Risk Decisioning Domain**
- AML/CTF posture and regulatory reporting → **Risk, Compliance & Regulatory Domain**
- Corporate statutory accounting → **Corporate Finance Domain**

## Credit & Underwriting Domain

**Credit Decision & Underwriting Policy Authority**

### Domain purpose

Assess creditworthiness and produce **authoritative credit decisions** for lending products by owning:

- Underwriting policy and decision models
- Data collection for credit assessment (bureau, internal signals, financials)
- Decision outcomes (approve/decline/conditions/limits)
- Auditability of rules/models used in each decision

This domain is the authoritative source for **credit decision truth**, while the Lending Product domain owns loan contract lifecycle and repayment obligations.

### Domain consumer personas & typical JTBD

- **Risk analyst / underwriter** → “Review applications; approve/decline; apply policy.”
- **Lending product team** → “Request decisions; enforce conditions; evolve underwriting rules.”
- **Fraud/risk/compliance** (indirect) → “Provide risk signals; ensure decisions are auditable.”
- **Merchant applicant** (indirect) → “Receive decision and understand conditions.”
- **Audit/regulators** (indirect) → “Review decision evidence and policy versioning.”

### Core data

- Credit application assessment record (DecisionRequestID) referencing ApplicationID/CustomerID
- Inputs: bureau responses, bank transaction summaries (references), financial statements (refs), merchant performance signals
- Credit score and risk grade outputs
- Decision outcome (approved/declined/conditional)
- Conditions (limits, covenants, required docs), pricing inputs (risk-based pricing references if used)
- Policy/rule/model version references and reason codes
- Manual review notes and approval trail

### Invariants

- Every decision is auditable and references the policy/model version used.
- Decision outcomes are deterministic given inputs + rule/model version (within defined tolerances).
- Manual overrides are explicit, approved, and traceable.
- This domain does not create loan contracts or post ledger entries.
- Decision validity/expiry is explicit (decisions can expire and require refresh).

### Capability authority

- Underwriting policy definition and governance (rules, scorecards, models)
- Credit decisioning (automated + assisted/manual)
- Integration orchestration for credit inputs (bureau pulls, document checks) *as assessment inputs*
- Decision issuance with conditions, limits, and reason codes
- Credit decision audit trail and reporting (credit-side)

### Data authority

- Credit decision records and history
- Underwriting policy/rule definitions and versions
- Credit scoring outputs and reason codes
- Manual review notes and approvals
- Decision validity windows/expiry metadata

### Explicit non-authority (to keep boundaries clean)

- Loan contract, repayment schedule, outstanding principal → **Lending Product Domain**
- Application workflow state machine → **Customer & Product Onboarding Domain**
- Customer identity master → **Customer & Identity Domain**
- Regulated banking ledger/balances → **Banking Domain**
- Fraud allow/deny decisions → **Fraud & Risk Decisioning Domain**
- AML/CTF compliance posture → **Risk, Compliance & Regulatory Domain**
- Commercial pricing policy (general) → **Product Quoting & Pricing Domain** *(credit may produce risk grade used as an input/reference)*
- Transfer execution for disbursement/repayments → **Funds Movement Domain**

## Accounting Product Domain  

**Merchant Financial Operating System Authority**

### Domain purpose

Provide merchant-facing financial management capabilities (via Thriday and related services) as the authoritative system for a merchant’s **operational accounting records**, including:

- Bookkeeping / journal entries for the merchant
- Chart of accounts (merchant-level)
- Period close and adjustment rules for merchant books
- GST/BAS (and related tax artefacts) support
- Merchant financial statements and reports

This domain exists to deliver a “merchant CFO/finance OS” layer that can integrate with Tyro product data (payments, banking, lending) but remains **distinct from Tyro’s corporate accounting** and from regulated banking ledgers.

### Domain consumer personas & typical JTBD

- **Merchant owner** → “Close my books; understand profit/cashflow; prepare BAS.”
- **Bookkeeper/accountant (SMB advisor)** → “Reconcile transactions, categorise, and produce compliant records.”
- **Merchant finance admin** → “Manage invoices/expenses categorisation; manage chart of accounts.”
- **Lending / risk teams** (indirect) → “Assess cashflow and business health signals (with consent).”
- **Support** (indirect) → “Troubleshoot accounting data issues and integrations.”

### Core data

- **Merchant chart of accounts** (merchant-level categories)
- **Merchant journals and journal lines** (double-entry)
- **Transaction categorisation / rules** (mapping bank/payment events to accounts)
- **Accounting periods & close state** (merchant books)
- **GST/BAS artefacts** (calculations, reports, lodgement support metadata)
- **Merchant financial statements** (P&L, balance sheet, cashflow)
- **Source event references** (links to banking transactions, settlement events, invoices, etc. — not authoritative copies)

### Invariants

- Merchant journals must balance (double-entry).
- Closed periods are immutable (changes require adjustments with audit trail).
- Source events are referenced and traceable (lineage to bank/payment inputs).
- Merchant accounting truth is separate from Tyro corporate GL truth.
- This domain does not own regulated deposit ledger balances (Banking domain does).

### Capability authority

- **Merchant bookkeeping & ledgering**
    - Create and maintain merchant journals
    - Categorisation rules and automation
    - Reconciliation workflows at merchant accounting level
- **Merchant reporting & compliance support**
    - Produce merchant financial statements
    - GST/BAS preparation support and reporting artefacts
    - Period close processes for merchant books
- **Accounting configuration**
    - Merchant chart of accounts management
    - Tax configuration, reporting preferences
    - Rules/templates for categorisation
- **Data ingestion/normalisation for merchant books** *(accounting perspective)*
    - Consume events/feeds from Banking, Payments, Billing etc.
    - Transform into merchant accounting entries (with clear traceability)

### Data authority

- Merchant chart of accounts
- Merchant journal entries and accounting period state
- Categorisation rules and reconciliation state (merchant accounting)
- Merchant tax artefacts (GST/BAS records)
- Merchant financial statements (derived from merchant books)

### Explicit non-authority (to keep boundaries clean)

- **Customer legal entity master and identity** → Customer & Identity Domain
- **Merchant acquiring configuration (MID, locations, terminal sharing groups)** → Payments Customer Configuration Domain
- **Transaction truth (authorisation/clearing/chargebacks)** → Payments Processing Domain
- **Settlement truth and payout balances** → Settlement & Reconciliation Domain
- **Deposit ledger entries and balances** → Banking Domain
- **Loan contract truth** → Lending Product Domain
- **Corporate accounting and statutory reporting** → Corporate Finance Domain
- **Partner commercial lifecycle** → Partnerships Domain
- **External accounting platform integrations consent/workflows** → Banking VAS Integrations Domain (if applicable)

## Funds Movement Domain

**Payment Rail Execution & Transfer State Authority**

### Domain purpose

Execute and track the lifecycle of **money movement instructions** across payment rails, including:

- BECS/Direct Entry transfers
- NPP/PayID/Osko transfers (where applicable)
- Internal transfers between Tyro accounts
- Collection instructions (e.g., invoice payments) where Tyro initiates movement
- Status tracking, returns, and idempotency controls

This domain is the authoritative source for **transfer execution state**, not the source of “why” a payment is being made, and not the ledger of balances (Banking domain).

### Domain consumer personas & typical JTBD

- **Settlement ops / finance ops** → “Execute payouts and handle returns.”
- **Billing/AR** → “Collect invoice payments via supported rails.”
- **Merchants** → “Receive settlement/payout; send supplier/payroll payments.”
- **Banking operations** → “Monitor transfer failures; resolve exceptions.”
- **Product/platform teams** → “Initiate transfers reliably and idempotently.”

### Core data

- Payment instruction (InstructionID, debtor/creditor accounts refs, amount, reference)
- Rail selection and routing metadata (BECS/NPP/internal)
- Execution status state machine (created/submitted/accepted/settled/failed/returned)
- Idempotency keys and correlation IDs
- Return codes and reason mapping
- Batch/grouping metadata (e.g., batch payments) *(batch orchestration may live elsewhere, but execution tracking lives here)*
- Operational telemetry (latency, failure rates)

### Invariants

- Instruction execution is idempotent (same idempotency key does not duplicate transfer).
- Transfer state transitions are deterministic and auditable.
- The domain must record rail outcomes (accepted/returned) faithfully.
- This domain does not own account balances or ledger postings; it emits execution events for Banking/Settlement to post appropriately.
- “Why” and policy eligibility is owned by the requesting domain (Settlement, Billing, Banking VAS, etc.).

### Capability authority

- Transfer instruction acceptance and validation (structural correctness, required fields)
- Rail orchestration and submission (BECS/NPP/internal)
- Status tracking, retries (where permitted), and reconciliation of rail responses
- Return/failed payment handling (return codes, notifications/events)
- Idempotency and correlation controls
- Transfer execution observability (execution health, failure reporting)

### Data authority

- Transfer instruction records and execution status history
- Rail routing decisions (as executed)
- Return codes, failure reasons, settlement/confirmation timestamps
- Idempotency/correlation records and audit trail

### Explicit non-authority (to keep boundaries clean)

- Regulated deposit ledger and balances → **Banking Domain**
- Settlement batch calculation and payable balances → **Settlement & Reconciliation Domain**
- Customer invoicing and collections policy → **Billing & AR Domain**
- External partner consent workflows (batch/payroll initiation) → **Banking VAS Integrations Domain**
- Customer master identity → **Customer & Identity Domain**
- Product pricing and fee policy → **Product Quoting & Pricing Domain**
- Customer-facing notifications → **Customer Notifications & Communications Domain** *(Funds Movement emits events; notifications decide what to send)*

## Billing & Accounts Receivable Domain

**Tyro Customer Billing, Invoicing & Receivables Authority**

### Domain purpose

Manage what customers **owe Tyro** by owning the authoritative lifecycle for:

- Billing accounts and billing profiles (how we bill a customer)
- Invoice generation and issuance
- Accounts receivable (AR) balances, aging, collections state
- Credits, adjustments, and write-off governance (AR perspective)

This domain ensures Tyro’s customer-facing charges (subscriptions, device rental, value-add fees, service charges, etc.) are invoiced and tracked consistently, while remaining separate from:

- Transaction processing and settlement (merchant payouts)
- Banking ledger (regulated balances)
- Corporate GL (statutory books)

### Domain consumer personas & typical JTBD

- **Finance ops / AR team** → “Issue invoices, track receivables, manage collections and disputes.”
- **Merchant admin** → “View invoices, understand charges, pay outstanding balances.”
- **Support** → “Explain invoice line items; raise billing disputes and credits.”
- **Revenue/pricing teams** (indirect) → “Ensure invoicing reflects commercial policy outputs.”
- **Corporate finance** (indirect) → “Reconcile AR outcomes into corporate books.”

### Core data

- Billing account/profile (CustomerID, billing contacts, delivery method, payment method refs)
- Invoice (InvoiceID, issue date, due date, status)
- Invoice line items (charge type, quantity, rate, reference to pricing decision)
- AR ledger (AR balance, aging buckets, payment allocations) *(AR sub-ledger, not the bank ledger)*
- Credits/adjustments/write-offs (with approvals and reason codes)
- Collections state (dunning stage, reminders sent, payment plans metadata)
- Dispute records (billing disputes, not scheme disputes)

### Invariants

- Invoices are immutable once issued (adjustments via credit notes / new invoices).
- AR balances reconcile to invoice issuance and payment allocation.
- Every invoice line item is traceable to an approved charge basis (e.g., pricing decision output).
- Collections actions are auditable and follow policy.
- This domain does not calculate commercial pricing rules; it consumes pricing outputs.

### Capability authority

- Billing account/profile management (where/ how to bill)
- Invoice lifecycle (draft → issued → paid/overdue/cancelled)
- AR sub-ledger management (aging, allocations, balances)
- Credits, adjustments, write-offs (AR governance)
- Collections orchestration (dunning rules, payment reminders, payment plan metadata)
- Billing dispute intake and tracking (billing context)

### Data authority

- Billing profiles and invoice records (including line items)
- AR balances, aging, payment allocation records
- Credit/adjustment/write-off records and audit trail
- Collections and billing-dispute state

### Explicit non-authority (to keep boundaries clean)

- Commercial pricing/fee calculation policy → **Product Quoting & Pricing Domain**
- Transaction truth (auth/clearing) → **Payments Processing Domain**
- Settlement netting/payout → **Settlement & Reconciliation Domain**
- Regulated bank ledger and customer bank account balances → **Banking Domain**
- Transfer execution (direct debit/collections rails) → **Funds Movement Domain** *(Billing requests collection; Funds Movement executes)*
- Corporate GL posting → **Corporate Finance Domain**
- Customer master identity → **Customer & Identity Domain**

# Business Operations Domains

## Customer Acquisition Domain

**Go-to-Market Pipeline, Marketing & Sales Execution Authority**

### Domain purpose

Manage Tyro’s **go-to-market engine** from market engagement through to a qualified, accepted opportunity and a clean handoff into **Customer & Product Onboarding**.

This domain is the authoritative source for **growth pipeline truth**, including:

- Marketing campaigns and lead generation
- Lead capture, enrichment, scoring, and routing
- Sales pipeline (opportunities), forecasting, and win/loss outcomes
- Channel and partner attribution for acquisition performance
- Pre-origination commercial intent packaging (products of interest, bundle intent, quote artefacts)

It does **not** own customer identity truth, product activation truth, merchant configuration truth, or pricing rule truth.

### Domain consumer personas & typical JTBD

- **Marketing / Growth** → “Run campaigns, capture leads, measure CAC/conversion, optimise funnels.”
- **Sales (AE/BDR)** → “Qualify leads, progress opportunities, forecast, close deals.”
- **Sales Operations** → “Define routing rules, stage gates, SLAs, territory/queue models.”
- **Partner/Channel teams** → “Track partner-sourced referrals and conversion outcomes.”
- **Revenue leadership** → “Monitor pipeline health and predict bookings.”
- **Origination/Onboarding** (downstream consumer) → “Receive a complete, qualified handoff package.”

### Core data

- **Campaigns & acquisition programs**
    - CampaignID, channel, audience definition (references), creatives/assets references
    - Spend, attribution metadata, experiment flags
- **Leads**
    - LeadID, source/channel/campaign attribution
    - Qualification signals (score, fit, intent), routing state
    - Contact points (non-authoritative snapshots), consent references
- **Accounts/Prospects (growth view)**
    - Prospect/account record used for selling context (not the legal/customer master)
- **Opportunities / pipeline**
    - OpportunityID, stage, expected close date/value
    - Product intent (payments/banking/lending/Thriday; bundle intent)
    - Competitive and win/loss notes, decision makers
- **Activity timeline**
    - Calls/emails/meetings/tasks and notes (commercial engagement record)
- **Offer/quote artefacts (intent-level)**
    - Quote metadata, proposed plan IDs, negotiated intent notes (references only)
- **Handoff package to Origination**
    - Requested products, captured artefacts, primary contacts, required context
    - Handoff status (sent/accepted/returned)
- **Attribution links**
    - PartnerID references (source), referral IDs, campaign IDs, channel IDs

### Invariants

- Growth pipeline is **not** the Customer system of record: CustomerID is owned by **Customer & Identity**.
- Leads and opportunities can exist without CustomerID; when a CustomerID exists, linkage must be explicit and not duplicated.
- Pipeline stages and transitions are auditable (stage changes tracked).
- Marketing/communication consent is **referenced**, not invented (Growth must consume consent from the authoritative source).
- Pricing in Growth is **quote/intent metadata**; authoritative fee rules and calculation remain in **Product Quoting & Pricing**.
- Handoff to Origination is idempotent (no duplicate applications without an explicit new request/version).

### Capability authority

- **Marketing campaign execution & optimisation**
    - Campaign lifecycle management, channel execution coordination
    - Funnel experimentation, landing pages/forms orchestration (where owned)
    - Lead generation and attribution tracking
- **Lead capture, enrichment, scoring & routing**
    - Capture leads from web, partners, events, outbound
    - Deduping (growth-level), enrichment, scoring models (growth-level)
    - Assignment/routing, follow-up SLAs
- **Opportunity & pipeline management**
    - Opportunity creation, stage progression, forecasting
    - Win/loss capture and pipeline analytics (commercial performance)
- **Channel & acquisition attribution**
    - Partner-sourced attribution (via PartnerID references)
    - Campaign/channel performance reporting
    - CAC and conversion metrics (growth-side truth)
- **Commercial intent packaging (pre-origination)**
    - Product interest capture, bundle intent, quote artefacts
    - “Ready for origination” package creation
- **Handoff orchestration to Customer & Product Onboarding**
    - Trigger application creation (or request it)
    - Pass captured artefacts/context
    - Track handoff status and remediation loops (missing info)

### Data authority

- Campaign records, attribution metadata, and growth experiments
- Lead records and their lifecycle (captured/qualified/disqualified)
- Opportunity records and pipeline stage truth
- Sales activity timeline and engagement artefacts
- Handoff package metadata and growth-side handoff status
- Acquisition attribution linkages (PartnerID/campaign/source IDs)

### Explicit non-authority (to keep boundaries clean)

- Customer legal entity master, users, groups/franchises → **Customer & Identity**
- Partner master record & partner lifecycle → **Partner Ecosystem**
- Consent/preference master (if centralised) → **Customer & Identity or Consent capability** *(Growth consumes)*
- Application workflow state machine & activation sequencing → **Customer & Product Onboarding**
- Merchant configuration (MIDs, locations, terminal sharing groups) → **Payments Customer Configuration**
- Payments runtime/transaction/settlement truth → **Payments Channels / Payments Processing / Settlement**
- Banking ledger / lending contract truth → **Banking / Lending**
- Authoritative pricing rules, fee calculation, commissions policy → **Product Quoting & Pricing**
- Billing invoices/AR → **Billing & Accounts Receivable**
- Regulatory decisions (KYC/AML) → **Risk, Compliance & Regulatory**

## Partnerships Domain  

**Partner Relationship & Commercial Participation Authority**

### Domain purpose

Maintain the authoritative record and lifecycle for **all third-party organisations Tyro engages with as partners**, and govern how those partners participate in Tyro’s **go-to-market** and **product ecosystem**.

This domain exists to provide a single, consistent “partner truth” across the business, covering partners that may be:

- **Referral / lead-source partners** (send leads/opportunities)
- **Service-providing partners** (e.g., POS vendors, loyalty providers, claiming providers)
- **Channel partners / resellers / ISOs**
- **Strategic partners** (enterprise/franchise arrangements)

It owns the **commercial relationship**, not the technical integration and not the customer identity model.

### Domain consumer personas & typical JTBD

- **Partner/BD manager** → “Onboard a partner, record the agreement, manage status and governance.”
- **Sales & Growth** → “Attribute leads to partners; understand partner eligibility; track partner performance.”
- **Partner operations / Finance ops** → “Validate partner eligibility for commission/revenue share; audit agreement changes.”
- **External partner admin** (if exposed via portal) → “Maintain partner profile, contacts, and view participation status.”
- **Product/Platform teams** (indirect) → “Confirm partner is active, what roles they have, and where to route partner-related questions.”

### Core data

- **Partner master record (PartnerID)**
    - Partner legal/registered identity (as partner) and key identifiers (e.g., ABN/ACN where needed)
    - Partner type(s) (multi-valued): referral, service provider, reseller, ISO, strategic, etc.
    - Partner lifecycle state (prospect/onboarded/active/suspended/offboarded)
    - Partner contacts (commercial/technical/finance) and communication preferences
- **Commercial participation model (metadata + references)**
    - Agreement/contract references, effective dates, renewal milestones
    - Commission/revenue-share **rule references** (not the calculation)
    - Eligibility flags (e.g., permitted verticals, segments, channels, regions)
- **Referral governance (for lead-source partners)**
    - Referral identifiers (codes, source IDs), attribution policy settings, expiry windows
    - Referral submission modes (portal/API/batch/manual) — as participation configuration
- **Relationship linkages (references, not duplicates)**
    - Links to CustomerID where the same organisation is also a customer
    - Links to Integration IDs where the partner provides services (POS/VAS/API)
    - Links to GroupID where relevant (e.g., franchisor acts as a partner)

### Invariants

- Every partner has a unique **PartnerID** and a deterministic lifecycle state.
- A partner may have **multiple partner roles simultaneously** (e.g., referral + service provider).
- Commercial terms are **versioned and effective-dated**; changes are auditable.
- Referral attribution policy is explicit and traceable.
- Partner lifecycle is distinct from Customer lifecycle:
    - Partner Ecosystem owns partner status
    - Customer & Identity owns customer status
- The Partnerships Domain does **not** become a copy of the customer master or the sales pipeline.

### Capability authority

- **Partner lifecycle management**
    - Onboard → activate → suspend → offboard
    - Maintain partner roles/types and eligibility constraints
    - Maintain partner contact model and operational governance metadata
- **Commercial relationship governance (as policy/metadata)**
    - Record agreement references, effective dates, renewal checkpoints
    - Maintain commission / revenue-share model references and eligibility conditions
    - Maintain participation constraints (allowed channels/verticals/regions)
- **Referral participation governance**
    - Manage referral identifiers and partner attribution settings
    - Define/refine referral mechanism configuration (how the partner can submit/track)
    - Provide partner attribution “truth” to Growth systems
- **Partner directory / lookup services (internal)**
    - Provide authoritative queries such as:
        - “Is this entity an active partner?”
        - “What partner roles do they have?”
        - “What agreement/eligibility references apply?”
        - “Which contacts are responsible?”

### Data authority

- Partner master record (PartnerID) and lifecycle state
- Partner roles/types and eligibility flags
- Partner contacts and governance metadata
- Agreement/contract references and effective dates
- Referral identifiers and attribution configuration
- Relationship links (PartnerID↔CustomerID, PartnerID↔IntegrationID, PartnerID↔GroupID)

### Explicit non-authority (to keep boundaries clean)

- **Customer legal entity master & group/franchise hierarchy** → Customer & Identity
- **Lead/opportunity pipeline and sales stages** → Customer Acquisition & Growth
- **Technical integration specs and runtime connectivity** → POS Integration / Payments VAS / Banking VAS
- **Certification lifecycle and conformance evidence** → Integration Enablement & Certification
- **Merchant configuration to enable a partner’s service** → Payments Customer Configuration (+ VAS enablement where relevant)
- **Commission/revenue calculations and invoicing** → Product Quoting & Pricing + Billing & AR  
*(Partner Ecosystem provides eligibility + rule references, not the financial calculation or ledger.)*

---

## Groups & Enterprises Domain  

**Enterprise/Franchise Policy & Control Authority**

### Domain purpose

Manage the policies, control structures, and governance rules required to support **enterprise and franchise operating models** where multiple customer legal entities operate under a shared umbrella (e.g., franchisor/franchisees, corporate groups, multi-brand enterprises).

This domain exists to keep core SMB product models clean by owning **group-level governance truth** (e.g. rules because you are in a groups), including:

- Head office oversight and delegated controls
- Group-level policy overrides (commercial and operational)
- Cross-entity configuration constraints and standards
- Group-wide reporting structures and aggregation rules
- Special enterprise/franchise constructs (e.g., fee carve-outs, settlement routing policies)

It is authoritative for **group governance and policy**, not for customer identity master, merchant configuration truth, transaction truth, settlement balances, or pricing engine calculation.

### Domain consumer personas & typical JTBD

- **Enterprise admin / franchisor head office** → “Manage group policy across many customers; standardise controls and reporting.”
- **Franchisee / branch operator** → “Operate independently within group policy constraints.”
- **Enterprise sales / deal desk** → “Apply negotiated group constructs (pricing overrides, governance terms).”
- **Finance ops / settlements ops** → “Apply group routing rules and fee carve-outs consistently.”
- **Support** → “Understand group structure and enforce correct access/control behaviour.”
- **Product/platform teams** → “Implement enterprise features without polluting SMB domains.”

### Core data

- **Group governance profile (GroupPolicyID)**
    - Governance type (franchise, corporate group, enterprise hierarchy)
    - Allowed/required operating policies (e.g., standardised configurations)
    - Delegation model (what head office can control vs franchisee)
- **Control & delegation rules**
    - Role/permission delegation patterns (policy-level; identity enforcement remains in Customer & Identity)
    - Allowed actions by entity type (head office vs site vs franchisee)
- **Group-level operational policies**
    - Standardisation rules for merchant/location configuration constraints (policy references)
    - Cross-entity configuration baselines (e.g., standard receipts branding policy, terminal branding policy)
    - Exceptions/waivers (policy-level)
- **Group financial governance policies (policy only)**
    - Settlement routing policies (e.g., where payouts route under group rules)
    - Fee carve-out policies (e.g., franchisor fee deduction logic as policy)
    - Consolidation/aggregation rules (what can be viewed/rolled up)
- **Group reporting & aggregation model**
    - Roll-up hierarchies for reporting (group → region → store)
    - Group KPIs and segmentation metadata (for reporting)
- **Links (references, not copies)**
    - GroupID reference from Customer & Identity
    - PartnerID reference when franchisor is also a partner
    - Pricing override references consumed by Product Quoting & Pricing
    - Settlement routing references consumed by Settlement domain

### Invariants

- Group governance policy must be **explicit, versioned, and auditable**.
- Group policy cannot override regulated ledger invariants (Banking) or transaction truth (Payments).
- Group governance is applied by consuming domains; this domain defines the rules, it doesn’t execute financial movements.
- Delegated control must be consistent with identity model (Customer & Identity remains authoritative for users/roles).
- Any carve-out or routing policy must be reproducible and effective-dated.
- Group policy must not become a duplicate of merchant configuration truth (Payments Customer Configuration remains authoritative for actual configuration records).

### Capability authority

- **Enterprise/group governance policy management**
    - Define and maintain group governance profiles and policy sets
    - Manage delegation/control rules for head office vs member entities
    - Maintain group-specific operating constraints and standards
- **Group-level override policy definition (not calculation)**
    - Define group-level pricing override policies (as rules/references) for Revenue domain consumption
    - Define settlement routing policies and fee carve-out policies for Settlement domain consumption
    - Manage policy exceptions/waivers with audit trail
- **Group reporting structure governance**
    - Define and maintain roll-up structures and aggregation logic for enterprise reporting views
    - Provide canonical “enterprise hierarchy view” for analytics and experience layers
- **Cross-entity governance signals**
    - Emit governance change events (policy updated, membership changes referenced, delegation updated)
    - Provide query APIs for “what policy applies to this customer/merchant under this group?”

### Data authority

- Group governance policy records (GroupPolicyID) and versions
- Delegation/control rule sets (policy-level)
- Group-level operational policy baselines and exceptions
- Settlement routing and fee carve-out policy definitions (not settlement outcomes)
- Reporting aggregation structures (roll-up models)
- Governance audit trail

### Explicit non-authority (to keep boundaries clean)

- **Group/franchise membership and hierarchy identity** → Customer & Identity (GroupID + membership)
- **User identities and access enforcement** → Customer & Identity (RBAC); this domain only defines delegation policy
- **Merchant configuration records (locations, enablement, terminal sharing groups)** → Payments Customer Configuration
- **Transaction truth, clearing, disputes** → Payments Processing
- **Settlement batch computation and merchant balances** → Settlement & Reconciliation
- **Commercial fee calculation and rate engine** → Product Quoting & Pricing
- **Bank ledger balances / regulated account state** → Banking
- **Loan contracts / credit decisions** → Lending / Credit
- **Partner commercial lifecycle** → Partner Ecosystem

## Corporate Finance Domain

**Tyro Corporate Books & Statutory Reporting Authority**

### Domain purpose

Maintain Tyro’s **corporate financial books** and statutory financial reporting as the authoritative source for:

- Corporate general ledger (GL) and journal postings
- Accounting periods and close processes
- Statutory and management financial statements
- Corporate-level allocations, accruals, tax and audit artefacts (where applicable)

This domain exists to clearly separate:

- **Product/customer financial truth** (e.g., merchant settlements, banking ledgers)  
from
- **Tyro corporate accounting truth** (the company’s P&L, balance sheet, statutory close).

### Domain consumer personas & typical JTBD

- **Finance (Financial Control)** → “Post journals, run period close, produce statutory accounts.”
- **FP&A** → “Consume GL outputs for performance reporting and forecasting.”
- **Treasury** → “Understand corporate cash positions and reconciliations.”
- **Audit / external accountants** → “Review evidence, controls, and postings.”
- **Product finance** (indirect) → “Reconcile product sub-ledgers and revenue outputs into corporate GL.”

### Core data

- **Chart of accounts** (GL account structure)
- **Journal entries** (debits/credits, references to source systems)
- **Accounting periods** (open/closed, close calendar, adjustments)
- **Accruals, allocations, reclasses**
- **Statutory reporting artefacts** (financial statements, trial balance, audit packs metadata)
- **Reconciliation metadata** (source-to-GL reconciliation status and evidence references)

### Invariants

- Double-entry journals must balance (debits = credits).
- Accounting periods once closed are immutable (adjustments via controlled process).
- Every journal is traceable to an approved source (or documented manual entry).
- Corporate GL is the single source of truth for Tyro statutory financials.
- This domain does not own product sub-ledger truth (it consumes summarised/validated inputs).

### Capability authority

- **Corporate journal posting & adjustments**
    - Create/post journals (manual and automated)
    - Manage accruals, allocations, intercompany postings (if applicable)
    - Maintain posting rules and controls for corporate accounting
- **Period close management**
    - Period status, close calendar, approvals
    - Close execution and controlled reopening/adjustment workflows (if allowed)
- **Corporate financial reporting**
    - Trial balance, P&L, balance sheet, cashflow reporting
    - Statutory reporting packs and audit artefacts production (or orchestration)
- **Corporate reconciliation governance (corporate perspective)**
    - Track reconciliation status of key sources feeding the GL
    - Manage evidence and sign-offs (corporate-side)

### Data authority

- Chart of accounts
- Corporate journals and posting history
- Accounting periods and close status
- Corporate financial statements and reporting artefacts
- Corporate reconciliation status metadata and evidence references

### Explicit non-authority (to keep boundaries clean)

- **Merchant settlement balances and payout truth** → Settlement & Reconciliation Domain
- **Banking deposit ledger entries and balances** → Banking Domain
- **Merchant accounting/journals (customer books)** → Accounting Product Domain
- **Transaction-level acquiring truth (authorisations/clearing/chargebacks)** → Payments Processing Domain
- **Commercial pricing rules/fee calculation policy** → Product Quoting & Pricing Domain
- **Invoicing and receivables (customer billing)** → Billing & Accounts Receivable Domain
- **Enterprise analytics and derived reporting datasets** → Data, Intelligence & AI Domain  
*(though it may consume corporate GL outputs as a governed data product)*


**Trust & Compliance Guardrails **

- **Fraud & Risk Decisioning** answers: *“Should we allow this action right now, and what control should apply?”*
- **Risk, Compliance & Regulatory** answers: *“Are we compliant, what regulatory obligations apply, and what evidence/reporting do we need?”*

## Risk, Compliance & Regulatory Domain

**Regulatory Obligations, AML/CTF Compliance, Risk Controls & Regulatory Reporting Authority**

### **Domain purpose**

Provide Tyro’s authoritative capability for managing **regulatory obligations and compliance controls** across the customer lifecycle (onboarding and in-life), ensuring Tyro can operate as a regulated Australian business bank with auditable adherence to applicable regulatory requirements.

This domain exists to:

- Define, execute, and evidence Tyro’s compliance obligations and risk controls (including AML/CTF) across products and channels
- Own regulatory decisioning outcomes (e.g., KYC/CDD outcomes, customer risk ratings, restrictions and escalations) and publish them for operational enforcement
- Operate ongoing due diligence, monitoring and review processes (customer- and transaction-based) and trigger investigations and reporting when required
- Provide regulatory reporting, attestations, and evidence for regulators and internal governance

Operational domains remain authoritative for transaction truth, product lifecycles, and ledger truth. This domain is authoritative for **regulatory policy execution and outcomes**.

### **Domain consumer personas & typical JTBD**

- **Compliance (AML/CTF, regulatory compliance)** → “Define obligations and controls; execute compliance checks; demonstrate compliance to regulators.”
- **Financial crime / investigations team** → “Monitor customer and transaction risk; triage alerts; escalate to investigations and reporting.”
- **Risk (operational and enterprise risk)** → “Maintain risk frameworks; validate control effectiveness; manage risk issues.”
- **Customer onboarding / servicing teams** → “Know what checks are required and whether a customer can be activated / continue in-life.”
- **Product domains (Payments, Banking, Lending)** → “Consume compliance outcomes (approve/decline/restrict) and apply them consistently.”
- **Case management / operations** → “Receive escalations and manage investigation workflows with traceability.”
- **Audit / regulators** → “Access evidence, lineage and audit trail of decisions and control operations.”

### **Core data**

- **Regulatory obligations and control catalogue**
    - Obligations by regime (e.g., AML/CTF), control objectives, control definitions, evidence requirements
- **Customer due diligence (CDD) decision records**
    - KYC/KYB outcomes (pass/fail/conditional), timestamps, decision rationale codes, versioning
    - Verification method/type references (and pointers to evidence metadata stored elsewhere)
- **Customer risk assessment and rating**
    - Customer risk score/rating, drivers, assessment versioning, review cadence, reviewer/approver metadata
    - Segment/typology classification and risk flags (e.g., high-risk indicators)
- **Ongoing customer due diligence (OCDD) records**
    - Monitoring triggers, periodic review requirements, review outcomes, escalation references
- **Enhanced customer due diligence (ECDD) records**
    - ECDD triggers, enhanced checks required, outcomes, approvals, restrictions, evidence references
- **Periodic KYC refresh**
    - Refresh schedules, due/overdue state, refresh outcomes, gating/restriction references
- **Ongoing monitoring artefacts**
    - **Customer monitoring** signals/alerts (behavioural changes, risk factor changes)
    - **Transaction monitoring** alerts (rule/model outputs, typology matches), alert metadata and dispositions
- **Regulatory action outcomes**
    - Approve/decline/restrict decisions, restriction types, conditions, time-bounds, review requirements
- **Regulatory reporting artefacts**
    - Report submissions metadata, reportable event references, statuses, acknowledgements, evidence packs references
- **Control operation evidence and audit trail**
    - Control runs, exceptions, waivers, sign-offs, lineage references to inputs and decisions

### **Invariants**

- Regulatory outcomes (KYC/CDD, risk ratings, restrictions) are **authoritative only in this domain** and must be consumed by other domains via API/event references.
- Every decision and outcome is **auditable** (who/what/when/why) and traceable to inputs, policy/rule versions, and evidence references.
- Customer risk assessment is **versioned**, time-effective, and reviewable; changes must be attributable and reproducible.
- OCDD/ECDD triggers and outcomes are explicit, reason-coded, and linked to the customer and relevant monitoring signals.
- Periodic KYC refresh must be enforceable (due/overdue) with defined actions (e.g., restrict capabilities) and escalation paths.
- Monitoring (customer and transaction) produces **alerts and dispositions**; final business actions are enforced in operational domains based on published compliance outcomes.
- The domain does not mutate operational transaction truth or ledgers; it references authoritative events and publishes compliance outcomes.

### **Capability authority**

- **CDD/KYC/KYB policy execution and decisioning**
    - Determine required checks for a customer context (by regime/policy)
    - Execute/coordinate identity verification and due diligence checks (including ongoing checks)
    - Produce authoritative KYC/CDD outcomes (pass/fail/conditional) and publish decision events
- **Customer risk assessment (financial crime / AML risk rating)**
    - Define and execute customer risk assessment approach and scoring/rating
    - Maintain review cadence and triggers, including segment changes and risk driver updates
    - Publish authoritative customer risk ratings and associated constraints/requirements
- **OCDD (ongoing due diligence)**
    - Define and operate ongoing customer monitoring requirements
    - Trigger periodic reviews and event-based reviews, manage dispositions and escalation criteria
- **ECDD (enhanced due diligence)**
    - Define ECDD program requirements and triggers
    - Coordinate enhanced checks, approvals, restrictions, and outcomes
    - Publish ECDD outcomes and enforceable restrictions/conditions for operational domains
- **Ongoing monitoring (customer and transaction)**
    - Define and operate transaction monitoring and customer monitoring controls (rules/models/threshold governance)
    - Triage alerts, manage dispositions (clear/escalate), and trigger investigations/reporting when required
    - Coordinate with AI/ML Operations and Data Platform where monitoring uses ML/data products (without delegating decision authority)
- **Periodic KYC refresh management**
    - Maintain refresh policy and schedules, due/overdue tracking, and gating outcomes
    - Trigger refresh activities and publish resulting outcomes and restrictions where applicable
- **Regulatory reporting and evidence**
    - Determine reportability and reporting requirements; manage submission workflows and attestations
    - Maintain evidence packs, audit trails, and compliance reporting metadata
- **Compliance outcomes publication for enforcement**
    - Publish compliance decision events and restriction directives for consumption by operational domains
    - Provide explainability services for “why restricted/declined” based on decision records and policy versions

### **Data authority**

- Regulatory decision records and outcomes (KYC/CDD/KYB, customer risk ratings, OCDD/ECDD outcomes, periodic refresh outcomes)
- Monitoring alerts and dispositions (customer and transaction monitoring) and their audit metadata
- Restriction/condition directives and time-bound enforcement instructions (policy outcomes)
- Regulatory reporting artefacts metadata and evidence references
- Control operation evidence, attestations, exceptions/waivers, and audit trail metadata

### **Explicit non-authority (to keep boundaries clean)**

- Customer/party master identity, legal entity/person records, and user access control → Customer & Identity Domain
    - (This domain stores references to identity evidence; it does not master identity.)
- Onboarding/origination journey state and product activation orchestration → Customer & Product Onboarding Domain (and relevant servicing/orchestration domains)
- Transaction truth (authorisation, clearing lifecycle) → Payments Processing Domain
- Dispute/chargeback case lifecycle → Disputes & Chargebacks Domain
- Settlement obligation calculation and payout truth → Settlement & Reconciliation Domain
- Payments sub-ledger journals/control accounts → Payments Accounting Domain
- Regulated deposit ledger postings/balances → Deposits Product Domain (Banking Ledger)
- Funds transfer execution lifecycle (rails outcomes) → Funds Movement Domain
- Investigation case workflow tooling and queues → Operational Investigations & Exceptions Domain
    - (This domain triggers/escalates cases and provides decisions/outcomes; case workflow is managed elsewhere.)
- Analytical data products, semantic models, and dashboards → Data Platform Domain
- AI/ML model lifecycle tooling and deployment operations → AI / ML Operations Domain


## Fraud & Risk Decisioning Domain  

**Operational Fraud Prevention & Real-Time Risk Decision Authority**

### Domain purpose

Prevent fraud and misuse by providing a **low-latency decision engine** that produces operational risk outcomes used inline in product flows, primarily in acquiring payments (CP/CNP), and optionally in adjacent areas (e.g., payment initiation limits, account takeover protection).

This domain is the authoritative source for:

- Fraud/risk scores
- Inline decisions: approve / decline / step-up / hold / throttle
- Reason codes and control recommendations
- Decision telemetry and model/policy versions used

It does **not** own AML/CTF compliance monitoring, sanctions screening, or regulatory reporting (those belong to Risk, Compliance & Regulatory).

### Domain consumer personas & typical JTBD

- **Payments/channel engineers** → “Request a fraud decision inline during checkout/authorisation.”
- **Fraud operations** → “Tune rules/models; reduce fraud losses; manage false positives.”
- **Risk analysts** → “Analyse trends; adjust thresholds; define decision policies.”
- **Support/ops (indirect)** → “Explain declines/step-ups and resolve false positives.”
- **Security/identity teams (adjacent)** → “Detect account takeover patterns; trigger step-up controls.”

### Core data

- **Decision request context (canonical model)**
    - Transaction/session signals (amount, tokenisation state, merchant context, device/session info)
    - Behavioural signals (velocity, anomaly indicators)
    - Entity references (CustomerID/MerchantID/UserID)
    - Correlation and idempotency keys
- **Decision outputs (authoritative)**
    - Risk score(s), confidence
    - Decision outcome (approve/decline/step-up/hold/throttle)
    - Reason codes and policy/model references
    - Recommended controls (step-up method, limit adjustments suggestion)
    - TTL/expiry for decisions where applicable
- **Policy/model governance artefacts (operational)**
    - Fraud rule sets and thresholds (versioned)
    - Model versions and calibration metadata (versioned)
    - Rollout cohorts / experiments / feature flags (optional but common)
- **Operational telemetry**
    - Latency, error rates, throughput
    - Drift/quality indicators (where measured)
    - Decision audit trail (what was decided, using what version)

### Invariants

- Decisions are **deterministic and reproducible** given inputs + policy/model version.
- Inline decisions are **low latency and highly available** (meets channel SLAs).
- Every decision includes **reason codes** and **version references**.
- Idempotency is enforced (same idempotency key yields same outcome).
- This domain does **not** mutate transaction truth or ledger balances.
- Decision outcomes have clear **control semantics** (what downstream systems are permitted/required to do).

### Capability authority

- **Inline fraud decisioning**
    - Real-time scoring and decision API
    - Step-up recommendations and control selection
    - Velocity/throttling decisions (where applied inline)
- **Near-real-time adaptive controls**
    - Streaming evaluation for burst attacks/patterns
    - Dynamic posture changes (e.g., temporarily elevate scrutiny)
- **Operational policy & model lifecycle**
    - Rule/threshold management for fraud controls
    - Model rollout governance (canary/cohorts)
    - Decision performance monitoring and tuning workflows
- **Decision event publishing**
    - Emit decision outcomes/alerts for: Case Mgmt, Compliance, Analytics

### Data authority

- Fraud/risk decision records (scores, outcomes, reasons, TTL)
- Operational fraud policy definitions and versions
- Model/version registry for decisioning (if not centralised elsewhere)
- Decision telemetry (latency/errors/volumes)
- Canonical decision request/response schemas

### Explicit non-authority (to keep boundaries clean)

- **AML/CTF monitoring, sanctions screening, regulatory reporting** → Risk, Compliance & Regulatory
- **Transaction truth and chargeback lifecycle** → Payments Processing
- **Checkout UX/session state** → Acceptance Runtime / Experience & Channel
- **Merchant configuration truth (incl. terminal sharing groups)** → Payments Customer Configuration
- **Settlement computation** → Settlement & Reconciliation
- **Bank ledger** → Banking Domain
- **Case workflow lifecycle** → Operational Investigations & Exceptions  
*(Fraud emits alerts/decisions; Case runs the investigation workflow.)*
- **Customer identity master** → Customer & Identity
- **Enterprise analytics/feature store** → Data, Intelligence & AI (where centralised)

## Disputes & Recovery Domain

**Dispute Operations & Recovery Authority**

### Domain purpose

Manage disputes arising from payments acquiring by operating two tightly-coupled but distinct workflows:

1. **Dispute workflow (scheme-managed / non-economic)** — system-of-record for scheme dispute progression (case state, evidence, deadlines, scheme interactions, and final scheme outcomes).
2. **Recovery workflow (Tyro-managed / economic)** — system-of-record for Tyro’s liability/economic outcomes and the resulting **FinancialCommitment intents** (i.e., how value is recovered or loss is allocated).

This domain exists to:

- Provide a single operational “case truth” for scheme disputes across chargebacks, retrieval requests, representment, and escalation stages
- Coordinate evidence collection/submission and enforce scheme deadline governance
- Publish authoritative **scheme outcomes** (win/loss/partial, reason codes, expiry/timeout) for downstream consumers
- Publish authoritative **recovery outcomes** and translate them into explicit **FinancialCommitment intents** (e.g., debit merchant, reverse debit, assess fee, Tyro write-off)
- Maintain strict separation between **scheme adjudication truth** (dispute) and **economic consequence truth**(recovery), while keeping them linked and auditable
- Emit canonical events consumed by Settlement, Finance, Risk, Support, and Analytics
- Maintain strict separation between **scheme adjudication truth** and **Tyro economic commitment truth**, while keeping them linked and auditable

### Domain consumer personas & typical JTBD

- **Disputes ops** → “Work scheme cases correctly; submit evidence on time; close cases with auditable outcomes.”
- **Risk & fraud** → “Consume dispute outcomes + recovery decisions, detect patterns, refine controls.”
- **Finance / settlement ops** → “Receive clear economic intents and apply them consistently into settlement and accounting.”
- **Support / CX** → “Explain dispute status and outcomes; coordinate merchant responses.”
- **Product & engineering** → “Automate dispute handling and decisioning while keeping scheme truth and financial truth clean.”

### Core data

#### A) Dispute workflow (scheme-managed) — SoR

- **Dispute Case record (DisputeCaseID)**
    - Link references: TransactionID / Clearing reference / MerchantID / Customer references
    - Dispute type/category (e.g., chargeback, retrieval request, pre-dispute)
    - Scheme/network identifiers and interaction references
- **Scheme case state & outcomes**
    - Case status, key timestamps, final outcome classification (win/loss/partial)
    - Scheme reason codes and outcome reasons
    - Expiry/timeout markers
- **Deadlines & obligations**
    - Scheme deadline references, internal SLA checkpoints
    - Required actions and completion tracking
- **Evidence coordination references**
    - Evidence checklist references and completeness status
    - Document/artifact references (pointers only; not storing documents)
    - Submission references and acknowledgements

#### B) Recovery workflow (Tyro-managed) — SoR

- **Recovery Decision record (DecisionID) linked to DisputeCaseID**
    - Liability decision outcome(s) and rationale references
    - Decision timing, versioning, overrides, approvals
- **FinancialCommitment intents (CommitmentID)**
    - Intent type: debit merchant / reverse debit / assess fee / Tyro write-off / other commitment patterns
    - Amount/currency references and target party references (merchant vs Tyro)
    - Linkage to the originating dispute case + scheme outcome references (where relevant)
    - Downstream status references (accepted/applied by Settlement/Finance), without owning settlement truth

#### Shared operational controls & telemetry

- Work allocation / queue state
- Ageing/backlog metrics, SLA breach indicators
- Audit trail of actions/decisions with correlation metadata

### Invariants

- **Two truths, one linkage:** scheme dispute truth and Tyro economic commitment truth are **separate systems-of-record**, linked by stable identifiers.
- **Scheme truth is never rewritten by economic decisions:** Tyro decisioning cannot mutate scheme outcomes; it references them.
- **Economic intents are explicit:** any merchant/Tyro financial consequence must be represented as an explicit **FinancialCommitment intent**, not implicit inference.
- **Deadline correctness is mandatory:** scheme deadlines and internal SLAs are tracked deterministically and auditable.
- **Evidence is reference-based:** this domain coordinates evidence, but does not become the document store.
- **Downstream application is delegated:** Settlement/Finance execute and account for financial consequences; this domain owns the intent and its lineage.

### Capability authority

#### Dispute workflow (scheme-managed)

- **Case intake, triage & orchestration** across dispute types
- **Scheme interaction coordination** (submission/response tracking)
- **Evidence coordination** (requests, completeness, submission references)
- **Deadline & SLA management** (scheme deadlines, escalation, exceptions)
- **Authoritative scheme outcome publishing** (win/loss/partial, reason codes, expiry/timeout)

#### Recovery workflow (Tyro-managed / economic)

- **Liability & decision outcome management** (decision SoR)
- **FinancialCommitment intent authoring** (debit/reverse/fee/write-off intents)
- **Downstream signalling** of intents to Settlement/Finance and visibility to Support/Risk
- **Decision governance** (approvals/overrides references, auditability)

### Data authority

- Dispute case master record and scheme-managed lifecycle truth
- Evidence coordination references and deadline/SLA artefacts
- Final scheme outcomes (win/loss/partial, reason codes, expiry/timeout)
- Recovery records (Tyro decision) for liability/economic outcomes
- FinancialCommitment intents and their lineage to dispute cases/outcomes
- Operational audit trails and correlation metadata

### Explicit non-authority (to keep boundaries clean)

- **Transaction master record, authorisation state** → Payments Processing Domain
- **Scheme clearing ingestion & clearing truth (incl. clearing adjustments as records)** → Payments Processing Domain
- **Merchant payout calculation, settlement batches, merchant payable balances, application of debits/credits** → Settlement & Reconciliation Domain
- **Transfer execution (rails movement)** → Funds Movement Domain
- **Payment GL journals and statutory books** → Payment Accounting Domain
- **Commercial pricing plans / product fee rules** → Product Quoting & Pricing Domain
    - (Disputes may *trigger* fee commitments; it does not own fee plan policy.)
- **Fraud policy ownership / risk decision policy** → Fraud & Risk Decisioning Domain
- **AML/CTF & regulatory reporting** → Risk, Compliance & Regulatory Domain
- **Customer support case workflow** → Customer Service & Support Domain
- **Analytics/feature store/model outputs** → Data, Intelligence & AI Domain
- **Merchant configuration / enablement** → Payments Customer Configuration Domain

# Partner Integrations & Value-Add Services Domains

## Payments VAS Integrations Domain 

**In-Flow Acquiring Value-Add Orchestration Authority**

### Domain purpose

Enable and operate **value-added services that are invoked within the acquiring payment flow** (typically during checkout / authorisation), by integrating Tyro’s acceptance and payment flows with approved third-party providers.

This domain’s job is to keep **core payments clean** while allowing modular plug-ins such as:

- Health claiming (e.g., Healthpoint)
- Dynamic Currency Conversion (e.g., PureCommerce)
- Charity / donations
- Loyalty enrichments that occur at checkout
- Other “in-flow” services tightly coupled to payment acceptance

It is authoritative for **VAS invocation, provider abstraction, and VAS outcomes**—not for transaction truth.

### Domain consumer personas & typical jobs to be done

- **Merchant / store operator** → “Offer claiming / DCC at checkout.”
- **Merchant admin / support** → “Enable/disable VAS and troubleshoot issues.”
- **VAS provider** (indirect) → “Receive standardised requests and return responses.”
- **Payments product/platform** → “Add/modify VAS without changing Payments Processing.”
- **Ops/SRE** → “Monitor provider health; degrade gracefully.”

### Core data

- **VAS Provider registry** (provider identity, capabilities, endpoints/adapters, SLAs)
- **Merchant VAS enablement state** (MerchantID ↔ enabled VAS, parameters, routing rules)
- **VAS invocation records** (InvocationID, linked CheckoutSessionID/TransactionID references, request/response snapshots, outcomes, latency/errors)
- **Provider health / circuit breaker state** (availability, timeouts, error rates)
- **VAS canonical models** (Tyro-standard request/response schemas independent of provider)

### Invariants

- VAS **must not mutate** transaction truth or scheme clearing state.
- Payments Processing remains authoritative for **TransactionID**, authorisation, clearing, disputes.
- VAS invocation must be **idempotent** and **auditable**.
- Merchant must be explicitly enabled before VAS invocation.
- VAS failures must not corrupt the payment lifecycle (explicit fail-open/fail-closed policies per VAS type).
- Provider-specific differences are contained behind adapters; upstream domains use canonical models.

### Capability authority

- **VAS invocation orchestration**: when to call a provider; request/response choreography; timeouts/retries/fallback policies
- **Provider abstraction layer**: mapping canonical ↔ provider protocols; adapter versioning
- **Merchant-level VAS enablement**: enable/disable per merchant/channel/device; validate config; routing to provider
- **Operational resilience controls**: circuit breakers; degradation; alerting triggers for provider failure
- **VAS outcome normalisation**: standardised outcomes surfaced to Runtime/Support tooling

### Data authority

- Merchant VAS enablement configuration (for acquiring VAS)
- Provider registry (for acquiring VAS)
- VAS invocation outcomes and telemetry state
- Provider health state and operational control flags

### Explicit non-authority (bright lines)

- Commercial contract/commission → **Partner Ecosystem / Revenue**
- Certification state (“is this integration certified?”) → **Integration Enablement & Certification**
- Checkout UX/session truth → **Acceptance Runtime**
- Transaction truth (authorisation/clearing/chargebacks) → **Payments Processing**
- Merchant master/config (beyond VAS enablement subset) → **Payments Customer Configuration**

## POS Integration Domain

**POS Integration Authority**

### Domain purpose

Define and operate the **POS integration surface** for Tyro acquiring so POS vendors can initiate and manage payment flows reliably and consistently across supported channels (typically in-store, sometimes omnichannel extensions).

This domain owns the **technical integration model** for POS → Tyro (patterns, capabilities, adapters), not the commercial partnership and not cross-ecosystem certification governance.

### Domain consumer personas & JTBD

- **POS vendor engineer** → “Integrate Tyro payments into my POS product.”
- **Tyro solutions/partner engineer** → “Support partner integration design, troubleshoot integration issues.”
- **Payments product/platform teams** → “Evolve POS integration capabilities without breaking partners.”
- **Merchant support** (indirect) → “Resolve POS-related payment issues quickly.”

### Core data

- POS integration capability model (e.g., sale, refund, void, tips, surcharges, preauth, reversals)
- Integration patterns/specs (message contracts, workflows)
- POS partner technical profile (supported features, integration mode)
- Certification requirements *as specifications* for POS behaviour (not certification state)
- Sandbox endpoints/config profiles for POS flows (technical config metadata)
- Compatibility guidance (at the POS-surface level; detailed certification compatibility lives in Certification domain)

### Invariants

- POS-initiated flows must map deterministically to supported Tyro payment flows
- Backwards compatibility rules are explicit (versioning/deprecation policy)
- POS integration must be idempotent and resilient to retries/timeouts
- POS integration cannot be a system-of-record for transactions (Payments Processing remains authoritative)

#### Capability authority

- POS integration API / protocol design (contracts, versions)
- POS flow orchestration at the integration edge (e.g., request/response choreography)
- Partner technical integration modes (e.g., cloud POS vs on-prem, paired vs unpaired)
- Reference implementations / sample apps / SDKs specifically for POS integration
- Technical troubleshooting patterns and diagnostics hooks for POS flows

#### Data authority

- POS integration specs and versioned contracts
- POS technical capability declarations (what a POS integration surface supports)
- POS integration configuration metadata required to operate the integration surface  
*(Not authoritative for partner commercial details, merchant enablement, or certification state.)*

## Banking VAS Integrations Domain  

**Banking Partner Ecosystem Enablement & Orchestration Authority**

### Domain purpose

Enable and govern integrations between Tyro Banking and **external value-add service providers** (any partner type), so partners can safely extend or leverage Tyro’s banking capabilities – one use-case we have today through Xero:

- **Initiation of banking workflows** (e.g., batch payments, payroll runs, supplier payments)

This domain exists to keep the **regulated Banking ledger** clean and stable while allowing external ecosystem services to plug in modularly. It owns the **consent model** and **partner-facing orchestration** of banking workflows—not ledger truth or rail execution.

### Domain consumer personas & typical JTBD

- **Merchant / business owner** → “Connect my Tyro account to a third-party service; grant/revoke permissions; run payments via that service.”
- **External service provider (partner engineer)** → “Access permitted banking data; initiate consented workflows; receive events/feeds reliably.”
- **Banking operations** → “Monitor externally initiated workflows; investigate failures; manage operational issues.”
- **Risk / compliance** (indirect) → “Ensure consent scope is enforced; monitor suspicious integration behaviour.”
- **Product/platform teams** → “Add new partner types/capabilities without modifying Banking ledger logic.”

### Core data

- **Provider capability registry (BankingIntegrationID)**
    - Provider identity reference (PartnerID link where applicable)
    - Capability categories supported (read / initiate / subscribe)
    - Supported workflow types (e.g., batch transfers, payroll, supplier pay runs)
    - Integration configuration metadata (adapter configuration references)
- **Consent & access control records**
    - ConsentID, MerchantID, AccountID
    - ProviderID / PartnerID reference
    - Scope: permissions (read, initiate, subscriptions), limits/constraints
    - Effective dates, expiry, revocation status
    - Audit trail of consent changes and approvers
- **Workflow orchestration records**
    - ExternalRequestID, WorkflowID (e.g., BatchID, PayrollRunID)
    - Instruction set snapshot (canonical)
    - Validation outcomes, partial failure mapping
    - Links to Funds Movement instruction IDs
    - Execution status, retries, error metadata
- **Subscription / feed state**
    - SubscriptionID, type (transactions, balances, events)
    - Cursor/checkpoint state, last delivery timestamp
    - Delivery status and retry logs
    - Transformation mappings (canonical → provider format)
- **Operational telemetry & controls**
    - Provider health state, circuit breaker status
    - Rate limiting/throttling policies
    - Latency/error rates by provider/capability

### Invariants

- No external banking action occurs without a valid, scoped consent.
- Consent scope is enforced deterministically and is auditable.
- All partner-initiated “write” actions are executed via **Funds Movement** (rail execution authority).
- **Banking Domain** remains authoritative for account lifecycle, ledger entries, and balances.
- Consent revocation immediately disables access and initiation capabilities.
- Orchestration is idempotent: duplicate partner requests do not create duplicate transfers.
- Provider-specific protocols are abstracted behind canonical banking workflow models.

### Capability authority

- **Consent lifecycle management**
    - Grant/update/revoke consent
    - Enforce scope and constraints at runtime
    - Emit consent change events to downstream systems
- **Partner-facing banking workflow orchestration**
    - Validate external requests (structure, scope, limits)
    - Translate partner requests into canonical banking instructions
    - Manage workflow state machines (batch runs, payroll runs, scheduled runs)
    - Coordinate retries and partial failure handling
    - Correlate partner workflow state with Funds Movement execution results
- **Data access, subscriptions, and feeds**
    - Manage subscriptions for banking events/feeds
    - Transform and deliver banking data to partners with delivery guarantees
    - Maintain cursors/checkpoints and idempotent delivery
- **Provider abstraction & integration adapters (banking surface)**
    - Canonical banking integration request/response schemas
    - Provider-specific mapping/adapters and version compatibility (workflow-level)
    - Rate limiting and resiliency patterns per provider
- **Operational governance of partner access**
    - Provider-level health monitoring, throttling, circuit breakers
    - Operational controls for suspend/resume of provider capabilities (as an integration control)

### Data authority

- Consent records and audit history
- Banking workflow orchestration state (batch/pay runs) and execution logs
- Subscription/feed state and delivery logs
- Provider capability registry and mapping configuration metadata
- Provider health state and operational control flags (throttling/circuit breaker)

### Explicit non-authority (to keep boundaries clean)

- **Account lifecycle, balances, ledger entries** → Banking Domain
- **Transfer execution on rails (NPP/BECS/internal), return codes** → Funds Movement Domain
- **Merchant bookkeeping/journals and tax records** → Financial Management & Accounting Domain
- **Partner commercial contract and lifecycle (as a partner)** → Partnerships Domain
- **Integration certification lifecycle and conformance evidence** → Integration Enablement & Certification Domain
- **Customer legal entity master, users, group hierarchy** → Customer & Identity Domain
- **Pricing/fees/commission policy calculation** → Product Quoting & Pricing Domain
- **Customer-facing UX composition** → Digital Channels & Experience Domain (this domain supplies APIs/events; channels render)

## Partner Developer Experience Domain  

**Developer Platform & Partner Integration Experience Authority**

### Domain purpose

Provide a consistent, high-quality **developer experience** for partners integrating with Tyro across all integration surfaces (POS, Payments APIs/SDKs, Payments VAS, Banking VAS). This domain owns the shared tooling and experience that makes it easy to:

- Discover Tyro integration capabilities
- Onboard as a developer/partner
- Access sandboxes and test data
- Use consistent auth patterns and SDKs
- Read accurate, versioned documentation
- Observe, troubleshoot, and iterate during integration
- Receive deprecation/breaking-change communications

It exists to prevent partner experience and tooling from fragmenting across product-specific integration domains.

This domain is authoritative for the **experience and tooling layer** of partner development—not the product integration specifications, not certification decisions, and not partner commercial lifecycle.

### Domain consumer personas & typical JTBD

- **Partner engineer / developer** → “Get docs, credentials, sandbox access, and tooling to integrate quickly.”
- **Partner solutions engineer** → “Guide partners through onboarding; debug issues using standard tools.”
- **Platform/product teams (APIs/SDKs/POS/VAS)** → “Publish docs consistently; manage versions; reduce integration friction.”
- **Integration governance/certification teams** → “Use shared environments and tooling to run conformance journeys.”
- **Support/ops (indirect)** → “Know what’s supported; access developer diagnostics to help partners.”

### Core data

- **Developer/partner-facing catalogue metadata**
    - API/SDK surface catalogue entries (endpoints, capabilities, versions)
    - Documentation structure, tags, and publishing metadata
    - Changelogs, deprecation schedules, compatibility notices
- **Sandbox environment model**
    - Sandbox tenant/account records (sandbox org IDs)
    - Test merchants/test accounts/test terminals (synthetic entities, seeded data)
    - Environment configuration (URLs, feature flags, limits)
    - Reset/refresh state and audit logs
- **Developer credential lifecycle metadata** *(not secrets storage)*
    - Credential request/issuance records (ClientID/API key IDs references)
    - Scope/permissions for credentials (what can be called)
    - Rotation/revocation status and audit history
- **Developer tooling artefacts**
    - Example apps/sample code versions
    - Postman/collection artefacts metadata
    - Webhook testing configuration metadata
    - Logs/trace correlation references exposed to partners (where permitted)
- **Partner communication records (developer comms)**
    - Breaking change notices delivered
    - Deprecation notices delivered
    - API status / incident notices delivered (developer-facing)

### Invariants

- Docs and artefacts are **versioned**, discoverable, and aligned to active API/SDK versions.
- Sandbox environments must be safe and isolated from production.
- Developer credentials must be scoped, auditable, and revocable.
- The domain does not become a system of record for partner commercial status or certification outcomes; it only references them.
- Partner-visible behaviours must be consistent across integration surfaces (auth, error formats, versioning conventions).

### Capability authority

- **Developer portal & onboarding experience**
    - Self-serve onboarding workflows for developers/partners
    - API/SDK discovery, documentation navigation, usage guidance
    - Partner-facing “getting started” journeys and integration playbooks
- **Documentation publishing & governance (experience-level)**
    - Doc structure standards, templates, and publishing pipelines
    - API reference publication, SDK docs, changelogs
    - Versioning and deprecation communications (developer-facing)
- **Sandbox provisioning & test-data enablement**
    - Provision sandbox tenants and seed test entities (test merchants/accounts/etc.)
    - Provide reset/refresh mechanisms
    - Manage sandbox feature flags and constraints
    - Provide test harness tooling entry points (not certification outcomes)
- **Developer access enablement (process-level)**
    - Credential request and issuance workflows (metadata + approvals)
    - Scope management and rotation/revocation workflows
    - Partner developer identity linkage to PartnerID where applicable
- **Shared developer tooling**
    - Standard webhook testing tools and callback verification
    - Standard request signing/auth helpers and SDK distribution patterns
    - Self-serve diagnostics surfaces (status, logs where appropriate)
- **Developer communications orchestration (developer lens)**
    - Notify partners about breaking changes, deprecations, sandbox incidents
    - Publish API status updates for developer consumption  
*(Marketing campaigns remain in Customer Acquisition & Growth; operational customer comms remain in Customer Notifications & Communications.)*

### Data authority

- Developer portal catalogue metadata and documentation publishing state
- Sandbox tenancy records and sandbox state (including seeded test artefact references)
- Credential lifecycle metadata (requested/issued/rotated/revoked) and audit logs
- Developer tooling artefact metadata (samples/collections/webhook configs)
- Developer-facing change notice and distribution logs

### Explicit non-authority (to keep boundaries clean)

- Partner commercial lifecycle, contracts, commissions → **Partnerships Domain**
- Certification lifecycle, conformance evidence, production eligibility → **Integration Enablement & Certification Domain**
- POS integration specifications and runtime connectivity → **POS Integration & Partner Connectivity Domain**
- In-flow payments VAS orchestration → **Payments VAS Integrations Domain**
- Banking consent/workflow orchestration → **Banking VAS Integrations Domain**
- Payment acceptance runtime and checkout session state → **Payments Channels Domain**
- Transaction truth and clearing/disputes → **Payments Processing Domain**
- Merchant-specific acquiring configuration (MIDs, enablement, terminal sharing groups) → **Payments Customer Configuration Domain**
- Customer identity master and access model → **Customer & Identity Domain** *(DevEx consumes identity/auth patterns, doesn’t own them)*
- Marketing campaign execution → **Customer Acquisition Domain**
- Customer operational/regulatory notifications → **Customer Notifications & Communications Domain**

## Integration Enablement & Certification Domain 

**Integration Testing, Conformance & Certification Authority**

### Domain purpose

Provide a consistent enterprise capability to **test, certify, and govern** external integrations into Tyro across multiple integration surfaces, including:

- POS integrations
- Value-add services integrations
- Partners implementing payments via APIs/SDKs

This domain owns the **certification lifecycle and conformance truth**: what is certified, for which versions, with what scope, and whether it is production-eligible.

### Domain consumer personas & typical JTBD

- **Partner engineer** → “Run required tests and become production-certified.”
- **Tyro solutions/partner engineer** → “Manage certification intake and readiness; validate evidence.”
- **Platform/product owners (APIs/SDKs/POS/VAS)** → “Enforce standards consistently; trigger re-certification on breaking change.”
- **Security/Risk/Compliance** → “Ensure required controls are validated and auditable.”
- **Support/Operations** (indirect) → “Know which partner versions are supported/certified.”

### Core data

- Integration registry entry (IntegrationID, type: POS/VAS/API/SDK)
- Partner reference (PartnerID link)
- Certification status (draft/testing/failed/certified/suspended/revoked)
- Certification scope (capabilities covered)
- Version bindings (partner integration version + Tyro API/SDK versions)
- Required test suites & conformance requirements (governed set)
- Test execution results and failure reasons
- Evidence references (reports/logs/artifacts)
- Waivers/exceptions (approver, rationale, expiry)
- Compatibility matrix (supported version combinations)
- Production eligibility flag and history

### Invariants

- No production eligibility without certification (unless time-bound waiver)
- Certification is **versioned and scoped** (never “blanket certified”)
- All decisions are auditable (who/when/why/evidence)
- Suspension/revocation removes production eligibility immediately
- Compatibility must be explicit and maintained over time

### Capability authority

- Certification lifecycle/state machine
- Conformance standards governance (required suites per integration surface)
- Test plan orchestration and certification decisioning
- Production eligibility gating (certification-based)
- Version compatibility governance and re-certification triggers
- Waiver/exception workflow and expiry enforcement

### Data authority

- Certification records and status history
- Conformance requirements registry (governed set)
- Test suite catalog and required mapping per surface/type
- Test results and evidence references
- Compatibility matrix and support policy for certified versions
- Waivers/exceptions and approvals
- Production eligibility flags

# Data & Intelligence Domains

## **Enterprise Data Governance Domain**

**Enterprise Data Governance, Assurance & Controls Authority**

### **Domain purpose**

Provide Tyro’s enterprise-wide data governance, assurance, and control framework so data across domains is trusted, secure, compliant, and reusable — without owning operational business truth or regulatory policy.

This capability exists to:

- Define and enforce enterprise data standards aligned to Risk, Compliance and Security policies
- Establish explicit data ownership and accountability aligned to the Reference Domain Model
- Define critical data elements (CDEs) and management frameworks required to meet regulatory obligations (e.g. APRA)
- Provide assurance mechanisms that validate trustworthiness (quality standards, contract compliance, lineage, auditability)
- Enable auditability and evidence to demonstrate compliance to enterprise policies

Risk & Compliance domains remain responsible for regulatory interpretation and policy setting.  
Enterprise Data Governance enables compliance to those policies through defined data standards and control frameworks.

### **Domain consumer personas & typical JTBD**

- **Data Governance Lead / Steward** → “Define standards, glossary framework, ownership model and ensure adherence.”
- **Data Owners** → “Understand what data I am accountable for and publish compliant contracts.”
- **Data Analysts** → “Use consistent definitions and certified semantics.”
- **Data Engineers** → “Implement lineage, quality and metadata standards.”
- **Security / Privacy Leads** → “Ensure classification and handling controls are applied.”
- **Audit** → “Verify evidence of control operation and compliance.”

### **Core data**

- Enterprise data ownership model aligned to the Reference Domain Model
- Critical Data Element (CDE) definitions and management frameworks
- Business glossary framework and term registry metadata
- Data classification standards (PII, PCI, financial sensitivity, etc.)
- Access control principles and entitlement model patterns
- Retention, archival and legal hold standards
- Data contract framework and registry metadata
- Data quality policy, SLAs and thresholds
- Lineage and auditability requirements
- Assurance artefacts (attestations, waivers, audit evidence references)

### **Invariants**

- Data ownership and accountability must be explicit and domain-aligned.
- Governance defines the framework — operational domains own business semantics.
- Data access must align to classification and enterprise security policies.
- Critical data must meet defined management and regulatory control standards.
- Data contracts are versioned; breaking changes require governance and consumer notification.
- Data quality SLAs must be measurable with defined escalation paths.
- Production data products must satisfy lineage and audit requirements.

### **Capability authority**

- Establish enterprise data ownership and stewardship model
- Define glossary operating model and semantic lifecycle governance
- Define classification, access, retention and handling standards
- Define CDE frameworks aligned to regulatory obligations
- Define and govern data contract framework
- Define enterprise data quality policy
- Define minimum lineage and metadata standards
- Provide assurance processes and certification reviews
- Govern lifecycle of certified cross-domain metrics

### **Data authority**

- Governance artefacts, standards and frameworks
- Ownership model and accountability mappings
- Glossary and term registry metadata
- Data contract standards and registry metadata
- Data quality policy definitions and assurance artefacts

### **Explicit non-authority**

- Regulatory interpretation and compliance policy → Risk & Compliance Domains
- Authoritative business semantics → Operational Domains
- Systems of record → Operational Domains
- Data pipeline implementation → Data Platforms
- Analytical marts and dashboards → Data Platforms
- AI/ML operational tooling → AI/ML Platform

## **Data Analytics & Intelligence Domain**

**Enterprise Data Ingestion, Storage, Productisation & Activation Authority**

### **Domain purpose**

Provide Tyro’s technical foundation and operational capability to ingest, transform, store, and serve data as trusted, reusable data products — enabling analytics and cross-domain insights while not owning operational master truth.

This capability exists to:

- Operate data infrastructure and tooling (batch, streaming, CDC, orchestration)
- Build and operate curated analytical data products with SLAs
- Enable cross-domain insights (e.g. Customer Graph)
- Activate insight signals into operational workflows
- Operate data quality monitoring and issue workflows

Operational domains remain authoritative for business invariants.

### **Domain consumer personas & typical JTBD**

- **Data Engineers** → “Build and maintain reliable pipelines.”
- **Data Analysts (Domain-Aligned)** → “Translate data into actionable insights.”
- **Analytics Engineers** → “Develop curated, analytics-ready models (e.g. dbt with dbt Cloud Canvas).”
- **Data Product Owners** → “Deliver measurable value from data products.”
- **Data Ops** → “Ensure platform reliability and performance.”
- **Internal Auditors** → “Validate control operation and lineage evidence.”

### **Core data**

- Ingestion pipelines and job metadata
- Transformation artefacts (dbt models, DAG definitions)
- Lake/warehouse storage structures
- Platform observability metrics
- Curated analytical data products and semantic models
- Certified cross-domain metric definitions (analytical semantics)
- BI datasets and dashboards
- Cross-domain derived datasets (e.g. Customer Graph)
- Insight APIs and activation configurations
- Data quality monitoring artefacts and incident records

### **Invariants**

- Platform does not become system of record for operational master data.
- Curated data products declare authoritative upstream domains.
- Data product interfaces are contract-driven and versioned.
- Observability is mandatory for production pipelines.
- Security controls are enforced consistently across environments.
- Data quality incidents have clear ownership and escalation paths.
- Activated insights are signals — operational domains determine decisions.

### **Capability authority**

- Data ingestion engineering and operations
- Transformation and orchestration tooling operations
- Storage and serving operations
- Secure environment implementation
- Data product management and SLAs
- Cross-domain insight activation
- Data quality monitoring and triage
- Self-serve analytics enablement

### **Data authority**

- Platform operational metadata
- Curated analytical data products and SLAs
- Certified cross-domain analytical metrics
- Cross-domain derived datasets and activation artefacts
- Data quality monitoring records

### **Explicit non-authority**

- Operational master truth → Operational Domains
- Business decisions → Relevant business domains
- Governance standards → Enterprise Data Governance
- AI/ML model lifecycle tooling → AI/ML Platform

## **AI & ML Domain**

**AI & ML Productionisation, Reliability & Responsible Controls Authority**

### **Domain purpose**

Productionise AI and ML capabilities safely and reliably across Tyro by providing shared lifecycle tooling, operational controls, and governance mechanisms — while keeping business decision authority in relevant domains.

This capability exists to:

- Provide ML lifecycle infrastructure (training, registry, deployment, monitoring)
- Provide responsible AI controls for GenAI usage
- Enable reproducible, auditable AI operations
- Provide standard inference serving patterns

This capability is the system of record for AI/ML operational artefacts — not for business decision policy.

### **Domain consumer personas & typical JTBD**

- **ML Engineers** → “Train, register, deploy and monitor models reproducibly.”
- **AI Engineers** → “Operate model serving and GenAI services reliably.”
- **AI/ML Ops** → “Ensure production stability, monitoring and rollback capability.”
- **Domain Teams** → “Consume model outputs safely and consistently.”
- **Risk / Compliance / Security** → “Ensure AI usage meets governance standards.”

### **Core data**

- Model registry artefacts and version metadata
- Training run records and reproducibility metadata
- Deployment configurations and rollout records
- Inference API/event specifications
- Monitoring, drift and safety metrics
- Prompt templates and GenAI governance artefacts
- Embedding pipeline and vector index metadata
- AI/ML operational audit logs
- Feature store platform metadata

### **Invariants**

- Models and prompts are versioned and auditable.
- Training and inference must be reproducible.
- Monitoring is mandatory for production deployments.
- Responsible AI controls apply for GenAI use cases.
- Retrieval systems require controlled sourcing and evaluation.
- AI/ML Platform provides signals — business domains own decisions.

### **Capability authority**

- Model registry and lineage management
- Training pipeline orchestration and CI/CD
- Deployment orchestration, rollback and monitoring
- Drift detection and retraining automation
- Prompt lifecycle governance
- Standard inference serving patterns
- Embeddings and retrieval operations
- AI/ML operational runbooks and incident response

### **Data authority**

- Model registry records
- Training and deployment metadata
- Monitoring and drift artefacts
- Prompt versions and governance artefacts
- Embedding/vector index operational metadata
- AI/ML audit logs

### **Explicit non-authority**

- Fraud/credit/pricing decision policy → Relevant business domains
- Operational master truth → Operational domains
- Analytical data products → Data Platforms
- Governance standards → Enterprise Data Governance
- Regulatory policy interpretation → Risk & Compliance Domains

---

# Cross-Domain Orchestrators

They:

- Coordinate across multiple authoritative domains
- Owns workflow state and transitions
- Does NOT own underlying core domain truth
- Encapsulates business process complexity
- Reduces tight coupling between system-of-record domains

Think of them as:

- Enterprise workflow & lifecycle engines

## Customer & Product Onboarding

**Prospect-to-Activation Orchestration Authority**

### Domain purpose

Orchestrate the end-to-end process from **prospect → application → assessment → approval → product activation** across one or more products (Payments, Banking, Lending, Financial Management). Owns the application workflow state machine and sequencing, while delegating decisions and record creation to authoritative domains.

### Domain consumer personas & typical JTBD

- **Prospect merchant** → “Apply for Tyro products and submit required info.”
- **Sales / Growth** → “Track application progress; reduce drop-off; hand off cleanly.”
- **Onboarding ops** → “Resolve missing info; manage manual reviews.”
- **Risk/Compliance/Credit** (indirect) → “Receive requests for checks and return decisions.”
- **Product teams** (indirect) → “Launch new origination flows without embedding logic everywhere.”

### Core data

- ApplicationID, applicant snapshot (submitted state)
- Products requested + bundle intent
- Application workflow state (draft/submitted/review/approved/declined/activated)
- Required-check registry (KYC, AML, credit, docs) and references to outcomes
- Document metadata references (not storage)
- Activation plan + activation execution log (references to created domain objects)

### Invariants

- Application state transitions are deterministic and auditable.
- “Submitted” application snapshot is immutable (changes become new version/amendment).
- Activation cannot occur without required check outcomes (referenced).
- Orchestrator never becomes system-of-record for customer/merchant/account/loan.

### Capability authority

- Application lifecycle state machine and orchestration rules
- Conditional branching logic (what checks required for which product)
- Sequencing and idempotent activation coordination across domains
- Handoff/return loops for missing info and manual review

### Data authority

- Application record + status history
- Required-check registry + references to outcomes
- Activation orchestration log (what was triggered, when, and results)

### Explicit non-authority

- Customer master → **Customer & Identity**
- Merchant config → **Payments Customer Configuration**
- KYC/AML outcomes → **Risk, Compliance & Regulatory**
- Credit decision → **Credit & Underwriting**
- Bank ledger/account truth → **Banking**
- Loan contract truth → **Lending Product**
- Transaction/settlement truth → **Payments Processing / Settlement**

## Customer Lifecycle Management  

**Post-Activation Lifecycle Orchestration Authority**

### Domain purpose

Coordinate lifecycle transitions for **active** customers/products (post-activation), such as suspension, reactivation, upgrades/downgrades, product add-ons, and offboarding. Ensures lifecycle policies are applied consistently across multiple product domains without embedding cross-domain workflow logic inside them.

### Domain consumer personas & typical JTBD

- **Merchant admin** → “Add products, change plan, suspend/close a service.”
- **Support/Ops** → “Suspend/reinstate safely; execute controlled offboarding.”
- **Risk/Compliance** (indirect) → “Trigger restrictions; confirm actions executed.”
- **Product teams** → “Implement consistent lifecycle rules across products.”

### Core data

- LifecycleCaseID (or LifecycleWorkflowID)
- Affected entity references (CustomerID, MerchantID, AccountID, LoanID)
- Lifecycle state machine (active/suspended/restricted/offboarding/closed)
- Reason codes, policy references, effective dates
- Orchestration steps and execution log (per domain action invoked)

### Invariants

- Lifecycle transitions are auditable, reason-coded, and time-bounded where applicable.
- Lifecycle orchestrator does not own underlying product states; it coordinates changes.
- A lifecycle transition must be reproducible from its policy version + execution log.

### Capability authority

- Cross-product lifecycle state machine and orchestration rules
- Controlled execution of suspend/reactivate/offboard across products
- Coordination of “product add-on” lifecycle where multiple domains must act
- Emission of lifecycle events and tracking of completion/partial failure handling

### Data authority

- Lifecycle workflow state and execution logs
- Lifecycle reason codes and policy references (or links to policy owners)

### Explicit non-authority

- Customer identity truth → **Customer & Identity**
- Merchant configuration truth → **Payments Customer Configuration**
- Ledger/account balances → **Banking**
- Loan contract truth → **Lending Product**
- Pricing rules truth → **Product Quoting & Pricing**
- Case/investigation workflow truth → **Operational Investigations & Exceptions**

## Product Bundling & Eligibility   

**Cross-Product Offer & Bundle Orchestration Authority**

### Domain purpose

Define and orchestrate how Tyro sells and manages **multi-product bundles** (e.g., Payments + Banking, Payments + Thriday, Banking + Lending), including eligibility checks, bundle composition rules, and cross-product activation coordination.

This prevents bundling logic being scattered across product domains and sales tools.

### Domain consumer personas & typical JTBD

- **Merchant** → “Buy a bundled offer; understand what’s included.”
- **Sales / deal desk** → “Quote bundles consistently; apply eligibility.”
- **Product managers** → “Launch new bundles and cross-sell journeys.”
- **Origination** (indirect) → “Receive bundle definition and required activation steps.”

### Core data

- Bundle definition (BundleID) and included products
- Eligibility rules and prerequisites (references to domain checks)
- Bundle pricing references (to Product Quoting & Pricing outputs)
- Bundle lifecycle state (draft/active/retired)
- Bundle-to-customer subscription records (bundle membership as orchestration state)

### Invariants

- Bundle definitions are versioned and effective-dated.
- Bundle eligibility is explicit and reproducible.
- Bundle orchestration never owns product truth; it coordinates and references.

### Capability authority

- Bundle catalog management (composition, eligibility, lifecycle)
- Orchestration of bundle purchase/upgrade/downgrade flows (in coordination with Origination/Lifecycle)
- Cross-product dependency management (ordering, gating, rollback strategy)

### Data authority

- Bundle definitions + versions
- Bundle eligibility rules (or references)
- Bundle subscription/orchestration state (who is on which bundle)

### Explicit non-authority

- Pricing calculation truth → **Product Quoting & Pricing**
- Customer master → **Customer & Identity**
- Merchant config and enablement → **Payments Customer Configuration**
- Banking/loan/account truth → **Banking / Lending / Credit**

## Product Quoting & Pricing  

**Commercial Pricing & Revenue Policy Authority**

### Domain purpose

Define, govern, and apply Tyro’s **commercial revenue logic** across products and channels—so pricing, fees, revenue share, and commissions are **consistent, versioned, auditable, and reusable** across Payments, Banking, Lending, Financial Management, and partner-led propositions.

This domain exists to prevent revenue logic from being scattered across product systems (Payments, Banking, Merchant config, Sales tools) and to ensure Tyro can:

- Launch new pricing models safely
- Support enterprise/franchise negotiated terms
- Manage partner commissions/revenue share
- Attribute and forecast revenue accurately

It is authoritative for **commercial policy and calculation**, not for scheme fees, ledger entries, invoicing, or settlement.

The Product Quoting & Pricing domain has *two consumption modes*:

1. **Quote / Preview API (synchronous)**  
Used by sales, onboarding, portals:

- Input: customer/group context + product bundle + expected volumes
- Output: plan selection + estimated fee schedule + explanation

1. **Rating / Fee Determination service (authoritative calculation)**  
Used by settlement/billing/accounting:

- Input: immutable “chargeable event” facts (e.g., cleared txn summary, device rental period, subscription event)
- Output: **FeeDecision** (DecisionID, amount, basis, rule version, effective date, breakdown, references)

Other domains store **only**:

- PlanID/VersionID references (optional),
- And FeeDecisionID + the returned fee facts for audit/explainability.

### Domain consumer personas & typical JTBD

- **Commercial / Pricing manager** → “Create and version pricing plans; model revenue impact; roll out safely.”
- **Enterprise sales / deal desk** → “Apply negotiated pricing and group overrides; approve exceptions.”
- **Partner managers** → “Define commission/revenue share structures and eligibility.”
- **Finance / FP&A** → “Understand revenue drivers and margin; reconcile revenue policy vs outcomes.”
- **Product teams** → “Quote and apply pricing consistently without embedding rules in product code.”
- **Billing/AR** (downstream) → “Generate invoices based on authoritative pricing outputs.”

### Core data

- **Pricing plan catalog** (plans, tiers, bundles, eligibility rules)
- **Rate cards & fee rules** (per product/channel/capability; e.g., MDR, device fees, subscription fees)
- **Effective dating & versioning** (rule versions, start/end, change history)
- **Override model** (enterprise/franchise/group overrides; exception approvals)
- **Partner commercial models**
    - Commission rules (referral)
    - Revenue share rules (service providers)
    - Eligibility conditions and effective dates
- **Usage-based inputs references** (transaction volumes, balances, subscriptions) — references only
- **Pricing decisions / calculation outputs** (quote result, applied fees, breakdowns)
- **Revenue attribution policy** (how revenue is attributed to products, partners, channels)

### Invariants

- Commercial rules are **versioned** and **auditable** (who changed what, when, why).
- A pricing decision must be reproducible given: inputs + rule version + effective date.
- Overrides must be explicit, scoped, and time-bounded.
- The domain’s outputs must not conflict with scheme fees (scheme fees remain in Payments Processing).
- This domain does not post to ledgers; it produces **commercial decisions** consumed by billing/finance systems.
- Partner commissions/revenue share are governed here, but paid/invoiced elsewhere.

### Capability authority

- **Pricing & fee rule management**
    - Define pricing plans, tiers, bundles
    - Define fee rules (transactional, subscription, device rental, banking fees, lending fees)
    - Govern eligibility and applicability rules
- **Rate engine / commercial calculation**
    - Compute applicable fees/prices for a customer/merchant/product at a point in time
    - Produce fee breakdowns and pricing decisions
    - Support simulation/what-if for commercial change (optional capability)
- **Enterprise & negotiated terms support** *(in coordination with Groups & Enterprises )*
    - Apply group/enterprise overrides and exception policies
    - Manage deal-specific pricing artefacts (effective dated)
- **Partner monetisation policy**
    - Define commission and revenue-share rules and eligibility
    - Produce commission/revenue-share calculation outputs for downstream settlement/billing
- **Revenue attribution policy**
    - Define how commercial revenue is attributed by product/channel/partner for reporting and finance hubs

### Data authority

- Pricing plan catalog and versions
- Rate cards, fee rules, and applicability/eligibility policies
- Override records (enterprise/group exceptions) and approval history
- Partner commission and revenue-share rule definitions (policy-level)
- Pricing decision outputs and fee breakdowns (commercial outputs)
- Revenue attribution mappings/policies

### Explicit non-authority (to keep boundaries clean)

- **Scheme/network fees and clearing-level fees** → Payments Processing
- **Transaction truth and volumes** → Payments Processing (Revenue consumes as input)
- **Settlement calculation and payout** → Settlement & Reconciliation
- **Deposit ledger balances and interest accrual** → Banking Domain
- **Loan contracts and repayment schedules** → Lending Product Domain
- **Invoice issuance and receivables** → Billing & Accounts Receivable
- **Corporate GL posting** → Corporate Finance & GL
- **Partner master record & lifecycle** → Partner Ecosystem
- **Group/franchise hierarchy** → Customer & Identity (and policy specifics may sit in Groups & Enterprises )

## Operational Case Management

**Operational Case Management Capability for Exceptions & Investigations**

### Domain purpose

A shared and generic enterprise capability for operational case management, investigations, evidence handling, and exception workflow orchestration across multiple domains. 

Manage cross-domain operational exceptions and investigations that require multi-team workflows, evidence, and audit trails—such as reconciliation breaks, disputes coordination, compliance investigations, fraud escalations, and complex operational incidents.

This domain owns the **workflow of exceptions**, not the underlying product records.

### Domain consumer personas & typical JTBD

- **Ops teams (payments, settlement, banking ops)** → “Track exceptions; route work; resolve breaks.”
- **Fraud/Compliance** → “Manage investigations; retain evidence; audit trail.”
- **Support** (indirect) → “Escalate complex issues and track resolution.”
- **Engineering/SRE** (indirect) → “Coordinate incident work and evidence.”

### Core data

- CaseID (exception/investigation)
- Case type (reconciliation break, fraud investigation, compliance review, operational incident, etc.)
- Severity, SLA, routing queue/owner
- Evidence references (documents/logs/transactions/account refs)
- Case workflow state machine, tasks, decisions (case-level)
- Audit trail and timeline

### Invariants

- Case state transitions are auditable.
- Evidence references are immutable and traceable.
- Case domain does not alter source-of-truth records; it requests actions from authoritative domains.

### Capability authority

- Case lifecycle, routing, SLA tracking
- Evidence management (references, chain-of-custody for evidence metadata)
- Multi-team task orchestration and decision logging
- Escalation and exception outcome recording
- Triggering actions in other domains (via APIs/events/tasks)

### Data authority

- Case records, workflow state, task state
- Evidence references and audit trail
- SLA metrics and routing metadata

### Explicit non-authority

- Customer-facing support ticketing (if separated) → **Customer Service & Support**
- Transaction/clearing/chargeback truth → **Payments Processing**
- Settlement truth → **Settlement & Reconciliation**
- Ledger truth → **Banking**
- Fraud decision truth → **Fraud & Risk Decisioning** (case consumes outputs)
- Compliance posture truth → **Risk, Compliance & Regulatory** (case uses outcomes/evidence)

## Customer Notifications & Communications

**Regulated & Commercial Communications Orchestration Authority**

### Domain purpose

Decide **what** communications to send, **when**, and **through which channel**, based on events from authoritative domains—ensuring regulated communications are compliant, templates are managed, delivery is tracked, and customer communication logic isn’t duplicated across product systems.

### Domain consumer personas & typical JTBD

- **Merchant/customer** → “Receive timely, correct notifications (activation, settlement, alerts).”
- **Compliance** → “Ensure regulated messages are sent with correct rules and audit trail.”
- **Product teams** → “Add new notifications without embedding logic in each domain.”
- **Support/Ops** → “Trigger and track communication for cases/incidents.”

### Core data

- Communication policy rules (event → message → channel) and versions
- Templates and content metadata (references)
- Recipient resolution references (CustomerID/UserID)
- Delivery status, retries, channel outcomes (sent/delivered/failed)
- Audit trail of regulated communications

### Invariants

- Communications are policy-driven, versioned, and auditable.
- Regulated messages must meet compliance requirements (retention, content constraints).
- This domain does not own customer identity or preferences as source of truth; it consumes them.

### Capability authority

- Communication rules engine (event-to-message orchestration)
- Channel routing selection (email/SMS/in-app/push/etc.)
- Template selection and dispatch orchestration
- Delivery tracking and retry/backoff policies
- Opt-in/opt-out enforcement by consuming preference sources

### Data authority

- Communication rules and versions
- Delivery logs/status and audit trail
- Template metadata references and dispatch records

### Explicit non-authority

- Customer identity and preferences master → **Customer & Identity** (or dedicated preferences capability, if created)
- Domain events generation → **All authoritative domains**
- Marketing campaign systems (lead gen) → **Customer Acquisition & Growth**
- In-app UX presentation → **Digital Channels & Experience** (this domain triggers; channels render)
