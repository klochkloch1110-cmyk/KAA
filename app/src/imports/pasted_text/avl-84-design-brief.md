# AVL 84 - Detailed UI/UX Design Brief v1

This document is intended for the UI/UX designer who will create wireframes, user flows, clickable prototypes, and later the visual design in Figma.

This is not just a screen inventory. It is a working design brief covering the interface design system, scenario logic, state set, and the structure of the Figma project.

---

## 1. Source Documents

The design must be based on the following documents:
- [ideya.md](/c:/Users/95/Desktop/KAA%2086/ideya.md)
- [app_blueprint_v1.md](/c:/Users/95/Desktop/KAA%2086/app_blueprint_v1.md)
- [docs/01_tz_screens_v1.md](/c:/Users/95/Desktop/KAA%2086/docs/01_tz_screens_v1.md)
- [docs/02_statuses_rules_v1.md](/c:/Users/95/Desktop/KAA%2086/docs/02_statuses_rules_v1.md)
- [docs/03_er_model_v1.md](/c:/Users/95/Desktop/KAA%2086/docs/03_er_model_v1.md)

If the mockups introduce logic that conflicts with these documents, business rules and user flows take precedence over visual aesthetics.

---

## 2. Design Objective

Prepare a Figma package that makes it possible to:
- align on product logic quickly;
- validate the core user scenarios;
- avoid rework during development;
- hand off clear wireframes, flows, and UI specifications to engineering.

The final design output must be detailed enough to move into development without vague placeholders such as "we'll decide this later."

---

## 3. Product Context

### 3.1. Product Type
An internal transportation operations management system for a small company with its own dump truck fleet.

### 3.2. What the System Must Replace
- fragmented communication in messengers;
- manual collection of consignment note photos;
- manual reconciliation of trips and shifts;
- manual tracking of mileage, fuel, maintenance, and expenses;
- manual preparation of customer reports and internal spreadsheets.

### 3.3. Core Interface Value
The interface should not aim to impress through decoration. It should:
- speed up operational actions;
- reduce input errors;
- clearly show current work status;
- give the manager control over the business in one or two screens.

---

## 4. User Roles

## 4.1. Driver

### User Goals
- quickly understand what has been assigned;
- open the route;
- submit a trip report;
- close the shift;
- view completed trips and earnings;
- communicate with the manager and colleagues about work.

### UX Risks
- low attention span;
- field-based usage;
- need for very fast input;
- possible connectivity issues;
- working with photos and documents on the go between tasks.

### Design Implication
The driver interface must be simple, visually large, extremely clear, and require as few decisions on screen as possible.

## 4.2. Manager / Admin

### User Goals
- create and assign jobs;
- monitor trips and shifts;
- review documents and OCR mismatches;
- track vehicles, expenses, and maintenance;
- calculate payouts/accruals;
- generate reports and exports.

### UX Risks
- large amount of data;
- high information density in tables;
- need for fast search and filtering;
- need to work from both mobile and wide screens.

### Design Implication
The admin interface must be compact, data-dense, filter-driven, and remain readable even with large data volumes.

## 4.3. Operator
A future role. No separate screen branch is required for design at this stage. Admin screens are reused, with some actions partially hidden.

---

## 5. Platforms and Device Matrix

## 5.1. Platform Priority
1. Android smartphone for the driver.
2. Web/tablet/desktop for the manager.
3. Mobile access for the manager as a secondary use case.

## 5.2. Target Viewport Sizes for Design

### Mobile
- 360 px width - minimum Android baseline;
- 390 px width - modern mobile base frame.

### Tablet
- 768 px width.

### Desktop / Laptop
- 1280 px width;
- 1440 px width for the primary admin workspace.

## 5.3. Screens That Must Be Designed Responsively
- admin dashboard;
- order list;
- order detail view;
- trip log;
- document archive;
- vehicle detail view;
- reports.

---

## 6. Scope of the Design Assignment

### Included in Scope
- user flows;
- low-fidelity wireframes;
- mid/high-fidelity UI after logic approval;
- interactive prototypes for the core scenarios;
- a basic design system;
- state specifications;
- responsive rules for mobile/tablet/desktop.

### Out of Scope for Iteration One
- promotional website;
- marketing screens;
- complex brand platform;
- highly detailed motion system;
- product-scale gamification.

Important: the designer should not invent secondary "wow features." The primary goal is a usable, clear, and scalable interface.

---

## 7. Design Principles

