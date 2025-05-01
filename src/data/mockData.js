// Placeholder mock data functions
// Replace with actual API calls later

// --- Mock Data Definitions ---

const MOCK_PRODUCTS = [
  {
    id: 'prod_001',
    name: 'Classic Crew Neck T-Shirt',
    // Use reference_image_url to match API
    reference_image_url: 'https://picsum.photos/seed/prod_001/300/300',
    // Add other fields based on API reference if needed (workspace_id, user_id, created_at)
    workspace_id: 'mock_workspace_1',
    user_id: 'mock_user_1',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    is_archived: false
  },
  {
    id: 'prod_002',
    name: 'Slim Fit Denim Jeans',
    reference_image_url: 'https://picsum.photos/seed/prod_002/300/300',
    workspace_id: 'mock_workspace_1',
    user_id: 'mock_user_1',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    is_archived: false
  },
  {
    id: 'prod_003',
    name: 'Hooded Sweatshirt',
    reference_image_url: 'https://picsum.photos/seed/prod_003/300/300',
    workspace_id: 'mock_workspace_1',
    user_id: 'mock_user_1',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    is_archived: false
  },
   {
    id: 'prod_004',
    name: 'Leather Biker Jacket',
    reference_image_url: 'https://picsum.photos/seed/prod_004/300/300',
    workspace_id: 'mock_workspace_1',
    user_id: 'mock_user_1',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    is_archived: false
  },
];

const MOCK_ASSETS = [
  {
    id: 'asset_001',
    // name: 'Cosmic T-Shirt Look', // Name isn't a direct field in Asset API
    // Use image_url and thumbnail_url from API reference
    image_url: 'https://picsum.photos/seed/asset_001/1024/1024',
    thumbnail_url: 'https://picsum.photos/seed/asset_001/300/300',
    prompt: 'Apply a swirling galaxy print to the base t-shirt (prod_001), deep blues and purples, star clusters visible.',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    // modelUsed: 'DreamShaper v8', // This might be in generation_params
    is_liked: true,
    // source: { // Source info needs to be inferred from prompt/IDs in real app
    //   type: 'text_garment',
    //   baseGarmentId: 'prod_001',
    // },
    workspace_id: 'mock_workspace_1',
    user_id: 'mock_user_1',
    job_id: 'job_001',
    is_public: false,
    product_id: 'prod_001', // Link to base garment
    input_image_id: null,
    generation_params: { model: 'DreamShaper v8', quality: 'standard', size: '1024x1024' }
  },
  {
    id: 'asset_002',
    image_url: 'https://picsum.photos/seed/asset_002/1024/1024',
    thumbnail_url: 'https://picsum.photos/seed/asset_002/300/300',
    prompt: 'Overlay a floral pattern (img_ref_002) onto denim jeans (prod_002), make flowers glow neon pink and green.',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    is_liked: false,
    workspace_id: 'mock_workspace_1',
    user_id: 'mock_user_1',
    job_id: 'job_002',
    is_public: true, // Make one public for explore
    product_id: 'prod_002', // Link to base garment
    input_image_id: 'img_ref_002', // Link to reference image
    generation_params: { model: 'Stable Diffusion XL', quality: 'hd', size: '1024x1536' }
  },
  {
    id: 'asset_003',
    image_url: 'https://picsum.photos/seed/asset_003/1024/1024',
    thumbnail_url: 'https://picsum.photos/seed/asset_003/300/300',
    prompt: 'A dark grey hoodie with integrated circuit patterns etched in glowing cyan lines, futuristic, high-tech.',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    is_liked: true,
    workspace_id: 'mock_workspace_1',
    user_id: 'mock_user_1',
    job_id: 'job_003',
    is_public: false,
    product_id: null, // Text only
    input_image_id: null,
    generation_params: { model: 'DreamShaper v8', quality: 'standard', size: '1024x1024' }
  },
  {
    id: 'asset_004',
    image_url: 'https://picsum.photos/seed/asset_004/1024/1024',
    thumbnail_url: 'https://picsum.photos/seed/asset_004/300/300',
    prompt: 'Cover the back panel of the biker jacket (prod_004) with vibrant, Banksy-style graffiti art, spray paint effect.',
    created_at: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    is_liked: false,
    workspace_id: 'mock_workspace_1',
    user_id: 'mock_user_1',
    job_id: 'job_004',
    is_public: true, // Another public one
    product_id: 'prod_004', // Link to base garment
    input_image_id: null,
    generation_params: { model: 'Stable Diffusion 1.5', quality: 'standard', size: '1024x1024' }
  },
   {
    id: 'asset_005',
    image_url: 'https://picsum.photos/seed/asset_005/1024/1024',
    thumbnail_url: 'https://picsum.photos/seed/asset_005/300/300',
    prompt: 'Simple white t-shirt splattered with abstract watercolor paint strokes, pastel colors, minimalist.',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    is_liked: true,
    workspace_id: 'mock_workspace_1',
    user_id: 'mock_user_1',
    job_id: 'job_005',
    is_public: false,
    product_id: null, // Text only
    input_image_id: null,
    generation_params: { model: 'DreamShaper v8', quality: 'hd', size: '1024x1024' }
  },
    {
    id: 'asset_006',
    image_url: 'https://picsum.photos/seed/asset_006/1024/1024',
    thumbnail_url: 'https://picsum.photos/seed/asset_006/300/300',
    prompt: 'Create a pair of jeans with a patchwork effect using different denim washes inspired by the reference photo (img_ref_006), bohemian style.',
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    is_liked: false,
    workspace_id: 'mock_workspace_1',
    user_id: 'mock_user_1',
    job_id: 'job_006',
    is_public: false,
    product_id: null, // Image only (no specific base garment)
    input_image_id: 'img_ref_006', // Link to reference image
    generation_params: { model: 'Stable Diffusion XL', quality: 'standard', size: '1024x1536' }
  },
];

