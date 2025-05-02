import React, { useState, createContext, useContext, useCallback, useEffect } from 'react';
import { Box, Flex, useToast } from '@chakra-ui/react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import axios from 'axios'; // Import axios

// 1. Create Context
const PageHeaderContext = createContext({
  title: '',
  subtitle: '',
  setHeader: () => {},
});

// Custom hook for easy context access
export const usePageHeader = () => useContext(PageHeaderContext);

// TODO: Move to config
const API_BASE_URL = 'https://productmarketing-ai-f0e989e4e1ad.herokuapp.com';

function DashboardLayout({ children, logout }) {
  const toast = useToast();
  // 2. Manage state in Layout
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  // Workspace state
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState(null);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);

  // --- Auth Helper --- 
  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({ title: "Authentication Error", description: "Please log in.", status: "error", duration: 3000, isClosable: true });
      return null;
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  }, [toast]);

  // --- Fetch Workspaces --- 
  useEffect(() => {
    const fetchUserWorkspaces = async () => {
      const config = getAuthConfig();
      if (!config) {
        setIsLoadingWorkspaces(false);
        return; // Need auth
      }
      setIsLoadingWorkspaces(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/workspaces`, config);
        const fetchedWorkspaces = response.data || [];
        setWorkspaces(fetchedWorkspaces);
        // Set the first workspace as current by default if none is selected
        // TODO: Add logic to remember last selected workspace (e.g., localStorage)
        if (fetchedWorkspaces.length > 0 && !currentWorkspaceId) {
           setCurrentWorkspaceId(fetchedWorkspaces[0].id);
        }
      } catch (error) {
        console.error("Error fetching workspaces:", error);
        toast({ title: 'Failed to load workspaces', description: error.response?.data?.message || error.message, status: 'error' });
        setWorkspaces([]); // Clear on error
      } finally {
        setIsLoadingWorkspaces(false);
      }
    };
    fetchUserWorkspaces();
  }, [getAuthConfig, currentWorkspaceId]); // Refetch if auth changes

  // Callback to update header, memoized for stability
  const setHeader = useCallback((newTitle, newSubtitle) => {
    setTitle(newTitle || '');
    setSubtitle(newSubtitle || '');
  }, []);

  // --- Workspace Switching/Adding Handlers --- 
  const handleSwitchWorkspace = (workspaceId) => {
    console.log("Switching to workspace:", workspaceId);
    setCurrentWorkspaceId(workspaceId);
    // TODO: Potentially store this ID in localStorage
    // TODO: Trigger data refresh for components depending on workspaceId
  };

  const handleAddWorkspace = () => {
    // TODO: Implement logic to add a new workspace (e.g., open modal, navigate)
    console.log("Add workspace clicked");
    toast({ title: 'Add Workspace', description: 'Feature not yet implemented.', status: 'info' });
  };

  // Find the current full workspace object
  const currentWorkspace = workspaces.find(ws => ws.id === currentWorkspaceId);

  // Context value
  const contextValue = { title, subtitle, setHeader };

  return (
    // 3. Provide Context
    <PageHeaderContext.Provider value={contextValue}>
      <Flex height="100vh" bg="white">
        {/* Pass workspace data and handlers to Sidebar */}
        <Sidebar 
          logout={logout} 
          workspaces={workspaces} 
          currentWorkspace={currentWorkspace} 
          onSwitchWorkspace={handleSwitchWorkspace}
          onAddWorkspace={handleAddWorkspace}
          isLoadingWorkspaces={isLoadingWorkspaces} // Pass loading state
        />
        <Flex flex="1" direction="column">
          {/* 4. Pass state to TopBar */}
          <TopBar logout={logout} title={title} subtitle={subtitle} />
          <Box 
            as="main" 
            flex="1" 
            p={8} 
            overflowY="auto" 
            bg="gray.50"
            sx={{
              // Make container elements transparent to show the gradient
              '& > div': {
                background: 'transparent',
              },
              // Ensure VStack components are transparent
              '& > .chakra-stack': {
                background: 'transparent',
              },
              // Make sure cards and other container components keep their bg
              '& .chakra-card, & [role="group"], & [data-card="true"]': {
                background: 'white',
              }
            }}
          >
            {children} {/* Page components now have access to context */}
          </Box>
        </Flex>
      </Flex>
    </PageHeaderContext.Provider>
  );
}

export default DashboardLayout; 