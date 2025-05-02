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
- **Pagination:** Not supported; returns all workspaces for the user.
- **Filtering:** Not supported; returns all.
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
- **Method & Endpoint:** `GET /api/products?workspaceId={workspace_id}`
- **Auth Required:** Yes
- **Pagination:** Not supported; returns all garments for the workspace.
- **Filtering:** By `workspaceId` parameter only.
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

### Fetch Generated Styles (Originally Assets)
- **Description (Fashion Context):** Retrieve a paginated list of generated Styles/Looks for the selected workspace.
- **Endpoint:** `GET /api/assets?workspaceId={workspace_id}&limit={n}&offset={m}&search={query}`
- **Auth Required:** Yes
- **Pagination:** Supported via `limit` and `offset` query parameters.
- **Filtering:** By `workspaceId` (required) and optional `search` on prompt.
- **Query Parameters:**
  - `workspaceId` (UUID, required) – your workspace ID
  - `limit` (integer, optional, default `20`, max `100`) – number of items to return
  - `offset` (integer, optional, default `0`) – number of items to skip
  - `search` (string, optional) – case-insensitive substring match on the prompt
- **Example Request (curl):**
  ```bash
  curl -X GET "https://productmarketing-ai-f0e989e4e1ad.herokuapp.com/api/assets?workspaceId=$WORKSPACE_ID&limit=5&offset=0&search=tee" \
    -H "Authorization: Bearer $TOKEN"
  ```
- **Quick Examples:**
  Fetch your 5 most recent styles:
  ```bash
  curl -X GET "https://productmarketing-ai-f0e989e4e1ad.herokuapp.com/api/assets?workspaceId=$WORKSPACE_ID&limit=5&offset=0" \
    -H "Authorization: Bearer $TOKEN"
  ```
  Fetch your 10 most recent styles:
  ```bash
  curl -X GET "https://productmarketing-ai-f0e989e4e1ad.herokuapp.com/api/assets?workspaceId=$WORKSPACE_ID&limit=10&offset=0" \
    -H "Authorization: Bearer $TOKEN"
  ```
- **Example Success Response (200 OK):**
  ```json
  {
    "assets": [
      {
        "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        "prompt": "Model wearing 'Classic White Tee'...",
        "image_url": "https://storage.example.com/style1.png",
        "thumbnail_url": "https://storage.example.com/style1_thumb.png",
        "workspace_id": "$WORKSPACE_ID",
        "user_id": "0002676d-f4c3-4713-9860-cf409e57e7d7",
        "created_at": "2024-04-29T10:00:00.000Z",
        "is_public": false,
        "is_liked": false,
        "isInCollection": false,
        "job_id": "f45f9df4-4202-459f-8514-bb5fd38d44e9"
      }
      // ... up to `limit` items
    ],
    "totalCount": 42,
    "limit": 5,
    "offset": 0
  }
  ```

### Fetch Public Styles (Originally Assets – Public)
- **Description (Fashion Context):** Get a paginated list of public Styles/Looks across all workspaces.
- **Endpoint:** `GET /api/assets/public?limit={n}&offset={m}&search={query}`
- **Auth Required:** No (optional)
- **Pagination:** Supported via `limit` and `offset` query parameters.
- **Filtering:** By optional `search` on prompt.
- **Query Parameters:** same as above, except `workspaceId` is not accepted
- **Example Request (curl):**
  ```bash
  curl -X GET "https://productmarketing-ai-f0e989e4e1ad.herokuapp.com/api/assets/public?limit=5&offset=0&search=dress"
  ```
