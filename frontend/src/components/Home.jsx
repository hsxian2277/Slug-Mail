import React from 'react';
import {Grid} from '@mui/material';
import TopBar from './TopBar';
import LeftBar from './LeftBar';
import MailList from './MailList';
import MailView from './MailView';

import SharedContext from './AppContext';

/**
 * Fetch number of starred mails
 *
 * @param {Function} setStarCount
 */
const fetchStarCount = (setStarCount) => {
  const item = localStorage.getItem('user');
  const user = JSON.parse(item);
  const bearerToken = user.accessToken;
  const email = encodeURIComponent(user.email);
  const starred = true;
  fetch(`http://localhost:3010/v0/mailbox/${email}?starred=${starred}`, {
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
      setStarCount(Number(json[0].count));
    });
};

/**
 * Homepage
 *
 * @return {object} JSX
 */
function Home() {
  const [openDrawer, setOpenDrawer] = React.useState(false);
  const [currentBox, setCurrentBox] = React.useState('Inbox');
  const [mailOpen, setMailOpen] = React.useState(false);
  const [mailId, setMailId] = React.useState(-1);
  const [starCount, setStarCount] = React.useState(0);
  const [updateMails, setUpdateMails] = React.useState(1);

  const handleOpenDrawer = () => {
    setOpenDrawer(true);
  };
  const handleCloseDrawer = () => {
    setOpenDrawer(false);
  };
  const handleCurrentBox = (mailbox) => {
    setCurrentBox(mailbox);
  };
  const handleMailOpen = () => {
    setMailOpen(true);
  };
  const handleMailClose = () => {
    setMailOpen(false);
    setMailId(-1);
  };
  const handleMailId = (id) => {
    setMailId(id);
  };
  const addStarCount = () => {
    setStarCount(starCount + 1);
  };
  const subStarCount = () => {
    setStarCount(starCount - 1);
  };
  const handleUpdateMails = () => {
    setUpdateMails(!updateMails);
  };

  React.useEffect(() => {
    fetchStarCount(setStarCount);
  }, []);

  return (
    <SharedContext.Provider
      value = {{openDrawer, handleOpenDrawer, handleCloseDrawer,
        currentBox, handleCurrentBox, handleMailOpen, handleMailId,
        mailId, handleMailClose, mailOpen, starCount, addStarCount,
        subStarCount, handleUpdateMails, updateMails,
      }}>
      {(mailOpen) &&
        <MailView></MailView>
      }
      <Grid container>

        <Grid item width='100%'>
          <TopBar></TopBar>
        </Grid>

        <Grid item>
          <LeftBar></LeftBar>
        </Grid>

        <Grid item width={'100%'}>
          <MailList></MailList>
        </Grid>

      </Grid>
    </SharedContext.Provider>
  );
};

export default Home;
