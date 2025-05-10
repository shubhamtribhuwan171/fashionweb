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

### Fetch Workspace Summary Counts
- **Description (Fashion Context):** Get summary counts (Looks, Collections, Base Garments) for a specific workspace.
- **Method & Endpoint:** `GET /api/workspaces/{workspaceId}/summary`
- **Auth Required:** Yes
- **Request Payload:** None
- **Path Parameters:**
  - `workspaceId` (UUID, required) – The ID of the workspace to summarize.
- **Example Success Response (200 OK):**
  ```json
  {
    "workspaceId": "95d29ad4-47fa-48ee-85cb-cbf762eb400a",
    "looks_created_count": 15,  // Total generated assets in this workspace
    "collections_count": 4,   // Total collections owned by the requesting user
    "base_garments_count": 5    // Total non-archived products in this workspace
  }
  ```
- **Errors:**
  - `400 Bad Request` if `workspaceId` is invalid.
  - `403 Forbidden` if the user is not a member of the workspace.
  - `404 Not Found` (implicitly handled by membership check failing if workspace doesn't exist).
  - `500 Internal Server Error` if database counting fails.

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
      "user_id": "0002676d-f4c3-4713-9860-cf409e57e7d7", // User who added it (NEW)
      "created_at": "2024-04-29T09:52:11.000Z",
      "archived": false,
      "garment_type": "top",
      "tags": ["basics", "white", "cotton"], // (NEW, Optional) User-defined tags
      "description": "Simple crew neck white t-shirt.", // (NEW, Optional) User description
      "is_favorite": true, // (NEW, Optional) User favorite flag
      "last_used_at": "2024-05-04T10:30:00.000Z", // (NEW, Optional) Timestamp of last use in generation
      "usage_count": 5 // (NEW, Optional) How many times used in generation
    }
    // ... more garments
  ]
  ```
- **Note:** When creating garments intended for use in Scene Composition (Modes 4/5), ensure the `garment_type` field is set appropriately ('top', 'bottom', or 'other') during creation via `POST /api/products`.
- **Purpose of New Fields:**
  - `user_id`: Identifies the user who uploaded or created the base garment.
  - `tags`: Allows for flexible categorization and searching (e.g., search by "cotton" or "basics"). Can be used for filtering in the UI.
  - `description`: Provides a space for more detailed notes about the garment.
  - `is_favorite`: Allows users to mark frequently used or preferred garments for easy access.
  - `last_used_at` / `usage_count`: Helps users understand which garments are used most/least often, potentially useful for sorting or cleanup.

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
        "job_id": "f45f9df4-4202-459f-8514-bb5fd38d44e9",
        "collections": [
          { "id": "col_12345", "name": "Summer Moodboard" }, 
          { "id": "col_67890", "name": "Favourites" }
        ],
        "model_image_id": "d120b36e-f85d-4a1d-ae14-bbe3cb9673be",
        "top_product_id": "e7a...",         // <<< NEW: ID of top garment used
        "bottom_product_id": "f8b...",     // <<< NEW: ID of bottom garment used
        "pose_image_id": "p9c...",         // <<< NEW: ID of pose image used
        "garment_focus": "top",              // <<< NEW: Focus hint used
        "input_accessory_ids": ["ad101304-f15d-4a97-9aa3-a108aac59bca"],
        "input_model_details": {
            "id": "d120b36e-f85d-4a1d-ae14-bbe3cb9673be",
            "name": "Studio Model A",
            "storage_url": "https://.../model-images/.../image.jpg"
        },
        "input_product_details": {
            "id": "e7a...",
            "name": "Blue Denim Jacket",
            "reference_image_url": "https://.../product-images/.../jacket.jpg"
        },
        "input_accessories_details": [
            {
                "id": "ad101304-f15d-4a97-9aa3-a108aac59bca",
                "name": "Fedora",
                "category": "hats",
                "storage_url": "https://.../accessory-images/.../hat.jpg"
            }
        ],
        "generation_params": {
            "model": "stable-diffusion-xl",
            "quality": "standard",
            "size": "1024x1024",
            "style": null
        }
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
    "garment_type": "top", // <<< NEW: Shows if it's categorized
    "workspace_id": "95d29ad4-47fa-48ee-85cb-cbf762eb400a",
    "user_id": "0002676d-f4c3-4713-9860-cf409e57e7d7", // (NEW) User who added it
    "created_at": "2024-04-29T09:52:11.000Z",
    "archived": false, 
    "brand_colors": null, // Example value
    "default_cta": null, // Example value
    "tags": ["basics", "white", "cotton"], // (NEW, Optional)
    "description": "Simple crew neck white t-shirt.", // (NEW, Optional)
    "is_favorite": true, // (NEW, Optional)
    "last_used_at": "2024-05-04T10:30:00.000Z", // (NEW, Optional)
    "usage_count": 5 // (NEW, Optional)
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
    "model_image_id": "d120b36e-f85d-4a1d-ae14-bbe3cb9673be",
    "top_product_id": "e7a...",         // <<< NEW: ID of top garment used
    "bottom_product_id": "f8b...",     // <<< NEW: ID of bottom garment used
    "pose_image_id": "p9c...",         // <<< NEW: ID of pose image used
    "garment_focus": "top",              // <<< NEW: Focus hint used
    "input_accessory_ids": ["ad101304-f15d-4a97-9aa3-a108aac59bca"],
    "generation_params": {
        "model": "stable-diffusion-xl",
        "quality": "standard",
        "size": "1024x1024",
        "style": null
    },
    "collections": [
      { "id": "col_12345", "name": "Summer Moodboard" },
      { "id": "col_67890", "name": "Favourites" }
    ],
    "input_model_details": {
        "id": "d120b36e-f85d-4a1d-ae14-bbe3cb9673be",
        "name": "Studio Model A",
        "storage_url": "https://.../model-images/.../image.jpg"
    },
    "input_product_details": {
        "id": "e7a...",
        "name": "Blue Denim Jacket",
        "reference_image_url": "https://.../product-images/.../jacket.jpg"
    },
    "input_accessories_details": [
        {
            "id": "ad101304-f15d-4a97-9aa3-a108aac59bca",
            "name": "Fedora",
            "category": "hats",
            "storage_url": "https://.../accessory-images/.../hat.jpg"
        }
    ]
  }
  ```

