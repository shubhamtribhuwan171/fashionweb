# AI Fashion App – Product Requirements Document (PRD)

*Version 1.0 – [Current Date] - **Initial Draft for Pivot** *

---

## 1. Purpose & Vision
AI Fashion App empowers users (designers, stylists, enthusiasts) to visualize fashion ideas, create styled looks, and explore AI-generated fashion concepts. Leveraging AI image generation, users can generate visuals based on text prompts, optionally using base garments or uploaded reference images. Users can organize generated styles into collections and discover public creations. This is a **web application** built with React JS and Chakra UI, reusing the backend infrastructure originally built for an AI Ad Maker.

---

## 2. Goals & Success Metrics (Initial)
| Goal | Metric | Target (90 days post-launch) |
|------|--------|------------------------------|
| Rapid Style Visualization | Avg. time from prompt/input → generated style visible | ≤ 60 sec |
| User Engagement | % users with ≥ 5 styles added to Collections or Liked | ≥ 30 % |
| Exploration | % users who interact with (like/view detail) ≥ 10 public styles | ≥ 15% |
| Retention | Day-30 rolling retention | ≥ 20 % |
| *Future Goal* | *Revenue via Credits/Subscriptions* | *TBD* |

---

## 3. Personas (Initial)
1.  **Aspiring Designer Dahlia:** Learning fashion design, uses the app to quickly visualize variations of her sketches or ideas. Needs inspiration and easy creation tools.
2.  **Stylist Sam:** Works with clients or creates lookbooks. Uses the app to generate outfit options around a specific garment or theme. Values organization (Collections).
3.  **Fashion Enthusiast Evan:** Loves exploring trends and creating unique looks. Uses the app for fun, discovery (Explore), and sharing ideas (future).

---

## 4. Backend Constraint: Conceptual Mapping

**CRITICAL NOTE:** This application reuses the backend API and database schema originally designed for an "AI Ad Maker" *without modification*. All adaptation to the fashion domain occurs conceptually within this **frontend web application**.

*   **`products` (DB Table & `/api/products`) => Base Garments:** Represents individual clothing items (e.g., "Blue Denim Jeans", "Silk Scarf"). Fields like `name` and `reference_image_url` are used. **Limitations:** Cannot store or filter by garment type, color, material, etc., via the API. Filtering is limited to name or client-side logic.
*   **`assets` (DB Table & `/api/assets`) => Generated Styles/Looks:** Represents the AI-generated fashion visuals. Fields like `prompt`, `file_urls` (for images), `user_id`, `workspace_id`, `is_public`, `like_count` are used. The `product_id` links a Style back to its Base Garment if applicable. The `input_image_id` links to an uploaded reference image.
*   **`prompt` field (`assets` table):** This text field is **crucial**. It must contain all necessary details for the AI, including garment descriptions, styling instructions, model details, setting, etc., as dedicated DB fields are unavailable.
*   **`input_images` (DB Table & `/api/input-images`) => Reference Images:** User-uploaded images (e.g., photos for try-on, textures, inspiration).
*   **`/api/generate` endpoint:** Used to trigger the creation of a new **Style/Look** (`asset`) based heavily on the detailed `prompt` provided, plus optional `product_id` (Base Garment) or `input_image_id` (Reference Image).
*   **`collections`, `likes`, `users`, `workspaces`:** Functionality maps directly (Collections of Styles, Likes on Styles, Users, Workspaces).

---

## 5. User Journeys (Happy Path - Web App)

### 5.1 First Style Generation (Text-to-Style)
1.  User logs into the web application.
2.  Navigates to the "Create Style" page.
3.  Ensures "Text Only" mode is selected.
4.  Enters a detailed text prompt (e.g., "Generate a photorealistic image of a female model wearing a flowing red silk evening gown, outdoors at sunset, elegant pose").
5.  Adjusts Quality/Aspect Ratio settings via modal (optional).
6.  Clicks "Generate Style".
7.  Views loading indicator, then the generated Style image(s) appear.
8.  Clicks the "Like" button on the generated Style.
9.  Clicks "Add to Collection" -> Selects existing or creates new collection via modal.
10. Clicks "View Details" -> Opens a modal/view with a larger image and prompt details.

### 5.2 Generating Style from a Base Garment
1.  User navigates to the "Garments" page.
2.  Browses the list of Base Garments (fetched from `/api/products`).
3.  Clicks on a specific Garment card (e.g., "Classic White Tee").
4.  On the Garment Detail view or directly from the card, clicks "Generate Styles with this Garment".
5.  User is navigated to the "Create Style" page; mode is set to "Use Garment", the selected garment (`product_id`) is pre-filled.
6.  User enters a prompt focusing on *how* to style it (e.g., "Model wearing this t-shirt, layered under a black blazer, dark wash jeans, urban street background").
7.  Clicks "Generate Style" -> Views result.

### 5.3 Exploring Public Styles
1.  User navigates to the "Explore Styles" page.
2.  Browses the grid of public Styles (fetched from `/api/assets/public`).
3.  Clicks a Style card -> A preview modal opens showing the image and prompt.
4.  Clicks the "Like" button within the modal.
5.  (Future) Clicks "Add to Collection" if desired.