// Mock Input Images (Reference Images)
const MOCK_INPUT_IMAGES = [
  {
    id: "img_ref_002",
    user_id: "mock_user_1",
    workspace_id: "mock_workspace_1",
    image_url: "https://picsum.photos/seed/ref_002/600/400",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 10000).toISOString(), // Slightly before asset
  },
  {
    id: "img_ref_006",
    user_id: "mock_user_1",
    workspace_id: "mock_workspace_1",
    image_url: "https://picsum.photos/seed/ref_006/600/400",
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000 - 10000).toISOString(), // Slightly before asset
  },
];


// Note: Models & Accessories are not part of the core API structure for v1
// Keeping them here for potential future use or UI mockups
const MOCK_MODELS = [
  { id: 'model_001', name: 'Aisha Khan', imageUrl: 'https://picsum.photos/seed/model_001/200/300' },
  { id: 'model_002', name: 'Ben Carter', imageUrl: 'https://picsum.photos/seed/model_002/200/300' },
  { id: 'model_003', name: 'Chloe Dubois', imageUrl: 'https://picsum.photos/seed/model_003/200/300' },
  { id: 'model_004', name: 'Kenji Tanaka', imageUrl: 'https://picsum.photos/seed/model_004/200/300' },
  { id: 'model_005', name: 'Sofia Rossi', imageUrl: 'https://picsum.photos/seed/model_005/200/300' },
];

const MOCK_ACCESSORIES = [
  { id: 'acc_001', name: 'Aviator Sunglasses', imageUrl: 'https://picsum.photos/seed/acc_001/200/200' },
  { id: 'acc_002', name: 'Leather Tote Bag', imageUrl: 'https://picsum.photos/seed/acc_002/200/200' },
  { id: 'acc_003', name: 'Beanie Hat', imageUrl: 'https://picsum.photos/seed/acc_003/200/200' },
  { id: 'acc_004', name: 'Gold Hoop Earrings', imageUrl: 'https://picsum.photos/seed/acc_004/200/200' },
  { id: 'acc_005', name: 'Canvas Backpack', imageUrl: 'https://picsum.photos/seed/acc_005/200/200' },
];

