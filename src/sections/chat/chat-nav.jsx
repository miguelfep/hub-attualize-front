import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import ClickAwayListener from '@mui/material/ClickAwayListener';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useResponsive } from 'src/hooks/use-responsive';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { ToggleButton } from './styles';
import { ChatNavItem } from './chat-nav-item';
import { ChatNavAccount } from './chat-nav-account';
import { ChatNavItemSkeleton } from './chat-skeleton';
import { ChatNavSearchResults } from './chat-nav-search-results';
import { InstanceFilter } from 'src/components/chat/instance-filter';

// ----------------------------------------------------------------------

const NAV_WIDTH = 320;

const NAV_COLLAPSE_WIDTH = 96;

// ----------------------------------------------------------------------

export function ChatNav({ 
  loading, 
  contacts, 
  conversations, 
  collapseNav, 
  selectedConversationId,
  instanceFilter = 'all',
  onInstanceFilterChange,
  showStats = false,
  stats
}) {
  const theme = useTheme();

  const router = useRouter();

  const mdUp = useResponsive('up', 'md');

  const {
    openMobile,
    onOpenMobile,
    onCloseMobile,
    onCloseDesktop,
    collapseDesktop,
    onCollapseDesktop,
  } = collapseNav;

  const [searchContacts, setSearchContacts] = useState({ query: '', results: [] });

  const handleSearchContacts = useCallback((inputValue) => {
    setSearchContacts((prev) => ({
      ...prev,
      query: inputValue,
    }));

    if (inputValue) {
      const results = contacts.filter((contact) =>
        contact.name.toLowerCase().includes(inputValue.toLowerCase())
      );

      setSearchContacts((prev) => ({
        ...prev,
        results,
      }));
    }
  }, [contacts]);

  const handleSelectContact = useCallback((contact) => {
    setSearchContacts({ query: '', results: [] });
    router.push(`${paths.dashboard.chat}?id=${contact.id}`);
  }, [router]);

  const handleToggleNav = useCallback(() => {
    if (mdUp) {
      onCollapseDesktop();
    } else {
      onOpenMobile();
    }
  }, [mdUp, onCollapseDesktop, onOpenMobile]);

  const renderToggleBtn = (
    <ToggleButton
      size="small"
      value="chat"
      selected={!collapseDesktop}
      onChange={handleToggleNav}
      sx={{
        p: 0.5,
        top: 24,
        left: 24,
        zIndex: 9,
        position: 'absolute',
        bgcolor: 'background.paper',
        '&:hover': {
          bgcolor: 'background.neutral',
        },
        ...(collapseDesktop && {
          left: 12,
        }),
      }}
    >
      <Iconify
        width={16}
        icon={collapseDesktop ? 'eva:arrow-ios-forward-fill' : 'eva:arrow-ios-back-fill'}
      />
    </ToggleButton>
  );

  const renderSkeleton = (
    <Stack spacing={2} sx={{ p: 3 }}>
      {[...Array(4)].map((_, index) => (
        <ChatNavItemSkeleton key={index} />
      ))}
    </Stack>
  );

  const renderList = (
    <Stack sx={{ flex: '1 1 auto', minHeight: 0 }}>
      {loading ? (
        renderSkeleton
      ) : (
        <Scrollbar>
          <Stack sx={{ p: 2 }}>
            {conversations.allIds.map((conversationId) => (
              <ChatNavItem
                key={conversationId}
                collapse={collapseDesktop}
                conversation={conversations.byId[conversationId]}
                selected={selectedConversationId === conversationId}
                onCloseMobile={onCloseMobile}
              />
            ))}
          </Stack>
        </Scrollbar>
      )}
    </Stack>
  );

  const renderContent = (
    <Stack sx={{ height: 1 }}>
      {/* Filtro de instância */}
      <InstanceFilter
        selectedInstance={instanceFilter}
        onInstanceChange={onInstanceFilterChange}
        showStats={showStats}
        stats={stats ? {
          operacional: stats.operacional?.total || 0,
          financeiroComercial: stats.financeiroComercial?.total || 0,
        } : undefined}
      />

      {/* Search */}
      <Box sx={{ p: 2.5 }}>
        <TextField
          fullWidth
          value={searchContacts.query}
          onChange={(event) => handleSearchContacts(event.target.value)}
          placeholder="Buscar conversas..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Search Results */}
      {searchContacts.query && (
        <ClickAwayListener onClickAway={() => setSearchContacts({ query: '', results: [] })}>
          <ChatNavSearchResults
            query={searchContacts.query}
            results={searchContacts.results}
            onSelectContact={handleSelectContact}
          />
        </ClickAwayListener>
      )}

      {/* Conversations List */}
      {!searchContacts.query && renderList}

      {/* Account */}
      <ChatNavAccount />
    </Stack>
  );

  return (
    <>
      <Stack
        sx={{
          width: NAV_WIDTH,
          height: 1,
          transition: theme.transitions.create(['width'], {
            duration: theme.transitions.duration.shorter,
          }),
          ...(collapseDesktop && { width: NAV_COLLAPSE_WIDTH }),
        }}
      >
        {renderToggleBtn}

        {!collapseDesktop && renderContent}
      </Stack>

      <Drawer
        anchor="left"
        open={openMobile}
        onClose={onCloseMobile}
        slotProps={{ backdrop: { invisible: true } }}
        PaperProps={{ sx: { width: NAV_WIDTH } }}
      >
        {renderContent}
      </Drawer>
    </>
  );
}