---

## 6. Functional Requirements (Web App)

### 6.1 Authentication
-   User Login/Signup via Email/Password (using `/api/auth/login`, `/api/auth/signup`).
-   Token-based session management (stored in `localStorage`).
-   Authenticated requests using Bearer token header.
-   Logout functionality (`/api/auth/logout`).

### 6.2 Workspaces
-   Users belong to workspaces (`/api/workspaces`).
-   Ability to switch between workspaces (if multiple exist).
-   All core entities (Garments, Styles, Collections) are associated with the active workspace.

### 6.3 Base Garment Management (`/api/products`)
-   View list of Base Garments associated with the workspace.
-   Add new Base Garment (requires Name, Reference Image URL).
-   View Base Garment details.
-   **Limitation:** No API support for editing, deleting, or filtering garments beyond name.

### 6.4 Style Generation (`/api/generate`, `/api/input-images`)
-   **Input modes**: Text Prompt Only, Text + Base Garment (`product_id`), Text + Uploaded Reference Image (`input_image_id`).
-   **Prompt Input:** Primary method for defining the desired style, requiring detailed descriptions.
-   **Settings:** Via Modal (Aspect Ratio, Quality).
-   **Generation Process:** Trigger via `/api/generate`, poll `/api/generate/{jobId}` for status, fetch result via `/api/assets/{assetId}` upon completion. Handle loading and error states.
-   Single style generated per request (based on current API).

### 6.5 Style Management (`/api/assets`, `/api/collections`, `/api/likes`)
-   **Liking:** Toggle like status on Styles (`POST/DELETE /api/assets/{assetId}/like`). View Liked Styles page (`GET /api/assets?liked=true`).
-   **Collections:**
    -   View list of Collections (`GET /api/collections`).
    -   Create new Collection (`POST /api/collections`).
    -   View Collection Detail (showing contained Styles) (`GET /api/collections/{collectionId}`).
    -   Add Style to Collection via Modal (`POST /api/collections/{collectionId}/items`).
    -   Remove Style from Collection (`DELETE /api/collections/{collectionId}/items/{assetId}`).
    -   Rename Collection (`PUT /api/collections/{collectionId}`).
    -   Delete Collection (`DELETE /api/collections/{collectionId}`).
-   **Viewing:**
    -   Grid views on Dashboard, Explore, Collections.
    -   Style Preview Modal (quick view).
    -   Full Style Detail view/modal (larger image, prompt, actions).
-   **Explore:** View public Styles (`GET /api/assets/public`). Basic client-side search/filter on prompt text may be possible.

### 6.6 Profile Management
-   View user profile (`GET /api/profile`).
-   Edit user profile (Name) (`PUT /api/profile`).

### 6.7 Credits & Plans (Placeholder)
-   Display credit balance (fetched via `/api/workspaces`).
-   *No actual credit deduction or purchase flows implemented initially.* Backend tables exist but are not used by the generation flow yet.

---

## 7. Non‑Functional Requirements
| Category | Requirement | Notes |
|----------|-------------|-------|
| Performance | Style generation median time < 60s. Web app load time < 3s. UI interactions feel responsive. | Backend performance depends on AI model. |
| Security | Use HTTPS. Secure token storage. Input sanitization (frontend). Backend RLS assumed. | Standard web security practices. |
| Privacy | Adhere to standard privacy practices. No user data used for model retraining. | |
| Availability | Target 99.5% backend uptime. Frontend hosted on reliable platform (e.g., Vercel, Netlify). | Graceful degradation if backend/AI is down. |
| Browser Support | Latest versions of Chrome, Firefox, Safari, Edge. | |
| Responsiveness | App usable on common desktop and tablet screen sizes. | Mobile web is secondary initially. |

---

## 8. External Integrations
| Service | Purpose | Notes |
|---------|---------|-------|
| Existing Backend API | Core logic, DB access | Hosted on Heroku (assumption). No changes allowed. |
| AI Image Generation API | Style generation | Accessed *via* the backend API. Specific model TBD/Configurable in backend. |
| Cloud Storage | Garment Images, Style Images, Ref Images | Accessed *via* URLs returned by the backend API. |
| *Future: Payment Provider* | *Credit Purchases, Subscriptions* | *RevenueCat tables exist in backend schema.* |

---

## 9. Open Questions / Risks
1.  **AI Model Capability:** How effectively can the backend's current AI model generate high-quality, controllable *fashion* images based *only* on detailed prompts and optional reference images? **High Risk.** Requires testing.
2.  **Prompt Complexity:** Users need to write very detailed prompts. Will this be intuitive? Need good examples and potentially prompt assistance tools later.
3.  **Garment Management Limitations:** Lack of editing, deleting, and structured metadata for garments is a significant limitation imposed by the backend constraint.
4.  **Scalability:** Backend performance under load for concurrent generation requests.
5.  **Conceptual Mapping Confusion:** Risk of confusion for developers or future maintainers due to the mismatch between API names and their actual use.

---

_End of document_ 