// Collections data needs to be updated based on the API response format
let MOCK_COLLECTIONS = [
  {
    id: 'coll_001',
    name: 'Cyberpunk Concepts',
    // description: 'Exploring futuristic and high-tech aesthetics.', // No description field in API
    user_id: 'mock_user_1',
    is_public: false,
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    asset_count: 2, // Calculated dynamically later
    thumbnail_urls: [], // Populated dynamically later
    // Store asset IDs separately for easier management in mock data
    _assetIds: ['asset_003', 'asset_001'] 
  },
  {
    id: 'coll_002',
    name: 'Floral & Patterns',
    user_id: 'mock_user_1',
    is_public: true,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    asset_count: 3,
    thumbnail_urls: [],
    _assetIds: ['asset_002', 'asset_005', 'asset_006']
  },
  {
    id: 'coll_003',
    name: 'Street Art Styles',
    user_id: 'mock_user_1',
    is_public: false,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    asset_count: 1,
    thumbnail_urls: [],
    _assetIds: ['asset_004']
  },
  {
    id: 'coll_004',
    name: 'Empty Collection',
    user_id: 'mock_user_1',
    is_public: false,
    created_at: new Date(Date.now() - 0.1 * 24 * 60 * 60 * 1000).toISOString(),
    asset_count: 0,
    thumbnail_urls: [],
    _assetIds: []
  },
];

// --- Simulated API Access Functions --- 

// Helper to deep clone to prevent modifying original mock data
const deepClone = (data) => JSON.parse(JSON.stringify(data));

// Helper to simulate network delay
const simulateDelay = (data) => new Promise(resolve => setTimeout(() => resolve(deepClone(data)), 300 + Math.random() * 400));

// --- Products (Base Garments) --- 

// GET /api/products?workspaceId={workspace_id}
export const getMockProducts = (workspaceId = 'mock_workspace_1') => {
  console.log(`MOCK: getMockProducts (workspaceId: ${workspaceId})`);
  const products = MOCK_PRODUCTS.filter(p => p.workspace_id === workspaceId && !p.is_archived);
  return simulateDelay(products);
};

// GET /api/products/{productId}
export const getMockProductById = (productId) => {
  console.log(`MOCK: getMockProductById (productId: ${productId})`);
  const product = MOCK_PRODUCTS.find(p => p.id === productId);
  return simulateDelay(product);
};

// POST /api/products
export const createMockProduct = async ({ name, reference_image_url, workspace_id }) => {
  console.log(`MOCK: createMockProduct (name: ${name})`);
  const newProduct = {
    id: `prod_${Date.now()}`,
    name: name,
    reference_image_url: reference_image_url,
    workspace_id: workspace_id || 'mock_workspace_1',
    user_id: 'mock_user_1',
    created_at: new Date().toISOString(),
    is_archived: false,
  };
  MOCK_PRODUCTS.push(newProduct);
  await simulateDelay(null); // Simulate delay
  return deepClone(newProduct);
};

// --- Assets (Styles/Looks) --- 

