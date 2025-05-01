import React, { useState, useEffect } from 'react';
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
  Spinner,
  VStack,
  useClipboard,
  Tooltip,
  IconButton,
  Flex,
} from '@chakra-ui/react';
import { FiSearch, FiCopy } from 'react-icons/fi';
import { getMockPromptExamples } from '../../data/mockData';

function PromptCard({ prompt, onSelect }) {
  const { hasCopied, onCopy } = useClipboard(prompt.text);

  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="md"
      _hover={{ shadow: 'md', borderColor: 'blue.300' }}
      position="relative"
      bg="white"
    >
      <VStack align="start" spacing={2}>
        <Text fontWeight="semibold" fontSize="sm">{prompt.category || 'General'}</Text>
        <Text fontSize="xs" color="gray.600" noOfLines={3}>{prompt.text}</Text>
      </VStack>
      <Flex justify="flex-end" mt={3}>
        <Tooltip label={hasCopied ? 'Copied!' : 'Copy Prompt'} closeOnClick={false}>
          <IconButton
            size="xs"
            icon={<Icon as={FiCopy} />}
            onClick={onCopy}
            variant="ghost"
            aria-label="Copy prompt"
            mr={2}
          />
        </Tooltip>
        <Button size="xs" colorScheme="blue" variant="outline" onClick={() => onSelect(prompt)}>
          Use Prompt
        </Button>
      </Flex>
    </Box>
  );
}

export default function PromptLibraryModal({ isOpen, onClose, onSelectPrompt }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [examples, setExamples] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setSearchTerm('');
      getMockPromptExamples()
        .then(data => setExamples(data || []))
        .catch(err => console.error("Error fetching prompts:", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const handleSelect = (prompt) => {
    onSelectPrompt(prompt);
    onClose();
  };

  const filteredExamples = examples.filter(p =>
    p.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="xl">
        <ModalHeader
          fontSize="lg"
          fontWeight="semibold"
          borderBottomWidth="1px"
          borderColor="gray.100"
          py={4} px={6}
        >
          Prompt Library
        </ModalHeader>
        <ModalCloseButton top={4} right={4} />
        <ModalBody pt={4} pb={6} px={6}>
          <InputGroup mb={5}>
            <InputLeftElement pointerEvents="none">
              <Icon as={FiSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search prompts or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              borderRadius="md"
            />
          </InputGroup>
          {loading ? (
            <Center py={10}><Spinner size="xl" /></Center>
          ) : filteredExamples.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
              {filteredExamples.map((example) => (
                <PromptCard key={example.id} prompt={example} onSelect={handleSelect} />
              ))}
            </SimpleGrid>
          ) : (
            <Center py={10}><Text>No prompts found{searchTerm ? ' matching "' + searchTerm + '"' : ''}.</Text></Center>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
} 