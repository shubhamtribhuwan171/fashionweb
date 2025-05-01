import React from 'react';
import {
  Flex,
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Spacer, // To push elements apart
  Icon
} from '@chakra-ui/react';
import { FiSearch, FiBell } from 'react-icons/fi';

function TopBar() {
  // TODO: Replace with actual data/handlers
  const user = { name: 'User Name', avatarUrl: '' }; // Placeholder

  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      w="full"
      px={4}
      py={2}
      bg="gray.100" // Changed from white to gray.100 to match Sidebar
      borderBottomWidth="1px"
      borderColor="gray.200"
      height="60px" // Fixed height for the top bar
    >
      {/* Left Section - Placeholder for potential breadcrumbs or title */}
      <Box>
        {/* Future: Add Breadcrumbs or Page Title here */}
      </Box>

      {/* Right Section */}
      <Flex align="center">
        {/* Search Bar - Placeholder */}
        <InputGroup w={{ base: '150px', md: '200px' }} mr={4}>
          <InputLeftElement pointerEvents="none">
            <Icon as={FiSearch} color="gray.400" />
          </InputLeftElement>
          <Input type="search" placeholder="Search..." borderRadius="md" />
        </InputGroup>

        {/* Notification Button - Placeholder */}
        <IconButton
          aria-label="Notifications" 
          icon={<Icon as={FiBell} />} 
          variant="ghost"
          fontSize="xl"
          mr={4}
          // TODO: Add onClick handler for notifications
        />

        {/* User Menu */}
        <Menu>
          <MenuButton 
            as={IconButton}
            icon={<Avatar size="sm" name={user.name} src={user.avatarUrl} />}
            variant="ghost"
            borderRadius="full"
          />
          <MenuList>
            <MenuItem>Profile</MenuItem>
            <MenuItem>Settings</MenuItem>
            <MenuItem>Logout</MenuItem> {/* TODO: Connect to logout function */}
          </MenuList>
        </Menu>
      </Flex>
    </Flex>
  );
}

export default TopBar; 