- **Example Success Response (200 OK):**
  ```json
  {
    "assets": [
      {
        "id": "b2c3d4e5-f6a7-8901-2345-67890abcdefg",
        "prompt": "Photorealistic image of a stylish red cocktail dress...",
        "image_url": "https://storage.example.com/style_public.png",
        "thumbnail_url": "https://storage.example.com/style_public_thumb.png",
        "workspace_id": "other-workspace-id",
        "user_id": "other-user-id",
        "created_at": "2024-04-28T11:00:00.000Z",
        "is_public": true,
        "is_liked": false,
        "isInCollection": true
      }
    ],
    "totalCount": 128,
    "limit": 5,
    "offset": 0
  }
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
    "is_archived": false,
    "is_liked": true,
    "collection_ids": ["col_12345", "col_67890"],
    "job_id": "f45f9df4-4202-459f-8514-bb5fd38d44e9",
    "model_image_id": "d120b36e-f85d-4a1d-ae14-bbe3cb9673be"
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
    "isInCollection": false,
    "job_id": "f45f9df4-4202-459f-8514-bb5fd38d44e9",
    "model_image_id": "d120b36e-f85d-4a1d-ae14-bbe3cb9673be",
    "product_id": "e7a...",
    "input_accessory_ids": ["ad101304-f15d-4a97-9aa3-a108aac59bca"],
    "generation_params": {
        "model": "stable-diffusion-xl",
        "quality": "standard",
        "size": "1024x1024",
        "style": null
    }
  }
  ```

### Add New Base Garment (Originally Product)
- **Description (Fashion Context):** Creates a new Base Garment record with an optional reference image.

#### Step 1: Upload Reference Image
- **Endpoint:** `POST /api/input-images/upload`
- **Auth Required:** Yes
- **Content-Type:** `multipart/form-data`
- **Form Data Fields:**
  - `workspaceId` (string): Your workspace UUID
  - `image` (file): The image file to upload
- **Example Request (curl):**
  ```bash
  curl -X POST https://productmarketing-ai-f0e989e4e1ad.herokuapp.com/api/input-images/upload \
    -H "Authorization: Bearer $TOKEN" \
    -F "workspaceId=$WORKSPACE_ID" \
    -F "image=@/path/to/photo.jpg"
  ```
- **Example Response (201 Created):**
  ```json
  {
    "id": "img_abcdef-1234",
    "storage_url": "https://your-cdn.supabase.co/input-images/…/img_abcdef.jpg",
    "workspace_id": "95d29ad4-47fa-48ee-85cb-cbf762eb400a",
    "user_id": "0002676d-f4c3-4713-9860-cf409e57e7d7",
    "created_at": "2024-04-29T12:00:00.000Z"
  }
  ```

#### Step 2: Create Base Garment
- **Endpoint:** `POST /api/products`
- **Auth Required:** Yes
- **Content-Type:** `application/json`
- **Request Payload:**
  ```json
  {
    "name": "Blue Denim Jacket",
    "workspace_id": "95d29ad4-47fa-48ee-85cb-cbf762eb400a",
    "reference_image_url": "https://your-cdn.supabase.co/input-images/…/img_abcdef.jpg",
    "brand_colors": { "primary": "#000000", "accent": "#FF0000" },
    "default_cta": "Shop Now!"
  }
  ```
- **Example Response (201 Created):**
  ```json
  {
    "id": "e7a...",
    "name": "Blue Denim Jacket",
    "reference_image_url": "https://your-cdn.supabase.co/input-images/…/img_abcdef.jpg",
    "workspace_id": "95d29ad4-47fa-48ee-85cb-cbf762eb400a",
    "user_id": "0002676d-f4c3-4713-9860-cf409e57e7d7",
    "created_at": "2024-05-01T09:00:00.000Z",
    "is_archived": false
  }
  ```

### Update Base Garment (Originally Product)
- **Description (Fashion Context):** Updates an existing Base Garment record (e.g., rename, change image URL, or archive).
- **Method & Endpoint:** `PUT /api/products/{garmentId}`
- **Auth Required:** Yes
- **Request Payload:**
  ```json
  {
    "name": "Blue Denim Jacket Updated",      // Optional
    "reference_image_url": "https://example.com/jacket-new.jpg",     // Optional
    "brand_colors": { "primary": "#FFFFFF" }, // Optional
    "default_cta": "Shop Now",                // Optional
    "archived": true                          // Optional (archive/unarchive)
  }
  ```
- **Example Success Response (200 OK):**
  ```json
  {
    "id": "d8894604-9b9c-47ba-9d84-7462d159aae5",
    "name": "Blue Denim Jacket Updated",
    "reference_image_url": "https://example.com/jacket-new.jpg",
    "workspace_id": "95d29ad4-47fa-48ee-85cb-cbf762eb400a",
    "user_id": "0002676d-f4c3-4713-9860-cf409e57e7d7",
    "created_at": "2024-04-29T09:52:11.000Z",
    "is_archived": true
  }
  ```

