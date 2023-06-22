import {render, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import {screen} from '@testing-library/react';
import {rest} from 'msw';
import {setupServer} from 'msw/node';
import {act} from 'react-dom/test-utils';

import App from '../App';

const LoginURL = 'http://localhost:3010/v0/login';
const MailboxURL = 'http://localhost:3010/v0/mailbox/molly%40books.com';
const MailURL = 'http://localhost:3010/v0/mail/molly%40books.com';

/**
 * @param {number} width
 */
function setWidth(width) {
  global.innerWidth = width;
  act(() => {
    global.dispatchEvent(new Event('resize'));
  });
}

/** */
function setNarrow() {
  setWidth(550);
}

const server = setupServer(
  rest.post(LoginURL, async (req, res, ctx) => {
    const user = await req.json();
    return user.email === 'molly@books.com' ?
      res(ctx.json({email: 'molly@books.com', name: 'Molly',
        accesToken: 'some-old-jwt'})) :
      res(ctx.status(404, 'Username or password incorrect'));
  }),
  rest.get(MailboxURL, async (req, res, ctx) => {
    if (req.url.searchParams.get('starred')) {
      return res(ctx.json([{name: 'Starred', count: '2'}]));
    } else {
      return res(ctx.json([
        {name: 'Inbox', count: '1'},
        {name: 'Sent', count: '3'},
        {name: 'Trash', count: '4'},
      ]));
    }
  }),
  rest.get(MailURL, async (req, res, ctx) => {
    const todayMorning = new Date();
    const todayNoon = new Date();
    const yesterday = new Date();
    const sameYearTwoDigit = new Date();
    const sameYearOneDigit = new Date();
    const pastYear = new Date();

    todayMorning.setHours(6);
    todayNoon.setHours(16);
    yesterday.setDate(todayMorning.getDate() - 1);
    sameYearOneDigit.setMonth(todayMorning.getMonth() - 3);
    sameYearOneDigit.setDate(1);
    sameYearTwoDigit.setMonth(todayMorning.getMonth() - 3);
    sameYearTwoDigit.setDate(11);
    pastYear.setFullYear(todayMorning.getFullYear() - 2);
    if (req.url.searchParams.get('starred') === 'true') {
      return res(ctx.json([
        {
          id: '1',
          from: {name: 'fromname1', email: 'fromemail1'},
          to: {name: 'toname1', email: 'toemail1'},
          subject: 'subject1',
          received: pastYear.toISOString(),
          content: 'content1',
          unread: true,
          starred: true,
        },
        {
          id: '2',
          from: {name: 'fromname2', email: 'fromemail2'},
          to: {name: 'toname2', email: 'toemail2'},
          subject: 'subject2',
          received: todayMorning.toISOString(),
          content: 'content2',
          unread: true,
          starred: false,
        },
        {
          id: '3',
          from: {name: 'fromname3', email: 'fromemail3'},
          to: {name: 'toname3', email: 'toemail3'},
          subject: 'subject3',
          received: sameYearOneDigit.toISOString(),
          content: 'content3',
          unread: true,
          starred: true,
        },
        {
          id: '4',
          from: {name: 'fromname4', email: 'fromemail4'},
          to: {name: 'toname4', email: 'toemail4'},
          subject: 'subject4',
          received: yesterday.toISOString(),
          content: 'content4',
          unread: true,
          starred: true,
        },
        {
          id: '5',
          from: {name: 'fromname5', email: 'fromemail5'},
          to: {name: 'toname5', email: 'toemail5'},
          subject: 'subject5',
          received: todayNoon.toISOString(),
          content: 'content5',
          unread: true,
          starred: true,
        },
        {
          id: '6',
          from: {name: 'fromname6', email: 'fromemail6'},
          to: {name: 'toname6', email: 'toemail6'},
          subject: 'subject6',
          received: sameYearTwoDigit.toISOString(),
          content: 'content6',
          unread: true,
          starred: true,
        },
      ]));
    }
    return res(ctx.json([
      {
        id: '1',
        from: {name: 'fromname1', email: 'fromemail1'},
        to: {name: 'toname1', email: 'toemail1'},
        subject: 'subject1',
        received: pastYear.toISOString(),
        content: 'content1',
        unread: true,
        starred: true,
      },
      {
        id: '2',
        from: {name: 'fromname2', email: 'fromemail2'},
        to: {name: 'toname2', email: 'toemail2'},
        subject: 'subject2',
        received: todayMorning.toISOString(),
        content: 'content2',
        unread: true,
        starred: false,
      },
      {
        id: '3',
        from: {name: 'fromname3', email: 'fromemail3'},
        to: {name: 'toname3', email: 'toemail3'},
        subject: 'subject3',
        received: sameYearOneDigit.toISOString(),
        content: 'content3',
        unread: true,
        starred: true,
      },
      {
        id: '4',
        from: {name: 'fromname4', email: 'fromemail4'},
        to: {name: 'toname4', email: 'toemail4'},
        subject: 'subject4',
        received: yesterday.toISOString(),
        content: 'content4',
        unread: true,
        starred: false,
      },
      {
        id: '5',
        from: {name: 'fromname5', email: 'fromemail5'},
        to: {name: 'toname5', email: 'toemail5'},
        subject: 'subject5',
        received: todayNoon.toISOString(),
        content: 'content5',
        unread: false,
        starred: true,
      },
      {
        id: '6',
        from: {name: 'fromname6', email: 'fromemail6'},
        to: {name: 'toname6', email: 'toemail6'},
        subject: 'subject6',
        received: sameYearTwoDigit.toISOString(),
        content: 'content6',
        unread: false,
        starred: false,
      },
    ]));
  }),
  rest.put(MailURL, async (req, res, ctx) => {
    return res(ctx.status(204, 'Username or password incorrect'));
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

/**
* Login
*/
test('Login from home', async () => {
  render(<App />);
  window.alert = () => { };
  const email = screen.getByPlaceholderText('Enter username');
  await userEvent.type(email, 'molly@books.com');
  const passwd = screen.getByPlaceholderText('Enter password');
  await userEvent.type(passwd, 'mollymember');
  fireEvent.click(screen.getByText('Sign in'));
  await waitFor(() => {
    expect(localStorage.getItem('user')).not.toBe(null);
  });
});

/**
* Check current mailbox display
*/
test('Current mailbox displayed in maillist', async () => {
  render(<App />);
  setNarrow();
  const list = screen.getByLabelText('maillist');
  const currentbox = screen.getByLabelText('currentbox');
  expect(list).not.toBe(null);
  expect(currentbox).not.toBe(null);
  expect(currentbox.innerHTML).toBe('Inbox');
});

/**
* Check list of mails
*/
test('List of mails', async () => {
  render(<App />);
  setNarrow();
  await waitFor(() => {
    expect(screen.getByText('subject1')).not.toBe(null);
  });
  expect(screen.getByText('subject2')).not.toBe(null);
  expect(screen.getByText('subject3')).not.toBe(null);
});

/**
* Check that mails are sorted
*/
test('List of mails sorted by received time', async () => {
  render(<App />);
  setNarrow();
  await waitFor(() => {
    const date1 = screen.getByLabelText('date1');
    const date2 = screen.getByLabelText('date2');
    expect(date1 <= date2).toBe(true);
  });
  const date2 = screen.getByLabelText('date2');
  const date3 = screen.getByLabelText('date3');
  const date4 = screen.getByLabelText('date4');
  const date5 = screen.getByLabelText('date5');
  const date6 = screen.getByLabelText('date6');
  expect(date2 <= date3).toBe(true);
  expect(date3 <= date4).toBe(true);
  expect(date4 <= date5).toBe(true);
  expect(date5 <= date6).toBe(true);
});

/**
* Check list of starred mails
*/
test('List of mails starred mails', async () => {
  render(<App />);
  setNarrow();
  fireEvent.click(screen.getByLabelText('menu'));
  await waitFor(() => {
    const inbox = screen.getByLabelText('Inbox');
    expect(inbox).not.toBe(null);
  });
  const sent = screen.getByLabelText('Sent');
  const star = screen.getByLabelText('Starred');
  const trash = screen.getByLabelText('Trash');
  expect(sent).not.toBe(null);
  expect(star).not.toBe(null);
  expect(trash).not.toBe(null);
  fireEvent.click(star);
  await waitFor(() => {
    const current = screen.getByLabelText('Starred');
    expect(current).not.toBe(null);
  });
  const mail1 = screen.getByText('subject1');
  const mail3 = screen.getByText('subject3');
  const mail5 = screen.getByText('subject5');
  expect(mail1).not.toBe(null);
  expect(mail3).not.toBe(null);
  expect(mail5).not.toBe(null);
});

/**
* Click to star/unstar a mail from mail list
*/
test('Click to star/unstar mail', async () => {
  render(<App />);
  setNarrow();
  fireEvent.click(screen.getByLabelText('menu'));
  await waitFor(() => {
    const inbox = screen.getByLabelText('Inbox');
    expect(inbox).not.toBe(null);
  });
  const star = screen.getByLabelText('0');
  expect(star).not.toBe(null);
  fireEvent.click(star);
  await waitFor(() => {
    const unstar = screen.getByLabelText('0');
    expect(unstar).not.toBe(null);
  });
  const unstar = screen.getByLabelText('1');
  expect(unstar).not.toBe(null);
  fireEvent.click(unstar);
  await waitFor(() => {
    const star = screen.getByLabelText('1');
    expect(star).not.toBe(null);
  });
});

/**
* Opening unread mail
*/
test('Click unread mail', async () => {
  render(<App />);
  setNarrow();
  await waitFor(() => {
    const inbox = screen.getByText('Inbox');
    expect(inbox).not.toBe(null);
  });
  const label = await screen.findByText('subject4');
  fireEvent.click(label);
  const cont = await screen.findByText('content4');
  expect(cont).not.toBe(null);
});

/**
* Opening read mail
*/
test('Click read mail', async () => {
  render(<App />);
  setNarrow();
  await waitFor(() => {
    const inbox = screen.getByText('Inbox');
    expect(inbox).not.toBe(null);
  });
  const label = await screen.findByText('subject6');
  fireEvent.click(label);
  const cont = await screen.findByText('content6');
  expect(cont).not.toBe(null);
});
