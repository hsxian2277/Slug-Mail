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
    return res(ctx.json(['Inbox', 'Sent', 'Trash']));
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

beforeAll(() => server.listen({onUnhandledRequest: 'bypass'}));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

/**
* Login
*/
test('Login from home', async () => {
  render(<App />);
  setNarrow();
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
* Check title at top bar
*/
test('Topbar exists after login', async () => {
  render(<App />);
  setNarrow();
  await waitFor(() => {
    const name = screen.getByLabelText('title');
    expect(name).not.toBe(null);
  });
  const menu = screen.getByLabelText('menu');
  expect(menu).not.toBe(null);
});

/**
* Click to open menu drawer
*/
test('Click menu bar', async () => {
  render(<App />);
  setNarrow();
  const menu = screen.getByLabelText('menu');
  expect(menu).not.toBe(null);
  fireEvent.click(menu);
  await waitFor(() => {
    const drawer = screen.getByLabelText('drawer');
    expect(drawer).not.toBe(null);
  });
});

/**
* Click to logout
*/
test('Logout', async () => {
  render(<App />);
  setNarrow();
  const logout = screen.getByLabelText('logout');
  expect(logout).not.toBe(null);
  fireEvent.click(logout);
  await waitFor(() => {
    const email = screen.getByPlaceholderText('Enter username');
    expect(email).not.toBe(null);
  });
  const passwd = screen.getByPlaceholderText('Enter password');
  expect(passwd).not.toBe(null);
  expect(localStorage.getItem('user')).toBe(null);
});
