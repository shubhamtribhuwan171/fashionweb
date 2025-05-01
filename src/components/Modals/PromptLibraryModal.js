import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  SimpleGrid,
  Box,
  Image,
  Text,
  VStack,
  HStack,
  Spinner,
  Center,
  useColorModeValue,
  IconButton,
  Tooltip,
  Tag,
} from '@chakra-ui/react';
import { FaCopy } from 'react-icons/fa';
// Correct import path
import { getMockPromptExamples } from '../../data/mockData';

const PromptExampleCard = ({ example, onUsePrompt }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const promptBg = useColorModeValue('gray.50', 'gray.800');
  const promptBorder = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={cardBg}
      boxShadow="md"
      display="flex"
      flexDirection="column"
    >
      {/* Assume imageUrl exists in mock for examples */}
      <Image src={example.imageUrl || 'https://via.placeholder.com/300x200?text=Example'} alt={example.name} objectFit="cover" h="200px" />

      <VStack p={4} align="stretch" spacing={3} flexGrow={1}>
        <HStack justify="space-between">
            <Text fontWeight="bold" fontSize="lg" >{example.name}</Text>
            <Tag size="sm" colorScheme={example.type === 'text' ? 'blue' : 'green'}>
                {example.type === 'text' ? 'Text Only' : 'Text + Image'}
            </Tag>
        </HStack>

        {example.description && (
            <Text fontSize="sm" color={textColor}>{example.description}</Text>
        )}

        {example.type === 'text_image' && example.referenceImageUrl && (
            <HStack spacing={2} align="center">
                <Text fontSize="xs" fontWeight="medium">Ref:</Text>
                <Image src={example.referenceImageUrl} boxSize="40px" borderRadius="sm" />
            </HStack>
        )}

        <Box
            p={3}
            bg={promptBg}
            borderRadius="md"
            borderWidth="1px"
            borderColor={promptBorder}
            flexGrow={1} // Allow prompt box to grow
            maxH="150px" // Limit height
            overflowY="auto" // Add scroll if needed
        >
            <Text fontSize="xs" fontFamily="monospace" whiteSpace="pre-wrap" wordBreak="break-word">
                {example.prompt}
            </Text>
        </Box>

        <Button
            colorScheme="blue"
            size="sm"
            onClick={() => onUsePrompt(example)} // Pass the whole example object
            mt={2}
        >
          Use Prompt
        </Button>
      </VStack>
    </Box>
  );
};

const PromptLibraryModal = ({ isOpen, onClose, onSelectPrompt }) => {
  const [examples, setExamples] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const headerBg = useColorModeValue('white', 'gray.800');
  // const footerBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    const fetchExamples = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedExamples = await getMockPromptExamples();
        setExamples(fetchedExamples || []); // Ensure array
      } catch (err) {
        console.error("Error fetching prompt examples:", err);
        setError('Failed to load examples.');
        setExamples([]); // Clear on error
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
        fetchExamples();
    }
  }, [isOpen]);

  const handleUsePrompt = (example) => {
      onSelectPrompt({ 
          prompt: example.prompt,
          // Adapt type based on your CreateStylePage needs if different from mock
          type: example.type, 
          // Pass necessary info if it's an image prompt
          referenceImage: example.type === 'text_image' && example.referenceImageUrl 
              ? { url: example.referenceImageUrl, name: `Ref: ${example.name}` } 
              : null,
      });
      onClose(); // Close modal after selection
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside"> 
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader borderBottomWidth="1px" bg={headerBg}>Prompt Library & Examples</ModalHeader>
        <ModalCloseButton />
        <ModalBody pt={6} pb={6}>
          {isLoading ? (
            <Center h="300px">
              <Spinner size="xl" />
            </Center>
          ) : error ? (
             <Center h="300px">
               <Text color="red.500">{error}</Text>
             </Center>
          ) : examples.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {examples.map((example) => (
                <PromptExampleCard
                  key={example.id}
                  example={example}
                  onUsePrompt={handleUsePrompt}
                />
              ))}
            </SimpleGrid>
          ) : (
            <Center h="200px">
               <Text color="gray.500">No prompt examples available.</Text>
             </Center>
          )}
        </ModalBody>

        {/* Footer removed as action is on cards */}
        {/* <ModalFooter borderTopWidth="1px" bg={footerBg}>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </ModalFooter> */}
      </ModalContent>
    </Modal>
  );
};

export default PromptLibraryModal; 