## 7.1. General
- functionality over decoration;
- status clarity over ornament;
- action over explanatory text;
- one entity = one primary scenario;
- minimum unnecessary fields on screen;
- all critical states must be visually distinguishable.

## 7.2. Driver Experience
- one primary CTA per screen;
- minimum competing elements;
- focus on the current shift and current job;
- fast access to the camera and route;
- readable trip and OCR statuses.

## 7.3. Admin Experience
- dense but not overloaded tables;
- convenient filtering;
- fast access to documents;
- clear status hierarchy;
- systematic approach to lists, detail views, and side panels.

---

## 8. Tone and Visual Direction

### Base Style
- modern, clean, restrained;
- industrial, but not rough;
- business-oriented interface rather than an "entertainment app";
- neutral palette with one or two accent colors;
- strong contrast and good readability in outdoor conditions.

### Avoid
- overly saturated colors;
- heavy gradients;
- overloaded cards;
- decorative illustrations without practical value;
- overly playful UI copy.

### Acceptable Emotional Layer
On the driver side, personal progress and earnings may be surfaced carefully, but the interface must not turn into a motivational feed.

---

## 9. Figma File Structure

Recommended page structure in Figma:

1. `00_Cover`
2. `01_Foundations`
3. `02_User_Flows`
4. `03_Wireframes_Driver`
5. `04_Wireframes_Admin`
6. `05_Components`
7. `06_Prototype_Driver`
8. `07_Prototype_Admin`
9. `08_Responsive_Rules`
10. `09_Handoff`
11. `10_Archive`

### What Must Be Included in Foundations
- grid;
- typography;
- base spacing;
- color tokens;
- icons;
- shadows and radii;
- status rules;
- button, field, tab, and badge tokens.

---

## 10. Core User Flows to Build First

## 10.1. Driver
1. Login -> Home screen.
2. Home screen -> Order list -> Order detail -> Open route.
3. Order detail -> Create trip report -> Attach consignment note -> Submit.
4. Home screen -> Current shift -> Close shift -> Submit shift report.
5. Home screen -> Vehicle -> View vehicle detail.
6. Home screen -> Chat -> Reply to message.
7. Home screen -> Shift history -> View accruals.

## 10.2. Manager
1. Login -> Dashboard.
2. Dashboard -> Order list -> Create order -> Assign driver/vehicle.
3. Dashboard -> Trip log -> Trip detail -> Verify consignment note and OCR.
4. Dashboard -> Shift log -> Shift detail -> Approve.
5. Dashboard -> Documents -> Filter -> Preview -> Download.
6. Dashboard -> Vehicles -> Vehicle detail -> Maintenance/Fuel/Expenses.
7. Dashboard -> Payroll -> Period -> Detail -> Export.
8. Dashboard -> Reports -> Select parameters -> Preview -> Export.

---

## 11. Information Architecture

## 11.1. Driver Navigation

Recommended bottom navigation:
- Home
- Orders
- Chat
- History
- Profile

### Additional Entry Points from Home
- My Vehicle
- Current Shift
- New Trip Report

### Rationale
Bottom navigation is better suited to the driver's frequent actions than a complex menu structure.

## 11.2. Admin Navigation

Recommended structure:

### Desktop / Tablet
- persistent left-side navigation;
- top utility bar;
- work area on the right;
- filters as a toolbar or right-side panel depending on the section.

### Mobile Admin
- drawer + compact top bar;
- reduced set of quick actions;
- avoid overloaded tables where possible.

### Admin Menu Sections
- Dashboard
- Orders
- Trips
- Shifts
- Documents
- OCR
- Vehicles
- Drivers
- Expenses
- Fuel
- Maintenance & Repair
- Payroll
- Reports
- Chat
- Settings

---

## 12. Screen Inventory for Wireframes

Below is the mandatory set of screens the designer must produce at least at low-fidelity level.

## 12.1. Driver Screens

### Block A. Core
1. Login
2. Home screen with active shift
3. Home screen without active shift
4. Order list
5. Order detail
6. Order detail with no trips created yet
7. Vehicle screen
8. Profile
9. Shift history
10. Accrual details

### Block B. Reporting
11. Create trip report
12. Successful trip report submission
13. Trip report with validation error
14. Trip report with no network / draft save
15. Current shift trip list
16. Shift closing screen
17. Shift report with warning about unfinished trips
18. Successful shift closure

### Block C. Communication
19. Chat
20. Chat with reply state
21. Notifications screen

## 12.2. Admin Screens

### Block A. Control and Dashboard
1. Login
2. Dashboard desktop
3. Dashboard tablet
4. Dashboard mobile compact

