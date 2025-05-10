# API Endpoints Used in the Application

This document lists the API endpoints called by different pages and components in the application.
**Base URL:** `https://productmarketing-ai-f0e989e4e1ad.herokuapp.com`

*(Note: Most endpoints require authentication via an `Authorization: Bearer <token>` header and often expect a `workspaceId` query parameter or in the request body.)*

---

## 1. Models (`src/pages/ModelsPage.js`)

*   **`GET /api/model-images`**: Fetches the list of models for the workspace.
    *   Params: `workspaceId`
*   **`DELETE /api/model-images/:modelId`**: Deletes a specific model image.
*   **(Via `UploadModelModal.js`)**
    *   **`POST /api/model-images/upload`**: Uploads a new model image file. (Expects `multipart/form-data` with `image` and `workspaceId`). *Note: The exact endpoint might differ slightly based on modal implementation details not fully reviewed.*

---

## 2. Model Detail (`src/pages/ModelDetailPage.js`)

*   **`GET /api/model-images/:modelId`**: Fetches details for a specific model image.
*   **`DELETE /api/model-images/:modelId`**: Deletes the specific model image.
*   **(Via `EditModelModal.js` - *if exists*)**
    *   **`PUT /api/model-images/:modelId`**: Updates details for a specific model image. *(Existence and endpoint assumed)*

---

## 3. Virtual Closet / Products (`src/pages/ProductsPage.js`)

*   **`GET /api/products`**: Fetches the list of products (garments) for the workspace.
    *   Params: `workspaceId`
*   **`DELETE /api/products/:productId`**: Deletes a specific product (garment).
*   **(Via `AddGarmentModal.js`)**
    *   **`POST /api/input-images/upload`**: Uploads the reference garment image file. (Expects `multipart/form-data` with `image`, `workspaceId`).
    *   **`POST /api/products`**: Creates a new product record using the uploaded image URL and other details. (Expects `multipart/form-data`).

---

## 4. Garment Detail (`src/pages/GarmentDetailPage.js`)

*   **`GET /api/products/:productId`**: Fetches details for a specific product (garment).
*   **`DELETE /api/products/:productId`**: Deletes the specific product (garment).
*   **(Via `EditGarmentModal.js` - *if exists*)**
    *   **`PUT /api/products/:productId`**: Updates details for a specific product. *(Existence and endpoint assumed)*

---

## 5. Poses (`src/pages/PosesPage.js`)

*   **`GET /api/poses`**: Fetches the list of poses for the workspace.
    *   Params: `workspaceId`
*   **`DELETE /api/poses/:poseId`**: Deletes a specific pose image.
*   **(Via `UploadPoseModal.js`)**
    *   **`POST /api/poses`**: Uploads a new pose image and associated data. (Expects `multipart/form-data`).
*   **(Via `EditPoseModal.js`)**
    *   **`PUT /api/poses/:poseId`**: Updates details for a specific pose image.

---

## 6. Pose Detail (`src/pages/PoseDetailPage.js`)

*   **`GET /api/poses/:poseId`**: Fetches details for a specific pose image.
*   **`DELETE /api/poses/:poseId`**: Deletes the specific pose image.
*   **(Via `EditPoseModal.js`)**
    *   **`PUT /api/poses/:poseId`**: Updates details for the specific pose image.

---

## 7. Accessories (`src/pages/AccessoriesPage.js`)

*   **`GET /api/accessory-images`**: Fetches the list of accessories for the workspace.
    *   Params: `workspaceId`, `category` (optional)
*   **`DELETE /api/accessory-images/:accessoryId`**: Deletes a specific accessory image.
*   **(Via `UploadAccessoryModal.js`)**
    *   **`POST /api/accessory-images`**: Uploads a new accessory image and associated data. (Expects `multipart/form-data`).
*   **(Via `EditAccessoryModal.js`)**
    *   **`PUT /api/accessory-images/:accessoryId`**: Updates details for a specific accessory image.

---

## 8. Accessory Detail (`src/pages/AccessoryDetailPage.js`)

*   **`GET /api/accessory-images/:accessoryId`**: Fetches details for a specific accessory image.
*   **`DELETE /api/accessory-images/:accessoryId`**: Deletes the specific accessory image.
*   **(Via `EditAccessoryModal.js`)**
    *   **`PUT /api/accessory-images/:accessoryId`**: Updates details for the specific accessory image.

---

## 9. My Creations / Generations (`src/pages/GenerationsPage.js`)

*   **`GET /api/assets`**: Fetches the list of generated assets (styles/looks) for the workspace.
    *   Params: `workspaceId`, `limit`, `offset`
*   **(Via `StyleCard.js` & `AddToCollectionModal.js`)**
    *   **`GET /api/collections`**: Fetches the list of collections (likely for the Add to Collection modal).
    *   **`POST /api/collections/:collectionId/assets`**: Adds an asset to a specific collection.
    *   **`POST /api/assets/:assetId/like`**: Likes an asset. *(Simulated in current code, actual endpoint assumed)*
    *   **`DELETE /api/assets/:assetId/like`**: Unlikes an asset. *(Simulated in current code, actual endpoint assumed)*

---

## 10. Asset Detail (`src/pages/AssetDetailPage.js`)

*   **`GET /api/assets/:assetId`**: Fetches details for a specific generated asset.
*   **`DELETE /api/assets/:assetId`**: Deletes a specific generated asset.
*   **`POST /api/assets/:assetId/like`**: Likes the asset. *(Actual endpoint assumed)*
*   **`DELETE /api/assets/:assetId/like`**: Unlikes the asset. *(Actual endpoint assumed)*
*   **(Via `AddToCollectionModal.js`)**
    *   **`GET /api/collections`**: Fetches the list of collections.
    *   **`POST /api/collections/:collectionId/assets`**: Adds this asset to a specific collection.

---

## 11. Collections (`src/pages/CollectionsPage.js`)

*   **`GET /api/collections`**: Fetches the list of collections for the workspace.
*   **`DELETE /api/collections/:collectionId`**: Deletes a specific collection.
*   **(Via `CreateCollectionModal.js`)**
    *   **`POST /api/collections`**: Creates a new collection.

---

## 12. Collection Detail (`src/pages/CollectionDetailPage.js`)

*   **`GET /api/collections/:collectionId`**: Fetches details for a specific collection.
*   **`GET /api/collections/:collectionId/assets`**: Fetches the list of assets belonging to this collection.
    *   Params: `limit`, `offset`
*   **`DELETE /api/collections/:collectionId/assets/:assetId`**: Removes a specific asset from this collection.
*   **`DELETE /api/collections/:collectionId`**: Deletes the entire collection.
*   **(Via `EditCollectionModal.js` - *if exists*)**
    *   **`PUT /api/collections/:collectionId`**: Updates details for the collection. *(Existence and endpoint assumed)*

---

## 13. Create Style (`src/pages/CreateStylePage.js` & `ExperimentalCreatePage.js`)

*These pages likely fetch data to populate selection options and then post to create a new asset.*
*   **`GET /api/products`**: Fetches garments.
*   **`GET /api/model-images`**: Fetches models.
*   **`GET /api/poses`**: Fetches poses.
*   **`GET /api/accessory-images`**: Fetches accessories.
*   **`POST /api/assets`**: Creates a new generated asset (style/look) based on selected inputs and prompt. *(Endpoint assumed based on other patterns)*

--- 