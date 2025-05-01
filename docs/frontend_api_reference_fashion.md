# Frontend API Reference - AI Fashion App Context

**CRITICAL NOTE:** This document describes the API used by the AI Fashion App frontend. However, the backend API itself **was not changed** from its original purpose (AI Ad Maker). The frontend **conceptually maps** the existing endpoints and data structures to fit the fashion domain. Pay close attention to the descriptions and notes explaining this mapping.

**Base URL:** `https://productmarketing-ai-f0e989e4e1ad.herokuapp.com`

**Authentication:** All endpoints require a `Bearer <token>` in the `Authorization` header unless otherwise specified.

---

## 0. Authentication

*(No conceptual change)*

### Login User
- **Description:** Authenticates an existing user and returns an API token.
- **Method & Endpoint:** `POST /api/auth/login`
- **Auth Required:** No
- **Request Payload:**
  ```json
  {
    "email": "user@example.com",
    "password": "yourpassword"
  }
  ```
- **Example Success Response (200 OK):**
  ```json
  {
    "message": "Login successful",
    "user": {
      "id": "0002676d-f4c3-4713-9860-cf409e57e7d7",
      "email": "user@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
  ```

### Signup User
- **Description:** Registers a new user.
- **Method & Endpoint:** `POST /api/auth/signup`
- **Auth Required:** No
- **Request Payload:**
  ```json
  {
    "email": "newuser@example.com",
    "password": "newpassword",
    "name": "New User" // Optional
  }
  ```
- **Example Success Response (201 Created - Placeholder):**
  ```json
  {
    "message": "Signup successful (placeholder)",
    "user": { ... },
    "token": "..."
  }
  ```

--- TBD

## 1. Dashboard & Core Entities

### Fetch Workspaces
- **Description (Fashion Context):** Get the list of workspaces the user belongs to. Workspaces are containers for Base Garments, Styles, and Collections. The response includes credit balance and subscription status.
- **Method & Endpoint:** `GET /api/workspaces`
- **Auth Required:** Yes
- **Request Payload:** None
- **Example Success Response (200 OK):**
  ```json
  [
    {
      "id": "95d29ad4-47fa-48ee-85cb-cbf762eb400a", // Workspace ID
      "owner_id": "some-user-id",
      "name": "My Fashion Ideas",
      "logo_url": null,
      "credits": 100, // Current credit balance for this workspace
      "created_at": "2023-10-27T09:00:00.000Z",
      "role": "owner", // User's role in this workspace
      "joined_at": "2023-10-27T10:00:00.000Z",
      "active_subscription_status": "active" // e.g., 'active', 'inactive', 'active_cancelled', 'expired'
    }
  ]
  ```

### Fetch Base Garments (Originally Products)
- **Description (Fashion Context):** Get a list of Base Garments (e.g., t-shirt, jeans) belonging to the selected workspace. This uses the original `/api/products` endpoint.
- **Method & Endpoint:** `GET /api/products?workspaceId={workspace_id}` (Optional: `&limit=N`)
- **Auth Required:** Yes
- **Request Payload:** None
- **Example Success Response (200 OK):**
  ```json
  [
    {
      "id": "d8894604-9b9c-47ba-9d84-7462d159aae5", // Garment ID (originally product ID)
      "name": "Classic White Tee", // Garment Name
      "reference_image_url": "https://example.com/tee.jpg", // URL to the garment's image
      "workspace_id": "95d29ad4-47fa-48ee-85cb-cbf762eb400a",
      "user_id": "0002676d-f4c3-4713-9860-cf409e57e7d7", // User who added it
      "created_at": "2024-04-29T09:52:11.000Z",
      "is_archived": false
    }
    // ... more garments
  ]
  ```