// GET /api/assets?workspaceId={workspace_id}&limit=N&sort=recent&liked=true
export const getMockAssets = ({ workspaceId = 'mock_workspace_1', limit, sort, liked }) => {
  console.log(`MOCK: getMockAssets (workspaceId: ${workspaceId}, limit: ${limit}, sort: ${sort}, liked: ${liked})`);
  let assets = MOCK_ASSETS.filter(a => a.workspace_id === workspaceId);

  if (liked) {
    assets = assets.filter(a => a.is_liked === true);
  }

  if (sort === 'recent') {
    assets.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  if (limit) {
    assets = assets.slice(0, limit);
  }
  
  return simulateDelay(assets);
};

// GET /api/assets/public?search={query}
export const getMockPublicAssets = ({ search }) => {
  console.log(`MOCK: getMockPublicAssets (search: ${search})`);
  let assets = MOCK_ASSETS.filter(a => a.is_public);
  if (search) {
    const query = search.toLowerCase();
    assets = assets.filter(a => a.prompt.toLowerCase().includes(query));
  }
  return simulateDelay(assets);
};

// GET /api/assets/{assetId}
export const getMockAssetById = (assetId) => {
  console.log(`MOCK: getMockAssetById (assetId: ${assetId})`);
  const asset = MOCK_ASSETS.find(a => a.id === assetId);
  return simulateDelay(asset);
};

// POST /api/assets/{assetId}/like
export const likeMockAsset = async (assetId) => {
   console.log(`MOCK: likeMockAsset (assetId: ${assetId})`);
   const asset = MOCK_ASSETS.find(a => a.id === assetId);
   if (asset) {
     asset.is_liked = true;
   }
   await simulateDelay(null);
   return { message: "Asset liked successfully" };
};

// DELETE /api/assets/{assetId}/like
export const unlikeMockAsset = async (assetId) => {
   console.log(`MOCK: unlikeMockAsset (assetId: ${assetId})`);
   const asset = MOCK_ASSETS.find(a => a.id === assetId);
   if (asset) {
     asset.is_liked = false;
   }
   await simulateDelay(null);
   return { message: "Asset unliked successfully" };
};

// (Delete asset functionality is complex due to relations, skip for basic mock)
// export const deleteMockAsset = (assetId) => { ... };

// --- Collections --- 

// Helper to populate thumbnail URLs for a collection
const populateCollectionThumbs = (collection) => {
    collection.asset_count = collection._assetIds.length;
    collection.thumbnail_urls = collection._assetIds
        .map(assetId => MOCK_ASSETS.find(a => a.id === assetId)?.thumbnail_url)
        .filter(Boolean) // Remove undefined if asset not found
        .slice(0, 4); // Limit to 4 thumbs per API spec
    // Also add single thumbnailUrl for CollectionCard convenience
    collection.thumbnailUrl = collection.thumbnail_urls[0] || 'https://via.placeholder.com/150x150/eee/aaa?text=Empty';
    return collection;
}

// GET /api/collections
export const getMockCollections = () => {
  console.log("MOCK: getMockCollections");
  const collections = MOCK_COLLECTIONS.map(c => {
      const populated = populateCollectionThumbs(deepClone(c));
      delete populated._assetIds; // Don't return internal asset ID list
      return populated;
  });
  return simulateDelay(collections);
};

// GET /api/collections/{collectionId}
export const getMockCollectionById = (collectionId) => {
  console.log(`MOCK: getMockCollectionById (collectionId: ${collectionId})`);
  const collection = MOCK_COLLECTIONS.find(c => c.id === collectionId);
  if (!collection) return simulateDelay(null);

  const populated = populateCollectionThumbs(deepClone(collection));
  // Populate assets based on _assetIds for the detail view
  populated.assets = populated._assetIds
      .map(assetId => deepClone(MOCK_ASSETS.find(a => a.id === assetId)))
      .filter(Boolean)
      .map(asset => { 
          // Simulate added_to_collection_at (not in real API)
          asset.added_to_collection_at = new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(); 
          return asset;
      }); 
  delete populated._assetIds; // Clean up internal field
  
  return simulateDelay(populated);
};

// POST /api/collections
export const createMockCollection = async ({ name, is_public = false, initialAssetId }) => {
  console.log(`MOCK: createMockCollection (name: ${name}, initialAssetId: ${initialAssetId})`);
  const newCollection = {
    id: `col_${Date.now()}`,
    name: name,
    user_id: 'mock_user_1',
    is_public: is_public,
    created_at: new Date().toISOString(),
    asset_count: initialAssetId ? 1 : 0,
    thumbnail_urls: [],
    _assetIds: initialAssetId ? [initialAssetId] : [],
  };
  MOCK_COLLECTIONS.push(newCollection);
  const populated = populateCollectionThumbs(deepClone(newCollection));
  delete populated._assetIds;
  await simulateDelay(null);
  return populated;
};

// POST /api/collections/{collectionId}/items
export const addAssetToCollection = async (collectionId, { asset_id }) => {
    console.log(`MOCK: addAssetToCollection (collectionId: ${collectionId}, asset_id: ${asset_id})`);
    const collection = MOCK_COLLECTIONS.find(c => c.id === collectionId);
    if (collection && !collection._assetIds.includes(asset_id)) {
        collection._assetIds.push(asset_id);
        console.log(`MOCK: Asset ${asset_id} added to collection ${collectionId}._assetIds`);
    } else if (!collection) {
        console.warn(`MOCK: Collection ${collectionId} not found!`);
        throw new Error("Mock Error: Collection not found");
    } else {
        console.log(`MOCK: Asset ${asset_id} already in collection ${collectionId}._assetIds`);
    }
    await simulateDelay(null);
    return { message: "Asset added to collection successfully" };
}

// DELETE /api/collections/{collectionId}/items/{assetId}
export const removeAssetFromCollection = async (collectionId, assetId) => {
    console.log(`MOCK: removeAssetFromCollection (collectionId: ${collectionId}, assetId: ${assetId})`);
    const collection = MOCK_COLLECTIONS.find(c => c.id === collectionId);
    if (collection) {
        const index = collection._assetIds.indexOf(assetId);
        if (index > -1) {
            collection._assetIds.splice(index, 1);
            console.log(`MOCK: Asset ${assetId} removed from collection ${collectionId}._assetIds`);
        } else {
            console.log(`MOCK: Asset ${assetId} not found in collection ${collectionId}._assetIds`);
        }
    } else {
        console.warn(`MOCK: Collection ${collectionId} not found!`);
        throw new Error("Mock Error: Collection not found");
    }
    await simulateDelay(null);
    // API returns 204 No Content, so return nothing or success message
    return { message: "Asset removed successfully" }; 
}

// PUT /api/collections/{collectionId}
export const renameMockCollection = async (collectionId, { name, is_public }) => {
    console.log(`MOCK: renameMockCollection (collectionId: ${collectionId}, name: ${name}, is_public: ${is_public})`);
    const collection = MOCK_COLLECTIONS.find(c => c.id === collectionId);
    if (collection) {
        if (name !== undefined) collection.name = name;
        if (is_public !== undefined) collection.is_public = is_public;
        const populated = populateCollectionThumbs(deepClone(collection));
        delete populated._assetIds;
        await simulateDelay(null);
        return populated; // Return updated collection data
    } else {
        console.warn(`MOCK: Collection ${collectionId} not found!`);
        throw new Error("Mock Error: Collection not found");
    }
};

// DELETE /api/collections/{collectionId}
export const deleteMockCollection = async (collectionId) => {
    console.log(`MOCK: deleteMockCollection (collectionId: ${collectionId})`);
    const index = MOCK_COLLECTIONS.findIndex(c => c.id === collectionId);
    if (index > -1) {
        MOCK_COLLECTIONS.splice(index, 1);
        console.log(`MOCK: Collection ${collectionId} deleted.`);
    } else {
        console.warn(`MOCK: Collection ${collectionId} not found!`);
        throw new Error("Mock Error: Collection not found");
    }
    await simulateDelay(null);
    // API returns 204 No Content
    return { message: "Collection deleted successfully" }; 
};

// --- Generation --- 

// POST /api/generate
export const initiateMockGeneration = async (params) => {
    console.log("MOCK: initiateMockGeneration with params:", params);
    const jobId = `job_${Date.now()}`;
    // Simulate starting the job
    mockGenerationJobs[jobId] = { status: 'pending', params };
    // Simulate processing delay
    setTimeout(() => {
        mockGenerationJobs[jobId].status = 'processing';
        // Simulate completion delay
        setTimeout(() => {
            const newAsset = {
                id: `asset_${Date.now()}`,
                image_url: `https://picsum.photos/seed/gen_${jobId}/1024/1024`,
                thumbnail_url: `https://picsum.photos/seed/gen_${jobId}/300/300`,
                prompt: params.prompt,
                created_at: new Date().toISOString(),
                is_liked: false,
                workspace_id: params.workspace_id || 'mock_workspace_1',
                user_id: 'mock_user_1',
                job_id: jobId,
                is_public: false,
                product_id: params.product_id || null,
                input_image_id: params.input_image_id || null,
                generation_params: { 
                    model: 'Mock Model', 
                    quality: params.quality || 'standard', 
                    size: params.aspect_ratio ? (params.aspect_ratio === '1:1' ? '1024x1024' : '1024x1536') : '1024x1024'
                }
            };
            MOCK_ASSETS.push(newAsset);
            mockGenerationJobs[jobId] = { status: 'completed', assetId: newAsset.id };
            console.log(`MOCK: Job ${jobId} completed, created asset ${newAsset.id}`);
        }, 3000 + Math.random() * 5000); // 3-8 seconds completion time
    }, 500 + Math.random() * 1000); // 0.5-1.5 seconds processing start time

    await simulateDelay(null); // Initial delay for accepting the job
    return { jobId: jobId, message: "Generation job accepted" };
}

let mockGenerationJobs = {};

// GET /api/generate/{jobId}
export const getMockGenerationStatus = async (jobId) => {
    console.log(`MOCK: getMockGenerationStatus (jobId: ${jobId})`);
    const job = mockGenerationJobs[jobId];
    if (!job) {
        throw new Error("Mock Error: Job not found");
    }
    // Simulate returning only the relevant status fields
    const response = { jobId };
    if (job.status === 'completed') {
        response.status = 'completed';
        response.assetId = job.assetId;
    } else if (job.status === 'failed') {
        response.status = 'failed';
        response.error = job.error || 'Unknown generation error';
    } else {
        response.status = job.status; // pending or processing
    }
    return simulateDelay(response); 
};

// POST /api/input-images/upload
export const uploadMockInputImage = async ({ workspace_id }) => {
    console.log("MOCK: uploadMockInputImage");
    const newImage = {
        id: `img_${Date.now()}`,
        user_id: "mock_user_1",
        workspace_id: workspace_id || "mock_workspace_1",
        image_url: `https://picsum.photos/seed/upload_${Date.now()}/600/400`,
        created_at: new Date().toISOString(),
    };
    MOCK_INPUT_IMAGES.push(newImage);
    await simulateDelay(null);
    return newImage;
}


// --- Other (Not used in V1 API but kept from original mock) ---
export const getMockModels = () => simulateDelay(MOCK_MODELS);
export const getMockAccessories = () => simulateDelay(MOCK_ACCESSORIES);

const MOCK_PROMPT_EXAMPLES = []; // Simplified for V1
export const getMockPromptExamples = () => simulateDelay(MOCK_PROMPT_EXAMPLES);

const MOCK_POSES = []; // Simplified for V1
const MOCK_MOODS = []; // Simplified for V1
const MOCK_VIEWS = []; // Simplified for V1
export const getMockPoses = () => simulateDelay(MOCK_POSES);
export const getMockMoods = () => simulateDelay(MOCK_MOODS);
export const getMockViews = () => simulateDelay(MOCK_VIEWS); 