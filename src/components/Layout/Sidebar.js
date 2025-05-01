import React from 'react';
import { Box, VStack, Button, Link as ChakraLink, Divider, Flex, Text, Icon, Spacer, Menu, MenuButton, MenuList, MenuItem, Avatar } from '@chakra-ui/react';
import { NavLink as RouterNavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiLayers, FiPlusSquare, FiGrid, FiBox, FiSearch, FiSettings, FiLogOut, FiChevronDown, FiBriefcase, FiPlus } from 'react-icons/fi';

// Custom NavLink style for active state
const activeLinkStyle = {
  backgroundColor: 'black',
  color: 'white',
  fontWeight: 'bold',
  borderRadius: 'md',
};

const baseLinkStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '0.75rem 1.5rem',
  borderRadius: 'md',
  _hover: {
    backgroundColor: 'gray.200',
    color: 'blue.600',
  },
};

function SidebarNavLink({ to, icon, children }) {
  return (
    <ChakraLink
      as={RouterNavLink}
      to={to}
      style={({ isActive }) => ({ ...baseLinkStyle, ...(isActive ? activeLinkStyle : {}) })}
      _focus={{ boxShadow: 'none' }}
      width="100%"
    >
      <Icon as={icon} mr={3} w={5} h={5} />
      {children}
    </ChakraLink>
  );
}

function WorkspaceSelector({ currentWorkspace, userWorkspaces = [], onAddWorkspace, onSwitchWorkspace }) {
  const current = currentWorkspace || { id: '1', name: 'My Workspace' }; 
  const workspaces = userWorkspaces.length > 0 ? userWorkspaces : [{ id: '1', name: 'My Workspace' }];

  return (
    <Menu placement="bottom-start" >
      <MenuButton 
        as={Button}
        w="full" 
        variant="ghost" 
        mb={8} 
        _hover={{ bg: 'gray.200' }}
        _active={{ bg: 'gray.300' }}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={2}
        h="auto"
        py={2}
      >
        <Flex align="center" flex="1" minWidth="0">
          <Avatar 
            icon={<Icon as={FiBriefcase} color="white" />}
            size="sm" 
            mr={3} 
            bg="black"
          /> 
          <Box flex="1" overflow="hidden">
            <Text fontWeight="semibold" fontSize="sm" color="gray.800" isTruncated>
              {current.name} 
            </Text>
          </Box>
        </Flex>
        <Icon as={FiChevronDown} ml={2} flexShrink={0} />
      </MenuButton>
      <MenuList zIndex="popover">
        {workspaces.map((ws) => (
          <MenuItem 
            key={ws.id} 
            onClick={() => onSwitchWorkspace(ws.id)}
            fontWeight={ws.id === current.id ? 'bold' : 'normal'}
          >
            {ws.name}
          </MenuItem>
        ))}
        <Divider />
        <MenuItem 
          icon={<Icon as={FiPlus} />} 
          onClick={onAddWorkspace}
        >
          Add Workspace
        </MenuItem>
      </MenuList>
    </Menu>
  );
}

function Sidebar({ logout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };
  
  const handleCreateStyle = () => {
    navigate('/app/create-style');
  }

  return (
    <Box 
      w="250px" 
      bg="gray.100"
      color="gray.700"
      p={4}
      display="flex"
      flexDirection="column"
      height="100vh"
      borderRight="1px solid"
      borderColor="gray.200"
    >
      <WorkspaceSelector />
      
      <VStack spacing={2} align="stretch" flexGrow={1}>
        <SidebarNavLink to="/app/dashboard" icon={FiHome}>Dashboard</SidebarNavLink>
        <SidebarNavLink to="/app/generations" icon={FiLayers}>My Looks</SidebarNavLink>
        <SidebarNavLink to="/app/create-style" icon={FiPlusSquare}>Create Style</SidebarNavLink>
        <SidebarNavLink to="/app/collections" icon={FiGrid}>Collections</SidebarNavLink>
        <SidebarNavLink to="/app/products" icon={FiBox}>Base Garments</SidebarNavLink>
        <SidebarNavLink to="/app/explore" icon={FiSearch}>Explore</SidebarNavLink>
      </VStack>

      <VStack spacing={2} align="stretch" mt={8}>
        <SidebarNavLink to="/app/settings" icon={FiSettings}>Settings</SidebarNavLink>
      </VStack>
      
      <Button 
        leftIcon={<Icon as={FiPlusSquare} />}
        colorScheme="blue"
        variant="solid"
        width="full"
        my={4}
        onClick={handleCreateStyle}
      >
        Create Style
      </Button>

      <Divider my={2} borderColor="gray.200" />
      
      <Button 
        onClick={handleLogout} 
        variant="ghost"
        width="full"
        color="gray.600"
        leftIcon={<Icon as={FiLogOut} />}
        justifyContent="flex-start"
        pl={4}
        _hover={{ bg: 'gray.200', color: 'red.500' }}
      >
        Logout
      </Button>
    </Box>
  );
}

export default Sidebar; 