### Fetch Recent Generated Styles (Originally Assets)
- **Description (Fashion Context):** Get a list of recently generated Styles/Looks for the selected workspace. This uses the original `/api/assets` endpoint.
- **Method & Endpoint:** `GET /api/assets?workspaceId={workspace_id}` (Optional: `&limit=N&sort=recent`)
- **Auth Required:** Yes
- **Request Payload:** None
- **Example Success Response (200 OK):**
  ```json
  [
    {
      "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef", // Style/Look ID (originally asset ID)
      "prompt": "Model wearing 'Classic White Tee' (product_id: d88...) tucked into high-waisted blue jeans...", // **Crucial:** Detailed fashion prompt used for generation
      "image_url": "https://storage.example.com/style1.png", // URL to the generated style image
      "thumbnail_url": "https://storage.example.com/style1_thumb.png",
      "workspace_id": "95d29ad4-47fa-48ee-85cb-cbf762eb400a",
      "user_id": "0002676d-f4c3-4713-9860-cf409e57e7d7", // User who generated it
      "created_at": "2024-04-29T10:00:00.000Z",
      "is_public": false,
      "is_liked": true, // Indicates if the current user liked this style
      "job_id": "f45f9df4-4202-459f-8514-bb5fd38d44e9" // Generation job ID
    }
  ]
  ```

### Fetch Specific Base Garment Details (Originally Product)
- **Description (Fashion Context):** Get details for a single Base Garment.
- **Method & Endpoint:** `GET /api/products/{garmentId}` (Note: `{garmentId}` is the original `{productId}`)
- **Auth Required:** Yes
- **Request Payload:** None
- **Example Success Response (200 OK):**
  ```json
  {
    "id": "d8894604-9b9c-47ba-9d84-7462d159aae5",
    "name": "Classic White Tee",
    "reference_image_url": "https://example.com/tee.jpg",
    "workspace_id": "95d29ad4-47fa-48ee-85cb-cbf762eb400a",
    "user_id": "0002676d-f4c3-4713-9860-cf409e57e7d7",
    "created_at": "2024-04-29T09:52:11.000Z",
    "is_archived": false
    // Original schema had no other relevant fields here
  }
  ```

### Fetch Specific Generated Style Details (Originally Asset)
- **Description (Fashion Context):** Get details for a single generated Style/Look.
- **Method & Endpoint:** `GET /api/assets/{styleId}` (Note: `{styleId}` is the original `{assetId}`)
- **Auth Required:** Yes
- **Request Payload:** None
- **Example Success Response (200 OK):**
  ```json
  {
    "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "prompt": "Model wearing 'Classic White Tee' (product_id: d88...) tucked into high-waisted blue jeans...",
    "image_url": "https://storage.example.com/style1.png",
    "thumbnail_url": "https://storage.example.com/style1_thumb.png",
    "workspace_id": "95d29ad4-47fa-48ee-85cb-cbf762eb400a",
    "user_id": "0002676d-f4c3-4713-9860-cf409e57e7d7",
    "created_at": "2024-04-29T10:00:00.000Z",
    "is_public": false,
    "is_liked": true,
    "job_id": "f45f9df4-4202-459f-8514-bb5fd38d44e9",
    // Include generation params if available from original schema
    "generation_params": {
        "model": "stable-diffusion-xl", // Example model used
        "quality": "standard",
        "size": "1024x1024",
        "style": null // Original field, may not be used in fashion context
    }
  }
  ```

### Add New Base Garment (Originally Product)
- **Description (Fashion Context):** Creates a new Base Garment record.
- **Method & Endpoint:** `POST /api/products`
- **Auth Required:** Yes
- **Request Payload:**
  ```json
  {
    "name": "Blue Denim Jacket",
    "reference_image_url": "https://example.com/jacket.jpg",
    "workspace_id": "95d29ad4-47fa-48ee-85cb-cbf762eb400a"
    // Other original fields like 'is_archived' might default
  }
  ```
- **Example Success Response (201 Created):** (Structure matches original API)
  ```json
  {
    "id": "e7a...', 
    "name": "Blue Denim Jacket",
    "reference_image_url": "https://example.com/jacket.jpg",
    "workspace_id": "95d29ad4-47fa-48ee-85cb-cbf762eb400a",
    "user_id": "...",
    "created_at": "...",
    "is_archived": false
  }
  ```