### Add New Base Garment (Originally Product)
- **Description (Fashion Context):** Creates a new Base Garment record with its reference image.
- **Method & Endpoint:** `POST /api/products`
- **Auth Required:** Yes
- **Content-Type:** `multipart/form-data`
- **Form Data Fields:**
  - `image` (file, required): The image file for the garment.
  - `name` (string, required): Name of the garment (e.g., "Classic White Tee").
  - `workspace_id` (UUID, required): The ID of the workspace.
  - `garment_type` (string, optional): 'top', 'bottom', or 'other'. Required if used in Scene Composition.
  - `brand_colors` (stringified JSON, optional): e.g., `'{"primary": "#000000", "accent": "#FF0000"}'`
  - `default_cta` (string, optional): e.g., "Shop Now!"
  - `tags` (stringified JSON array, optional): e.g., `'["basics", "white"]'`
  - `description` (string, optional): "Simple crew neck..."
  - `is_favorite` (boolean, optional): `true` or `false` (sent as string 'true'/'false' in form-data, parsed by backend)
- **Example Request (curl):**
  ```bash
  curl -X POST https://productmarketing-ai-f0e989e4e1ad.herokuapp.com/api/products \
    -H "Authorization: Bearer $TOKEN" \
    -F "name=Blue Denim Jacket" \
    -F "workspace_id=$WORKSPACE_ID" \
    -F "garment_type=top" \
    -F "tags=["denim", "casual"]" \
    -F "description=Standard blue denim jacket." \
    -F "image=@/path/to/jacket.jpg"
  ```