### Block B. Orders
5. Order list
6. Create order
7. Edit order
8. Order detail
9. Archived / completed order

### Block C. Trips and Shifts
10. Trip log
11. Trip detail
12. OCR mismatch state inside trip detail
13. Shift log
14. Shift detail

### Block D. Documents
15. Document archive - table view
16. Document archive - preview panel
17. Fullscreen / modal document viewer
18. OCR queue

### Block E. Fleet and Personnel
19. Vehicle list
20. Vehicle detail
21. Maintenance & repairs
22. Fuel log
23. Expenses
24. Driver list
25. Driver detail
26. Driver payroll

### Block F. Reporting and Communication
27. Reports and exports
28. Chat
29. Notifications
30. Settings and reference data

---

## 13. Key Screen Guidance for the Designer

The section below does not repeat every business field from the screen specification. The focus here is composition, hierarchy, and UI behavior.

## 13.1. Driver Home Screen

### Screen Goal
Within 3-5 seconds, the screen must answer the following questions:
- Is there an active shift?
- Which jobs are currently relevant?
- What is the next action the driver needs to take?
- Have trip reports already been submitted?
- Does the shift need to be closed?

### Priority of Blocks from Top to Bottom
1. Shift status.
2. Primary CTA.
3. Active orders.
4. Today's summary.
5. Vehicle.
6. Recent notifications.

### Primary CTA by Context
- if there is no open shift: `Open Shift` or `Go to Orders`;
- if there is an active order: `Create Trip Report`;
- if all trips have been submitted: `Close Shift`.

### UI Requirements
- the top block must visually communicate shift status;
- the CTA must always stand out more than secondary actions;
- orders should be displayed as cards with only key information and no clutter;
- consignment note numbers already submitted within the shift should be shown as a short list or compact chips.

## 13.2. Driver Order Detail

### Data Priority
1. Route and points A/B.
2. Material and volume.
3. Rate per trip.
4. Note.
5. History of already submitted trips.

### UI Requirements
- the map or route block must be visually above secondary information;
- the `Open Route` button is primary;
- the `Submit Trip Report` button should be adjacent to the route block or directly below it;
- trip history must not pull too much visual focus.

## 13.3. Trip Report Form

### Goal
Minimize both errors and the number of actions.

### Layout
1. Auto-filled order summary.
2. Consignment note field.
3. Volume field.
4. Consignment note photo.
5. Supporting documents.
6. Comment.
7. Primary submit button.

### UX Rules
- the consignment note photo must be clearly marked as required;
- after a photo is added, a large preview is required;
- show explicit messaging that "OCR will verify the document after submission";
- if the photo is missing, the error must be visible and local to the field;
- do not place the main action too low on the screen without a sticky/fixed button.

### Useful Details
- include a retake state;
- support multiple supporting documents;
- include a photo quality hint: do not crumple the document, do not crop the number, ensure sufficient lighting.

## 13.4. Shift Closing Screen

### Goal
Confirm the daily summary, not force the driver to reconstruct the day manually.

### Layout
1. Shift summary.
2. Breakdown by orders.
3. Mileage field.
4. Fuel field.
5. Comment.
6. Submit CTA.

### UI Requirements
- auto-calculated metrics must be visually separated from manual input;
- if there are unfinished trips, show a warning block above the CTA;
- the mileage field must be exceptionally clear and accompanied by the last known value.

## 13.5. Admin Dashboard

### Goal
Provide an overview of the current operational situation on a single screen.

### Required Widgets
- active orders;
- drivers currently on shift;
- vehicles on the road;
- number of trips completed today;
- OCR issues;
- unclosed shifts;
- expenses for the selected period;
- quick actions.

### UI Requirements
- do not turn the dashboard into a dump of cards;
- the top section must contain KPI/summary-level information;
- below that, show issue lists and operational lists;
- recent trips and recent shifts tables should not be excessively long above the fold.

## 13.6. Admin Order List

### Goal
Enable fast search, filtering, and management of orders.

### UI Requirements
- the table must support status badges;
- filters must be fast to access and not buried deeply;
- bulk actions may be omitted initially if they are not confirmed by the business;
- the `Create Order` button must always be visible.

## 13.7. Trip Detail and OCR Mismatch

### Goal
Allow the manager to verify data quickly.

### Layout
1. Header with key metadata.
2. Manual input block.
3. OCR result block.
4. Consignment note photo.
5. Supporting documents.
6. Status history and comments.
7. Action buttons.