### Delete Base Garment (Originally Product)
- **Description (Fashion Context):** Deletes a Base Garment by its ID.
- **Method & Endpoint:** `DELETE /api/products/{garmentId}`
- **Auth Required:** Yes
- **Request Payload:** None
- **Example Success Response:** `204 No Content`

### Delete Generated Style/Look (Originally Asset)
- **Description (Fashion Context):** Deletes a generated Style/Look by its ID, including the database record and the associated image file(s) from storage.
- **Method & Endpoint:** `DELETE /api/assets/{styleId}` (Note: `{styleId}` is the original `{assetId}`)
- **Auth Required:** Yes
- **Request Payload:** None
- **Example Success Response:** `204 No Content`
- **Errors:**
  - `404 Not Found` if the asset does not exist.
  - `403 Forbidden` if the user does not own the asset or belong to the workspace.
  - `500 Internal Server Error` if the database deletion fails (storage deletion errors are logged but do not cause a 500).

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
      "is_liked": false,
      "isInCollection": true
    }
  ]
  ```

--- TBD

## 3. Create Style (Originally Generate Asset)

### Upload Input Reference Image
- **Description (Fashion Context):** Uploads a reference image (e.g., photo for virtual try-on, texture) to be used as input for *image-edit* Style generation. Uses the original `/api/input-images/upload` endpoint.
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

### Initiate Style Generation (Using DALL-E 3 or DALL-E 2)
- **Description (Fashion Context):** Starts the asynchronous AI Style/Look generation process. The backend determines the generation mode based on the primary ID provided (`product_id`, `input_image_id`, or `model_image_id`). These modes are mutually exclusive. **Do not send a `mode` parameter in the request.**
- **Method & Endpoint:** `POST /api/generate`
- **Auth Required:** Yes
- **Common Required Parameters (All Modes):**
  - `prompt` (string, required): Text description of your desired image/scene. Can be minimal for edit/scene modes if the main instruction is via IDs/other params.
  - `workspace_id` (UUID, required): Your workspace identifier.

- **Mode Selection & Specific Parameters:**

  **1. Text-to-Image Mode (Default - No ID provided):**
    - **Trigger:** No `product_id`, `input_image_id`, or `model_image_id` is provided.
    - **Purpose:** Generate a new image purely from text.
    - **Backend Model Used:** `dall-e-3` (default) or `dall-e-2`.
    - **Required Parameters:** `prompt`, `workspace_id`.
    - **Optional Parameters:**
      - `model` (string): `dall-e-3` (default) or `dall-e-2`.
      - `size` (string): `1024x1024` (default), `1792x1024`, `1024x1792`.
      - `quality` (string): `standard` (default), `hd` (only for `dall-e-3`).
      - `n` (integer): Number of images (currently only `1` supported).
      - `aspect_ratio` (string): e.g., "1:1", "16:9" (often derived from `size`).
      - `user` (string): End-user ID for abuse monitoring.

  **2. Product Edit Mode:**
    - **Trigger:** `product_id` is provided.
    - **Purpose:** Edit the `reference_image_url` associated with a specific Base Garment.
    - **Backend Model Used:** `gpt-image-1` (DALL-E 2 based).
    - **Required Parameters:** `prompt`, `workspace_id`, `product_id` (UUID).
    - **Optional Parameters:**
      - `size` (string): `1024x1024` (default), `512x512`, `256x256`.
      - `n` (integer): Number of images (currently only `1` supported).
      - `user` (string): End-user ID.
    - **Ignored Parameters:** `model`, `quality`, `aspect_ratio`, `input_image_id`, `model_image_id`, etc.

  **3. Image Edit Mode:**
    - **Trigger:** `input_image_id` is provided.
    - **Purpose:** Edit a specific previously uploaded reference image.
    - **Backend Model Used:** `gpt-image-1` (DALL-E 2 based).
    - **Required Parameters:** `prompt`, `workspace_id`, `input_image_id` (UUID).
    - **Optional Parameters:** (Same as Product Edit Mode)
      - `size` (string): `1024x1024` (default), `512x512`, `256x256`.
      - `n` (integer): Number of images (currently only `1` supported).
      - `user` (string): End-user ID.
    - **Ignored Parameters:** `model`, `quality`, `aspect_ratio`, `product_id`, `model_image_id`, etc.

  **4. Scene Generation Mode:**
    - **Trigger:** `model_image_id` is provided. (If `product_id` is *also* provided, see Mode 5).
    - **Purpose:** Generate a scene using a base model image and text prompt, optionally incorporating accessory *images*.
    - **Backend Model Used:** `gpt-image-1` (DALL-E 2 based, uses multi-image edit).
    - **Required Parameters:** `prompt`, `workspace_id`, `model_image_id` (UUID).
    - **Optional Parameters:**
      - `accessory_image_ids` (array of UUIDs): **Accessory images to include in the edit. Note: This is the expected field in the request.**
      - `size` (string): `1024x1024` (default), `1536x1024`, `1024x1536`.
      - `n` (integer): Number of images (currently only `1` supported).
      - `user` (string): End-user ID.
    - **Ignored Parameters:** `model`, `quality`, `aspect_ratio`, `product_id`, `input_image_id`, `pose`, `mood`.

  **5. Combined Scene Generation (Model + Garment + Accessories):**
    - **Trigger:** BOTH `model_image_id` AND `product_id` are provided.
    - **Purpose:** Generate a scene using a base model image, a garment image (from the product), and optionally accessory images, all guided by the prompt.
    - **Backend Model Used:** `gpt-image-1` (DALL-E 2 based, uses multi-image edit).
    - **Required Parameters:** `prompt`, `workspace_id`, `model_image_id` (UUID), `product_id` (UUID).
    - **Optional Parameters:**
      - `accessory_image_ids` (array of UUIDs): **Accessory images to include in the edit. Note: This is the expected field in the request.**
      - `size` (string): `1024x1024` (default), `1536x1024`, `1024x1536`.
      - `n` (integer): Number of images (currently only `1` supported).
      - `user` (string): End-user ID.
    - **Ignored Parameters:** `model`, `quality`, `aspect_ratio`, `input_image_id`, `pose`, `mood`.

- **Request Payload Examples:**

  *Example 1: Text-to-Image (Using DALL-E 3)*
  ```json
  {
    "prompt": "A futuristic fashion illustration of a chrome jacket",
    "workspace_id": "95d29ad4-47fa-48ee-85cb-cbf762eb400a",
    "model": "dall-e-3",
    "size": "1024x1024",
    "quality": "hd"
  }
  ```

  *Example 2: Product Edit (Using Base Garment's Image)*
  ```json
  {
    "prompt": "Show this jacket on a mannequin in a store window display",
    "workspace_id": "95d29ad4-47fa-48ee-85cb-cbf762eb400a",
    "product_id": "e7a..." // Triggers Product Edit Mode
    // "size": "1024x1024" // Optional size for edit
  }
  ```

  *Example 3: Image Edit (Using Uploaded Reference Image)*
  ```json
  {
    "prompt": "Change the background to a sunny beach",
    "workspace_id": "95d29ad4-47fa-48ee-85cb-cbf762eb400a",
    "input_image_id": "img_1234567890abcdef" // Triggers Image Edit Mode
  }
  ```

  *Example 4: Scene Generation (Model Image + Optional Accessory Images)*
  ```json
  {
    "prompt": "Place the provided hat accessory realistically on the provided model image. Maintain the ecommerce product shot style.", // Prompt guides composition
    "workspace_id": "95d29ad4-47fa-48ee-85cb-cbf762eb400a",
    "model_image_id": "d120b36e-f85d-4a1d-ae14-bbe3cb9673be", // Triggers Scene Mode (4)
    "accessory_image_ids": ["ad101304-f15d-4a97-9aa3-a108aac59bca"], // Optional accessory image input
    "size": "1024x1024" // Model, quality, pose, mood etc are ignored by backend for this mode
  }
  ```

  *Example 5: Combined Scene (Model Image + Product/Garment Image + Optional Accessory Images)*
  ```json
  {
    "prompt": "Show the provided model image wearing the provided garment image and hat image. Studio lighting, clean background.", // Prompt guides composition of MULTIPLE images
    "workspace_id": "95d29ad4-47fa-48ee-85cb-cbf762eb400a",
    "model_image_id": "d120b36e-f85d-4a1d-ae14-bbe3cb9673be", // Required for Combined Scene (5)
    "product_id": "e7a...",                         // Required for Combined Scene (5) - provides garment image
    "accessory_image_ids": ["ad101304-f15d-4a97-9aa3-a108aac59bca"], // Optional accessory image input
    "size": "1024x1024" // Model, quality, pose, mood etc are ignored by backend for this mode
  }
  ```

- **Example Success Response (202 Accepted):**
  ```json
  {
    "jobId": "f45f9df4-4202-459f-8514-bb5fd38d44e9",
    "message": "Generation request accepted"
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

#### Like a Style
- **Description:** Marks a generated Style/Look as liked by the current user.
- **Endpoint:** `POST /api/assets/{styleId}/like`
- **Auth Required:** Yes
- **Request Payload:** None
- **Example Success Response (201 Created):**
  ```json
  {
    "asset_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "user_id": "0002676d-f4c3-4713-9860-cf409e57e7d7",
    "created_at": "2024-05-01T09:15:00.000Z"
  }
  ```
- **If Already Liked:**
  Returns `200 OK` with:
  ```json
  { "message": "Asset already liked" }
  ```
- **Errors:**
  - `404 Not Found` if the asset does not exist.
  - `401 Unauthorized` if the request lacks a valid token.

#### Unlike a Style
- **Description:** Removes a like from a Style/Look for the current user.
- **Endpoint:** `DELETE /api/assets/{styleId}/like`
- **Auth Required:** Yes
- **Request Payload:** None
- **Example Success Response (204 No Content)**
- **Errors:**
  - `404 Not Found` if the like record does not exist.
  - `401 Unauthorized` if the request lacks a valid token.

--- TBD

## 4. Collections (of Styles/Looks)

*(No major conceptual change, Collections now hold Styles/Looks (Assets))*

### Fetch Collections
- **Description (Fashion Context):** Get the list of collections owned by the user (for organizing Styles/Looks).
- **Method & Endpoint:** `GET /api/collections`
- **Auth Required:** Yes
- **Pagination:** Not supported; returns all collections.
- **Filtering:** Not supported; returns all.
- **Response Fields:**
  - `asset_count` (integer): how many Styles/Looks are in this collection.
  - `thumbnail_urls` (string[]): up to 4 URLs of the most recently added Styles/Looks (useful for previews).

- **Example Success Response (200 OK):**
  ```json
  [
    {
      "id": "col_12345",
      "name": "Summer Outfit Ideas",
      "is_public": false,
      "created_at": "2024-04-27T10:00:00.000Z",
      "asset_count": 5,
      "thumbnail_urls": [
          "https://storage.example.com/style_thumb1.png",
        "https://storage.example.com/style_thumb2.png",
        "https://storage.example.com/style_thumb3.png",
        "https://storage.example.com/style_thumb4.png"
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
        "added_to_collection_at": "...",
        // Input IDs might be present here too
        "model_image_id": "...",
        "product_id": "...",
        "input_accessory_ids": ["..."],
        "is_liked": true,
        "isInCollection": true
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
- **Description (Fashion Context):** Get a paginated list of Styles/Looks that the current user has liked.
- **Endpoint:** `GET /api/assets/liked?limit={n}&offset={m}`
- **Auth Required:** Yes
- **Pagination:** Supported via `limit` and `offset` query parameters.
- **Filtering:** Not supported; returns items based on user likes only.
- **Query Parameters:**
  - `limit` (integer, optional, default `20`, max `100`) – number of items per page
  - `offset` (integer, optional, default `0`) – number of items to skip
- **Example Request (curl):**
  ```bash
  curl -X GET "https://productmarketing-ai-f0e989e4e1ad.herokuapp.com/api/assets/liked?limit=10&offset=0" \
    -H "Authorization: Bearer $TOKEN"
  ```
- **Example Success Response (200 OK):**
  ```json
  {
    "assets": [
      {
        "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        "prompt": "Model wearing 'Classic White Tee'...",
        "image_url": "https://storage.example.com/style1.png",
        "thumbnail_url": "https://storage.example.com/style1_thumb.png",
        "workspace_id": "95d29ad4-47fa-48ee-85cb-cbf762eb400a",
        "user_id": "0002676d-f4c3-4713-9860-cf409e57e7d7",
        "created_at": "2024-04-29T10:00:00.000Z",
        "is_public": false,
        "is_liked": true,
        "isInCollection": false,
        "job_id": "f45f9df4-4202-459f-8514-bb5fd38d44e9",
        "model_image_id": "...",
        "product_id": "...",
        "input_accessory_ids": ["..."]
      }
      // ... up to `limit` items
    ],
    "totalCount": 42,   // total number of liked assets
    "limit": 10,
    "offset": 0
  }
  ```

### Fetch My Model Images (Across Workspaces)
- **Description (Fashion Context):** Get a paginated list of all Model Images uploaded by the user or accessible in workspaces they belong to.
- **Endpoint:** `GET /api/profile/model-images?limit={n}&offset={m}`
- **Auth Required:** Yes
- **Pagination:** Supported via `limit` and `offset` query parameters.
- **Query Parameters:**
  - `limit` (integer, optional, default `50`, max `100`) – number of items per page
  - `offset` (integer, optional, default `0`) – number of items to skip
- **Example Success Response (200 OK):**
  ```json
  {
    "images": [
      {
        "id": "d120b36e-f85d-4a1d-ae14-bbe3cb9673be",
        "storage_url": "https://.../model-images/.../image.jpg",
        "name": "Studio Model A",
        "created_at": "2024-05-02T09:32:36.000Z",
        "workspace_id": "95d29ad4-47fa-48ee-85cb-cbf762eb400a" // Included for context
      }
      // ... more model images
    ],
    "totalCount": 15, // Total accessible model images
    "limit": 50,
    "offset": 0
  }
  ```

### Fetch My Accessory Images (Across Workspaces)
- **Description (Fashion Context):** Get a paginated list of all Accessory Images uploaded by the user or accessible in workspaces they belong to, optionally filtered by category.
- **Endpoint:** `GET /api/profile/accessory-images?limit={n}&offset={m}&category={category}`
- **Auth Required:** Yes
- **Pagination:** Supported via `limit` and `offset` query parameters.
- **Query Parameters:**
  - `limit` (integer, optional, default `50`, max `100`) – number of items per page
  - `offset` (integer, optional, default `0`) – number of items to skip
  - `category` (string, optional): Filter by category (e.g., `hats`, `bags`, `jewelry`, `shoes`, `scarves`, `other`).
- **Example Success Response (200 OK):**
  ```json
  {
    "images": [
      {
        "id": "ad101304-f15d-4a97-9aa3-a108aac59bca",
        "storage_url": "https://.../accessory-images/.../hat.jpg",
        "name": "Fedora",
        "category": "hats",
        "created_at": "2024-05-02T09:32:38.000Z",
        "workspace_id": "95d29ad4-47fa-48ee-85cb-cbf762eb400a" // Included for context
      }
      // ... more accessory images
    ],
    "totalCount": 23, // Total accessible accessory images (matching category if filtered)
    "limit": 50,
    "offset": 0
  }
  ```

### Update User Profile
- **Description (Fashion Context):** Updates the name or avatar of the logged-in user.
- **Method & Endpoint:** `PUT /api/profile`
- **Auth Required:** Yes
- **Request Payload:** `{"name": "Updated Name", "avatar_url": "..."}` (Optional fields)
- **Example Success Response (200 OK):** (Returns updated user profile)

--- TBD

## 6. Model & Accessory Images (New)

Endpoints for managing reusable model photos and accessory images used in Scene Generation.

### List Model Images
- **Description:** Get a list of model images uploaded to a specific workspace.
- **Method & Endpoint:** `GET /api/model-images?workspaceId={workspace_id}`
- **Auth Required:** Yes
- **Query Parameters:**
  - `workspaceId` (UUID, required): The workspace to list images from.
- **Example Success Response (200 OK):**
  ```json
  [
    {
      "id": "d120b36e-f85d-4a1d-ae14-bbe3cb9673be",
      "storage_url": "https://.../model-images/.../image.jpg",
      "name": "Studio Model A", // Optional name given at upload
      "created_at": "2024-05-02T09:32:36.000Z"
    }
    // ... more model images
  ]
  ```

### Upload Model Image
- **Description:** Uploads a new model image file.
- **Method & Endpoint:** `POST /api/model-images/upload`
- **Auth Required:** Yes
- **Content-Type:** `multipart/form-data`
- **Form Data Fields:**
  - `workspaceId` (UUID, required): Workspace to associate the image with.
  - `image` (file, required): The model image file.
  - `name` (string, optional): A user-friendly name for the image.
- **Example Success Response (201 Created):**
  ```json
  {
    "id": "d120b36e-f85d-4a1d-ae14-bbe3cb9673be",
    "user_id": "0002676d-f4c3-4713-9860-cf409e57e7d7",
    "workspace_id": "95d29ad4-47fa-48ee-85cb-cbf762eb400a",
    "storage_url": "https://.../model-images/.../image.jpg",
    "name": "Studio Model A",
    "created_at": "2024-05-02T09:32:36.000Z"
  }
  ```

### Delete Model Image
- **Description:** Deletes a specific model image by its ID.
- **Method & Endpoint:** `DELETE /api/model-images/{modelImageId}`
- **Auth Required:** Yes
- **Request Payload:** None
- **Example Success Response:** `204 No Content`

### List Accessory Images
- **Description:** Get a list of accessory images uploaded to a specific workspace, optionally filtered by category.
- **Method & Endpoint:** `GET /api/accessory-images?workspaceId={workspace_id}&category={category}`
- **Auth Required:** Yes
- **Query Parameters:**
  - `workspaceId` (UUID, required): The workspace to list images from.
  - `category` (string, optional): Filter by category (e.g., `hats`, `bags`, `jewelry`, `shoes`, `scarves`, `other`).
- **Example Success Response (200 OK):**
  ```json
  [
    {
      "id": "ad101304-f15d-4a97-9aa3-a108aac59bca",
      "storage_url": "https://.../accessory-images/.../hat.jpg",
      "name": "Fedora", // Optional name given at upload
      "category": "hats",
      "created_at": "2024-05-02T09:32:38.000Z"
    }
    // ... more accessory images
  ]
  ```

### Upload Accessory Image
- **Description:** Uploads a new accessory image file.
- **Method & Endpoint:** `POST /api/accessory-images/upload`
- **Auth Required:** Yes
- **Content-Type:** `multipart/form-data`
- **Form Data Fields:**
  - `workspaceId` (UUID, required): Workspace to associate the image with.
  - `category` (string, required): The category of the accessory (e.g., `hats`, `bags`, `jewelry`, `shoes`, `scarves`, `other`).
  - `image` (file, required): The accessory image file.
  - `name` (string, optional): A user-friendly name for the image.
- **Example Success Response (201 Created):**
  ```json
  {
    "id": "ad101304-f15d-4a97-9aa3-a108aac59bca",
    "user_id": "0002676d-f4c3-4713-9860-cf409e57e7d7",
    "workspace_id": "95d29ad4-47fa-48ee-85cb-cbf762eb400a",
    "storage_url": "https://.../accessory-images/.../hat.jpg",
    "name": "Fedora",
    "category": "hats",
    "created_at": "2024-05-02T09:32:38.000Z"
  }
  ```

### Delete Accessory Image
- **Description:** Deletes a specific accessory image by its ID.
- **Method & Endpoint:** `DELETE /api/accessory-images/{accessoryImageId}`
- **Auth Required:** Yes
- **Request Payload:** None
- **Example Success Response:** `204 No Content`

--- TBD

_This document reflects the API state as used by the Fashion App frontend, mapping concepts onto the existing backend structure as of [Date of Last Update]._ 