- **Example Response (201 Created):**
  ```json
  {
    "id": "e7a...",
    "name": "Blue Denim Jacket",
    "reference_image_url": "https://your-cdn.supabase.co/product-images/.../jacket.jpg", 
    "workspace_id": "95d29ad4-47fa-48ee-85cb-cbf762eb400a",
    "user_id": "0002676d-f4c3-4713-9860-cf409e57e7d7", // (NEW)
    "created_at": "2024-05-01T09:00:00.000Z",
    "garment_type": "top",
    "archived": false,
    "tags": ["denim", "casual"], // (NEW)
    "description": "Standard blue denim jacket.", // (NEW)
    "is_favorite": false, // (NEW - default)
    "last_used_at": null, // (NEW - default)
    "usage_count": 0 // (NEW - default)
  }
  ```

### Update Base Garment (Originally Product)
- **Description (Fashion Context):** Updates an existing Base Garment's metadata (e.g., rename, change garment type, archive). **Note:** This endpoint *cannot* be used to change the reference image file.
- **Method & Endpoint:** `PUT /api/products/{garmentId}`
- **Auth Required:** Yes
- **Request Payload (JSON):**
  ```json
  {
    "name": "Blue Denim Jacket Updated",      // Optional
    "garment_type": "top",             
    "archived": true,                         
    // New optional fields for update
    "tags": ["denim", "casual", "favorite"], 
    "description": "My favorite standard blue denim jacket.",
    "is_favorite": true
  }
  ```
- **Example Success Response (200 OK):** (Returns updated product object including new fields)

### Delete Base Garment (Originally Product)
- **Description (Fashion Context):** Deletes a Base Garment by its ID. This also deletes the associated image file from storage.
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

### Upload Input Reference Image (for Image Editing)
- **Description (Fashion Context):** Uploads a reference image (e.g., photo for virtual try-on, texture) specifically to be used as input for the **Reference Image Edit Mode** of Style generation (`POST /api/generate`). This is **not** for creating Base Garments. Uses the original `/api/input-images/upload` endpoint.
- **Method & Endpoint:** `POST /api/input-images/upload`
- **Auth Required:** Yes
- **Content-Type:** `multipart/form-data`
- **Form Data Fields:**
  - `image` (file, required): The image file.
  - `workspaceId` (UUID, required): The ID of the current workspace.
- **Example Request (curl):**
  ```bash
  curl -X POST https://productmarketing-ai-f0e989e4e1ad.herokuapp.com/api/input-images/upload \
    -H "Authorization: Bearer $TOKEN" \
    -F "workspaceId=$WORKSPACE_ID" \
    -F "image=@/path/to/reference_photo.jpg"
  ```
- **Example Success Response (201 Created):**
  ```json
  {
    "id": "img_1234567890abcdef", // Reference Image ID (use this in POST /api/generate)
    "user_id": "0002676d-f4c3-4713-9860-cf409e57e7d7",
    "workspace_id": "95d29ad4-47fa-48ee-85cb-cbf762eb400a",
    "storage_url": "https://storage.example.com/input-images/.../input_ref_img.jpg", // Renamed from image_url for clarity
    "created_at": "2024-04-29T12:00:00.000Z"
  }
  ```

### Generate a New Style/Look (Async)
- **Description (Fashion Context):** Initiates an asynchronous job to generate a new Style/Look based on various inputs like a base model image, garment images, pose references, accessories, and a text prompt. The actual generation mode is determined by the backend based on the provided IDs.
- **Method & Endpoint:** `POST /api/generate`
- **Auth Required:** Yes
- **Common Required Parameters (All Modes):**
  - `workspace_id` (UUID, required): Your workspace identifier.
  - `prompt` (string): Text description. Required for Text-to-Image mode, optional but recommended for guidance in other modes.

