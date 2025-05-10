import React, { useState, useEffect, useCallback, useMemo, useContext, useRef } from 'react';
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
import { FaUndo, FaImage, FaMagic, FaTshirt, FaSquare, FaMobileAlt, FaStar, FaRegStar, FaHeart, FaRegHeart, FaFolderPlus, FaTimes, FaCheckCircle, FaBoxOpen, FaUser, FaShoppingBag, FaUserCircle, FaHourglassHalf, FaPlus, FaCopy, FaPen, FaUserCheck, FaUserSlash, FaMinus } from 'react-icons/fa'; 
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
const MAX_POLLING_ATTEMPTS = 10; // Approx 30 seconds timeout

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
  const [selectedTopGarment, setSelectedTopGarment] = useState(null); // Top garment selection
  const [selectedBottomGarment, setSelectedBottomGarment] = useState(null); // Bottom garment selection
  const [activeGarmentSlot, setActiveGarmentSlot] = useState(null); // 'top' or 'bottom' slots for Garment modal context
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedAccessories, setSelectedAccessories] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null); // Stores { id, name, url }
  const [selectedPoseId, setSelectedPoseId] = useState(null); // Renamed state, stores ID only
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedViews, setSelectedViews] = useState([]); // Stores array of view objects
  const [prompt, setPrompt] = useState('');
  const [generationState, setGenerationState] = useState('idle'); // idle, generating, results, timed_out_checking
  const [results, setResults] = useState([]); // Stores array of generated asset-like objects
  const [error, setError] = useState(null);
  const [generationSettings, setGenerationSettings] = useState({
      aspectRatio: '9:16',
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
  const [isUploadingImage, setIsUploadingImage] = useState(false); // For uploading indicator

  // --- Batch Generation State ---
  const [numberOfLooks, setNumberOfLooks] = useState(3); // Default to 3 looks
  const initialBatchItem = () => ({
    id: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Unique ID for key prop
    prompt: '',
    selectedPose: null, // Changed from poseId to selectedPose object
    jobId: null,
    status: 'idle', // idle, generating, results, timed_out_checking, failed
    result: null, // Stores the asset object
    pollingAttempts: 0,
    error: null, // Added error field for per-item errors
  });
  const [generationBatch, setGenerationBatch] = useState(() => Array(numberOfLooks).fill(null).map(() => initialBatchItem()));
  const [activeBatchSlotIndex, setActiveBatchSlotIndex] = useState(0); // Default to the first slot being active
  const batchPollingIntervalsRef = useRef({}); // Ref for storing polling interval IDs for batch items

  // --- Hooks called at top level --- 
  const placeholderBg = useColorModeValue('gray.100', 'gray.700');
  const placeholderBorder = useColorModeValue('gray.300', 'gray.600');
  const placeholderColor = useColorModeValue('gray.500', 'gray.400');
  const hoverBg = useColorModeValue('gray.100', 'gray.700'); // Re-used for hover states
  const settingCardBg = useColorModeValue('white', 'gray.700');
  const settingCardHoverBg = useColorModeValue('gray.50', 'gray.600');
  const activeBatchItemBackground = useColorModeValue('gray.50', 'gray.700'); // For the active batch item details
  const selectedPoseBg = useColorModeValue('purple.50', 'purple.800');
  const selectedPoseBorderColor = useColorModeValue('purple.300', 'purple.600');
  const selectedPoseIconColor = useColorModeValue('purple.600', 'purple.200');
  
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
    { value: 'text', label: 'Text', icon: FaMagic },
    { value: 'garment', label: 'Garment', icon: FaTshirt },
    { value: 'batch', label: 'Batch', icon: FaCopy },
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
      if (newMode !== 'image') setImageFile(null);
      if (newMode !== 'batch') {
        // Optionally reset batch state if switching away from batch mode
        // setGenerationBatch(Array(5).fill(null).map(() => initialBatchItem()));
      }
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

  // --- Define Polling Function with useCallback --- 
  const pollStatus = useCallback(async (currentJobId, intervalIdToClear) => {
    const config = getAuthConfig();
    if (!currentJobId || !config) {
        console.log("Polling stopped: No job ID or auth config.");
         if (intervalIdToClear) clearInterval(intervalIdToClear); // Clear interval if stopping
         setPollingIntervalId(null);
         return;
    }

    console.log(`Polling job ${currentJobId}, attempt ${pollingAttempts + 1}`); // Use pollingAttempts state here

    if (pollingAttempts >= MAX_POLLING_ATTEMPTS) { 
        console.warn("Polling timed out from frontend perspective.");
        // Don't set error, just change state and stop polling
        setGenerationState('timed_out_checking'); 
        toast({ 
          title: "Still Working...", 
          description: "Generation is taking longer than expected. You can view your generation status in the Generations page.", 
          status: "warning", 
          duration: 5000 
        });
        setJobId(null);
        if (intervalIdToClear) clearInterval(intervalIdToClear); // Clear interval on timeout
        setPollingIntervalId(null);
        return;
    }

    try {
        const pollResponse = await axios.get(`${API_BASE_URL}/api/generate/${currentJobId}`, config);
        const status = pollResponse.data?.status;
        const assetId = pollResponse.data?.assetId;
        const errorMsg = pollResponse.data?.error;

        if (status === 'completed' && assetId) {
            console.log("Generation completed! Asset ID:", assetId);
            setJobId(null); // Stop polling
            if (intervalIdToClear) clearInterval(intervalIdToClear);
            setPollingIntervalId(null);
            try {
                const assetResponse = await axios.get(`${API_BASE_URL}/api/assets/${assetId}`, config);
                setResults([assetResponse.data]);
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
            if (intervalIdToClear) clearInterval(intervalIdToClear);
            setPollingIntervalId(null);
            toast({ title: "Generation Failed", description: errorMsg || "Please try again.", status: "error" });
        } else {
            // Still pending or processing, increment attempts for next poll
            setPollingAttempts(prev => prev + 1); 
            // Schedule the next poll (the useEffect will handle this based on state change)
        }
    } catch (pollError) {
        console.error("Polling error:", pollError);
        setPollingAttempts(prev => prev + 1); // Increment to eventually timeout
        // Optionally add logic to stop after several consecutive poll errors
    }
  }, [getAuthConfig, pollingAttempts, toast, setResults, setGenerationState, setError, setJobId, setPollingIntervalId]); // Add dependencies

  // --- NEW: Effect to handle Remix Data or Remix Asset ---
  useEffect(() => {
    console.log('CreateStylePage mounted. Checking location state:', location.state);
    const { remixAsset } = location.state || {}; // Focus on remixAsset

    if (remixAsset) {
      console.log("Applying remixAsset data:", JSON.stringify(remixAsset, null, 2)); // Log the received object
      // Determine mode based on input_details
      const inputs = remixAsset.input_details || {};
      let inferredMode = 'text';
      if (inputs.input_image) inferredMode = 'image';
      else if (inputs.top_garment || inputs.bottom_garment || inputs.model) inferredMode = 'garment';
      setMode(inferredMode);

      // Prefill prompt and negative
      setPrompt(remixAsset.prompt || '');
      // Prefill settings if available
      if (remixAsset.aspect_ratio) {
          console.log("Attempting to set aspectRatio from remixAsset:", remixAsset.aspect_ratio);
          setGenerationSettings(s => {
              const newSettings = { ...s, aspectRatio: remixAsset.aspect_ratio };
              console.log("Updated generationSettings with aspectRatio:", newSettings);
              return newSettings;
          });
      } else {
           console.log("No aspect_ratio found on remixAsset.");
      }
      if (remixAsset.quality) {
          console.log("Attempting to set quality from remixAsset:", remixAsset.quality);
          setGenerationSettings(s => {
               const newSettings = { ...s, quality: remixAsset.quality };
               console.log("Updated generationSettings with quality:", newSettings);
               return newSettings;
          });
      } else {
           console.log("No quality found on remixAsset.");
      }

      // Prefill selections
      if (inputs.model) setSelectedModel(inputs.model);
      if (inputs.pose) setSelectedPoseId(inputs.pose.id);
      if (inputs.accessories) setSelectedAccessories(inputs.accessories);
      if (inputs.top_garment) setSelectedTopGarment(inputs.top_garment);
      if (inputs.bottom_garment) setSelectedBottomGarment(inputs.bottom_garment);
      if (inputs.input_image) {
        setMode('image');
        setUploadedImage({ id: inputs.input_image.id, name: inputs.input_image.name || '', url: inputs.input_image.storage_url });
      }

      // Clear the state from navigation
      navigate('.', { replace: true, state: {} });
      toast({ title: 'Remix applied!', description: 'Inputs pref-filled.', status: 'info', duration: 3000 });
      return; // Exit early after processing remixAsset
    }
    // Optional: Handle legacy remixData if needed, or remove this block
    // else if (location.state?.remixData) { ... }
    
  }, [location.state, navigate, toast]); // Keep dependencies minimal

  // --- Effects (place after function definitions they use) --- 
  // Effect to handle preselected garment OR initial mode from navigation state
  useEffect(() => {
    // **** IMPORTANT: Check if remix data was just processed ****
    // If remix data was present in the initial location.state, the effect above 
    // would have cleared it. If location.state is now empty, we can assume 
    // remix logic handled it (or there was nothing to handle). 
    // This prevents this effect from overriding remix settings.
    if (!location.state || Object.keys(location.state).length === 0) {
        console.log("Skipping garment/initialMode effect, state is empty (likely handled by remix or empty).");
        return; 
    }

    // Original logic for single garment or initial mode (if remixData wasn't present)
    console.log("Processing garment/initialMode state:", location.state);
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
          setSelectedTopGarment(garment); 
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

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Basic type check
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
          toast({ title: "Invalid File Type", description: "Please select a PNG, JPG, or WEBP image.", status: "error" });
          setImageFile(null);
        e.target.value = null;
          return;
      }
      setImageFile(file);
      setMode('image');
      // Immediately upload the reference image
      const config = getAuthConfig();
      if (!config) return;
      const formData = new FormData();
      formData.append('workspaceId', currentWorkspaceId);
      formData.append('image', file);
      try {
        setIsUploadingImage(true);
        const uploadRes = await axios.post(
          `${API_BASE_URL}/api/input-images/upload`,
          formData,
          { ...config, headers: { ...config.headers, 'Content-Type': 'multipart/form-data' } }
        );
        // Assuming response has id and storage_url
        setUploadedImage({ id: uploadRes.data.id, name: file.name, url: uploadRes.data.storage_url || uploadRes.data.image_url });
      } catch (uploadErr) {
        console.error('Image upload failed:', uploadErr);
        const msg = uploadErr.response?.data?.message || 'Image upload failed.';
        toast({ title: 'Upload Error', description: msg, status: 'error' });
        setUploadedImage(null);
      } finally {
        setIsUploadingImage(false);
      }
    } else {
      setImageFile(null);
      setUploadedImage(null);
    }
  };

  // --- Define handleImageUpload to trigger the file input --- 
  const handleImageUpload = () => {
      const fileInput = document.getElementById('image-upload-input');
      fileInput?.click(); // Trigger click on the hidden/styled input
  };

  // --- NEW: Batch Generation Initiation ---
  const initiateBatchGeneration = async () => {
    const config = getAuthConfig();
    if (!config) {
      toast({ title: "Authentication Error", description: "Cannot start batch generation.", status: "error", duration: 5000, isClosable: true });
      return;
    }

    // Show a general toast that batch generation has started
    toast({ title: "Batch Generation Started", description: `Initiating ${generationBatch.length} look(s). You can monitor progress in the 'Define Your Looks' section.`, status: "info", duration: 7000, isClosable: true });

    // Helper to derive garment_focus, adapted from single handleVisualize
    let garmentFocus;
    if (selectedTopGarment?.id && selectedBottomGarment?.id) {
      garmentFocus = 'both';
    } else if (selectedTopGarment?.id) {
      garmentFocus = 'top';
    } else if (selectedBottomGarment?.id) {
      garmentFocus = 'bottom';
    }

    // Helper to derive size, adapted from single handleVisualize
    let apiSize = "1024x1024"; // Default
    if (generationSettings.aspectRatio === '1:1') apiSize = "1024x1024";
    else if (generationSettings.aspectRatio === '9:16') apiSize = "1024x1536";
    else if (generationSettings.aspectRatio === '16:9') apiSize = "1536x1024";
    
    // Create a new array for updates to avoid direct state mutation in loop
    let updatedBatch = [...generationBatch];

    for (let i = 0; i < generationBatch.length; i++) {
      const batchItem = generationBatch[i];

      // Skip if prompt is empty for this look, or if already processing/done
      if (!batchItem.prompt || !batchItem.prompt.trim()) {
        updatedBatch[i] = { ...batchItem, status: 'failed', error: 'Prompt is empty for this look.' };
        setGenerationBatch([...updatedBatch]); // Early update for this item
        toast({ title: `Look ${i + 1} Skipped`, description: "Prompt is empty.", status: "warning", duration: 3000 });
        continue;
      }
      if (batchItem.status === 'generating' || batchItem.status === 'results') {
          console.log(`Skipping Look ${i+1} as it's already generating or has results.`);
          continue;
      }


      const payload = {
        workspace_id: currentWorkspaceId,
        prompt: batchItem.prompt.trim(),
        n: 1,
        model: 'gpt-image-1', // As per current single generation logic
        model_image_id: selectedModel?.id,
        top_product_id: selectedTopGarment?.id,
        bottom_product_id: selectedBottomGarment?.id,
        accessory_image_ids: selectedAccessories.length > 0 ? selectedAccessories.map(acc => acc.id) : undefined,
        pose_image_id: batchItem.selectedPose?.id,
        garment_focus: garmentFocus,
        size: apiSize,
        // quality can be passed if API supports, e.g., quality: generationSettings.quality
      };

      // Update status to 'generating' optimistically for this item
      updatedBatch[i] = { ...batchItem, status: 'generating', jobId: null, pollingAttempts: 0, error: null };
      setGenerationBatch([...updatedBatch]); // Update UI to show "generating" for this item

      try {
        const response = await axios.post(`${API_BASE_URL}/api/generate`, payload, config);
        // Update the specific item with its jobId
        updatedBatch[i] = { ...updatedBatch[i], jobId: response.data.jobId, status: 'generating' }; // Ensure status is generating
        console.log(`Batch Look ${i + 1} initiated. Job ID: ${response.data.jobId}`);
      } catch (err) {
        console.error(`Generation request failed for batch item ${i + 1}:`, err);
        const errorMsg = err.response?.data?.message || `Failed to start generation for Look ${i + 1}.`;
        updatedBatch[i] = { ...updatedBatch[i], status: 'failed', error: errorMsg, jobId: null };
        toast({ title: `Look ${i + 1} Failed`, description: errorMsg, status: "error", duration: 5000 });
      }
      // Set the batch state after each API call attempt to reflect changes incrementally
      setGenerationBatch([...updatedBatch]);
    }
    // Final update to ensure all changes are captured if any loop iterations were skipped
    // setGenerationBatch(updatedBatch); // This might be redundant if updated inside loop correctly
  };

  // --- Generation Logic --- 
  const handleVisualize = async () => {
    // If in batch mode, delegate to the new batch handler
    if (mode === 'batch') {
      initiateBatchGeneration();
      return;
    }

    // Existing single generation logic
    setError(null);
    setResults([]);
    setJobId(null);
    setPollingAttempts(0);
    if (pollingIntervalId) clearInterval(pollingIntervalId);
    setPollingIntervalId(null);

    const config = getAuthConfig();
    if (!config) {
        toast({ title: "Authentication Error", status: "error" });
        setGenerationState('idle');
      return;
    }

    // --- Build Payload - Always for gpt-image-1 ---
    let payload = {
        workspace_id: currentWorkspaceId,
        prompt: prompt.trim(),
        n: 1, // Default number of images
        model: 'gpt-image-1', // <<< Hardcode model

        // Include all potential gpt-image-1 fields, 
        // values will be null/undefined if not selected
        model_image_id: selectedModel?.id, 
        top_product_id: selectedTopGarment?.id,
        bottom_product_id: selectedBottomGarment?.id,
        accessory_image_ids: selectedAccessories.length > 0 ? selectedAccessories.map(acc => acc.id) : undefined,
        pose_image_id: selectedPoseId, // Pose ID is already stored
    };

    // Determine garment focus
    if (payload.top_product_id && payload.bottom_product_id) {
        payload.garment_focus = 'both';
    } else if (payload.top_product_id) {
        payload.garment_focus = 'top';
    } else if (payload.bottom_product_id) {
        payload.garment_focus = 'bottom';
    } else {
        // If no specific garment selected, maybe default focus or remove?
        // For now, let's not set it if no garments are selected.
        // delete payload.garment_focus; // Or let backend handle missing field
    }

    // Size for gpt-image-1 (adjust based on aspect ratio)
    if (generationSettings.aspectRatio === '1:1') payload.size = "1024x1024";
    else if (generationSettings.aspectRatio === '9:16') payload.size = "1024x1536"; // Check API doc for exact supported sizes
    else if (generationSettings.aspectRatio === '16:9') payload.size = "1536x1024"; // Check API doc for exact supported sizes
    else payload.size = "1024x1024"; // Default fallback

    // --- Remove the previous conditional model selection logic --- 
    /* 
    let selectedModelName = ''; 
    if (selectedModel) { ... } 
    else if (mode === 'image' && uploadedImage) { ... } 
    else if (mode === 'garment' && ...) { ... } 
    else { ... }
    payload.model = selectedModelName;
    */

    // --- Remove the cleanup logic for different models --- 
    /*
    if (payload.model !== 'dall-e-3') { ... }
    if (payload.model !== 'gpt-image-1') { ... }
    if (payload.model !== 'dall-e-2') { ... }
    */

    console.log("API Payload (Forced gpt-image-1):", payload);

    try {
      setGenerationState('generating');
      const response = await axios.post(`${API_BASE_URL}/api/generate`, payload, config);
      setJobId(response.data.jobId);
      // Start polling logic (or handle via WebSocket)
      // ... existing polling logic ...

    } catch (err) {
       console.error("Generation request failed:", err);
      const errorMsg = err.response?.data?.message || "Failed to start generation job.";
      setError(errorMsg);
      toast({ title: "Generation Error", description: errorMsg, status: "error" });
                    setGenerationState('idle');
      setJobId(null);
    }
  };

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
    setSelectedTopGarment(null);
    setSelectedBottomGarment(null);
    setImageFile(null);
    setPreviewUrl(null);
    setSelectedModel(null);
    setSelectedAccessories([]);
    setSelectedPoseId(null);
    setSelectedMood(null);
    setSelectedViews([]);
    setGenerationState('idle');
    setResults([]);
    setError(null);
    setJobId(null);
    setPollingAttempts(0);
    setGenerationSettings({ aspectRatio: '9:16', quality: 'standard' });
    setExpandedSetting(null);
    // Clear file input visually if needed (can be tricky)
    const fileInput = document.getElementById('image-upload-input'); // Assuming input has this ID
    if(fileInput) fileInput.value = null;
  };

  // --- Modal Selection Handlers --- 
  const handleSelectGarment = (garment) => {
    // Assign garment to the active slot (top or bottom)
    if (activeGarmentSlot === 'top') {
      setSelectedTopGarment(garment);
    } else if (activeGarmentSlot === 'bottom') {
      setSelectedBottomGarment(garment);
    }
    setActiveGarmentSlot(null);
      onGarmentModalClose();
  };
  const handleSelectModel = (model) => { setSelectedModel(model); onModelModalClose(); }; 
  const handleSelectAccessories = (accessories) => { setSelectedAccessories(accessories); onAccessoryModalClose(); }; // Expects array
  const handleSelectPrompt = ({ prompt: newPrompt }) => { setPrompt(newPrompt); onPromptModalClose(); };
  const handleSelectPose = (poseId) => { setSelectedPoseId(poseId); onPoseModalClose(); }; // Updated handler to accept ID
  const handleSelectMood = (mood) => { 
    setSelectedMood(mood);
    if (mood && mood.name) {
      setPrompt(prevPrompt => {
        const moodText = `mood: ${mood.name}`;
        if (prevPrompt.trim() === '') {
          return moodText;
        } else {
          // Check if a mood is already in the prompt
          const moodRegex = /,?\s*mood:\s*[^,]+/; // Matches ", mood: ..." or "mood: ..."
          if (moodRegex.test(prevPrompt)) {
            // Replace existing mood
            return prevPrompt.replace(moodRegex, `, ${moodText}`);
          } else {
            // Add new mood
            return `${prevPrompt}, ${moodText}`;
          }
        }
      });
    }
    onMoodModalClose(); 
  };
  const handleSelectViews = (views) => { setSelectedViews(views); onViewModalClose(); }; // Expects array

  // --- NEW: Handler for selecting pose for a batch item ---
  const handleSelectPoseForBatch = async (poseInput) => { // Expects full pose object or ID
    if (activeBatchSlotIndex !== null) {
      let fullPoseObject = null; 

      const config = getAuthConfig();
      if (!config) {
        toast({ title: "Authentication Error", description: "Cannot load pose details.", status: "error" });
        onPoseModalClose();
        return;
      }

      if (typeof poseInput === 'string') { // If modal sends an ID
        console.log(`PoseSelectionModal returned an ID: ${poseInput}. Fetching full pose details from API.`);
        try {
          const response = await axios.get(`${API_BASE_URL}/api/poses?workspaceId=${currentWorkspaceId}`, config);
          const poses = response.data; 
          const foundPose = poses.find(p => p.id === poseInput);
          
          if (foundPose) {
            fullPoseObject = foundPose;
          } else {
            console.error(`Pose with ID ${poseInput} not found in API response. workspaceId: ${currentWorkspaceId}`);
            toast({ title: "Pose Not Found", description: `Selected pose (ID: ${poseInput}) could not be loaded from the server.`, status: "error", duration: 7000 });
            // Even if not found, create a placeholder to store the ID at least
            fullPoseObject = { id: poseInput, name: `Pose (ID: ${poseInput.substring(0, 8)}...)`, storage_url: null }; 
          }
        } catch (error) {
          console.error("Error fetching poses from API:", error);
          const errorMsg = error.response?.data?.message || "Could not load pose details from the server.";
          toast({ title: "API Error", description: errorMsg, status: "error" });
          // Create a placeholder if API call fails, using the original ID
          fullPoseObject = { id: poseInput, name: `Pose (ID: ${poseInput.substring(0, 8)}...)`, storage_url: null }; 
        }
      } else if (poseInput && typeof poseInput === 'object' && poseInput.id) { // If modal sends a valid-like object
        console.log("PoseSelectionModal returned a full pose object directly.");
        fullPoseObject = poseInput;
      } else if (poseInput) {
        console.error("Invalid or incomplete pose data received from selection modal:", poseInput);
        toast({ title: "Invalid Pose Data", description: "Received unexpected pose data from the selection modal.", status: "error" });
      } 

      setGenerationBatch(prevBatch => {
        const newBatch = [...prevBatch];
        // Ensure we only update if activeBatchSlotIndex is valid for the newBatch array length
        if (activeBatchSlotIndex < newBatch.length) {
            newBatch[activeBatchSlotIndex] = { ...newBatch[activeBatchSlotIndex], selectedPose: fullPoseObject };
        }
        return newBatch;
      });
    }
    onPoseModalClose();
    // setActiveBatchSlotIndex(null); // Reset active index - this is now handled by PoseSelectionModal's onClose prop
  };

  const findOption = (options, value) => options.find(opt => opt.value === value);
  
  // --- Open AddToCollectionModal --- 
  const openCollectionModal = (asset) => {
      setSelectedAssetForCollection(asset);
      onAddToCollectionOpen();
  };

  const removeSelectedTopGarment = () => setSelectedTopGarment(null);
  const removeSelectedBottomGarment = () => setSelectedBottomGarment(null);
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

  // --- Polling useEffect --- 
  useEffect(() => {
    let intervalId = null;
    if (jobId && generationState === 'generating') {
        console.log("Starting polling interval for job:", jobId);
        // Setup interval using the useCallback version of pollStatus
        intervalId = setInterval(() => {
            pollStatus(jobId, intervalId); // Pass intervalId for clearing inside pollStatus
        }, POLLING_INTERVAL);
        setPollingIntervalId(intervalId); // Store interval ID
    } else {
        console.log("Clearing polling interval.");
        if (pollingIntervalId) clearInterval(pollingIntervalId);
        setPollingIntervalId(null);
    }

    // Cleanup function
    return () => {
        if (pollingIntervalId) {
            console.log("Clearing interval on unmount/dependency change.");
            clearInterval(pollingIntervalId);
            setPollingIntervalId(null);
        }
    };
  // Re-run when jobId or generationState changes
  // pollStatus is now stable due to useCallback
  }, [jobId, generationState, pollStatus]); 

  // --- NEW: Poll Batch Item Status Function ---
  const pollBatchItemStatus = useCallback(async (batchItemId, jobIdToPoll) => {
    const config = getAuthConfig();
    if (!jobIdToPoll || !config) {
      setGenerationBatch(prevBatch =>
        prevBatch.map(item =>
          item.id === batchItemId
            ? { ...item, status: 'failed', error: 'Polling setup error: Missing Job ID or Auth.' }
            : item
        )
      );
      return;
    }

    // Check for timeout and fire toast *before* the main async logic, based on current item state derived inside setGenerationBatch
    // This is a bit tricky because toast shouldn't be in the updater. We need to read, decide, toast, then update.
    // Let's read the attempts first, then decide on toast and subsequent update.

    let shouldToastTimeout = false;
    let itemToToastIndex = -1;

    setGenerationBatch(prevBatch => {
        const itemIndex = prevBatch.findIndex(item => item.id === batchItemId);
        if (itemIndex !== -1) {
            const currentItem = prevBatch[itemIndex];
            if (currentItem.status === 'generating' && currentItem.pollingAttempts >= MAX_POLLING_ATTEMPTS -1) { // Check if *next* attempt will be timeout
                shouldToastTimeout = true;
                itemToToastIndex = itemIndex; // Assuming itemIndex is stable enough for a quick toast title
            }
        }
        return prevBatch; // No state change here, just reading for toast decision
    });

    if (shouldToastTimeout && itemToToastIndex !== -1) {
        toast({
            title: `Look ${itemToToastIndex + 1} - Still Working...`,
            description: "Generation is taking longer than expected. You can view status in the Generations page later.",
            status: "warning",
            duration: 6000,
            isClosable: true
        });
    }

    try {
      const pollResponse = await axios.get(`${API_BASE_URL}/api/generate/${jobIdToPoll}`, config);
      const status = pollResponse.data?.status;
      const assetId = pollResponse.data?.assetId;
      const errorMsg = pollResponse.data?.error;

      if (status === 'completed' && assetId) {
        try {
          const assetResponse = await axios.get(`${API_BASE_URL}/api/assets/${assetId}`, config);
          setGenerationBatch(prevBatch =>
            prevBatch.map(item =>
              item.id === batchItemId
                ? { ...item, status: 'results', result: assetResponse.data, error: null, pollingAttempts: 0 }
                : item
            )
          );
        } catch (fetchErr) {
          console.error(`Failed to fetch final asset for batch item ${batchItemId}:`, fetchErr);
          setGenerationBatch(prevBatch =>
            prevBatch.map(item =>
              item.id === batchItemId
                ? { ...item, status: 'failed', error: 'Generation complete, but failed to fetch result.' }
                : item
            )
          );
        }
      } else if (status === 'failed') {
        setGenerationBatch(prevBatch =>
          prevBatch.map(item =>
            item.id === batchItemId
              ? { ...item, status: 'failed', error: errorMsg || 'Generation failed.', jobId: null }
              : item
          )
        );
      } else { // Still pending or processing, or other statuses
        setGenerationBatch(prevBatch =>
          prevBatch.map(item => {
            if (item.id === batchItemId) {
              if (item.status !== 'generating') {
                // If item is no longer generating (e.g., timed_out_checking, failed by other means), don't update pollingAttempts
                return item;
              }
              if (item.pollingAttempts >= MAX_POLLING_ATTEMPTS) {
                return { ...item, status: 'timed_out_checking', error: item.error || 'Polling timed out from frontend.' };
              }
              return { ...item, pollingAttempts: (item.pollingAttempts || 0) + 1 };
            }
            return item;
          })
        );
      }
    } catch (pollError) {
      console.error(`Polling error for batch item ${batchItemId} (Job ID: ${jobIdToPoll}):`, pollError);
      setGenerationBatch(prevBatch =>
        prevBatch.map(item => {
          if (item.id === batchItemId) {
            if (item.status !== 'generating') return item; // Don't revert status
            // Increment attempts to eventually timeout even on polling errors
             if (item.pollingAttempts >= MAX_POLLING_ATTEMPTS) {
                return { ...item, status: 'timed_out_checking', error: item.error || 'Polling request failed and timed out.' };
            }
            return { ...item, pollingAttempts: (item.pollingAttempts || 0) + 1, error: item.error }; // Preserve existing error if any, or set one if desired
          }
          return item;
        })
      );
    }
  }, [getAuthConfig, toast, API_BASE_URL, MAX_POLLING_ATTEMPTS]); // setGenerationBatch is stable

  // --- NEW: useEffect for Batch Polling Management ---
  useEffect(() => {
    // Manage polling intervals for batch items
    // If leaving batch mode, clear all existing intervals
    if (mode !== 'batch') {
      Object.values(batchPollingIntervalsRef.current).forEach(clearInterval);
      batchPollingIntervalsRef.current = {};
      return;
    }

    // For each batch item, start or stop polling based on its status and jobId
    generationBatch.forEach(item => {
      const existingIntervalId = batchPollingIntervalsRef.current[item.id];
      if (item.status === 'generating' && item.jobId && !existingIntervalId) {
        console.log(`Starting polling for batch item ${item.id}, Job ID: ${item.jobId}`);
        const intervalId = setInterval(() => {
          pollBatchItemStatus(item.id, item.jobId);
        }, POLLING_INTERVAL);
        batchPollingIntervalsRef.current[item.id] = intervalId;
      } else if ((item.status !== 'generating' || !item.jobId) && existingIntervalId) {
        console.log(`Stopping polling for batch item ${item.id} (Status: ${item.status}, JobID: ${item.jobId})`);
        clearInterval(existingIntervalId);
        delete batchPollingIntervalsRef.current[item.id];
      }
    });

    // Cleanup on unmount or when generationBatch/mode changes
    return () => {
      console.log('Cleaning up batch polling intervals from useEffect.');
      Object.values(batchPollingIntervalsRef.current).forEach(clearInterval);
      batchPollingIntervalsRef.current = {};
    };
  }, [generationBatch, mode, pollBatchItemStatus]);

  // --- Effect to update generationBatch when numberOfLooks changes ---
  useEffect(() => {
    setGenerationBatch(prevBatch => {
      const newSize = parseInt(numberOfLooks, 10);
      const currentSize = prevBatch.length;
      if (newSize === currentSize) return prevBatch;

      const newBatch = Array(newSize).fill(null).map((_, i) => {
        if (i < currentSize) return prevBatch[i]; // Keep existing items
        return initialBatchItem(); // Add new initial items
      });
      return newBatch;
    });
    // Reset active slot to 0 if it's out of bounds of the new size
    setActiveBatchSlotIndex(prevIndex => {
      const newSize = parseInt(numberOfLooks, 10);
      if (prevIndex >= newSize) return 0;
      return prevIndex;
    });
  }, [numberOfLooks]);

  // --- Render ---
  return (
    // Use Flex for side-by-side layout on larger screens
    <Flex direction={{ base: 'column', lg: 'row' }} gap={8} pt={4} pb={8}>
      
      {/* Left Panel: Controls */}
      <VStack 
        spacing={5} // Consistent spacing
        align="stretch" 
        flex={{ base: 'none', lg: 6 }} // Assign flex ratio for lg screens
      >
 
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

        {/* Input Section: Changed outer Flex to VStack */}
        <VStack spacing={4} align="stretch"> 
          {/* Garment Inputs (Conditional) */}
          {(mode === 'garment' || mode === 'batch') && (
            <Flex direction={{ base: 'column', md: 'row' }} gap={4}> {/* Inner Flex for garments remains row */}
              {/* Top Garment */}
              <Box flex={1} minWidth="180px">
                <HStack justifyContent="space-between" mb={2} align="center">
                  <HStack spacing={2}>
                      <Icon as={FaTshirt} color="gray.500" /> 
                    <Heading size="sm">Top Garment</Heading>
                  </HStack>
                </HStack>
                
                {selectedTopGarment ? (
                  <HStack 
                    p={2} 
                    spacing={3} 
                    bg={settingCardHoverBg} 
                    borderRadius="md" 
                    borderWidth="1px" 
                    borderColor={placeholderBorder} 
                    minHeight="66px"
                    alignItems="center" // Center items vertically in the HStack
                  >
                    <Image 
                      src={selectedTopGarment.reference_image_url || 'https://via.placeholder.com/50'} 
                      boxSize="40px" // Keep image size reasonable
                      borderRadius="sm" 
                      objectFit="cover"
                    />
                    <VStack align="start" spacing={1} flex={1}> {/* Text and Button stack */} 
                      <Text fontSize="sm" fontWeight="medium" noOfLines={2}> {/* Allow wrapping */} 
                        {selectedTopGarment.name}
                      </Text>
                      <Button 
                        size="xs" 
                        variant="outline" 
                        onClick={() => { setActiveGarmentSlot('top'); onGarmentModalOpen(); }} 
                        alignSelf="flex-start" // Align button left within VStack
                      >
                        Change
                      </Button>
                    </VStack>
                  </HStack>
                ) : (
                  // Refined Placeholder
                  <HStack 
                    borderWidth="1px" 
                    borderRadius="md" 
                    p={3} // Keep padding for click area
                    spacing={3} // Adjust spacing
                    alignItems="center" 
                    borderColor={placeholderBorder} 
                    bg={placeholderBg} 
                    minHeight="66px" 
                    cursor="pointer" 
                    _hover={{ bg: hoverBg }} 
                    onClick={() => { setActiveGarmentSlot('top'); onGarmentModalOpen(); }}
                    justifyContent="center" // Center content horizontally
                  >
                     <Icon as={FaTshirt} color={placeholderColor} boxSize={5}/> 
                     <Text color={placeholderColor} fontSize="sm">Select Top Garment...</Text>
                  </HStack>
                )}
              </Box>
              {/* Bottom Garment */}
              <Box flex={1} minWidth="180px">
                <HStack justifyContent="space-between" mb={2} align="center">
                  <HStack spacing={2}>
                    <Icon as={FaShoppingBag} color="gray.500" />
                    <Heading size="sm">Bottom Garment</Heading>
                  </HStack>
                </HStack>
                {selectedBottomGarment ? (
                  <HStack 
                    p={2} 
                    spacing={3} 
                    bg={settingCardHoverBg} 
                    borderRadius="md" 
                    borderWidth="1px" 
                    borderColor={placeholderBorder} 
                    minHeight="66px"
                    alignItems="center" // Center items vertically in the HStack
                  >
                    <Image 
                      src={selectedBottomGarment.reference_image_url || 'https://via.placeholder.com/50'} 
                      boxSize="40px" 
                      borderRadius="sm" 
                      objectFit="cover"
                    />
                    <VStack align="start" spacing={1} flex={1}> {/* Text and Button stack */} 
                      <Text fontSize="sm" fontWeight="medium" noOfLines={2}> {/* Allow wrapping */} 
                        {selectedBottomGarment.name}
                      </Text>
                      <Button 
                        size="xs" 
                        variant="outline" 
                        onClick={() => { setActiveGarmentSlot('bottom'); onGarmentModalOpen(); }} 
                        alignSelf="flex-start" // Align button left within VStack
                      >
                        Change
                      </Button>
                    </VStack>
                  </HStack>
                ) : (
                   // Refined Placeholder
                  <HStack 
                    borderWidth="1px" 
                    borderRadius="md" 
                    p={3} // Keep padding
                    spacing={3} // Adjust spacing
                    alignItems="center" 
                    borderColor={placeholderBorder} 
                    bg={placeholderBg} 
                    minHeight="66px" 
                    cursor="pointer" 
                    _hover={{ bg: hoverBg }} 
                    onClick={() => { setActiveGarmentSlot('bottom'); onGarmentModalOpen(); }}
                    justifyContent="center" // Center content horizontally
                  >
                    <Icon as={FaShoppingBag} color={placeholderColor} boxSize={5}/> {/* Use Bag Icon */} 
                    <Text color={placeholderColor} fontSize="sm">Select Bottom Garment...</Text>
                  </HStack>
                )}
              </Box>
            </Flex>
          )}
           {/* END Garment Inputs */}

          {/* Unified Container for Model & Accessories - MOVED HERE */}
          <Box borderWidth="1px" borderRadius="lg" p={4} borderColor={placeholderBorder}> 
            <Flex direction={{ base: 'column', md: 'row' }} gap={6}> {/* Two columns */} 
            
              {/* Left Column: Model */}
              <VStack flex={1} align="start" spacing={3}>
                <HStack> {/* Label + Icon */} 
                  <Icon as={FaUserCircle} color="gray.500" /> 
                  <Heading size="sm">Model</Heading>
                </HStack>
                
                {selectedModel ? (
                  <VStack align="start" spacing={2} w="100%">
                     <Image 
                        src={selectedModel.storage_url} 
                        alt={selectedModel.name || 'Model Preview'} 
                        boxSize="40px" // Revert size
                        objectFit="cover" 
                        borderRadius="sm" // Revert border radius
                      />
                      <Text fontSize="md" fontWeight="medium" noOfLines={2}>{selectedModel.name || 'Untitled Model'}</Text>
                      <Button 
                        size="sm" // Slightly larger button
                        variant="outline" 
                        onClick={onModelModalOpen} 
                        alignSelf="flex-start"
                      >
                          Change
                      </Button>
                    </VStack>
                 ) : (
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
                        w="100%" // Take full width of column
                        minHeight="100px" // Example min height
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <Text color={placeholderColor} fontSize="sm">Select Model</Text>
                    </Box>
                 )}
              </VStack>

              {/* Right Column: Accessories */}
              <VStack flex={1} align="start" spacing={3}>
                <HStack align="center" mb={0}> {/* Ensure vertical alignment */} 
                  <Icon as={FaBoxOpen} color="gray.500" /> {/* Example Icon */} 
                  <Text fontWeight="bold">Accessories</Text> {/* Bold Text */} 
                </HStack>
                
                <Wrap spacing={2} minHeight="60px"> {/* Wrap for tags, min height */} 
                  {selectedAccessories.length > 0 ? (
                      selectedAccessories.map(acc => (
                          <Tag key={acc.id} size="md" variant="solid" colorScheme="purple" borderRadius="full">
                              {/* TODO: Add accessory icons if available */} 
                              {/* <Icon as={FaShoppingBag} mr={1} /> */} 
                              <TagLabel>{acc.name}</TagLabel>
                              <TagCloseButton onClick={() => removeSelectedAccessory(acc.id)} />
                          </Tag>
                      ))
                  ) : (
                     <Text fontSize="xs" color={placeholderColor} fontStyle="italic">No accessories selected.</Text>
                  )}
                </Wrap>
                <Button 
                  leftIcon={<FaPlus />} 
                  variant="outline" 
                  borderStyle="dashed"
                  size="sm"
                  onClick={onAccessoryModalOpen}
                  w="100%" // Button takes full width
                >
                  Add Accessory
                </Button>
              </VStack>
            
            </Flex> {/* End Two columns */} 
          </Box> {/* End Unified Container FOR MODEL & ACCESSORIES */} 
          
           {/* Image Input (Conditional) - REMAINS AFTER MODEL/ACC */}
           {mode === 'image' && ( // This is the original image upload mode
             <Box> {/* Removed flex properties */} 
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

          {/* --- NEW: Batch Generation Input Section --- */}
          {mode === 'batch' && (
            <VStack spacing={4} align="stretch" borderWidth="1px" borderRadius="lg" p={4}>
              {/* Modified Heading and Number of Looks Selector */}
              <HStack justifyContent="space-between" alignItems="center" mb={4}> 
                <Heading size="md">Define Your Looks</Heading>
                {/* Plus-Minus Counter for Number of Looks */}
                <HStack spacing={2} alignItems="center">
                  <IconButton 
                    icon={<FaMinus />} 
                    size="xs" 
                    aria-label="Decrease number of looks"
                    onClick={() => setNumberOfLooks(prev => Math.max(2, prev - 1))} // Min 2 looks
                    isDisabled={numberOfLooks <= 2}
                  />
                  <Text fontSize="sm" fontWeight="medium" minW="50px" textAlign="center">
                    {numberOfLooks} Look{numberOfLooks > 1 ? 's' : ''}
                  </Text>
                  <IconButton 
                    icon={<FaPlus />} 
                    size="xs" 
                    aria-label="Increase number of looks"
                    onClick={() => setNumberOfLooks(prev => Math.min(5, prev + 1))} // Max 5 looks
                    isDisabled={numberOfLooks >= 5}
                  />
                </HStack>
              </HStack>

              {/* Carousel-like navigation for batch items */}
              <HStack spacing={2} overflowX="auto" py={2} mb={3} borderBottomWidth="1px" borderColor="gray.200">
                {generationBatch.map((batchItem, index) => {
                  const isPromptFilled = batchItem.prompt && batchItem.prompt.trim() !== '';
                  const isPoseSelected = !!batchItem.selectedPose;
                  return (
                    <Button
                      key={`tab-${index}`}
                      variant={'outline'}
                      colorScheme={activeBatchSlotIndex === index ? 'purple' : 'gray'}
                      onClick={() => setActiveBatchSlotIndex(index)}
                      size="md" // Slightly larger to accommodate internal VStack
                      flexShrink={0} // Prevent buttons from shrinking too much
                      height="auto" // Allow button height to adjust to content
                      p={2} // Adjust padding as needed
                    >
                      <VStack spacing={1} alignItems="center">
                        <HStack spacing={2}>
                          <Icon
                            as={FaPen}
                            color={isPromptFilled ? 'green.500' : 'red.500'}
                            boxSize={4}
                          />
                          <Icon
                            as={isPoseSelected ? FaUserCheck : FaUserSlash}
                            color={isPoseSelected ? 'green.500' : 'red.500'}
                            boxSize={4}
                          />
                        </HStack>
                        <Text fontSize="sm">Look {index + 1}</Text>
                      </VStack>
                    </Button>
                  );
                })}
              </HStack>

              {/* Details for the active batch item */}
              {activeBatchSlotIndex !== null && generationBatch[activeBatchSlotIndex] && (
                <Box p={3} borderWidth="1px" borderRadius="md" shadow="sm" bg={activeBatchItemBackground}>
                  <VStack spacing={3} align="stretch">
                    <HStack justifyContent="space-between">
                      <FormLabel htmlFor={`batch-prompt-${activeBatchSlotIndex}`} mb={0} fontWeight="bold">
                        Prompt for Look {activeBatchSlotIndex + 1}
                      </FormLabel>
                    </HStack>
                    <Textarea
                      id={`batch-prompt-${activeBatchSlotIndex}`}
                      placeholder={`Describe the style for Look ${activeBatchSlotIndex + 1}...`}
                      value={generationBatch[activeBatchSlotIndex].prompt}
                      onChange={(e) => {
                        const newPrompt = e.target.value;
                        setGenerationBatch(prevBatch => {
                          const newBatch = [...prevBatch];
                          newBatch[activeBatchSlotIndex] = { ...newBatch[activeBatchSlotIndex], prompt: newPrompt };
                          return newBatch;
                        });
                      }}
                      rows={4} // Increased rows for better editing
                    />
                    {/* Enhanced Pose Selection Display */}
                    <FormControl mt={2}>
                      <FormLabel fontSize="sm" fontWeight="medium">Pose</FormLabel>
                      {generationBatch[activeBatchSlotIndex].selectedPose ? (
                        <HStack 
                          p={2} 
                          spacing={3} 
                          bg={selectedPoseBg} // Use variable
                          borderRadius="md" 
                          borderWidth="1px" 
                          borderColor={selectedPoseBorderColor} // Use variable
                          alignItems="center"
                        >
                          {/* Display Pose Image if available */}
                          {generationBatch[activeBatchSlotIndex].selectedPose.storage_url && (
                            <Image 
                              src={generationBatch[activeBatchSlotIndex].selectedPose.storage_url} 
                              alt={generationBatch[activeBatchSlotIndex].selectedPose.name || 'Pose preview'}
                              boxSize="40px" 
                              objectFit="cover" 
                              borderRadius="sm" 
                              bg="gray.200" // BG for placeholder/broken images
                            />
                          )}
                          {!generationBatch[activeBatchSlotIndex].selectedPose.storage_url && (
                             <Icon as={FaUserCheck} color={selectedPoseIconColor} boxSize={5}/>
                          )}
                          <VStack align="start" spacing={0} flex={1}>
                            <Text fontSize="sm" fontWeight="medium">
                              {generationBatch[activeBatchSlotIndex].selectedPose.name || 'Pose Selected'}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              ID: {generationBatch[activeBatchSlotIndex].selectedPose.id} 
                            </Text>
                          </VStack>
                          <Button 
                            size="xs" 
                            variant="outline" 
                            onClick={onPoseModalOpen} 
                          >
                            Change
                          </Button>
                        </HStack>
                      ) : (
                        <HStack 
                          borderWidth="1px" 
                          borderRadius="md" 
                          p={3} 
                          spacing={3} 
                          alignItems="center" 
                          borderColor={placeholderBorder} 
                          bg={placeholderBg} 
                          minHeight="60px" // Consistent height
                          cursor="pointer" 
                          _hover={{ bg: hoverBg }} 
                          onClick={onPoseModalOpen}
                          justifyContent="center"
                        >
                          <Icon as={FaUserCircle} color={placeholderColor} boxSize={5}/> 
                          <Text color={placeholderColor} fontSize="sm">Select Pose...</Text>
                        </HStack>
                      )}
                    </FormControl>
                  </VStack>
                </Box>
              )}
            </VStack>
          )}
          {/* End Batch Generation Input Section */}
          
          {/* Unified Container for Model & Accessories - This block is now MOVED from here. 
              The content of this comment represents where it USED to be. 
              It was originally after the Batch Generation Input Section. 
          */}
          
        </VStack> 
        {/* End Main Input VStack */}

        {/* Prompt Input - Conditionally render if not in batch mode */}
        {mode !== 'batch' && (
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
        )}
        
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
        {/* Conditionally render if not in batch mode, as these are per-item in batch */}
        {mode !== 'batch' && (
         <VStack spacing={3} align="stretch" borderWidth="1px" borderRadius="lg" p={4}>
             <Heading size="sm" mb={1}>Refinements</Heading>
             <HStack spacing={3} width="100%">
                 {/* Pose Selection Display Card */}
                 <SettingDisplayCard
                    label="Pose"
                    icon={FaUserCircle} // Placeholder icon
                    value={selectedPoseId ? 'Selected' : 'Default'} // Updated display logic
                    onClick={onPoseModalOpen}
                    bg={placeholderBg}
                    hoverBg={hoverBg}
                    isActive={!!selectedPoseId}
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
             </HStack>
         </VStack>
        )}

      </VStack>

      {/* Right Panel: Visualization Area */}
      <VStack 
        flex={{ base: 'none', lg: 7 }} // Assign flex ratio for lg screens
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
                   {/* Handle timeout checking state */} 
                   {generationState === 'timed_out_checking' && (
                       <VStack spacing={3}>
                           <Icon as={FaHourglassHalf} boxSize={10} color="orange.400" />
                           <Text fontWeight="medium" color="orange.500" textAlign="center">
                               Still working... Generation is taking longer than usual.
                           </Text>
                           <Text fontSize="sm" color="gray.500" textAlign="center">
                               You can view your previous generations in the Generations page.
                           </Text>
                           <Button size="sm" colorScheme="purple" variant="outline" onClick={() => navigate('/app/generations')}>
                               View Generations
                           </Button>
                       </VStack>
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
                  isDisabled={
                    generationState === 'generating' ||
                    (mode !== 'batch' && !prompt.trim()) ||
                    (mode === 'garment' && !(selectedTopGarment || selectedBottomGarment)) ||
                    (mode === 'image' && !uploadedImage)
                  }
                  w="full"
              >
                  Visualize Look
              </Button>
              
              {/* Show "Visualize Another" only after first generation */}
              {(generationState === 'generating' || generationState === 'results' || generationState === 'timed_out_checking') && (
                  <Button 
                      leftIcon={<FaUndo />} 
                      onClick={handleStartOver}
                      variant="outline"
                      isDisabled={generationState === 'generating'} // Only truly disable while actively generating
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
          onSelectPose={activeBatchSlotIndex !== null ? handleSelectPoseForBatch : handleSelectPose}
      />
       <MoodSelectionModal
          isOpen={isMoodModalOpen}
          onClose={onMoodModalClose}
          onSelectMood={handleSelectMood}
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