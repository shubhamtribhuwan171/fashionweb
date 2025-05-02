import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  RadioGroup,
  Radio,
  Stack,
  Textarea,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
  Spinner,
  Alert,
  AlertIcon,
  SimpleGrid,
  useToast,
  Image,
  useDisclosure,
  Icon,
  Center,
  AspectRatio,
  Select,
  useColorModeValue,
  Flex,
  useRadio,
  useRadioGroup,
  Tag,
  Collapse,
  Input,
  Spacer,
  Wrap,
  WrapItem,
  TagLabel,
  TagCloseButton,
  IconButton,
  CloseButton,
} from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
// Make sure react-icons is installed: npm install react-icons
import { FaUndo, FaImage, FaMagic, FaTshirt, FaSquare, FaMobileAlt, FaStar, FaRegStar, FaHeart, FaRegHeart, FaFolderPlus, FaTimes, FaCheckCircle, FaBoxOpen, FaUser, FaShoppingBag, FaUserCircle } from 'react-icons/fa'; 
// import StyleCard from '../../components/styles/StyleCard'; // Removed - Not used directly here
import GarmentSelectionModal from '../components/Modals/GarmentSelectionModal'; // Adjusted path
import ModelSelectionModal from '../components/Modals/ModelSelectionModal'; // Adjusted path
import AccessorySelectionModal from '../components/Modals/AccessorySelectionModal'; // Adjusted path
import PromptLibraryModal from '../components/Modals/PromptLibraryModal'; // Adjusted path
import PoseSelectionModal from '../components/Modals/PoseSelectionModal'; // Adjusted path
import MoodSelectionModal from '../components/Modals/MoodSelectionModal'; // Adjusted path
import ViewSelectionModal from '../components/Modals/ViewSelectionModal'; // Adjusted path
// Adjusted path and imported necessary functions
import { getMockProductById, getMockViews, getMockMoods, getMockPoses } from '../data/mockData'; 
import axios from 'axios'; // Import axios
import StyleCard from '../components/Styles/StyleCard'; // Import StyleCard for results
import AddToCollectionModal from '../components/Modals/AddToCollectionModal'; // Import AddToCollectionModal
import { usePageHeader } from '../components/Layout/DashboardLayout'; // Import hook

// TODO: Move to config
const API_BASE_URL = 'https://productmarketing-ai-f0e989e4e1ad.herokuapp.com';
const POLLING_INTERVAL = 3000; // 3 seconds
const MAX_POLLING_ATTEMPTS = 20; // Approx 1 minute timeout

// TODO: Replace with actual workspace ID from context/state management
const getMockWorkspaceId = () => '95d29ad4-47fa-48ee-85cb-cbf762eb400a';

// Simulation function needs to be defined or imported. Defined locally for now.
// TODO: Potentially move this to mockData.js if used elsewhere
const simulateGeneration = (prompt, mode, inputDetails, settings, pose, mood, views) => {
  console.log('Simulating generation with:', { prompt, mode, inputDetails, settings, pose, mood, views });

  // Construct a more detailed prompt if mood/pose are selected
  let finalPrompt = prompt;
  // Use pose/mood *names* if available, otherwise fall back or skip
  if (pose?.name) finalPrompt += `, posing ${pose.name}`; 
  if (mood?.name) finalPrompt += `, mood: ${mood.name}`; // Assume mood object has a 'name'

  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate one result per selected view
      const numResults = views.length > 0 ? views.length : 1;
      const actualViews = views.length > 0 ? views : [{ id: 'view_001', name: 'Front Full' }]; // Default to front view if none selected

      const results = actualViews.map((view, i) => ({
        id: `sim_${Date.now()}_${view.id}_${i}`,
        // Include view name in the result name if multiple views
        name: numResults > 1 ? `Generated Look (${view.name})` : `Generated Look`,
        // Vary image seed slightly based on view for simulation
        imageUrl: `https://picsum.photos/seed/${Date.now()}_${view.id}/${settings.aspectRatio === '1:1' ? '600' : (settings.aspectRatio === '9:16' ? '450' : '800')}/${settings.aspectRatio === '1:1' ? '600' : (settings.aspectRatio === '9:16' ? '800' : '450')}`,
        liked: false,
        // createdAt: 'Just now', // Using created_at from API standard later
        created_at: new Date().toISOString(), 
        prompt: finalPrompt, // Use the potentially augmented prompt
        view: view, // Store the view associated with this result
        source: {
            type: mode === 'garment' ? 'text_garment' : (mode === 'image' ? 'text_image' : 'text'),
            baseGarmentId: mode === 'garment' ? inputDetails?.id : undefined,
            referenceImageUrl: mode === 'image' ? inputDetails?.url : undefined,
        },
        // Mimic potential asset fields
        product_id: mode === 'garment' ? inputDetails?.id : null,
        input_image_id: mode === 'image' ? inputDetails?.id : null, // Assuming image upload provides an ID eventually
        generation_params: { 
            model: 'DreamShaper v8', // Example model
            pose: pose?.name, 
            mood: mood?.name, 
            view: view?.name,
            aspectRatio: settings.aspectRatio,
            quality: settings.quality,
         } 
        // modelUsed: 'DreamShaper v8',
        // // Store other generation parameters if needed
        // settings: settings,
        // pose: pose,
        // mood: mood,
      }));
      resolve(results);
    }, 2500);
  });
};

// Internal Selection Card Component using Chakra's useRadio hook
function SelectionCard(props) {
  const { getInputProps, getRadioProps } = useRadio(props);
  const input = getInputProps();
  const radio = getRadioProps();

  const selectedBg = useColorModeValue('purple.100', 'purple.800'); // Changed from blue
  const selectedBorder = useColorModeValue('purple.500', 'purple.300'); // Changed from blue
  const hoverBg = useColorModeValue('gray.100', 'gray.700');

  return (
    <Box as='label' flex={1}> {/* Ensure cards take equal space */}
      <input {...input} />
      <Box
        {...radio}
        cursor='pointer'
        borderWidth='1px'
        borderRadius='md'
        boxShadow='sm'
        _checked={{
          bg: selectedBg,
          borderColor: selectedBorder,
          fontWeight: 'bold',
        }}
        _hover={{
          bg: hoverBg,
        }}
        px={4}
        py={3}
        textAlign="center"
      >
        {props.icon && <Icon as={props.icon} mb={1} />}
        <Text fontSize="sm">{props.children}</Text>
      </Box>
    </Box>
  );
}