- **Mode Selection & Specific Parameters:**

  **1. Text-to-Image Mode:**
    - **Trigger:** No `input_image_id`, `product_id`, or `model_image_id` is provided.
    - **Purpose:** Generate a new image purely from text.
    - **Backend Model Used:** Typically `dall-e-3`.
    - **Required Parameters:** `prompt`, `workspace_id`.
    - **Optional Parameters:** OpenAI settings (`model`, `size`, `quality`, `n`, `aspect_ratio`, `user`).

  **2. Reference Image Edit Mode:**
    - **Trigger:** `input_image_id` is provided.
    - **Purpose:** Edit a specific previously uploaded reference image based on the prompt. Requires an image previously uploaded via `POST /api/input-images/upload`.
    - **Backend Model Used:** `dall-e-2`.
    - **Required Parameters:** `workspace_id`, `input_image_id`. (`prompt` is optional but highly recommended).
    - **Optional Parameters:** OpenAI settings (`size` [256/512/1024], `n`, `user`).

  **3. Legacy Product Edit Mode:**
    - **Trigger:** `product_id` is provided (and NO `model_image_id` or Scene Params).
    - **Purpose:** Edit the `reference_image_url` associated with a specific Base Garment.
    - **Backend Model Used:** `dall-e-2`.
    - **Required Parameters:** `workspace_id`, `product_id`. (`prompt` is optional but highly recommended).
    - **Optional Parameters:** OpenAI settings (`size` [256/512/1024], `n`, `user`).
    - **Note:** This mode cannot be combined with `top_product_id`, `bottom_product_id`, `pose_image_id`, etc. Use Mode 4 for that.

  **4. Scene Composition Mode:**
    - **Trigger:** `model_image_id` is provided.
    - **Purpose:** Generate a scene compositing a base model image with optional garments (top/bottom), a pose reference, and accessories, guided by the prompt and focus hint.
    - **Backend Model Used:** `gpt-image-1` (multi-image edit capability).
    - **Required Parameters:** `workspace_id`, `model_image_id`. (`prompt` is optional but highly recommended).
    - **Optional Parameters:**
      - `top_product_id` (UUID): ID of the Product record (with `garment_type`='top') to use as the top garment.
      - `bottom_product_id` (UUID): ID of the Product record (with `garment_type`='bottom') to use as the bottom garment.
      - `pose_image_id` (UUID): ID of the Pose Image record to use as pose reference.
      - `accessory_image_ids` (array of UUIDs): Accessory images to include.
      - `garment_focus` (string): 'top', 'bottom', 'both', or 'none' (default) to guide AI focus.
      - OpenAI settings (`size` [1024x1024, 1536x1024, 1024x1536], `n`, `user`).
    - **Note:** Cannot be combined with `input_image_id` or the legacy `product_id`.

- **Request Payload Examples:**

  *Example 1: Text-to-Image* (Unchanged)
  ```json
  { /* ... */ }
  ```

  *Example 2: Reference Image Edit* (Using `input_image_id`)
  ```json
  {
    "prompt": "Change the background to a sunny beach",
    "workspace_id": "95d29ad4-47fa-48ee-85cb-cbf762eb400a",
    "input_image_id": "img_1234567890abcdef" // Triggers Reference Image Edit
  }
  ```

  *Example 3: Legacy Product Edit* (Using single `product_id`)
  ```json
  {
    "prompt": "Show this t-shirt folded neatly on a wooden table",
    "workspace_id": "95d29ad4-47fa-48ee-85cb-cbf762eb400a",
    "product_id": "d8894604-9b9c-47ba-9d84-7462d159aae5" // Triggers Legacy Product Edit
  }
  ```

  *Example 4: Scene Composition (Model + Top + Pose + Focus)*
  ```json
  {
    "prompt": "Photorealistic image of the model wearing the specified top and matching the given pose. Clean studio background.",
    "workspace_id": "95d29ad4-47fa-48ee-85cb-cbf762eb400a",
    "model_image_id": "d120b36e-f85d-4a1d-ae14-bbe3cb9673be", // <<< Trigger
    "top_product_id": "e7a...",                         // <<< Top Garment Input
    "pose_image_id": "p9c...",                         // <<< Pose Input
    "garment_focus": "top",                              // <<< Focus Hint
    "size": "1024x1536"                                 // Optional setting
  }
  ```

  *Example 5: Scene Composition (Model + Top + Bottom + Accessories)*
  ```json
  {
    "prompt": "Model wearing the specified top, bottom, and hat accessory. Natural outdoor lighting.",
    "workspace_id": "95d29ad4-47fa-48ee-85cb-cbf762eb400a",
    "model_image_id": "d120b36e-f85d-4a1d-ae14-bbe3cb9673be", // <<< Trigger
    "top_product_id": "e7a...",                         // <<< Top Input
    "bottom_product_id": "f8b...",                     // <<< Bottom Input
    "accessory_image_ids": ["ad101304-f15d-4a97-9aa3-a108aac59bca"], // <<< Accessory Input
    "garment_focus": "both"                              // <<< Focus Hint (Optional)
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
    "error": "Specific error message if job failed"
  }
  ```

