import React from 'react';
import {Drawer, List, ListItem, Toolbar, ListItemText} from '@mui/material';
import {Divider, ListItemIcon, ListItemButton, Typography} from '@mui/material';
import {Box} from '@mui/material';
import {Inbox, Mail} from '@mui/icons-material';

import AppContext from './AppContext';

/**
 * Fetch mailboxes
 *
 * @param {Function} setMailboxes
 * @param {String}  starCount
 */
const fetchMailboxes = (setMailboxes, starCount) => {
  const item = localStorage.getItem('user');
  const user = JSON.parse(item);
  const bearerToken = user.accessToken;
  const email = encodeURIComponent(user.email);
  fetch(`http://localhost:3010/v0/mailbox/${email}`, {
    method: 'get',
    headers: new Headers({
      'Authorization': `Bearer ${bearerToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
  })
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      json.splice(1, 0, {name: 'Starred', count: starCount});
      setMailboxes(json);
    });
};

/**
 * Drawer Bar
 *
 * @return {object} JSX
 */
function LeftBar() {
  const ctx = React.useContext(AppContext);
  const [mailboxes, setMailboxes] = React.useState([]);

  React.useEffect(() => {
    fetchMailboxes(setMailboxes, 0);
  }, []);

  React.useEffect(() => {
    fetchMailboxes(setMailboxes, ctx.starCount);
  }, [ctx.starCount]);

  // Built from MUI documentation starter code for temporary drawer
  // Citation: https://mui.com/material-ui/react-drawer/
  return (
    <AppContext.Consumer>
      {({currentBox, openDrawer, handleCloseDrawer, handleCurrentBox}) => (
        <Drawer
          variant="temporary"
          aria-label='drawer'
          open={openDrawer}
          onClose={handleCloseDrawer}
          sx={{
            'display': {xs: 'block', sm: 'none'},
            '& .MuiDrawer-paper': {boxSizing: 'border-box', width: 240},
          }}>
          <div>
            <Toolbar />
            <Typography marginLeft={'10%'}>Slug Mail</Typography>
            <Divider />
            <List aria-label='boxlist'>
              {mailboxes.map((text, index) => (
                <ListItem key={text.name} disablePadding>
                  {(text.name === currentBox) &&
                    <Box sx={{backgroundColor: 'lightgray'}} width='100%'>
                      <ListItemButton aria-label={text.name} onClick={() => {
                        handleCurrentBox(text.name);
                        handleCloseDrawer();
                      }}>
                        <ListItemIcon>
                          {index % 2 === 0 ? <Inbox /> : <Mail />}
                        </ListItemIcon>
                        <ListItemText primary={text.name} />

                        <Typography align='right' component={'div'}>
                          <ListItemText primary={text.count} />
                        </Typography>
                      </ListItemButton>
                    </Box>
                  }
                  {(text.name !== currentBox) &&
                    <Box width={'100%'}>
                      <ListItemButton aria-label={text.name} onClick={() => {
                        handleCurrentBox(text.name);
                        handleCloseDrawer();
                      }}>
                        <ListItemIcon>
                          {index % 2 === 0 ? <Inbox /> : <Mail />}
                        </ListItemIcon>
                        <ListItemText primary={text.name} />
                        <Typography align='right' component={'div'}>
                          <ListItemText primary={text.count} />
                        </Typography>
                      </ListItemButton>
                    </Box>
                  }
                </ListItem>
              ))}
            </List>
            <Divider />
          </div>
        </Drawer>
      )}
    </AppContext.Consumer>
  );
};

export default LeftBar;