// Component for the compact display card for settings
const SettingDisplayCard = ({ label, icon, value, onClick, isActive, bg, hoverBg, ...rest }) => {
    // Call hook unconditionally at the top level of this component
    const activeBg = useColorModeValue('purple.50', 'purple.900');
    
    return (
        <Box 
            borderWidth="1px" 
            borderRadius="lg" 
            p={3} 
            flex={1} 
            textAlign="center" 
            cursor="pointer" 
            onClick={onClick}
            borderColor={isActive ? 'purple.400' : 'inherit'}
            // Use the variable derived from the hook call
            bg={isActive ? activeBg : bg} 
            _hover={{ bg: hoverBg }}
            {...rest}
        >
            <Icon as={icon} mb={1} />
            <Text fontSize="xs" color="gray.500">{label}</Text>
            <Text fontSize="sm" fontWeight="medium">{value}</Text>
        </Box>
    );
};

// Component for the full options group when expanded
const SettingOptionsGroup = ({ label, options, groupProps, getRadioOptionProps }) => (
    <Box p={4} borderWidth="1px" borderRadius="md">
        <Text fontSize="sm" fontWeight="medium" mb={3}>{label}</Text>
        <HStack {...groupProps} spacing={4}>
            {options.map(option => {
                const radio = getRadioOptionProps({ value: option.value });
                return (
                    <SelectionCard key={option.value} icon={option.icon} {...radio}>
                        {option.label}
                    </SelectionCard>
                );
            })}
        </HStack>
    </Box>
);

