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

// Set up mock api
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
    // Initialize different dates for code coverage
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
    return res(ctx.json([
      {
        id: '1',
        from: {name: 'fromname1', email: 'fromemail1'},
        to: {name: 'toname1', email: 'toemail1'},
        subject: 'subject1',
        received: pastYear.toISOString(),
        content: 'content1',
      },
      {
        id: '2',
        from: {name: 'fromname2', email: 'fromemail2'},
        to: {name: 'toname2', email: 'toemail2'},
        subject: 'subject2',
        received: todayMorning.toISOString(),
        content: 'content2',
      },
      {
        id: '3',
        from: {name: 'fromname3', email: 'fromemail3'},
        to: {name: 'toname3', email: 'toemail3'},
        subject: 'subject3',
        received: sameYearOneDigit.toISOString(),
        content: 'content3',
      },
      {
        id: '4',
        from: {name: 'fromname4', email: 'fromemail4'},
        to: {name: 'toname4', email: 'toemail4'},
        subject: 'subject4',
        received: yesterday.toISOString(),
        content: 'content4',
      },
      {
        id: '5',
        from: {name: 'fromname5', email: 'fromemail5'},
        to: {name: 'toname5', email: 'toemail5'},
        subject: 'subject5',
        received: todayNoon.toISOString(),
        content: 'content5',
      },
      {
        id: '6',
        from: {name: 'fromname6', email: 'fromemail6'},
        to: {name: 'toname6', email: 'toemail6'},
        subject: 'subject6',
        received: sameYearTwoDigit.toISOString(),
        content: 'content6',
      },
    ]));
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
* Open leftbar of drawer
*/
test('Click to open leftbar after login', async () => {
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
});

/**
* Click drawer to switch mailbox
*/
test('Click to switch mailbox', async () => {
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
  fireEvent.click(trash);
  await waitFor(() => {
    const current = screen.getByLabelText('Trash');
    expect(current).not.toBe(null);
  });
});

/**
* Click drawer to refresh box
*/
test('Click to switch mailbox to same box', async () => {
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
  fireEvent.click(screen.getByLabelText('Inbox'));
  await waitFor(() => {
    const current = screen.getByLabelText('Inbox');
    expect(current).not.toBe(null);
  });
});
