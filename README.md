# Santi Willz Services

Source snapshot for the Santi Willz Services enquiry website, exported from the live AppDeploy project.

- Live website: https://santi-willz-services-orders-pe22dn.v2.appdeploy.ai/
- Source snapshot: AppDeploy v3 (`1793170581348`, 2026-10-28)
- Service categories: **Gadgets**, **Automobile**, and **Technical Support & Installation**.
- Original logo asset: `public/resources/original-logo.png` (preserved unchanged, without the RC line).

## Enquiry flow

The guided frontend form in `src/main.ts` collects service-specific details and the customer's contact information. It sends `POST /api/orders` to `backend/index.ts`, where enquiries are validated and registered in the AppDeploy `customer_orders` database with a unique `SWS-` reference. After successful registration, the site prepares a WhatsApp message to the Santi Willz Services Business number (08051816985). The customer must send that message from WhatsApp.

## Deployment notes

This repository contains **source code and assets**, not production database records. The live backend, database and runtime are still hosted by AppDeploy; uploading the files to GitHub does **not** migrate stored enquiries or independently deploy the API. The frontend imports `@appdeploy/client`, and the server imports `@appdeploy/sdk` which require an AppDeploy-compatible environment. A generic static site host or GitHub Pages alone will not run the enquiry-registration backend.

The original runtime configuration and tests are included. Do not commit credentials, customer data exports, or live API secrets to this public repository.