### Logout User
- **Description (Fashion Context):** Logs the user out.
- **Method & Endpoint:** `POST /api/auth/logout`
- **Auth Required:** Yes
- **Request Payload:** None
- **Example Success Response:** `204 No Content` or `{"message": "Logged out successfully"}`

--- TBD

## 2. Explore Styles (Originally Explore Assets)

### Fetch Public Styles
- **Description (Fashion Context):** Get a list of all public Styles/Looks. Uses the original `/api/assets/public` endpoint.
- **Method & Endpoint:** `GET /api/assets/public` (Optional: `?search={query}` - **Note:** Search likely operates on the `prompt` field in the backend).
- **Auth Required:** No (Optional - provides `is_liked` if authenticated)
- **Request Payload:** None
- **Example Success Response (200 OK):**
  ```json
  [
    {
      "id": "a1b2c3d4-e5f6-7890-1234-567890public",
      "prompt": "Photorealistic image of a stylish red cocktail dress...",
      "image_url": "https://storage.example.com/style_public.png",
      "thumbnail_url": "https://storage.example.com/style_public_thumb.png",
      "workspace_id": "some-other-workspace-id",
      "user_id": "some-other-user-id",
      "created_at": "2024-04-28T11:00:00.000Z",
      "is_public": true,
      "is_liked": false // Based on current user's likes if logged in
      // "job_id": "..."
    }
  ]
  ```

--- TBD

## 3. Create Style (Originally Generate Asset)

### Upload Input Reference Image
- **Description (Fashion Context):** Uploads a reference image (e.g., photo for virtual try-on, texture) to be used as input for Style generation. Uses the original `/api/input-images/upload` endpoint.
- **Method & Endpoint:** `POST /api/input-images/upload`
- **Auth Required:** Yes
- **Request Payload:** `multipart/form-data` containing:
  - `image`: The image file.
  - `workspace_id`: The ID of the current workspace.
- **Example Success Response (201 Created):**
  ```json
  {
    "id": "img_1234567890abcdef", // Reference Image ID
    "user_id": "0002676d-f4c3-4713-9860-cf409e57e7d7",
    "workspace_id": "95d29ad4-47fa-48ee-85cb-cbf762eb400a",
    "image_url": "https://storage.example.com/input_ref_img.jpg",
    "created_at": "2024-04-29T12:00:00.000Z"
  }
  ```

### Initiate Style Generation
- **Description (Fashion Context):** Starts the AI Style/Look generation process. Uses the original `/api/generate` endpoint. **The `prompt` field is critical here.**
- **Method & Endpoint:** `POST /api/generate`
- **Auth Required:** Yes
- **Request Payload:**
  ```json
  {
    // ** VERY IMPORTANT FIELD **
    "prompt": "Generate a photorealistic image of a male model wearing the 'Blue Denim Jacket' (product_id: e7a...) over a white t-shirt, black jeans, studio lighting, full body shot.", 
    "workspace_id": "95d29ad4-47fa-48ee-85cb-cbf762eb400a",
    // Provide *EITHER* product_id (Base Garment) *OR* input_image_id (Reference Image), or neither.
    "product_id": "e7a...", // Optional: ID of the Base Garment being used
    "input_image_id": "img_123...", // Optional: ID of the uploaded Reference Image being used
    // Standard parameters from original API
    "n": 1, // Optional: Number of images (default 1)
    "aspect_ratio": "9:16", // Optional: e.g., "1:1", "16:9", "9:16"
    "quality": "hd", // Optional: e.g., "standard", "hd"
    // Other original generation parameters might exist but may be less relevant
    // "negative_prompt": "low quality, blurry", 
    // "style": null 
  }
  ```