### UI Requirements
- visually differentiate between "entered by driver" and "recognized by OCR";
- the mismatch state must be obvious without reading long explanations;
- the consignment note image must open large enough for convenient manual verification.

## 13.8. Document Archive

### Goal
Find any required document in no more than 2-3 actions.

### UI Requirements
- on desktop, use split view: list + preview;
- filters must include period, type, driver, vehicle, order, customer, and OCR status;
- the preview must support zoom and opening in full view;
- support batch export, even if the UI initially exposes it as a single button without a complex flow.

---

## 14. Mandatory States to Design

Without these, the design will be incomplete.

## 14.1. General
- loading;
- empty state;
- error state;
- success state;
- offline / network issues;
- blocked / restricted state;
- confirmation modal;
- destructive action confirmation;
- archived state.

## 14.2. Driver
- no active shift;
- no assigned orders;
- trip submitted;
- trip requires review;
- shift cannot be closed without mileage;
- OCR mismatch flagged by the manager;
- consignment note photo not uploaded.

## 14.3. Admin
- empty order list;
- empty trip log;
- no documents for the selected filters;
- empty OCR queue;
- order without an assigned driver;
- vehicle unavailable for assignment;
- warning about suspicious mileage;
- archived object in read-only mode.

---

## 15. Statuses and Their Visual Representation

The designer must establish a universal status system from the start.

### Order Statuses
- draft
- assigned
- in_progress
- completed
- cancelled
- archived

### Trip Statuses
- submitted
- verified
- needs_review
- rejected

### OCR Statuses
- pending
- matched
- mismatch
- failed
- not_required

### Shift Statuses
- open
- submitted
- approved
- needs_review

### Vehicle Statuses
- active
- service
- repair
- inactive

### Status Design Requirements
- statuses must differ not only by color, but also by text and/or icon;
- warning and error must not look visually identical;
- archived and inactive must not be confused with completed;
- status tokens must be consistent across all screens.

---

## 16. Form Requirements

## 16.1. General
- use a consistent pattern for labels, hints, and error messages;
- clearly mark required fields;
- display errors next to the relevant field;
- split long forms into logical sections;
- the primary action must appear in a predictable position.

## 16.2. Driver Forms
- maximize auto-fill;
- minimize optional fields on the first screen;
- photos and documents must not look secondary;
- numeric fields must be designed for mobile keyboard input.

## 16.3. Admin Forms
- reference data fields should use a select-from-list pattern + the ability to add a new entity where approved;
- table filters must be quick and reusable;
- a two-column layout is acceptable for long order forms on desktop.

---

## 17. Table and List Requirements

## 17.1. Admin Tables
- sticky headers are recommended;
- sorting by key columns;
- clear empty states;
- status badges;
- fast navigation to the detail view by clicking a row;
- row actions must not overload the table.

## 17.2. Driver Lists
- use cards instead of heavy tables;
- show no more than 4-6 key data points per card;
- the main action must be visible immediately.

---

## 18. Map and Route Requirements

### The Design Must Include
- point A card;
- point B card;
- route block within the order;
- CTA `Open in Yandex Maps` or equivalent;
- a no-embedded-map variant for slow map loading;
- a fallback state with no coordinates.

### Important
Do not make a critical scenario depend entirely on a beautifully embedded map. The user must always have a simple way to open the route externally.

---

## 19. Chat Requirements

### What Is Needed in v1
- shared work chat;
- text messages;
- reply to message;
- photo attachments;
- system messages;
- links to entities.

### What the Designer Should Not Overcomplicate
- reactions;
- story-like interaction patterns;
- complex chat-specific profiles;
- decorative experiments.

### UI Requirements
- messages must remain readable in long conversations;
- system messages must be visually distinct from user messages;
- attachments must open in preview;
- the reply pattern must be visible without taking up half the screen.

---

## 20. Design System Requirements

The goal is to build the minimum viable foundation required for development.

## 20.1. Foundations
- color tokens;
- typography scale;
- spacing scale;
- radius tokens;
- shadows/elevation;
- icon size rules;
- grid rules;
- breakpoints.

## 20.2. Components
- buttons: primary, secondary, ghost, destructive;
- text fields;
- number fields;
- text areas;
- dropdown/select;
- search field;
- segmented control;
- tabs;
- chips/tags;
- badges/statuses;
- cards;
- list item;
- table row;
- modal;
- drawer;
- toast/snackbar;
- file upload block;
- image preview;
- empty state block;
- filter panel;
- stat widget;
- top bar;
- side nav;
- bottom nav.

