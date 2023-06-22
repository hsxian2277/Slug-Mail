import {AppBar, Toolbar, IconButton, Typography, Avatar} from '@mui/material';
import {Tooltip} from '@mui/material';
import {Menu} from '@mui/icons-material';
import {useNavigate} from 'react-router-dom';
import React from 'react';
import SharedContext from './AppContext';

/**
 * Top Bar
 *
 * @return {object} JSX
 */
function TopBar() {
  const user = JSON.parse(localStorage.getItem('user'));
  const history = useNavigate();
  const [name, setName] = React.useState(user.name);

  React.useEffect(() => {
    setName(user.name);
  }, [user.name]);

  // Logging out navigate back to login
  const logout = () => {
    localStorage.removeItem('user');
    setName('');
    history('/login');
  };

  // Built from starter code of basic app bar on MUI documentation
  // Citation: https://mui.com/material-ui/react-app-bar/
  return (
    <SharedContext.Consumer>
      {({handleOpenDrawer, currentBox}) => (
        <AppBar position="static">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleOpenDrawer}
              sx={{mr: 2}}
            >
              <Menu />
            </IconButton>
            <Typography variant="h6" component="div" sx={{flexGrow: 1}}
              aria-label='title'>
              {name}'s {currentBox}
            </Typography>
            <Tooltip title='Log out'>
              <Avatar color="inherit" onClick={logout}
                aria-label='logout'
                sx={{':hover': {
                  border: 'thin solid',
                  borderColor: 'red',
                }}}>{name[0]}</Avatar>
            </Tooltip>
          </Toolbar>
        </AppBar>
      )}
    </SharedContext.Consumer>
  );
};

export default TopBar;