- **Example Success Response (202 Accepted):**
  ```json
  {
    "jobId": "f45f9df4-4202-459f-8514-bb5fd38d44e9",
    "message": "Generation job accepted"
  }
  ```

### Check Style Generation Status
- **Description (Fashion Context):** Poll this endpoint to check the status of an ongoing Style generation job.
- **Method & Endpoint:** `GET /api/generate/{jobId}`
- **Auth Required:** Yes
- **Request Payload:** None
- **Example Success Response (200 OK - In Progress):**
  ```json
  {
    "jobId": "f45f9df4-4202-459f-8514-bb5fd38d44e9",
    "status": "processing" // or "pending"
  }
  ```
- **Example Success Response (200 OK - Completed):**
  ```json
  {
    "jobId": "f45f9df4-4202-459f-8514-bb5fd38d44e9",
    "status": "completed",
    // The ID of the generated Style/Look (originally assetId)
    "assetId": "a1b2c3d4-e5f6-7890-1234-567890abcdef" 
  }
  ```
- **Example Success Response (200 OK - Failed):**
  ```json
  {
    "jobId": "f45f9df4-4202-459f-8514-bb5fd38d44e9",
    "status": "failed",
    "error": "Insufficient credits" // Or other error message
  }
  ```

### Like/Unlike Style (Originally Asset)
- **Description (Fashion Context):** Marks a generated Style/Look as liked by the current user.
- **Method & Endpoint:** `POST /api/assets/{styleId}/like` (Note: `{styleId}` is the original `{assetId}`)
- **Auth Required:** Yes
- **Request Payload:** None
- **Example Success Response (200 OK or 201 Created):** `{"message": "Asset liked successfully"}`

- **Description (Fashion Context):** Removes the like from a Style/Look for the current user.
- **Method & Endpoint:** `DELETE /api/assets/{styleId}/like`
- **Auth Required:** Yes
- **Request Payload:** None
- **Example Success Response (204 No Content or 200 OK):** `{"message": "Asset unliked successfully"}`

--- TBD

## 4. Collections (of Styles/Looks)

*(No major conceptual change, Collections now hold Styles/Looks (Assets))*

### Fetch Collections
- **Description (Fashion Context):** Get the list of collections owned by the user (for organizing Styles/Looks).
- **Method & Endpoint:** `GET /api/collections`
- **Auth Required:** Yes
- **Request Payload:** None
- **Example Success Response (200 OK):**
  ```json
  [
    {
      "id": "col_12345",
      "name": "Summer Outfit Ideas",
      "user_id": "0002676d-f4c3-4713-9860-cf409e57e7d7",
      "is_public": false,
      "created_at": "2024-04-27T10:00:00.000Z",
      "asset_count": 5, // Number of Styles/Looks in the collection
      "thumbnail_urls": [ // URLs of contained Styles/Looks (Assets)
          "https://storage.example.com/style_thumb1.png",
          // ... up to 4 thumbnails
      ]
    }
  ]
  ```

### Fetch Collection Details (incl. Styles/Looks)
- **Description (Fashion Context):** Get details for a specific collection, including the Styles/Looks it contains.
- **Method & Endpoint:** `GET /api/collections/{collectionId}`
- **Auth Required:** Yes
- **Request Payload:** None
- **Example Success Response (200 OK):**
  ```json
  {
    "id": "col_12345",
    "name": "Summer Outfit Ideas",
    // ... other collection fields
    "assets": [ // Array of Styles/Looks (originally Assets)
      {
        "id": "a1b2c3d4...", // Style/Look ID
        "prompt": "Model wearing 'Classic White Tee'...",
        "image_url": "https://storage.example.com/style1.png",
        "thumbnail_url": "https://storage.example.com/style1_thumb.png",
        "created_at": "...",
        "added_to_collection_at": "..."
      }
    ]
  }
  ```

