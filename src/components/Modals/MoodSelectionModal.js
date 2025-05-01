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
  useRadio,
  useRadioGroup,
  Text,
  Spinner,
  Center,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
} from '@chakra-ui/react';
import { getMockMoods } from '../../data/mockData'; // Assuming moods are fetched here
import { FiSearch } from 'react-icons/fi';

// Custom Radio Card for selection
function MoodCard(props) {
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
          bg: 'purple.600',
          color: 'white',
          borderColor: 'purple.600',
        }}
        _focus={{
          boxShadow: 'outline',
        }}
        px={5}
        py={3}
        textAlign="center"
      >
        <Text fontSize="md" fontWeight="bold">{props.mood.name}</Text>
        <Text fontSize="sm" color="gray.500">{props.mood.description}</Text>
      </Box>
    </Box>
  );
}

function MoodSelectionModal({ isOpen, onClose, onSelectMood }) {
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMoodId, setSelectedMoodId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      setLoading(true);
      setSelectedMoodId(null);
      getMockMoods()
        .then(data => {
          if (isMounted) setMoods(data || []);
        })
        .catch(err => {
          console.error("Error fetching moods for modal:", err);
          if (isMounted) setMoods([]);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }
    return () => { isMounted = false; };
  }, [isOpen]);

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'mood',
    onChange: setSelectedMoodId,
  });

  const group = getRootProps();

  const handleSelect = () => {
    const selectedMood = moods.find(m => m.id === selectedMoodId);
    if (selectedMood) {
      onSelectMood(selectedMood);
    }
    onClose(); // Close modal after selection
  };

  const filteredItems = moods.filter(item => 
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
          Select Mood
        </ModalHeader>
        <ModalCloseButton top={4} right={4} />
        <ModalBody pt={4} pb={6} px={6}>
           <InputGroup mb={5}>
                <InputLeftElement pointerEvents="none">
                    <Icon as={FiSearch} color="gray.400" />
                </InputLeftElement>
                <Input 
                    placeholder="Search moods..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    borderRadius="md"
                />
           </InputGroup>
          {loading ? (
            <Center py={5}><Spinner /></Center>
          ) : filteredItems.length > 0 ? (
            <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacing={5}>
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
      </ModalContent>
    </Modal>
  );
}

export default MoodSelectionModal; 