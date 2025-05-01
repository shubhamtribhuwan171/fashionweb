import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
  Button,
  Text,
  Box,
  Input, 
  InputGroup,
  InputLeftElement,
  Center,
  Icon,
  Image,
  useRadio,
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';

// Custom Radio Card for selection
function PoseCard(props) {
  const { getInputProps, getRadioProps } = useRadio(props);
  const input = getInputProps();
  const checkbox = getRadioProps();

  return (
    <Box as="label">
      <input {...input} />
      <Box
        {...checkbox}
        cursor="pointer"
        borderWidth="1px"
        borderRadius="md"
        boxShadow="md"
        _checked={{
          bg: 'teal.600',
          color: 'white',
          borderColor: 'teal.600',
        }}
        _focus={{
          boxShadow: 'outline',
        }}
        px={5}
        py={3}
        textAlign="center"
      >
        <Image src={props.pose.imageUrl} alt={props.pose.name} boxSize="100px" objectFit="cover" mx="auto" mb={2} borderRadius="md" />
        <Text fontSize="sm">{props.pose.name}</Text>
      </Box>
    </Box>
  );
}

const mockPoses = [ // Example mock data
  { id: 'p1', name: 'Standing Power Pose' }, 
  { id: 'p2', name: 'Sitting Relaxed' }, 
  { id: 'p3', name: 'Walking Dynamic' },
  // ... more poses
];

export default function PoseSelectionModal({ isOpen, onClose, onSelectPose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState(mockPoses); // Use state for potential fetching
  const loading = false; // Placeholder

  const handleSelect = (item) => {
    onSelectPose(item);
    onClose(); 
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="xl">
        <ModalHeader 
          fontSize="lg" 
          fontWeight="semibold"
          borderBottomWidth="1px"
          borderColor="gray.100"
          py={4} px={6}
        >
          Select Pose
        </ModalHeader>
        <ModalCloseButton top={4} right={4} />
        <ModalBody pt={4} pb={6} px={6}>
           <InputGroup mb={5}>
                <InputLeftElement pointerEvents="none">
                    <Icon as={FiSearch} color="gray.400" />
                </InputLeftElement>
                <Input 
                    placeholder="Search poses..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    borderRadius="md"
                />
           </InputGroup>
          {loading ? (
            <Center py={5}> {/* Add Spinner if loading state is used */}</Center>
          ) : filteredItems.length > 0 ? (
            <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacing={5}> 
              {/* Replace with actual card component and mapping */}
              {filteredItems.map((item) => (
                <Box key={item.id} p={4} borderWidth="1px" borderRadius="md" _hover={{ shadow: 'md' }} cursor="pointer" onClick={() => handleSelect(item)} textAlign="center">
                  {item.name} 
                </Box>
              ))}
            </SimpleGrid>
          ) : (
             <Center py={5}><Text>No items found{searchTerm ? ' matching "' + searchTerm + '"' : ''}.</Text></Center>
          )}
        </ModalBody>
        {/* No Footer needed for simple selection */}
      </ModalContent>
    </Modal>
  );
} 