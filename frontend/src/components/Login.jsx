import {Grid} from '@mui/material';
import {TextField} from '@mui/material';
import {Button} from '@mui/material';
import React from 'react';
import {useNavigate} from 'react-router-dom';

/**
 * Login Form
 *
 * @return {object} JSX
 */
function Login() {
  const [user, setUser] = React.useState({email: '', password: ''});
  const [error, setError] = React.useState(false);
  const history = useNavigate();

  React.useEffect(() => {
    localStorage.removeItem('user');
  }, []);

  const handleInputChange = (event) => {
    const {value, name} = event.target;
    const u = user;
    u[name] = value;
    setUser(u);
  };

  // Post to server for login
  const handleLoginClick = (event) => {
    event.preventDefault();
    fetch('http://localhost:3010/v0/login', {
      method: 'POST',
      body: JSON.stringify(user),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (!res.ok) {
          setError(true);
          throw res;
        }
        setError(false);
        return res.json();
      })
      .then((json) => {
        localStorage.setItem('user', JSON.stringify(json));
        history('/');
      })
      .catch((err) => {
        setError(true);
      });
  };

  return (
    <Grid
      container
      direction='column'
      alignItems='center'
      justifyContent='center'
      marginLeft={'auto'}
      marginRight={'auto'}
      paddingTop={'5%'}>
      <Grid item
        aria-label='title'
        textAlign={'center'}>
          Login
      </Grid>
      <Grid item marginTop='2%'>
        <Grid container
          spacing={2}
          alignItems={'center'}
          justifyContent='space-evenly'>
          <Grid item>
              Username:
          </Grid>
          <Grid item>
            {(!error) &&
              <TextField
                id="outlined-required-username"
                aria-label='username'
                name='email'
                placeholder="Enter username"
                onChange={handleInputChange}
              />
            }
            {(error) &&
              <TextField
                error
                id="outlined-error-helper-text-username"
                name='email'
                aria-label='invalid username'
                label="Error"
                placeholder="Enter username"
                onChange={handleInputChange}
              />
            }
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <Grid container
          spacing={2}
          marginTop='5%'
          alignItems={'center'}
          justifyContent='space-evenly'>
          <Grid item>
            Password:
          </Grid>
          <Grid item>
            {(!error) &&
            <TextField
              id="outlined-required-password"
              aria-label='password'
              name='password'
              placeholder="Enter password"
              type={'password'}
              onChange={handleInputChange}
            />
            }
            {(error) &&
            <TextField
              error
              id="outlined-error-helper-text-password"
              name='password'
              label="Error"
              aria-label='invalid password'
              placeholder="Enter password"
              type={'password'}
              helperText="Incorrect Username or password"
              onChange={handleInputChange}
            />
            }
          </Grid>
        </Grid>
      </Grid>
      <Grid
        item
        alignItems={'center'}
        justifyContent='center'
        textAlign={'center'}
        marginTop='2%'>
        <Button variant="contained"
          aria-label='loginButton'
          id='button'
          onClick={handleLoginClick}>
            Sign in
        </Button>
      </Grid>
    </Grid>
  );
};

export default Login;