// Renaming component to match filename convention
function CreateStylePage() { 
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { setHeader } = usePageHeader(); // Use hook

  const { isOpen: isGarmentModalOpen, onOpen: onGarmentModalOpen, onClose: onGarmentModalClose } = useDisclosure();
  const { isOpen: isModelModalOpen, onOpen: onModelModalOpen, onClose: onModelModalClose } = useDisclosure();
  const { isOpen: isAccessoryModalOpen, onOpen: onAccessoryModalOpen, onClose: onAccessoryModalClose } = useDisclosure();
  const { isOpen: isPromptModalOpen, onOpen: onPromptModalOpen, onClose: onPromptModalClose } = useDisclosure();
  const { isOpen: isPoseModalOpen, onOpen: onPoseModalOpen, onClose: onPoseModalClose } = useDisclosure();
  const { isOpen: isMoodModalOpen, onOpen: onMoodModalOpen, onClose: onMoodModalClose } = useDisclosure();
  const { isOpen: isViewModalOpen, onOpen: onViewModalOpen, onClose: onViewModalClose } = useDisclosure();
  const { isOpen: isAddToCollectionOpen, onOpen: onAddToCollectionOpen, onClose: onAddToCollectionClose } = useDisclosure();

  const [mode, setMode] = useState('text');
  const [selectedGarment, setSelectedGarment] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedAccessories, setSelectedAccessories] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null); // Stores { id, name, url }
  const [selectedPose, setSelectedPose] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedViews, setSelectedViews] = useState([]); // Stores array of view objects
  const [prompt, setPrompt] = useState('');
  const [generationState, setGenerationState] = useState('idle'); // idle, generating, results
  const [results, setResults] = useState([]); // Stores array of generated asset-like objects
  const [error, setError] = useState(null);
  const [generationSettings, setGenerationSettings] = useState({
      aspectRatio: '1:1',
      quality: 'standard',
  });
  const [expandedSetting, setExpandedSetting] = useState(null); // null, 'aspectRatio', 'quality'
  const [displayedResultIndex, setDisplayedResultIndex] = useState(0);
  const [imageFile, setImageFile] = useState(null); // For storing the selected File object
  const [previewUrl, setPreviewUrl] = useState(null); // For image preview
  const [jobId, setJobId] = useState(null); // Store active generation job ID
  const [pollingAttempts, setPollingAttempts] = useState(0);
  const [selectedAssetForCollection, setSelectedAssetForCollection] = useState(null);
  const [pollingIntervalId, setPollingIntervalId] = useState(null); // Store interval ID

  // --- Hooks called at top level --- 
  const placeholderBg = useColorModeValue('gray.100', 'gray.700');
  const placeholderBorder = useColorModeValue('gray.300', 'gray.600');
  const placeholderColor = useColorModeValue('gray.500', 'gray.400');
  const hoverBg = useColorModeValue('gray.100', 'gray.700'); // Re-used for hover states
  const settingCardBg = useColorModeValue('white', 'gray.700');
  const settingCardHoverBg = useColorModeValue('gray.50', 'gray.600');
  
  // --- Auth Helper ---
  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({ title: "Authentication Error", description: "Please log in.", status: "error" });
      return null;
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  }, [toast]);

  // Placeholder for workspace ID
  const currentWorkspaceId = getMockWorkspaceId();

  // --- Options ---
  const modeOptions = [
    { value: 'text', label: 'Text Only', icon: FaMagic },
    { value: 'garment', label: 'Use Garment', icon: FaTshirt },
    { value: 'image', label: 'Upload Image', icon: FaImage },
  ];
  const aspectRatioOptions = [
    { value: '1:1', label: 'Square', icon: FaSquare },
    { value: '16:9', label: 'Landscape', icon: FaImage },
    { value: '9:16', label: 'Portrait', icon: FaMobileAlt },
  ];
  const qualityOptions = [
      { value: 'standard', label: 'Standard', icon: FaRegStar },
      { value: 'hd', label: 'HD', icon: FaStar },
  ];

  // --- Radio Groups ---
  const { getRootProps: getModeRootProps, getRadioProps: getModeRadioProps } = useRadioGroup({
    name: 'mode',
    value: mode,
    onChange: newMode => {
      setMode(newMode);
      if (newMode !== 'garment') setSelectedGarment(null);
      if (newMode !== 'image') setImageFile(null);
    },
  });
  const { getRootProps: getAspectRootProps, getRadioProps: getAspectRadioProps } = useRadioGroup({
    name: 'aspectRatio',
    value: generationSettings.aspectRatio,
    onChange: value => {
      setGenerationSettings(s => ({ ...s, aspectRatio: value }));
      setExpandedSetting(null);
    },
  });
  const { getRootProps: getQualityRootProps, getRadioProps: getQualityRadioProps } = useRadioGroup({
    name: 'quality',
    value: generationSettings.quality,
    onChange: value => {
      setGenerationSettings(s => ({ ...s, quality: value }));
      setExpandedSetting(null);
    },
  });

  // --- Effects ---
  // Effect to handle preselected garment OR initial mode from navigation state
  useEffect(() => {
    const { selectedGarmentId, initialMode } = location.state || {}; // Destructure state
    const config = getAuthConfig(); // Get auth config
    let stateProcessed = false; // Flag to ensure we clear state only once

    // --- Handle Initial Mode --- 
    if (initialMode && ['text', 'garment', 'image'].includes(initialMode)) {
      setMode(initialMode);
      console.log(`Initial mode set from navigation state: ${initialMode}`);
      stateProcessed = true;
      // If mode is garment/image but no specific garment/image is passed, 
      // don't prefill prompt or assume anything else yet.
    }

    // --- Handle Preselected Garment (can run alongside initialMode, but initialMode takes precedence for *setting* the mode) --- 
    const fetchAndSetSelectedGarment = async (garmentId) => {
      if (!garmentId || !config) return; // Exit if no ID or auth
      
      // Only set mode to 'garment' if initialMode wasn't already set to something else
      if (!initialMode) {
          setMode('garment'); 
      }
      console.log(`Fetching preselected garment details for ID: ${garmentId}`);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/products/${garmentId}`, config);
        const garment = response.data;
        
        if (garment) {
          setSelectedGarment(garment); 
          console.log("Preselected garment fetched and set:", garment);
          if (!prompt) { // Only prefill prompt if it's empty
            setPrompt(`Model wearing the '${garment.name}'...`);
          }
        } else {
            toast({ title: "Couldn't load preselected garment", description: "Garment not found or invalid data received.", status: "warning", duration: 3000, isClosable: true });
            if (!initialMode) setMode('text'); // Revert mode if fetch fails ONLY if initialMode didn't set it
        }
      } catch (err) {
        console.error("Error fetching preselected garment:", err);
        toast({ title: "Error Loading Garment", description: err.response?.data?.message || "Failed to load the selected garment.", status: "error", duration: 3000, isClosable: true });
        if (!initialMode) setMode('text'); // Revert mode on error ONLY if initialMode didn't set it
      } finally {
        stateProcessed = true; // Mark state as processed even if fetch fails
      }
    };

    if (selectedGarmentId) {
      fetchAndSetSelectedGarment(selectedGarmentId);
    }

    // Clear location state after processing IF any state was processed
    if (stateProcessed) {
        console.log("Clearing navigation state:", location.state);
        navigate(location.pathname, { replace: true, state: {} });
    }

    // Dependencies: location.state object identity, navigate, toast, prompt, getAuthConfig
    // Using location.pathname is usually stable unless route changes
  }, [location.state, location.pathname, navigate, toast, prompt, getAuthConfig]);

  // Effect to set default view state (e.g., 'Front Full')
  useEffect(() => {
      const setDefaultView = async () => {
          if (selectedViews.length === 0) {
              try {
                  const allViews = await getMockViews();
                  const defaultView = allViews.find(v => v.id === 'view_001');
                  if (defaultView) {
                      setSelectedViews([defaultView]);
                  }
              } catch (err) {
                  console.error("Failed to fetch or set default view", err);
              }
          }
      };
      setDefaultView();
  }, []); // Run only once on mount

  // --- Image File Handling --- 
  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);
    // Clean up the object URL
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Basic type check
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
          toast({ title: "Invalid File Type", description: "Please select a PNG, JPG, or WEBP image.", status: "error" });
          setImageFile(null);
          e.target.value = null; // Attempt to clear input
          return;
      }
      setImageFile(file);
      setMode('image'); // Switch mode automatically when image is selected
    } else {
      setImageFile(null);
    }
  };

  // --- Define handleImageUpload to trigger the file input --- 
  const handleImageUpload = () => {
      const fileInput = document.getElementById('image-upload-input');
      fileInput?.click(); // Trigger click on the hidden/styled input
  };

  // --- Generation Logic --- 
  const handleVisualize = async () => {
    setError(null);
    setResults([]);
    setJobId(null);
    setPollingAttempts(0);
    if (pollingIntervalId) clearTimeout(pollingIntervalId); // Use clearTimeout for IDs from setTimeout
    setPollingIntervalId(null);

    const config = getAuthConfig();
    if (!currentWorkspaceId || !config) {
      setError("Workspace ID or Authentication missing.");
      return;
    }

    if (!prompt.trim()) {
        toast({ title: "Prompt Required", description: "Please enter a prompt describing the look.", status: "warning"});
        return;
    }

    // --- Determine Mode based on NEW Prioritization (Mode 5 > 4 > 2 > 3 > 1) --- 
    let effectiveMode = 'text';
    let payload = {
        prompt: prompt,
        workspace_id: currentWorkspaceId,
        // Base settings - these might be modified/deleted based on the mode
        size: "1024x1024", // Default - API doc suggests DALL-E 2 modes use this or others
        aspect_ratio: generationSettings.aspectRatio, // Often ignored by DALL-E 2 modes
        quality: generationSettings.quality, // Often ignored by DALL-E 2 modes
        n: 1, 
    };

    // 1. Mode 5 (Combined Scene)? (Model + Garment + Optional Accessories)
    if (selectedModel && selectedGarment) {
        effectiveMode = 'combined_scene'; // Mode 5
        payload.model_image_id = selectedModel.id;
        payload.product_id = selectedGarment.id;
        if (selectedAccessories.length > 0) {
            payload.accessory_image_ids = selectedAccessories.map(acc => acc.id);
        }
        // Per docs, DALL-E 2 based, ignores quality, aspect_ratio, input_image_id, pose, mood
        delete payload.quality;
        delete payload.aspect_ratio;
        // Set size appropriate for this DALL-E 2 multi-image edit mode if needed
        payload.size = "1024x1024"; // Example, check API doc for specific sizes

    // 2. Mode 4 (Scene)? (Model only + Optional Accessories)
    } else if (selectedModel && !selectedGarment) {
        effectiveMode = 'scene'; // Mode 4
        payload.model_image_id = selectedModel.id;
        if (selectedAccessories.length > 0) {
            payload.accessory_image_ids = selectedAccessories.map(acc => acc.id);
        }
        // Per docs, DALL-E 2 based, ignores quality, aspect_ratio, product_id, input_image_id, pose, mood
        delete payload.quality;
        delete payload.aspect_ratio;
        payload.size = "1024x1024"; // Example, check API doc

    // 3. Mode 2 (Product Edit)? (Garment only)
    } else if (selectedGarment && !selectedModel) {
        effectiveMode = 'product_edit'; // Mode 2
        payload.product_id = selectedGarment.id;
        // Per docs, DALL-E 2 based, ignores quality, aspect_ratio, model_image_id, input_image_id
        delete payload.quality;
        delete payload.aspect_ratio;
        payload.size = "1024x1024"; // Example, check API doc

    // 4. Mode 3 (Image Edit)? (Uploaded Image only)
    } else if (uploadedImage && !selectedModel && !selectedGarment) { 
        effectiveMode = 'image_edit'; // Mode 3
        payload.input_image_id = uploadedImage.id; // Ensure uploadedImage state has the ID
        // Per docs, DALL-E 2 based, ignores quality, aspect_ratio, product_id, model_image_id
        delete payload.quality;
        delete payload.aspect_ratio;
        payload.size = "1024x1024"; // Example, check API doc
    
    // 5. Mode 1 (Text-to-Image)
    } else {
        effectiveMode = 'text'; // Mode 1
        // Keep DALL-E 3 params (quality, aspect_ratio)
        // Adjust size based on aspect ratio for DALL-E 3
        if (generationSettings.aspectRatio === "1792x1024" || generationSettings.aspectRatio === "1024x1792") {
             payload.size = generationSettings.aspectRatio; 
        } else {
             payload.size = "1024x1024"; // Default for 1:1
        } 
        // payload.model = "dall-e-3"; // Can explicitly set if needed, or rely on backend default
    }

    console.log(`Effective Mode Determined: ${effectiveMode}`);
    console.log("Final Generation Payload:", payload);

    setGenerationState('generating');

    try {
      // Submit generation job
      const generateResponse = await axios.post(`${API_BASE_URL}/api/generate`, payload, config);
      const currentJobId = generateResponse.data?.jobId;

      if (!currentJobId) {
          throw new Error("Generation request accepted, but no Job ID was returned.");
      }
      setJobId(currentJobId);
      console.log("Generation job submitted, Job ID:", currentJobId);

      // Start Polling (handled by useEffect)
      setPollingAttempts(1);

    } catch (err) {
      console.error("Generation process failed:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to start generation.";
      setError(errorMsg);
      setGenerationState('idle'); // Reset state on failure
      toast({ title: "Generation Error", description: errorMsg, status: "error", duration: 5000 });
    }
  };

  // --- Polling Logic --- 
  useEffect(() => {
    let intervalId = null;

    const pollStatus = async () => {
        const config = getAuthConfig();
        if (!jobId || !config || generationState !== 'generating') {
             return; // Exit if no job ID, no auth, or not in generating state
        }

        console.log(`Polling job ${jobId}, attempt ${pollingAttempts}`);

        if (pollingAttempts > MAX_POLLING_ATTEMPTS) {
            console.error("Polling timed out.");
            setError("Generation took too long to complete. Please try again later.");
            setGenerationState('idle');
            setJobId(null);
            toast({ title: "Timeout", description: "Generation took too long.", status: "warning" });
            return;
        }

        try {
            const pollResponse = await axios.get(`${API_BASE_URL}/api/generate/${jobId}`, config);
            const status = pollResponse.data?.status;
            const assetId = pollResponse.data?.assetId;
            const errorMsg = pollResponse.data?.error;

            if (status === 'completed' && assetId) {
                console.log("Generation completed! Asset ID:", assetId);
                setJobId(null); // Stop polling
                // Fetch the final asset details
                try {
                  const assetResponse = await axios.get(`${API_BASE_URL}/api/assets/${assetId}`, config);
                  setResults([assetResponse.data]); // Assuming single result for now
                  setGenerationState('results');
                  console.log("Final asset data fetched:", assetResponse.data);
                } catch (fetchErr) {
                    console.error("Failed to fetch final asset:", fetchErr);
                    setError(fetchErr.response?.data?.message || "Generation complete, but failed to fetch the result.");
                    setGenerationState('idle');
                    toast({ title: "Result Fetch Error", description: "Failed to load the generated look.", status: "error" });
                }
            } else if (status === 'failed') {
                console.error("Generation job failed:", errorMsg);
                setError(errorMsg || "Generation failed for an unknown reason.");
                setGenerationState('idle');
                setJobId(null); // Stop polling
                toast({ title: "Generation Failed", description: errorMsg || "Please try again.", status: "error" });
            } else {
                // Still pending or processing, increment attempts for next poll
                setPollingAttempts(prev => prev + 1); 
            }
        } catch (pollError) {
            console.error("Polling error:", pollError);
            // Don't stop polling on transient network errors, but maybe after a few?
            // For now, we just let the max attempts handle persistent errors.
            setPollingAttempts(prev => prev + 1); // Increment to eventually timeout
        }
    };

    if (jobId && generationState === 'generating') {
      // Use setTimeout for interval to allow immediate first check if needed
      intervalId = setTimeout(pollStatus, pollingAttempts === 1 ? 500 : POLLING_INTERVAL); // Poll quickly first time
    }

    // Cleanup function to clear timeout
    return () => {
        if (intervalId) {
            clearTimeout(intervalId);
        }
    };
  // Dependencies: jobId changes trigger polling start/stop
  // pollingAttempts changes trigger the next poll
  // generationState ensures polling only happens when 'generating'
  }, [jobId, generationState, pollingAttempts, getAuthConfig, toast]);

  // --- Like Handler for Results --- 
  const handleLikeToggleResult = async (assetToToggle) => {
      if (!assetToToggle) return;
      const config = getAuthConfig();
      if (!config) return;

      const currentLikedStatus = assetToToggle.is_liked;
      const newLikedStatus = !currentLikedStatus;
      const assetIdToToggle = assetToToggle.id;

      // Optimistic UI update in results array
      setResults(prevResults => prevResults.map(r => {
          if (r.id === assetIdToToggle) {
              return { ...r, is_liked: newLikedStatus, like_count: (r.like_count || 0) + (newLikedStatus ? 1 : -1) };
          }
          return r;
      }));

      const url = `${API_BASE_URL}/api/assets/${assetIdToToggle}/like`;
      try {
          if (newLikedStatus) {
              await axios.post(url, {}, config);
              // Optional: toast confirmation
          } else {
              await axios.delete(url, config);
              // Optional: toast confirmation
          }
      } catch (error) {
          console.error("Failed to update like status for result:", error);
          // Revert optimistic UI update in results array
          setResults(prevResults => prevResults.map(r => {
              if (r.id === assetIdToToggle) {
                   return { ...r, is_liked: currentLikedStatus, like_count: (r.like_count || 0) + (currentLikedStatus ? 1 : -1) };
              }
              return r;
          }));
          toast({ title: "Error Updating Like", description: error.response?.data?.message || "Could not update like.", status: "error" });
      }
  };

  // --- Other Handlers (handleStartOver, modal selections) --- 
  const handleStartOver = () => {
    setPrompt('');
    setMode('text');
    setSelectedGarment(null);
    setImageFile(null);
    setPreviewUrl(null);
    setSelectedModel(null);
    setSelectedAccessories([]);
    setSelectedPose(null);
    setSelectedMood(null);
    setSelectedViews([]);
    setGenerationState('idle');
    setResults([]);
    setError(null);
    setJobId(null);
    setPollingAttempts(0);
    setGenerationSettings({ aspectRatio: '1:1', quality: 'standard' });
    setExpandedSetting(null);
    // Clear file input visually if needed (can be tricky)
    const fileInput = document.getElementById('image-upload-input'); // Assuming input has this ID
    if(fileInput) fileInput.value = null;
  };

  // --- Modal Selection Handlers --- 
  const handleSelectGarment = (garment) => {
      setSelectedGarment(garment);
    // If a garment is selected, implicitly switch mode if needed?
    // setMode('garment'); // Or let selections override mode implicitly
      onGarmentModalClose();
  };
  const handleSelectModel = (model) => { 
    setSelectedModel(model); 
    // If a model is selected, switch to scene mode? 
    // setMode('scene'); // Let's handle mode in handleVisualize
    onModelModalClose(); 
  };
  const handleSelectAccessories = (accessories) => { 
    setSelectedAccessories(accessories); 
    onAccessoryModalClose(); 
  };
  const handleSelectPrompt = ({ prompt: newPrompt }) => {
      setPrompt(newPrompt);
      // Handle potential reference image selection from prompt library if implemented
      onPromptModalClose();
  };
  const handleSelectPose = (pose) => { setSelectedPose(pose); onPoseModalClose(); };
  const handleSelectMood = (mood) => { setSelectedMood(mood); onMoodModalClose(); };
  const handleSelectViews = (views) => { setSelectedViews(views); onViewModalClose(); };

  // --- Helper function for Setting cards --- 
  const findOption = (options, value) => options.find(opt => opt.value === value);
  
  // --- Open AddToCollectionModal --- 
  const openCollectionModal = (asset) => {
      setSelectedAssetForCollection(asset);
      onAddToCollectionOpen();
  };

  const removeSelectedGarment = () => setSelectedGarment(null);
  const removeSelectedModel = () => setSelectedModel(null);
  const removeSelectedAccessory = (accessoryId) => {
    setSelectedAccessories(prev => prev.filter(acc => acc.id !== accessoryId));
  };

  useEffect(() => {
    // Set a generic header initially
    setHeader('Create Style', 'Generate a new look');
    // Optionally update subtitle based on mode later if needed
    return () => setHeader('', ''); // Clear on unmount
  }, [setHeader]);

  // --- Render ---
  return (
    // Use Flex for side-by-side layout on larger screens
    <Flex direction={{ base: 'column', lg: 'row' }} gap={8} pt={4} pb={8}>
      
      {/* Left Panel: Controls */}
      <VStack 
        spacing={5} // Consistent spacing
        align="stretch" 
        width={{ base: '100%', lg: '450px' }} // Fixed width for controls panel
        flexShrink={0}
      >
        <Heading size="lg">Visualize New Look</Heading>

        {/* Mode Selection */}
        <FormControl>
          <FormLabel>Generation Mode</FormLabel>
          <HStack {...getModeRootProps()} spacing={3}> 
            {modeOptions.map(({ value, label, icon }) => {
              const radio = getModeRadioProps({ value });
              return (
                <SelectionCard key={value} {...radio} icon={icon}>
                  {label}
                </SelectionCard>
              );
            })}
          </HStack>
        </FormControl>

        {/* Input Section (Conditional Garment/Image + Optional Model/Accessories) */}
        <Flex direction={{ base: 'column', md: 'row' }} gap={4} align="stretch"> 
          {/* Garment Input (Conditional) - Ensure it takes appropriate width */}
          {mode === 'garment' && (
            <Box flex={{ md: 1 }}> 
              {/* Standardized Header */}
              <HStack justifyContent="space-between" mb={1} align="center">
                  <HStack spacing={2}>
                      <Icon as={FaTshirt} color="gray.500" /> 
                      <Heading size="sm">Selected Garment *</Heading> 
                  </HStack>
                  {/* FormLabel removed as it's replaced by the HStack/Heading */}
              </HStack>
              {/* FormLabel removed from here */}
              {/* <FormLabel>Selected Garment *</FormLabel> */} 

              {selectedGarment ? (
                 // Style for selected garment preview
                 <HStack 
                    p={2} 
                    spacing={3} 
                    bg={settingCardHoverBg} 
                    borderRadius="md"
                    borderWidth="1px" 
                    borderColor={placeholderBorder} 
                >
                  <Image src={selectedGarment.reference_image_url || 'https://via.placeholder.com/50'} boxSize="40px" borderRadius="sm" objectFit="cover"/>
                  <Text flex={1} fontWeight="medium">{selectedGarment.name}</Text>
                  <Button size="xs" variant="outline" onClick={onGarmentModalOpen}>Change</Button> 
                </HStack>
              ) : (
                // Style for placeholder button
              <HStack
                borderWidth="1px"
                borderRadius="md"
                p={3}
                spacing={4}
                alignItems="center"
                  borderColor={placeholderBorder}
                bg={placeholderBg}
                  minHeight="66px" 
                  cursor="pointer" 
                  _hover={{ bg: hoverBg }} 
                  onClick={onGarmentModalOpen} 
                >
                   <Icon as={FaTshirt} mr={2} /> 
                   <Text color={placeholderColor}>Select Base Garment...</Text> 
              </HStack>
              )}
            </Box>
          )}

           {/* Image Input (Conditional) - Ensure it takes appropriate width */}
           {mode === 'image' && (
             <Box flex={{ md: 1 }}> 
                {/* Standardized Header */}
                <HStack justifyContent="space-between" mb={1} align="center">
                  <HStack spacing={2}>
                    <Icon as={FaImage} color="gray.500" /> 
                    <Heading size="sm">Reference Image *</Heading> 
                  </HStack>
                </HStack>
               {/* FormLabel removed */}
               {/* <FormLabel>Reference Image *</FormLabel> */} 

               {/* Placeholder/Preview for Image */}
               <HStack
                  borderWidth="1px"
                  borderRadius="md"
                  p={3}
                  spacing={4}
                  alignItems="center"
                  borderColor={uploadedImage ? 'transparent' : placeholderBorder}
                  bg={placeholderBg}
                  minHeight="66px" // Match other input boxes
                  cursor="pointer" // Make clickable
                  _hover={{ bg: hoverBg }}
                  onClick={handleImageUpload} // Trigger file input
               >
                 {uploadedImage ? (
                   <>
                     <Image src={previewUrl} boxSize="40px" borderRadius="sm" objectFit="cover"/>
                     <Text flex={1} fontWeight="medium" noOfLines={1}>{uploadedImage.name}</Text>
                     <Button size="xs" variant="outline" onClick={handleImageUpload}>Change</Button> 
                   </>
                 ) : (
                    <>
                      <Icon as={FaImage} mr={2} />
                      <Text color={placeholderColor}>Upload Image...</Text>
                    </>
                 )}
               </HStack>
               {/* Hidden file input */}
               <Input 
                  type="file" 
                  id="image-upload-input" 
                  accept="image/png, image/jpeg, image/webp" 
                  onChange={handleFileChange} 
                  style={{ display: 'none' }} 
                />
             </Box>
           )}

          {/* Model Selection Display - Ensure it takes appropriate width */}
          <Box flex={{ md: 1 }}> {/* Removed bg, p, shadow from outer box */}
              <HStack justifyContent="space-between" mb={1}> {/* Reduced margin bottom */}
                  <HStack spacing={2}>
                      <Icon as={FaUserCircle} color="gray.500" /> 
                      <Heading size="sm">Model</Heading>
                  </HStack>
              </HStack>
              
              {/* Conditionally render preview or placeholder */}
              {selectedModel ? (
                   // Style for selected model preview
              <HStack
                      p={2} 
                      spacing={3}
                      bg={settingCardHoverBg} 
                      borderRadius="md"
                borderWidth="1px"
                      borderColor={placeholderBorder}
                    > 
                      <Image 
                        src={selectedModel.storage_url} 
                        alt={selectedModel.name || 'Model Preview'} 
                        boxSize="40px" 
                        objectFit="cover" 
                        borderRadius="sm" 
                      />
                      <Text fontSize="sm" fontWeight="medium" noOfLines={1} flex={1}>{selectedModel.name || 'Untitled Model'}</Text>
                      <Button size="xs" variant="outline" onClick={onModelModalOpen} ml="auto">
                          Change
                      </Button>
                    </HStack>
              ) : (
                   // Style for placeholder - clickable box
                   <Box 
                      p={6} 
                      border={"1px dashed"} 
                      borderColor={placeholderBorder} 
                borderRadius="md"
                      textAlign="center" 
                bg={placeholderBg}
                      cursor={"pointer"} 
                      _hover={{ bg: hoverBg }} 
                onClick={onModelModalOpen}
                    >
                        <Text color={placeholderColor}>Click to select a model (Optional)</Text>
                    </Box>
              )}
           </Box>
        </Flex> {/* End Flex */} 

       {/* Accessory Selection (Optional) - Remains below */}
            <Box>
              <FormLabel>Accessories (Optional)</FormLabel>
              <HStack
                  borderWidth="1px"
                  borderRadius="md"
                  p={3}
                  spacing={2}
                  alignItems="center"
                  borderColor={selectedAccessories.length > 0 ? 'transparent' : placeholderBorder}
                  bg={placeholderBg}
                  minHeight="66px" // Match other input boxes
                  flexWrap="wrap" // Allow tags to wrap
                  cursor="pointer"
                  onClick={onAccessoryModalOpen}
                  _hover={{ bg: useColorModeValue('gray.200', 'gray.600')}}
              >
                  {selectedAccessories.length > 0 ? (
                      selectedAccessories.map(acc => (
                          <Tag key={acc.id} size="md" variant="solid" colorScheme="purple" m={1}>
                              {acc.name}
                          </Tag>
                      ))
                  ) : (
                      <Text color={placeholderColor} width="100%" textAlign="center">
                          Select Accessories... (Optional)
                      </Text>
                  )}
              </HStack>
            </Box>

        {/* Prompt Input */}
        <FormControl isRequired>
          <HStack justify="space-between" mb={1}> {/* Label and Library Button */}
            <FormLabel mb={0}>Style Prompt</FormLabel>
            <Button 
              size="xs" 
              variant="outline"
              onClick={onPromptModalOpen} // Open prompt library modal
            >
              Prompt Library
            </Button>
          </HStack>
          <Textarea
            placeholder="Describe the desired style, clothing details, model appearance, setting, lighting..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={5} // Adjust rows as needed
          />
          <FormHelperText>Example: "Full body shot of model wearing the [garment name] in a futuristic city, neon lighting, cyberpunk aesthetic."</FormHelperText>
        </FormControl>
        
        {/* --- Advanced Settings Section (Aspect Ratio, Quality) --- */}
        <VStack spacing={3} align="stretch" borderWidth="1px" borderRadius="lg" p={4}>
           <Heading size="sm" mb={1}>Generation Settings</Heading>
           {/* Collapsed View: Show current selections */}
           <Collapse in={expandedSetting === null} animateOpacity unmountOnExit>
             <HStack spacing={3} width="100%">
                <SettingDisplayCard
                    label="Aspect Ratio"
                    icon={findOption(aspectRatioOptions, generationSettings.aspectRatio)?.icon}
                    value={findOption(aspectRatioOptions, generationSettings.aspectRatio)?.label}
                    onClick={() => setExpandedSetting('aspectRatio')}
                    isActive={expandedSetting === 'aspectRatio'}
                    bg={settingCardBg}
                    hoverBg={settingCardHoverBg}
                />
                <SettingDisplayCard
                    label="Quality"
                    icon={findOption(qualityOptions, generationSettings.quality)?.icon}
                    value={findOption(qualityOptions, generationSettings.quality)?.label}
                    onClick={() => setExpandedSetting('quality')}
                    isActive={expandedSetting === 'quality'}
                    bg={settingCardBg}
                    hoverBg={settingCardHoverBg}
                 />
             </HStack>
           </Collapse>

           {/* Expanded Aspect Ratio View */}
           <Collapse in={expandedSetting === 'aspectRatio'} animateOpacity unmountOnExit>
             <VStack spacing={4} align="stretch">
                <SettingOptionsGroup
                    label="Select Aspect Ratio"
                    options={aspectRatioOptions}
                    groupProps={getAspectRootProps()}
                    getRadioOptionProps={getAspectRadioProps}
                 />
                 {/* Divider or spacing */}
                 <SettingDisplayCard
                     label="Quality"
                     icon={findOption(qualityOptions, generationSettings.quality)?.icon}
                     value={findOption(qualityOptions, generationSettings.quality)?.label}
                     onClick={() => setExpandedSetting('quality')}
                     isActive={expandedSetting === 'quality'}
                     bg={settingCardBg}
                     hoverBg={settingCardHoverBg}
                 />
            </VStack>
           </Collapse>

            {/* Expanded Quality View */}
           <Collapse in={expandedSetting === 'quality'} animateOpacity unmountOnExit>
             <VStack spacing={4} align="stretch">
                 <SettingDisplayCard
                     label="Aspect Ratio"
                     icon={findOption(aspectRatioOptions, generationSettings.aspectRatio)?.icon}
                     value={findOption(aspectRatioOptions, generationSettings.aspectRatio)?.label}
                     onClick={() => setExpandedSetting('aspectRatio')}
                     isActive={expandedSetting === 'aspectRatio'}
                     bg={settingCardBg}
                     hoverBg={settingCardHoverBg}
                 />
                 <SettingOptionsGroup
                     label="Select Quality"
                     options={qualityOptions}
                     groupProps={getQualityRootProps()}
                     getRadioOptionProps={getQualityRadioProps}
                 />
             </VStack>
           </Collapse>
        </VStack>

        {/* --- Optional Refinements Section (Pose, Mood, View) --- */}
         <VStack spacing={3} align="stretch" borderWidth="1px" borderRadius="lg" p={4}>
             <Heading size="sm" mb={1}>Refinements (Optional)</Heading>
             <HStack spacing={3} width="100%">
                 {/* Pose Selection Display Card */}
                 <SettingDisplayCard
                    label="Pose"
                    icon={FaTshirt} // Replace with appropriate icon
                    value={selectedPose ? selectedPose.name : 'Default'}
                    onClick={onPoseModalOpen}
                    isActive={expandedSetting === 'pose'}
                    bg={settingCardBg}
                    hoverBg={settingCardHoverBg}
                 />
                 {/* Mood Selection Display Card */}
                 <SettingDisplayCard
                     label="Mood"
                     icon={FaMagic} // Replace with appropriate icon
                     value={selectedMood ? selectedMood.name : 'Default'}
                     onClick={onMoodModalOpen}
                     isActive={expandedSetting === 'mood'}
                     bg={settingCardBg}
                     hoverBg={settingCardHoverBg}
                 />
                  {/* View Selection Display Card */}
                 <SettingDisplayCard
                     label="Views"
                     icon={FaImage} // Replace with appropriate icon
                     // Display number of selected views, or "Default" if only the default one is implicitly selected
                     value={`${selectedViews.length} Selected`}
                     onClick={onViewModalOpen}
                     isActive={expandedSetting === 'views'}
                     bg={settingCardBg}
                     hoverBg={settingCardHoverBg}
                 />
             </HStack>
         </VStack>

      </VStack>

      {/* Right Panel: Visualization Area */}
      <VStack 
        flex={1} 
        align="center" // Center content horizontally
        spacing={4} 
        pt={{ base: 4, lg: 12 }} // Add padding top for alignment
        position="sticky" // Make results sticky on large screens
        top="80px" // Adjust based on header height if necessary
        alignSelf="flex-start" // Prevent stretching vertically
      >
          {/* Image Preview Area */}
          <Box 
            width="100%" 
            maxW={{ base: '100%', md: '600px', lg: '100%' }} // Allow full width on lg
            mx="auto"
          >
            <AspectRatio 
              // Dynamically set ratio based on selection
              ratio={generationSettings.aspectRatio === '1:1' ? 1 : (generationSettings.aspectRatio === '9:16' ? 9/16 : 16/9)}
              borderRadius="lg"
              overflow="hidden"
              border="2px dashed"
              borderColor={generationState === 'results' ? 'transparent' : placeholderBorder}
              bg={generationState === 'results' ? 'transparent' : placeholderBg}
              color={placeholderColor}
              position="relative"
              minH="300px" // Ensure minimum height
            >
              <Center flexDir="column" p={4}>
                  {generationState === 'idle' && (
                      <>
                          <Icon as={FaMagic} boxSize={12} mb={4} color={placeholderColor}/>
                          <Text fontWeight="medium" color={placeholderColor} textAlign="center">
                              Your visualization will appear here
                          </Text>
                      </>
                  )}
                  {generationState === 'generating' && (
                      <Spinner size="xl" color="purple.500" />
                  )}
                  {/* Display the selected result */}
                  {generationState === 'results' && results.length > 0 && results[0] && (
                      <Image 
                          src={results[0].file_urls ? Object.values(results[0].file_urls)[0] : results[0].image_url}
                          alt={results[0].prompt || 'Generated Look'}
                          objectFit="cover" 
                          width="100%" 
                          height="100%" 
                      />
                  )}
                  {/* Handle case where results are expected but empty */}
                   {generationState === 'results' && results.length === 0 && !error && (
                       <Text fontWeight="medium" color="orange.500" textAlign="center">
                           Generation finished, but no results were returned.
                       </Text>
                   )}
              </Center>
            </AspectRatio>
          </Box>

          {/* Result Thumbnails (only if multiple results exist) */}
          {generationState === 'results' && results.length > 1 && (
              <HStack 
                spacing={3} 
                justifyContent="center" 
                flexWrap="wrap" 
                width="100%" 
                maxW={{ base: '100%', md: '600px', lg: '100%' }} // Allow full width
                mx="auto"
              >
                  {results.map((result, index) => (
                      <Box
                          key={result.id || index} // Use index as fallback key
                          cursor="pointer"
                          borderWidth="2px"
                          borderRadius="md"
                          // Highlight the selected thumbnail
                          borderColor={index === displayedResultIndex ? 'purple.500' : 'transparent'} 
                          onClick={() => setDisplayedResultIndex(index)} // Switch main view on click
                          overflow="hidden"
                          boxSize="60px" // Size of thumbnails
                          _hover={{ borderColor: 'purple.300' }}
                          boxShadow="sm"
                      >
                          <Image 
                              src={result.imageUrl} 
                              alt={result.name || `Result ${index + 1}`}
                              objectFit="cover"
                              width="100%"
                              height="100%"
                          />
                      </Box>
                  ))}
              </HStack>
          )}

          {/* Action Buttons */}
          <VStack spacing={3} width="100%" maxW="400px" mx="auto" pt={4}>
              <Button
                  colorScheme="purple"
                  onClick={handleVisualize}
                  isLoading={generationState === 'generating'}
                  loadingText="Visualizing..."
                  size="lg"
                  // Disable if generating or required fields missing
                  isDisabled={generationState === 'generating' || !prompt.trim() || (mode === 'garment' && !selectedGarment) || (mode === 'image' && !uploadedImage) }
                  w="full"
              >
                  Visualize Look
              </Button>
              
              {/* Show "Visualize Another" only after first generation */}
              {(generationState === 'generating' || generationState === 'results') && (
                  <Button 
                      leftIcon={<FaUndo />} 
                      onClick={handleStartOver}
                      variant="outline"
                      isDisabled={generationState === 'generating'} // Disable while generating
                      w="full"
                  >
                      Visualize Another
                  </Button>
              )}
          </VStack>

          {/* Error Display */}
          {error && (
              <Alert status="error" borderRadius="md" maxW="400px" mx="auto">
                  <AlertIcon />
                  {error}
              </Alert>
          )}
      </VStack>

      {/* --- Modals --- */}
      {/* Ensure correct props are passed */}
      <GarmentSelectionModal 
        isOpen={isGarmentModalOpen} 
        onClose={onGarmentModalClose} 
        onSelectGarment={handleSelectGarment} 
      />
      <ModelSelectionModal
        isOpen={isModelModalOpen}
        onClose={onModelModalClose}
        onSelectModel={handleSelectModel}
      />
      {/* Pass the array of selected accessory objects for initial state */}
      <AccessorySelectionModal
        isOpen={isAccessoryModalOpen}
        onClose={onAccessoryModalClose}
        onSelectAccessories={handleSelectAccessories} // Passes back array of full accessory objects
        initialSelectedIds={selectedAccessories.map(acc => acc.id)} // Pass only IDs for initial state
      />
      <PromptLibraryModal
        isOpen={isPromptModalOpen}
        onClose={onPromptModalClose}
        onSelectPrompt={handleSelectPrompt} // Expects { prompt, type, referenceImage }
      />
      {/* Pass current selection for potential highlighting in modal */}
      <PoseSelectionModal
          isOpen={isPoseModalOpen}
          onClose={onPoseModalClose}
          onSelectPose={handleSelectPose} 
          // currentPose={selectedPose} // Prop might not be used by modal, check modal impl.
      />
       <MoodSelectionModal
          isOpen={isMoodModalOpen}
          onClose={onMoodModalClose}
          onSelectMood={handleSelectMood}
          // currentMood={selectedMood} // Prop might not be used by modal, check modal impl.
      />
      {/* This modal needs refactoring for multi-select */}
      <ViewSelectionModal
          isOpen={isViewModalOpen}
          onClose={onViewModalClose}
          onSelectViews={handleSelectViews} // Expects array of view objects
          initialSelectedIds={selectedViews.map(v => v.id)} // Pass array of IDs
      />
       {/* Add To Collection Modal (for results) */} 
        {selectedAssetForCollection && (
            <AddToCollectionModal
                isOpen={isAddToCollectionOpen}
                onClose={() => { onAddToCollectionClose(); setSelectedAssetForCollection(null); }}
                styleId={selectedAssetForCollection.id}
            />
       )}
    </Flex>
  );
} 

export default CreateStylePage; // Ensure default export 