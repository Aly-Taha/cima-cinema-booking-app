# CIMA — Cinema Booking Web App

A centralized cinema booking platform that aggregates multiple cinema chains across Egypt into one application. Users can browse cinemas, search and filter movies by genre/location/title, view showtimes, select seats from an interactive map, and (in future sprints) complete bookings with secure online payment.

> **Note:** This is a fork of a team project. The README below documents my individual contributions. Originally developed as a course project for CSCE3701 — Software Engineering at The American University in Cairo.

## Project Status

**Release Classification:** Early Alpha — Major Limitations

**Working in deployment:** Registration, login/logout, cinema and movie browsing, multi-criteria filtering (genre + location), showtime viewing (future-only), interactive seat map selection, backed by PostgreSQL.

**Not working end-to-end:** Booking and payment. The user flow reaches the seat map and dead-ends — PayPal integration runs only locally and is not deployed. QR ticket generation and booking history are blocked behind the payment dependency.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| ORM / Database | Prisma over PostgreSQL |
| Authentication | JWT + bcryptjs |
| Payments (local only) | PayPal SDK |

## Team

Six members working in Scrum across two sprints. I served as **Product Owner** — I did not write the application code. My contributions are described below.

## My Contributions — Product Owner

### Backlog & Sprint Management
- Owned and prioritized the product backlog across 2 sprints (24+ story points total)
- Wrote and refined user stories with acceptance criteria for all 10 Sprint 1 stories and Sprint 2 scope
- Defined the Sprint 1 goal: deliver foundational authentication and content-discovery as the base for all booking features

### Architecture Trade-Off Decisions
- Drove a **4-layer to 3-layer architecture consolidation** to reduce unnecessary abstraction for a course-project scale
- Owned the **Stripe → PayPal payment-gateway migration** decision mid-project when Stripe's business verification requirements created timeline risk
- Caught and corrected multiple architecture diagram wiring errors during the design phase (SSL connected to wrong layer, QR generator wired to data access instead of business logic, database connected to business logic instead of data access)

### Living Documentation (SRS / DSD / RTM)
- Maintained the SRS, DSD, and Requirements Traceability Matrix as living documents through **3 formal versions** (v1.0 → v1.1 → v1.2)
- Filled in all empty SRS sections: intended audience, NFRs, performance, security, quality attributes, database, legal/PCI-DSS, glossary, TBD list
- Reclassified several requirements between Functional and Non-Functional
- Made every NFR measurable and testable
- Added a Sprint status column to the RTM tracking each story's completion state

### Quality & Release Governance
- Ran **root-cause analysis** on a filter-deployment regression and instituted a Definition-of-Done update requiring smoke testing in the deployed environment before stories can close
- Drove surgical corrections to the final Milestone 4 report so it reflected **true deployment state, not aspiration:**
  - Changed release recommendation from "Release with Limitations" → "Release as Early Alpha — Major Limitations"
  - Corrected completed story points from 12 → 9 (caught the miscount)
  - Downgraded SCRUM-49 (Booking History) from Done → Pending
  - Confirmed SCRUM-52 (Seat Hold) as neither deployed nor tested, with a double-booking race condition found only in code review
  - Rewrote UAT section to reflect the real tester experience: browse → filter → select seats → dead end at booking

### Sprint 1 Stories Delivered (stable in deployment)
| ID | Story | Story Points |
|----|-------|-------------|
| SCRUM-40 | Browse Cinemas Across Egypt | 5 |
| SCRUM-41 | Filter Cinemas By Location | 2 |
| SCRUM-42 | Filter Movies by Genre | 2 |
| SCRUM-43 | View Showtimes for a Movie | 2 |
| SCRUM-46 | Create An Account | 3 |
| SCRUM-47 | Log In | 2 |
| SCRUM-48 | Log Out | 1 |
| SCRUM-53 | Integrate Payment Gateway | 3 |
| SCRUM-54 | Generate Booking Reference | 2 |
| SCRUM-69 | Manage Cinema Listings | 2 |

### Sprint 2 Completed Stories
| ID | Story | Story Points | Status |
|----|-------|-------------|--------|
| SCRUM-50 | Interactive Seat Map | 5 | Deployed |
| SCRUM-72 | Filter Fix | 1 | Deployed |
| SCRUM-73 | Prisma/PostgreSQL Migration | 3 | Completed |

## Known Limitations
- Payment (PayPal) runs only on a developer's local machine; crashes after approximately 1 hour. Integration test TC-05 fails in deployment.
- Seat hold (SCRUM-52) was never deployed or tested; a double-booking race condition was identified in code review only.
- Booking history (SCRUM-49) is blocked by the payment dependency.
- QR ticket generation is blocked behind payment.
- UAT with two testers confirmed the dead-end at booking. Only derived backlog item: a "Clear All" button on the genre filter (Sprint 3 UX polish).

## Architecture
The system uses a layered architecture (consolidated from 4 to 3 layers during the design phase). Two design variants were evaluated:
- **Design A:** Request-flow layering (traditional 3-tier)
- **Design B:** Service-type layering (Sommerville style) — recommended and adopted

Layered architecture was chosen over microservices, event-driven, and controller-worker alternatives based on team size (6), project scope (course project), and expected load (500 concurrent users).

## Documentation
- `docs/SRS` — Software Requirements Specification (v1.2)
- `docs/DSD` — Detailed System Design
- `docs/RTM` — Requirements Traceability Matrix with Sprint status
- `docs/M4_Report` — Sprint 2 Closure & Release Readiness

## How to Run
```bash
# Clone the repository
git clone https://github.com/yourname/cima.git
cd cima

# Install dependencies
npm install

# Set up environment variables (see .env.example)
cp .env.example .env

# Run database migrations
npx prisma migrate dev

# Start the development server
npm run dev
```

## License
Course project — not licensed for commercial use.
