import React from 'react';
import {Toolbar, List, Typography, ListItemAvatar} from '@mui/material';
import {Slide, Dialog, AppBar, Avatar, Divider} from '@mui/material';
import {IconButton, ListItem, ListItemText} from '@mui/material';
import {ChevronLeft, Star, StarBorder, Mail, Delete} from '@mui/icons-material';
import AppContext from './AppContext';

// List of month in English
const monthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May',
  'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

// Transition from starter code of full-screen dialog on MUI documentation
// Citation: https://mui.com/material-ui/react-dialog/
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/**
 * Covert a string of date into correct display format
 *
 * @param {String} input
 * @return {String} String of date
 */
function convertDate(input) {
  const today = new Date();
  const date = new Date(input);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  // Check if today
  if (today.getFullYear() === date.getFullYear() &&
    today.getMonth() === date.getMonth() &&
    today.getDate() === date.getDate()) {
    let hour = date.getHours();
    hour = hour.toString();
    const min = date.getMinutes().toString().padStart(2, '0');
    return hour + ':' + min;
  }
  // Check if yesterday
  if (yesterday.getFullYear() === date.getFullYear() &&
    yesterday.getMonth() === date.getMonth() &&
    yesterday.getDate() === date.getDate()) {
    return 'Yesterday';
  }
  // Code on checking number of months between dates
  // Citation: https://bobbyhadz.com/blog/javascript-get-number-of-months-between-two-dates
  const diff = Math.abs(today.getMonth() - date.getMonth()) +
    12 * Math.abs(today.getFullYear() - date.getFullYear());

  // Check if date is within 12 months
  if (diff <= 12) {
    let day = date.getDate();
    if (day.toString().length < 2) {
      day = '0' + day;
    }
    return monthList[date.getMonth()] + ' ' + day;
  }
  return date.getFullYear();
}

// Fetch mail given id
const fetchMail = (id, setMail) => {
  const item = localStorage.getItem('user');
  const user = JSON.parse(item);
  const bearerToken = user.accessToken;
  const email = encodeURIComponent(user.email);
  fetch(`http://localhost:3010/v0/mail/${email}?id=${id}`, {
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
      setMail(json[0]);
    });
};

// Put new info into mail
const putMail = (id, unread, starred, handleUpdateMails, setMail, mailbox) => {
  const item = localStorage.getItem('user');
  const user = JSON.parse(item);
  const bearerToken = user.accessToken;
  const email = encodeURIComponent(user.email);
  let path = ``;
  // Either put it in original mailbox or a different one
  if (mailbox) {
    path = `http://localhost:3010/v0/mail/${email}?id=${id}&unread=${unread}&starred=${starred}&mailbox=${mailbox}`;
  } else {
    path = `http://localhost:3010/v0/mail/${email}?id=${id}&unread=${unread}&starred=${starred}`;
  }
  fetch(path, {
    method: 'put',
    headers: new Headers({
      'Authorization': `Bearer ${bearerToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
  })
    .then((res) => {
      handleUpdateMails();
      fetchMail(id, setMail);
    });
};

/**
 * Mail Viewer
 *
 * @return {object} JSX
 */
function MailView() {
  const ctx = React.useContext(AppContext);
  const [mail, setMail] = React.useState({
    id: '',
    from: {name: '', email: ''},
    to: {name: '', email: ''},
    subject: '',
    received: new Date().toISOString(),
    content: '',
    unread: false,
    starred: false,
  });

  React.useEffect(() => {
    fetchMail(ctx.mailId, setMail);
  }, [ctx.mailId]);

  // Built from starter code of full-screen dialog on MUI documentation
  // Citation: https://mui.com/material-ui/react-dialog/
  return (
    <AppContext.Consumer>
      {({mailOpen, handleMailClose, addStarCount,
        subStarCount, handleUpdateMails, currentBox}) => (
        <Dialog
          fullScreen
          open={mailOpen}
          onClose={handleMailClose}
          TransitionComponent={Transition}
        >
          <AppBar sx={{position: 'relative'}}>
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                onClick={handleMailClose}
                aria-label="closemail"
              >
                <ChevronLeft/>
              </IconButton>
              <Typography align='right'
                width='100%'>
                <IconButton
                  edge="end"
                  color="inherit"
                  onClick={() => {
                    putMail(mail.id, true, mail.starred,
                      handleUpdateMails, setMail, undefined);
                    handleMailClose();
                  }}
                  aria-label="unread"
                >
                  <Mail/>
                </IconButton>
                <IconButton
                  edge="end"
                  color="inherit"
                  onClick={() => {
                    putMail(mail.id, false, mail.starred,
                      handleUpdateMails, setMail, 'Trash');
                    handleMailClose();
                  }}
                  aria-label="delete"
                >
                  <Delete />
                </IconButton>
              </Typography>
            </Toolbar>
          </AppBar>

          <List>
            <ListItem>
              <Typography fontSize={15} fontWeight='bold'>
                {mail.subject}
              </Typography>
            </ListItem>

            <ListItem>
              <Typography
                sx={{backgroundColor: 'lightgray'}}>
                {currentBox}
              </Typography>
              <Typography align='right' width={'100%'}>
                {(mail.starred) &&
                  <IconButton
                    aria-label='unstar'
                    onClick={(event) => {
                      event.stopPropagation();
                      putMail(mail.id, mail.unread, !mail.starred,
                        handleUpdateMails, setMail);
                      subStarCount();
                    }}>
                    <Star />
                  </IconButton>}
                {(!mail.starred) &&
                  <IconButton
                    aria-label='star'
                    onClick={(event) => {
                      event.stopPropagation();
                      putMail(mail.id, mail.unread, !mail.starred,
                        handleUpdateMails, setMail);
                      addStarCount();
                    }}>
                    <StarBorder />
                  </IconButton>}
              </Typography>
            </ListItem>

            <ListItem>
              <ListItemAvatar sx={{width: '10%'}}>
                <Avatar>{mail.from.name[0]}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary ={mail.from.name}
                secondary = {mail.from.email}/>
              <ListItemText
                primary = {convertDate(mail.received, mail.content)}
                secondary = '&nbsp;'/>
            </ListItem>

            <Divider />
            <ListItem aria-label='content'>
              <Typography>
                {mail.content}
              </Typography>
            </ListItem>

          </List>
        </Dialog>
      )}
    </AppContext.Consumer>
  );
};

export default MailView;
