import React from 'react';
import {Avatar, Divider, List, ListItemAvatar, Box} from '@mui/material';
import {ListItemText, IconButton} from '@mui/material';
import {ListItem, Typography} from '@mui/material';
import {Star, StarBorder} from '@mui/icons-material';
import AppContext from './AppContext';

// List of month in English
const monthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May',
  'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

// Fetch list of mails of a mailbox
const fetchMails = (mailbox, setMails) => {
  const item = localStorage.getItem('user');
  const user = JSON.parse(item);
  const bearerToken = user.accessToken;
  const email = encodeURIComponent(user.email);
  let path = ``;
  if (mailbox === 'Starred') {
    const starred = true;
    path = `http://localhost:3010/v0/mail/${email}?starred=${starred}`;
  } else {
    path = `http://localhost:3010/v0/mail/${email}?mailbox=${mailbox}`;
  }
  fetch(path, {
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
      json.sort(customSort);
      setMails(json);
    });
};

// Replace mail with new info
const putMail = (id, unread, starred, currentBox, setMails) => {
  const item = localStorage.getItem('user');
  const user = JSON.parse(item);
  const bearerToken = user.accessToken;
  const email = encodeURIComponent(user.email);
  fetch(`http://localhost:3010/v0/mail/${email}?id=${id}&unread=${unread}&starred=${starred}`, {
    method: 'put',
    headers: new Headers({
      'Authorization': `Bearer ${bearerToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
  })
    .then((res) => {
      fetchMails(currentBox, setMails);
    });
};

/**
 * Custom sort function on 2 date objects, code from stack overflow
 * Citation: https://stackoverflow.com/questions/3859239/sort-json-by-date
 *
 * @param {String} a
 * @param {String} b
 * @return {Number} JSX
 */
function customSort(a, b) {
  return new Date(b.received).getTime() - new Date(a.received).getTime();
}

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

/**
 * Mail List
 *
 * @return {object} JSX
 */
function MailList() {
  const ctx = React.useContext(AppContext);
  const [mails, setMails] = React.useState([]);

  React.useEffect(() => {
    fetchMails('Inbox', setMails);
  }, []);

  React.useEffect(() => {
    fetchMails(ctx.currentBox, setMails);
  }, [ctx.currentBox, ctx.updateMails]);

  return (
    <AppContext.Consumer>
      {({currentBox, handleMailOpen, handleMailId,
        addStarCount, subStarCount}) => (
        <List aria-label='maillist'>

          <ListItem aria-label='currentbox'>
            {currentBox}
          </ListItem>

          {mails.map((mail, index) => (
            <Box key={mail.id}
              onClick = {() => {
                handleMailId(mail.id);
                handleMailOpen();
                if (mail.unread === true) {
                  putMail(mail.id, false, mail.starred, currentBox,
                    setMails);
                }
              }}>
              <Divider></Divider>

              <ListItem
                aria-label={mail.from.name}
                alignItems='flex-start'>

                <ListItemAvatar sx={{width: '10%'}}>
                  <Avatar>{mail.from.name[0]}</Avatar>
                </ListItemAvatar>

                <List sx={{display: 'block', width: '60%'}}>
                  <ListItem>
                    {(mail.unread) &&
                      <Typography noWrap overflow={'hidden'}
                        fontWeight='bold'>
                        {mail.from.name}
                      </Typography>
                    }
                    {(!mail.unread) &&
                      <Typography noWrap overflow={'hidden'}>
                        {mail.from.name}
                      </Typography>
                    }
                  </ListItem>
                  <ListItem>
                    {(mail.unread) &&
                        <Typography noWrap overflow={'hidden'}
                          fontWeight='bold'>
                          {mail.subject}
                        </Typography>
                    }
                    {(!mail.unread) &&
                      <Typography noWrap overflow={'hidden'}>
                        {mail.subject}
                      </Typography>
                    }
                  </ListItem>
                  <ListItem>
                    <Typography noWrap overflow={'hidden'}>
                      {mail.content}
                    </Typography>
                  </ListItem>
                </List>

                <ListItemText
                  aria-label={'date' + mail.id}
                  sx={{width: '30%'}}>
                  <Typography align='right'>
                    {convertDate(mail.received)}
                  </Typography>
                  <Typography align='right'
                    marginTop='85%'>
                    {(mail.starred) &&
                      <IconButton
                        aria-label={index}
                        onClick={(event) => {
                          event.stopPropagation();
                          putMail(mail.id, mail.unread, !mail.starred,
                            currentBox, setMails);
                          subStarCount();
                        }}>
                        <Star />
                      </IconButton>}
                    {(!mail.starred) &&
                      <IconButton
                        aria-label={index}
                        onClick={(event) => {
                          event.stopPropagation();
                          putMail(mail.id, mail.unread, !mail.starred,
                            currentBox, setMails);
                          addStarCount();
                        }}>
                        <StarBorder />
                      </IconButton>}
                  </Typography>
                </ListItemText>
              </ListItem>

            </Box>
          ))}
        </List>
      )}
    </AppContext.Consumer>
  );
};

export default MailList;