#### Generating Multiple Styles/Looks Concurrently

To generate multiple different Styles or Looks "at the same time" (e.g., trying 5 different combinations of models, poses, garments, and prompts), the frontend should make multiple, separate API calls to the `POST /api/generate` endpoint.

-   **One API Call Per Style:** Each desired Style/Look requires its own individual API request with its specific set of parameters (`prompt`, `model_image_id`, `pose_image_id`, `top_product_id`, etc.).
-   **Asynchronous Processing:** The backend is designed to handle these requests asynchronously.
    -   For each `POST /api/generate` request received, the system immediately creates a unique generation job and returns a `jobId`.
    -   The actual image generation for each job then occurs in the background.
    -   This allows the frontend to initiate several generation requests in quick succession without waiting for each one to complete before sending the next.
-   **Tracking Progress:** The frontend should store each `jobId` received and can then poll the `GET /api/generate/:jobId` endpoint for each job independently to track its status and retrieve the resulting `assetId` upon completion.

This approach leverages the backend's asynchronous job queue and Node.js's non-blocking nature to process multiple generation tasks concurrently, providing an efficient way to explore various style combinations.

### Get Status of a Generation Job
- **Description (Fashion Context):** Retrieves the current status of an image generation job. If the job is completed, it will include the `assetId` of the generated Style/Look.
- **Method & Endpoint:** `GET /api/generate/:jobId`

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
- **Description (Fashion Context):** Get the profile details of the logged-in user, including core user info and extended onboarding data.
- **Method & Endpoint:** `GET /api/profile`
- **Auth Required:** Yes
- **Request Payload:** None
- **Example Success Response (200 OK):**
  ```json
  {
    "id": "0002676d-f4c3-4713-9860-cf409e57e7d7",
    "name": "Sarthak Sharma",
    "email": "sarthak@example.com",
    "avatar_url": null,
    "onboarding_completed": true, // Or false if not yet completed
    "created_at": "2024-05-01T10:00:00.000Z",
    "user_profile_details": { // This object contains the extended onboarding data
      "user_id": "0002676d-f4c3-4713-9860-cf409e57e7d7", // Foreign key, same as main ID
      "primary_objective": "Create product advertisements",
      "job_title_or_role": "Marketing Manager",
      "other_job_title": null,
      "company_name": "Fashion Forward Inc.",
      "company_website": "https://fashionforward.example.com",
      "industry": "Fashion & Apparel",
      "other_industry": null,
      "company_size": "11-50 people",
      "created_at": "2024-05-06T12:00:00.000Z",
      "updated_at": "2024-05-06T12:30:00.000Z"
    }
  }
  ```