## 20.3. Component States
Each key component must include the following states:
- default;
- hover, where applicable for web;
- pressed;
- focus;
- disabled;
- error;
- success, where applicable;
- loading, where applicable.

---

## 21. Interface Content and Microcopy

### Requirements
- interface language: Russian;
- short and direct CTAs;
- no bureaucratic wording or overly long warnings;
- statuses and error messages must be understandable without technical terminology.

### Examples of Good Tone
- `Submit Report`
- `Add Consignment Note Photo`
- `Needs Review`
- `Shift Not Closed`
- `Mileage is below the last saved value`

### Examples of Poor Tone
- `An operation execution error has occurred`
- `The action cannot be performed`
- `Invalid verification data format`

---

## 22. Accessibility and Usability

Minimum requirements:
- sufficient contrast;
- tap/click targets must not be too small;
- clear focus states for web;
- color must not be the only carrier of meaning;
- key actions must remain readable in sunlight and on low-end Android screens.

This is especially important for drivers. A beautiful interface with weak contrast is simply a bad interface here.

---

## 23. Interactive Prototype Requirements

The designer must produce at least 2 complete clickable scenarios.

## 23.1. Driver Prototype
Required scenario:
1. Login.
2. Land on the home screen.
3. Open an order.
4. Open the route.
5. Complete the trip report.
6. Add a photo.
7. Submit the report.
8. Navigate to the trip list.
9. Close the shift.

## 23.2. Admin Prototype
Required scenario:
1. Login.
2. Dashboard.
3. Create an order.
4. Assign driver and vehicle.
5. Navigate to the trip log.
6. Open a flagged trip detail.
7. View the OCR mismatch.
8. Go to the document archive.
9. Generate a report.

### What Must Be Clickable
- primary navigation;
- key CTAs;
- transitions between list and detail screens;
- modal views;
- document preview;
- filters at a basic level.

---

## 24. Design Priority by Phase

## Phase 1. Flow + Wireframes
Deliver:
- user flows;
- skeleton screen map;
- low-fidelity screens for key scenarios.

## Phase 2. Structural Validation
Validate:
- clarity of navigation;
- absence of logical gaps;
- adequacy of statuses and states;
- form usability.

## Phase 3. Visual UI
Deliver:
- visual style;
- tokens;
- components;
- high-fidelity key screens.

## Phase 4. Prototype + Handoff
Deliver:
- interactive prototype;
- developer notes;
- states;
- responsive variants.

---

## 25. Development Handoff Requirements

By the time the design is handed off, Figma must contain:
- clearly named frames;
- understandable page structure;
- components and variants;
- tokens and styles;
- responsive behavior notes;
- comments for non-standard block logic;
- a list of states for each key screen.

### Additionally Recommended
- a separate `Dev Notes` page;
- a screen-to-route mapping table;
- comments on hidden states and edge cases.

---

## 26. Designer Deliverables

Mandatory final package:

1. Figma file with section-based structure.
2. User flow map.
3. Wireframes for all key screens.
4. Interactive prototype for the driver.
5. Interactive prototype for the admin.
6. Foundations and a basic design system.
7. Component library.
8. Responsive admin variants.
9. A full set of empty/error/loading/success states.
10. Developer handoff page.

---

## 27. UI/UX Documentation Acceptance Criteria

The work can be considered sufficient to start development if:
- all key scenarios are covered;
- each important screen has a default state and exception states;
- navigation is clear for both driver and admin;
- forms do not conflict with business logic;
- statuses are visually consistent;
- documents, OCR, and reporting are properly represented in the UX;
- the admin panel is designed thoughtfully for desktop/tablet;
- a developer can understand the structure from the mockups without guessing.

---

## 28. Special Notes for the Designer

1. Do not try to make the interface "too trendy" at the expense of speed of use.
2. Do not bury critical actions inside multi-layer menus.
3. Do not turn the driver's home screen into an information dump.
4. Do not build the admin dashboard out of 20 decorative cards with no hierarchy.
5. Do not treat documents as a secondary module - they are one of the product's core pillars.
6. Do not forget that OCR is a control aid, not a blocking mechanism.

---

## 29. What the Designer Can Start Doing Immediately

1. Build the Figma file structure.
2. Draw the user flows for driver and admin.
3. Create low-fidelity wireframes for the priority screens.
4. Align on navigation and block composition.
5. After approval, move on to visual design and prototyping.

This brief is detailed enough to start design work without the additional question of "what exactly should be designed?"