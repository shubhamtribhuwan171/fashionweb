import React, { useState, useEffect } from 'react';
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
} from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
// Make sure react-icons is installed: npm install react-icons
import { FaUndo, FaImage, FaMagic, FaTshirt, FaSquare, FaMobileAlt, FaStar, FaRegStar } from 'react-icons/fa'; 
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

  const selectedBg = useColorModeValue('blue.100', 'blue.800');
  const selectedBorder = useColorModeValue('blue.500', 'blue.300');
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

// Renaming component to match filename convention
function CreateStylePage() { 
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const { isOpen: isGarmentModalOpen, onOpen: onGarmentModalOpen, onClose: onGarmentModalClose } = useDisclosure();
  const { isOpen: isModelModalOpen, onOpen: onModelModalOpen, onClose: onModelModalClose } = useDisclosure();
  const { isOpen: isAccessoryModalOpen, onOpen: onAccessoryModalOpen, onClose: onAccessoryModalClose } = useDisclosure();
  const { isOpen: isPromptModalOpen, onOpen: onPromptModalOpen, onClose: onPromptModalClose } = useDisclosure();
  const { isOpen: isPoseModalOpen, onOpen: onPoseModalOpen, onClose: onPoseModalClose } = useDisclosure();
  const { isOpen: isMoodModalOpen, onOpen: onMoodModalOpen, onClose: onMoodModalClose } = useDisclosure();
  const { isOpen: isViewModalOpen, onOpen: onViewModalOpen, onClose: onViewModalClose } = useDisclosure();

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

  // --- Define options for the selection cards ---
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
      { value: 'hd', label: 'High Def', icon: FaStar },
  ];

  // --- Setup Radio Groups for cards ---
  const { getRootProps: getModeRootProps, getRadioProps: getModeRadioProps } = useRadioGroup({
    name: 'mode',
    value: mode,
    onChange: (newMode) => {
        setMode(newMode);
        // Clear irrelevant selections when mode changes
        if (newMode !== 'garment') setSelectedGarment(null);
        if (newMode !== 'image') setUploadedImage(null);
    },
  });
  const { getRootProps: getAspectRootProps, getRadioProps: getAspectRadioProps } = useRadioGroup({
    name: 'aspectRatio',
    value: generationSettings.aspectRatio,
    onChange: (value) => {
        setGenerationSettings(s => ({ ...s, aspectRatio: value }));
        setExpandedSetting(null); // Collapse after selection
    },
  });
  const { getRootProps: getQualityRootProps, getRadioProps: getQualityRadioProps } = useRadioGroup({
    name: 'quality',
    value: generationSettings.quality,
    onChange: (value) => {
        setGenerationSettings(s => ({ ...s, quality: value }));
        setExpandedSetting(null); // Collapse after selection
    },
  });

  // --- Effects ---
  // Effect to handle preselected garment from navigation state
  useEffect(() => {
    const preselectedGarmentId = location.state?.preselectedGarmentId;
    if (preselectedGarmentId) {
      setMode('garment');
      getMockProductById(preselectedGarmentId).then(garment => {
        if (garment) {
          // The API returns reference_image_url, use that
          setSelectedGarment(garment); 
          // Optionally prefill prompt
          if (!prompt) { // Avoid overwriting user prompt
            setPrompt(`Model wearing the '${garment.name}'...`);
          }
        } else {
            toast({ title: "Couldn't load preselected garment", status: "warning", duration: 3000, isClosable: true });
        }
      }).catch(err => {
           console.error("Error fetching preselected garment:", err);
           toast({ title: "Error loading garment", status: "error", duration: 3000, isClosable: true });
      }).finally(() => {
         // Clear location state after processing
         navigate(location.pathname, { replace: true, state: {} });
      });
    }
  }, [location.state, navigate, toast, prompt]); // Add prompt to dependencies

  // Effect to set default view state (e.g., 'Front Full')
  useEffect(() => {
      const setDefaultView = async () => {
          if (selectedViews.length === 0) { // Only if no views are selected yet
              try {
                  const allViews = await getMockViews();
                  // Assuming 'view_001' is the ID for 'Front Full' in mockData
                  const defaultView = allViews.find(v => v.id === 'view_001'); 
                  if (defaultView) {
                      setSelectedViews([defaultView]); // Set as an array
                  }
              } catch (err) {
                  console.error("Failed to fetch or set default view", err);
                  // Handle error appropriately, maybe a toast?
              }
          }
      };
      setDefaultView();
  }, []); // Run only once on mount

  // --- Event Handlers ---
  const handleVisualize = async () => {
    // Basic validation
    if (!prompt.trim()) {
      toast({ title: "Please enter a prompt", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    if (mode === 'garment' && !selectedGarment) {
        toast({ title: "Please select a garment or change mode", status: "warning", duration: 3000, isClosable: true });
        return;
    }
     if (mode === 'image' && !uploadedImage) {
        toast({ title: "Please upload an image or change mode", status: "warning", duration: 3000, isClosable: true });
        return;
    }

    setGenerationState('generating');
    setError(null);
    setResults([]); // Clear previous results

    try {
      const inputDetails = mode === 'garment' ? selectedGarment : (mode === 'image' ? uploadedImage : null);
      // Pass current state variables to the generation function
      const generatedResults = await simulateGeneration(
          prompt,
          mode,
          inputDetails,
          generationSettings,
          selectedPose,
          selectedMood,
          selectedViews // Pass the array of selected view objects
      );
      setResults(generatedResults);
      setGenerationState('results');
      setDisplayedResultIndex(0); // Show the first result initially
    } catch (err) {
      console.error("Visualization failed:", err);
      const errorMsg = 'Simulation failed. Please try again.';
      setError(errorMsg);
      setGenerationState('idle');
       toast({ title: "Visualization failed", description: errorMsg, status: "error", duration: 5000, isClosable: true });
    }
  };

  const handleStartOver = () => {
    // Reset all relevant states to their initial values
    setMode('text');
    setSelectedGarment(null);
    setSelectedModel(null);
    setSelectedAccessories([]);
    setUploadedImage(null);
    setPrompt('');
    setResults([]);
    setError(null);
    setGenerationState('idle');
    setGenerationSettings({ aspectRatio: '1:1', quality: 'standard' });
    setSelectedPose(null);
    setSelectedMood(null);
    setSelectedViews([]); // Clear selected views
    setDisplayedResultIndex(0);
    setExpandedSetting(null);
     // Re-fetch and set the default view after resetting
    getMockViews()
      .then(allViews => {
          const defaultView = allViews.find(v => v.id === 'view_001');
          if (defaultView) setSelectedViews([defaultView]);
      })
      .catch(err => console.error("Failed to reset default view", err));
  };

  const handleSelectGarment = (garment) => {
    console.log('Garment selected from modal:', garment);
    setSelectedGarment(garment);
    // Optionally update prompt if it's empty or generic
    if (!prompt.trim() || prompt.startsWith('Model wearing ')) {
        setPrompt(`Model wearing the '${garment.name}'...`);
    }
    onGarmentModalClose(); // Ensure modal closes
  };

  const handleSelectModel = (model) => {
    console.log('Model selected from modal:', model);
    setSelectedModel(model);
    onModelModalClose(); // Ensure modal closes
  };

  // This handler now receives the array of full accessory objects
  const handleSelectAccessories = (accessories) => {
      console.log('Accessories selected from modal:', accessories);
      setSelectedAccessories(accessories);
      // Note: Accessory modal usually handles its own closing
  };

  // Mock image upload handler
  const handleImageUpload = () => {
      // In a real app, trigger file input, upload, and get URL/ID
       toast({ title: "Mock Upload", description: "Simulating image upload.", status: "info", duration: 2000 });
      // Use a placeholder image for simulation
      const mockImageData = { 
          id: `img_ref_${Date.now()}`, // Mock ID
          name: 'Uploaded Reference', 
          // url: 'https://via.placeholder.com/150/0000FF/808080?text=Uploaded' 
          url: 'https://picsum.photos/seed/uploaded_ref/150/150' 
      };
      setUploadedImage(mockImageData);
  };

  // Handler for prompt selection from library
  const handleSelectPrompt = ({ prompt: newPrompt, type: promptType, referenceImage }) => {
    console.log('Prompt selected from library:', { newPrompt, promptType, referenceImage });
    setPrompt(newPrompt);

    // Determine the best mode based on the prompt type from library
    const newMode = promptType === 'text_image' ? 'image' : 'text';
    setMode(newMode);

    // If it's an image prompt, set the uploadedImage state
    if (newMode === 'image' && referenceImage) {
      // Assume referenceImage is { url, name }
      setUploadedImage(referenceImage); 
      setSelectedGarment(null); // Clear garment selection if switching to image mode
    } else {
      setUploadedImage(null); // Clear image if switching to text/garment mode
    }
    
    onPromptModalClose(); // Close the library modal
  };

  // Handler for Pose selection
  const handleSelectPose = (pose) => {
      console.log('Pose selected:', pose);
      setSelectedPose(pose);
      onPoseModalClose(); // Close the pose modal
  };

  // Handler for Mood selection
  const handleSelectMood = (mood) => {
      console.log('Mood selected:', mood);
      setSelectedMood(mood);
      onMoodModalClose(); // Close the mood modal
  };

  // Handler for View selection (receives array of view objects)
  const handleSelectViews = (views) => {
      console.log('Views selected:', views);
      setSelectedViews(views);
      // View modal should handle its own closing
  };

  // --- UI Variables ---
  const placeholderBg = useColorModeValue('gray.100', 'gray.700');
  const placeholderBorder = useColorModeValue('gray.300', 'gray.600');
  const placeholderColor = useColorModeValue('gray.500', 'gray.400');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');

  // Helper to find the full option object from its value for display
  const findOption = (options, value) => options.find(opt => opt.value === value);

  // Get current selection details for display cards
  const currentAspectOption = findOption(aspectRatioOptions, generationSettings.aspectRatio);
  const currentQualityOption = findOption(qualityOptions, generationSettings.quality);

  // --- Reusable Components ---
  // Component for the compact display card for settings
  const SettingDisplayCard = ({ label, icon, value, onClick, ...rest }) => (
    <Box
      as="button"
      flex={1} // Allow cards to take equal space
      borderWidth="1px"
      borderRadius="md"
      p={3}
      textAlign="center"
      onClick={onClick}
      _hover={{ bg: hoverBg }}
      minWidth="100px" // Adjust min width as needed
      {...rest}
    >
      <FormLabel fontSize="xs" mb={1} color={useColorModeValue('gray.600', 'gray.400')} fontWeight="medium">{label}</FormLabel>
      <HStack justify="center" spacing={1}>
         {icon && <Icon as={icon} boxSize={4}/>}
         <Text fontSize="sm" fontWeight="medium" noOfLines={1}>{value || 'N/A'}</Text>
      </HStack>
    </Box>
  );

  // Component for the full options group when expanded
  const SettingOptionsGroup = ({ label, options, groupProps, getRadioOptionProps }) => (
      <FormControl>
          <FormLabel>{label}</FormLabel>
          <HStack {...groupProps} spacing={3}>
              {options.map(({ value, label: optionLabel, icon: optionIcon }) => {
                  const radio = getRadioOptionProps({ value });
                  return (
                      <SelectionCard key={value} {...radio} icon={optionIcon}>
                          {optionLabel}
                      </SelectionCard>
                  );
              })}
          </HStack>
      </FormControl>
  );

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
        <VStack align="stretch" spacing={4}>
          {/* Garment Input (Conditional) */}
          {mode === 'garment' && (
            <Box>
              <FormLabel>Selected Garment *</FormLabel>
              <HStack
                borderWidth="1px"
                borderRadius="md"
                p={3}
                spacing={4}
                alignItems="center"
                borderColor={selectedGarment ? 'transparent' : placeholderBorder}
                bg={placeholderBg}
                minHeight="66px" // Match other input boxes
              >
                {selectedGarment ? (
                  <>
                    {/* Use reference_image_url from API structure */}
                    <Image src={selectedGarment.reference_image_url || 'https://via.placeholder.com/50'} boxSize="50px" borderRadius="sm" objectFit="cover"/>
                    <Text flex={1} fontWeight="medium">{selectedGarment.name}</Text>
                    <Button size="sm" variant="outline" onClick={onGarmentModalOpen}>Change</Button>
                  </>
                ) : (
                   <Button onClick={onGarmentModalOpen} variant="outline" width="100%" leftIcon={<FaTshirt />}>
                      Select Base Garment...
                   </Button>
                )}
              </HStack>
            </Box>
          )}

           {/* Image Input (Conditional) */}
           {mode === 'image' && (
             <Box>
               <FormLabel>Reference Image *</FormLabel>
               <HStack
                  borderWidth="1px"
                  borderRadius="md"
                  p={3}
                  spacing={4}
                  alignItems="center"
                  borderColor={uploadedImage ? 'transparent' : placeholderBorder}
                  bg={placeholderBg}
                  minHeight="66px" // Match other input boxes
               >
                 {uploadedImage ? (
                   <>
                     <Image src={uploadedImage.url} boxSize="50px" borderRadius="sm" objectFit="cover"/>
                     <Text flex={1} fontWeight="medium">{uploadedImage.name}</Text>
                     {/* Allow changing the uploaded image */}
                     <Button size="sm" variant="outline" onClick={handleImageUpload}>Change</Button> 
                   </>
                 ) : (
                    <Button onClick={handleImageUpload} variant="outline" width="100%" leftIcon={<FaImage/>}>
                       Upload Image...
                    </Button>
                 )}
               </HStack>
             </Box>
           )}

          {/* Model Selection (Optional) */}
           <Box>
             <FormLabel>Virtual Model (Optional)</FormLabel>
              <HStack
                borderWidth="1px"
                borderRadius="md"
                p={3}
                spacing={4}
                alignItems="center"
                borderColor={selectedModel ? 'transparent' : placeholderBorder}
                bg={placeholderBg}
                minHeight="66px" // Match other input boxes
                cursor="pointer"
                onClick={onModelModalOpen}
                _hover={{ bg: useColorModeValue('gray.200', 'gray.600')}}
              >
                {selectedModel ? (
                  <>
                    <Image src={selectedModel.imageUrl} boxSize="50px" borderRadius="sm" objectFit="cover"/>
                    <Text flex={1} fontWeight="medium">{selectedModel.name}</Text>
                    <Button size="sm" variant="ghost">Change</Button>
                  </>
                ) : (
                   <Text color={placeholderColor} width="100%" textAlign="center">
                      Select Model... (Optional)
                   </Text>
                )}
              </HStack>
           </Box>

           {/* Accessory Selection (Optional) */}
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

        </VStack>

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
                    icon={currentAspectOption?.icon}
                    value={currentAspectOption?.label}
                    onClick={() => setExpandedSetting('aspectRatio')}
                />
                <SettingDisplayCard
                    label="Quality"
                    icon={currentQualityOption?.icon}
                    value={currentQualityOption?.label}
                    onClick={() => setExpandedSetting('quality')}
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
                     icon={currentQualityOption?.icon}
                     value={currentQualityOption?.label}
                     onClick={() => setExpandedSetting('quality')}
                     // Style differently to indicate it's not the active section
                     bg={placeholderBg} 
                 />
            </VStack>
           </Collapse>

            {/* Expanded Quality View */}
           <Collapse in={expandedSetting === 'quality'} animateOpacity unmountOnExit>
             <VStack spacing={4} align="stretch">
                 <SettingDisplayCard
                     label="Aspect Ratio"
                     icon={currentAspectOption?.icon}
                     value={currentAspectOption?.label}
                     onClick={() => setExpandedSetting('aspectRatio')}
                      bg={placeholderBg} 
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
                 />
                 {/* Mood Selection Display Card */}
                 <SettingDisplayCard
                     label="Mood"
                     icon={FaMagic} // Replace with appropriate icon
                     value={selectedMood ? selectedMood.name : 'Default'}
                     onClick={onMoodModalOpen}
                 />
                  {/* View Selection Display Card */}
                 <SettingDisplayCard
                     label="Views"
                     icon={FaImage} // Replace with appropriate icon
                     // Display number of selected views, or "Default" if only the default one is implicitly selected
                     value={`${selectedViews.length} Selected`}
                     onClick={onViewModalOpen}
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
                      <Spinner size="xl" color="blue.500" />
                  )}
                  {/* Display the selected result */}
                  {generationState === 'results' && results.length > 0 && results[displayedResultIndex] && (
                      <Image 
                          src={results[displayedResultIndex].imageUrl} 
                          alt={results[displayedResultIndex].name || 'Generated Look'}
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
                          borderColor={index === displayedResultIndex ? 'blue.500' : 'transparent'} 
                          onClick={() => setDisplayedResultIndex(index)} // Switch main view on click
                          overflow="hidden"
                          boxSize="60px" // Size of thumbnails
                          _hover={{ borderColor: 'blue.300' }}
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
                  colorScheme="blue"
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
    </Flex>
  );
} 

export default CreateStylePage; // Ensure default export 