### Rename Collection
- **Description (Fashion Context):** Updates the name and/or public status of a collection.
- **Method & Endpoint:** `PUT /api/collections/{collectionId}`
- **Auth Required:** Yes
- **Request Payload:** `{"name": "Updated Collection Name", "is_public": true}` (Optional fields)
- **Example Success Response (200 OK):** (Returns updated collection details)

### Delete Collection
- **Description (Fashion Context):** Permanently deletes a collection (does not delete the contained Styles/Looks).
- **Method & Endpoint:** `DELETE /api/collections/{collectionId}`
- **Auth Required:** Yes
- **Request Payload:** None
- **Example Success Response:** `204 No Content`

### Add Style/Look to Collection
- **Description (Fashion Context):** Adds an existing Style/Look (Asset) to an existing collection.
- **Method & Endpoint:** `POST /api/collections/{collectionId}/items`
- **Auth Required:** Yes
- **Request Payload:**
  ```json
  {
    // ID of the Style/Look (originally asset_id)
    "asset_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef" 
  }
  ```
- **Example Success Response (201 Created):** `{"message": "Asset added to collection successfully"}`

### Remove Style/Look from Collection
- **Description (Fashion Context):** Removes a Style/Look (Asset) from a collection.
- **Method & Endpoint:** `DELETE /api/collections/{collectionId}/items/{styleId}` (Note: `{styleId}` is the original `{assetId}`)
- **Auth Required:** Yes
- **Request Payload:** None
- **Example Success Response:** `204 No Content`

### Create New Collection (Optionally with Initial Style/Look)
- **Description (Fashion Context):** Creates a new collection, optionally adding an initial Style/Look.
- **Method & Endpoint:** `POST /api/collections`
- **Auth Required:** Yes
- **Request Payload:**
  ```json
  {
    "name": "My Design Sketches",
    "is_public": false, // Optional
    // Optional: ID of the Style/Look (Asset) to add immediately
    "initialAssetId": "a1b2c3d4..." 
  }
  ```
- **Example Success Response (201 Created):** (Returns new collection details)

--- TBD

## 5. Profile & User Settings

*(No major conceptual change)*

### Fetch User Profile
- **Description (Fashion Context):** Get the profile details of the logged-in user.
- **Method & Endpoint:** `GET /api/profile`
- **Auth Required:** Yes
- **Request Payload:** None
- **Example Success Response (200 OK):** (Standard user fields)

### Fetch Liked Styles/Looks
- **Description (Fashion Context):** Get a list of Styles/Looks liked by the current user. Uses the original `GET /api/assets` endpoint with a query parameter.
- **Method & Endpoint:** `GET /api/assets?liked=true`
- **Auth Required:** Yes
- **Request Payload:** None
- **Example Success Response (200 OK):** (Returns array of Style/Look objects, similar to Fetch Recent Styles)

### Update User Profile
- **Description (Fashion Context):** Updates the name or avatar of the logged-in user.
- **Method & Endpoint:** `PUT /api/profile`
- **Auth Required:** Yes
- **Request Payload:** `{"name": "Updated Name", "avatar_url": "..."}` (Optional fields)
- **Example Success Response (200 OK):** (Returns updated user profile)

--- TBD

## Shared Actions / Modals (API Mapping Summary)

- **`StylePreviewModal`:** Uses `GET /api/assets/{styleId}` and `POST/DELETE /api/assets/{styleId}/like`.
- **`AddToCollectionModal`:** Uses `GET /api/collections`, `POST /api/collections/{collectionId}/items`, and `POST /api/collections` (with `initialAssetId`).
- **`GarmentSelectionModal`:** Uses `GET /api/products?workspaceId={workspace_id}`.
- **`AddGarmentModal`:** Uses `POST /api/products`.
- **`WorkspaceSelectionModal`:** Uses `GET /api/workspaces`.
- **`RenameCollectionModal`:** Uses `PUT /api/collections/{collectionId}`.

--- TBD

_This document reflects the API state as used by the Fashion App frontend, mapping concepts onto the existing backend structure as of [Date of Last Update]._ 