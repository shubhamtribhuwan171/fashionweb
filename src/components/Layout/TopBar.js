import React from 'react';
import {
  Flex,
  Box,
  // Input,
  // InputGroup,
  // InputLeftElement,
  IconButton,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  // Spacer, // Not needed if search/notifications are removed
  Icon,
  HStack, // Added HStack
  VStack,    // Added VStack
  Heading,   // Added Heading
  Text,      // Added Text
} from '@chakra-ui/react';
// Removed FiSearch, FiBell
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { FiSettings, FiLogOut } from 'react-icons/fi';
// Import the flask icon
import { FaFlask } from 'react-icons/fa';

// Accept title and subtitle props
function TopBar({ logout, title, subtitle }) { 
  const navigate = useNavigate(); // Hook for navigation
  // TODO: Replace with actual data/handlers
  const user = { name: 'User Name', avatarUrl: '' }; // Placeholder

  const handleSettings = () => {
    navigate('/app/settings');
  };

  // Add handler for the new experimental page
  const handleExperimentalPage = () => {
    navigate('/app/experimental-create');
  };

  const handleLogout = () => {
    if (logout) {
      logout();
      // Navigation after logout is likely handled within the logout function or parent
    } else {
      console.error("Logout function not provided to TopBar");
    }
  };

  return (
    <Flex
      as="header"
      align="center"
      justify="space-between" // Will push user menu to the right
      w="full"
      px={4}
      py={2}
      bg="gray.100" // Changed background to match sidebar
      borderBottomWidth="1px"
      borderColor="gray.200"
      height="60px"
    >
      {/* Left Section - Display Title/Subtitle */}
      <VStack align="start" spacing={0}> 
        {title && <Heading size="sm" color="gray.700">{title}</Heading>}
        {subtitle && <Text fontSize="xs" color="gray.500">{subtitle}</Text>}
      </VStack>

      {/* Right Section */}
      <HStack spacing={3}> {/* Use HStack for right-side items */} 
        {/* Add Experimental Page Button */}
        <IconButton
          aria-label="Experimental Create Page"
          icon={<Icon as={FaFlask} />}
          variant="ghost"
          onClick={handleExperimentalPage}
          borderRadius="full"
        />

        {/* Settings Button */}
        <IconButton
          aria-label="Settings"
          icon={<Icon as={FiSettings} />}
          variant="ghost"
          onClick={handleSettings}
          borderRadius="full"
        />

        {/* User Menu */}
        <Menu>
          <MenuButton 
            as={IconButton}
            icon={<Avatar size="sm" name={user.name} src={user.avatarUrl} bg="#E53E3E" color="white"/>}
            variant="ghost"
            borderRadius="full"
          />
          <MenuList>
            {/* Settings moved to top bar icon */}
            <MenuItem onClick={handleLogout} icon={<Icon as={FiLogOut} />}>Logout</MenuItem> 
          </MenuList>
        </Menu>
      </HStack>
    </Flex>
  );
}

export default TopBar; 