- **Note:** `user_profile_details` will be an empty object `{}` if the user hasn't submitted their onboarding details yet or if they signed up before this feature was added.

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
        "workspace_id": "95d29ad4-47fa-48ee-85cb-cbf762eb400a",
        "tags": ["studio", "female"], // (NEW, Optional)
        "description": "Model A facing front.", // (NEW, Optional)
        "is_favorite": false, // (NEW, Optional)
        "last_used_at": null, // (NEW, Optional)
        "usage_count": 0, // (NEW, Optional)
        "gender": "female", // (NEW, Optional)
        "body_type": "average", // (NEW, Optional)
        "hair": "blonde, long", // (NEW, Optional)
        "skin_tone": "fair" // (NEW, Optional)
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
        "workspace_id": "95d29ad4-47fa-48ee-85cb-cbf762eb400a",
        "tags": ["felt", "brown"], // (NEW, Optional)
        "description": null, // (NEW, Optional)
        "is_favorite": true, // (NEW, Optional)
        "last_used_at": "2024-05-05T11:00:00.000Z", // (NEW, Optional)
        "usage_count": 1 // (NEW, Optional)
      }
      // ... more accessory images
    ],
    "totalCount": 23, // Total accessible accessory images (matching category if filtered)
    "limit": 50,
    "offset": 0
  }
  ```

### Update User Profile
- **Description (Fashion Context):** Updates the user's basic profile information (`name`, `avatar_url`) or their overall `onboarding_completed` status flag.
- **Method & Endpoint:** `PUT /api/profile`
- **Auth Required:** Yes
- **Request Payload:**
  ```json
  {
    "name": "Sarthak S. Sharma", // Optional
    "avatar_url": "https://example.com/new_avatar.png", // Optional
    "onboarding_completed": true // Optional, to manually flag onboarding as done/undone
  }
  ```
- **Example Success Response (200 OK):** (Returns updated core user profile fields, excluding `user_profile_details`)

### Update User Onboarding & Profile Details (NEW)
- **Description:** Saves or updates the detailed onboarding information for a user (e.g., objectives, company info). This also automatically sets the user's `onboarding_completed` flag to `true` in their main profile.
- **Method & Endpoint:** `PUT /api/profile/details`
- **Auth Required:** Yes
- **Request Payload (JSON):** Include at least one field to update.
  ```json
  {
    "primary_objective": "Client work (agency)", // Optional
    "job_title_or_role": "Freelancer",           // Optional
    "other_job_title": null,                     // Optional
    "company_name": "Creative Solutions Co.",    // Optional
    "company_website": "https://creativesolutions.example.com", // Optional
    "industry": "Digital Agency",                // Optional
    "other_industry": null,                      // Optional
    "company_size": "Just me"                    // Optional
  }
  ```
- **Example Success Response (200 OK):** (Returns the full, updated `user_profile_details` object)
  ```json
  {
    "user_id": "0002676d-f4c3-4713-9860-cf409e57e7d7",
    "primary_objective": "Client work (agency)",
    "job_title_or_role": "Freelancer",
    // ... other fields ...
    "updated_at": "2024-05-07T14:00:00.000Z"
  }
  ```
- **Errors:**
  - `400 Bad Request` if the payload is empty or invalid (e.g., bad URL format).
  - `500 Internal Server Error` if the database update fails.

--- TBD

## 6. Model & Accessory Images (New)

Endpoints for managing reusable model photos and accessory images used in Scene Generation.

**Purpose of New Fields (Apply to Model, Accessory, Pose Images where added):**
- `user_id`: Identifies the user who uploaded the image.
- `tags`: Allows for flexible categorization and searching (e.g., search by specific feature, style, color).
- `description`: Provides space for notes about the image.
- `is_favorite`: Lets users mark preferred images.
- `last_used_at` / `usage_count`: Helps identify popular/unused inputs.

### List Model Images
- **Description:** Get a list of model images uploaded to a specific workspace.
- **Method & Endpoint:** `GET /api/model-images?workspaceId={workspace_id}`
- **Auth Required:** Yes
- **Query Parameters:**
  - `workspaceId` (UUID, required): The workspace to list images from.
  - **Shared Library:** You can retrieve built-in models from the global library by calling the same endpoint with the global workspace ID (e.g. `workspaceId=11111111-2222-3333-4444-555555555555`). Merge the two result sets (`myWorkspace` + `globalLibrary`) in your client and tag records with a `source` flag as needed.
- **Example Success Response (200 OK):**
  ```json
  [
    {
      "id": "d120b36e-f85d-4a1d-ae14-bbe3cb9673be",
      "storage_url": "https://.../model-images/.../image.jpg",
      "name": "Studio Model A", 
      "created_at": "2024-05-02T09:32:36.000Z",
      "tags": ["studio", "female"], // (NEW, Optional)
      "description": "Model A facing front.", // (NEW, Optional)
      "is_favorite": false, // (NEW, Optional)
      "last_used_at": null, // (NEW, Optional)
      "usage_count": 0, // (NEW, Optional)
      "gender": "female", // (NEW, Optional)
      "body_type": "average", // (NEW, Optional)
      "hair": "blonde, long", // (NEW, Optional)
      "skin_tone": "fair" // (NEW, Optional)
    }
    // ... more model images
  ]
  ```

### Get Model Image by ID
- **Description:** Gets details for a single model image by its ID.
- **Method & Endpoint:** `GET /api/model-images/{modelImageId}`
- **Auth Required:** Yes
- **Path Parameters:**
  - `modelImageId` (UUID, required): The ID of the model image to fetch.
- **Example Success Response (200 OK):**
  ```json
  {
    "id": "d120b36e-f85d-4a1d-ae14-bbe3cb9673be",
    "storage_url": "https://.../model-images/.../image.jpg",
    "name": "Studio Model A", 
    "created_at": "2024-05-02T09:32:36.000Z",
    "workspace_id": "95d29ad4-47fa-48ee-85cb-cbf762eb400a",
    "tags": ["studio", "female"], // (NEW, Optional)
    "description": "Model A facing front.", // (NEW, Optional)
    "is_favorite": false, // (NEW, Optional)
    "last_used_at": null, // (NEW, Optional)
    "usage_count": 0, // (NEW, Optional)
    "gender": "female", // (NEW, Optional)
    "body_type": "average", // (NEW, Optional)
    "hair": "blonde, long", // (NEW, Optional)
    "skin_tone": "fair" // (NEW, Optional)
  }
  ```
- **Errors:**
  - `404 Not Found` if the image does not exist.
  - `403 Forbidden` if the user does not have access to the image's workspace.
  - `401 Unauthorized` if the request lacks a valid token.

### Update Model Image
- **Description:** Updates metadata for a specific model image (e.g., name, tags).
- **Method & Endpoint:** `PUT /api/model-images/{modelImageId}`
- **Auth Required:** Yes
- **Path Parameters:**
  - `modelImageId` (UUID, required): The ID of the model image to update.
- **Request Payload (JSON):** Include at least one field to update.
  ```json
  {
    "name": "Updated Model Name", // Optional
    "tags": ["studio", "female", "smiling"], // Optional (replaces existing tags)
    "description": "Updated description.", // Optional
    "is_favorite": true, // Optional
    "gender": "female", // Optional
    "body_type": "petite", // Optional
    "hair": "long brunette", // Optional
    "skin_tone": "light olive" // Optional
  }
  ```
- **Example Success Response (200 OK):** (Returns the full updated model image object)
- **Errors:**
  - `404 Not Found` if the image does not exist.
  - `403 Forbidden` if the user does not own the image.
  - `400 Bad Request` if the payload is empty or invalid.

### Upload Model Image
- **Description:** Uploads a new model image file.
- **Method & Endpoint:** `POST /api/model-images/upload`
- **Auth Required:** Yes
- **Content-Type:** `multipart/form-data`
- **Form Data Fields:**
  - `workspaceId` (UUID, required): Workspace to associate the image with.
  - `image` (file, required): The model image file. File field **must** be named `image`.
  - `name` (string, optional): A user-friendly name for the image.
  - `tags` (stringified JSON array, optional): `'["studio", "female"]'`
  - `description` (string, optional): "Model A facing front."
  - `is_favorite` (boolean, optional): `true` or `false`
  - `gender` (string, optional): e.g., "female", "male", "non-binary"
  - `body_type` (string, optional): e.g., "average", "athletic", "plus size"
  - `hair` (string, optional): e.g., "blonde, long", "short brown buzzcut"
  - `skin_tone` (string, optional): e.g., "fair", "olive", "dark"
- **Example Success Response (201 Created):** (Includes new optional fields)

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
  - **Shared Library:** Call the same endpoint with the global workspace ID to retrieve shared accessories. On the front end, merge both sets and use a `source` flag to show library vs. personal.
- **Example Success Response (200 OK):**
  ```json
  [
    {
      "id": "ad101304-f15d-4a97-9aa3-a108aac59bca",
      "storage_url": "https://.../accessory-images/.../hat.jpg",
      "name": "Fedora", 
      "category": "hats",
      "created_at": "2024-05-02T09:32:38.000Z",
      "workspace_id": "95d29ad4-47fa-48ee-85cb-cbf762eb400a",
      "tags": ["felt", "brown"], // (NEW, Optional)
      "description": null, // (NEW, Optional)
      "is_favorite": true, // (NEW, Optional)
      "last_used_at": "2024-05-05T11:00:00.000Z", // (NEW, Optional)
      "usage_count": 1 // (NEW, Optional)
    }
    // ... more accessory images
  ]
  ```

### Get Accessory Image by ID
- **Description:** Gets details for a single accessory image by its ID.
- **Method & Endpoint:** `GET /api/accessory-images/{accessoryImageId}`
- **Auth Required:** Yes
- **Path Parameters:**
  - `accessoryImageId` (UUID, required): The ID of the accessory image to fetch.
- **Example Success Response (200 OK):**
  ```json
  {
    "id": "ad101304-f15d-4a97-9aa3-a108aac59bca",
    "storage_url": "https://.../accessory-images/.../hat.jpg",
    "name": "Fedora",
    "category": "hats",
    "created_at": "2024-05-02T09:32:38.000Z",
    "workspace_id": "95d29ad4-47fa-48ee-85cb-cbf762eb400a",
    "tags": ["felt", "brown"], // (NEW, Optional)
    "description": null, // (NEW, Optional)
    "is_favorite": true, // (NEW, Optional)
    "last_used_at": "2024-05-05T11:00:00.000Z", // (NEW, Optional)
    "usage_count": 1 // (NEW, Optional)
  }
  ```
- **Errors:**
  - `404 Not Found` if the image does not exist.
  - `403 Forbidden` if the user does not have access to the image's workspace.
  - `401 Unauthorized` if the request lacks a valid token.

### Update Accessory Image
- **Description:** Updates metadata for a specific accessory image.
- **Method & Endpoint:** `PUT /api/accessory-images/{accessoryImageId}`
- **Auth Required:** Yes
- **Path Parameters:**
  - `accessoryImageId` (UUID, required): The ID of the accessory image to update.
- **Request Payload (JSON):** Include at least one field to update.
  ```json
  {
    "name": "Brown Leather Handbag", // Optional
    "category": "bags", // Optional
    "tags": ["leather", "brown", "handbag"], // Optional
    "description": "Classic brown leather handbag.", // Optional
    "is_favorite": false // Optional
  }
  ```
- **Example Success Response (200 OK):** (Returns the full updated accessory image object)
- **Errors:** (Similar to Model Image update)

### Upload Accessory Image
- **Description:** Uploads a new accessory image file.
- **Method & Endpoint:** `POST /api/accessory-images/upload`
- **Auth Required:** Yes
- **Content-Type:** `multipart/form-data`
- **Form Data Fields:**
  - `workspaceId` (UUID, required): Workspace to associate the image with.
  - `category` (string, required): The category of the accessory (e.g., `hats`, `bags`, `jewelry`, `shoes`, `scarves`, `other`).
  - `image` (file, required): The accessory image file. File field **must** be named `image`.
  - `




  - image Download Option
  - Image Crop
  - Sign Up
  - Mood

  - 5 Image generation Common (Model, clothing (top/bottom), accesory) Different (prompt, pose)
  - Onbording

