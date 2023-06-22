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
    return user.email.toString() === 'molly@books.com' ?
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
    const today = new Date();

    if (todayMorning.getHours() >= 12) {
      todayMorning.setHours(todayMorning.getHours() - 12);
    }
    if (todayNoon.getHours() < 12) {
      todayNoon.setHours(todayNoon.getHours() + 12);
    }
    yesterday.setDate(today.getDate() - 1);
    sameYearOneDigit.setMonth(todayMorning.getMonth() - 3);
    sameYearOneDigit.setDate(1);
    sameYearTwoDigit.setMonth(todayMorning.getMonth() - 3);
    sameYearTwoDigit.setDate(11);
    pastYear.setFullYear(todayMorning.getFullYear() - 2);
    const id = req.url.searchParams.get('id');
    if (req.url.searchParams.get('id') !== undefined &&
      req.url.searchParams.get('id') !== null) {
      if (id === '6') {
        return res(ctx.json([{
          id: '6',
          from: {name: 'fromname6', email: 'fromemail6'},
          to: {name: 'toname6', email: 'toemail6'},
          subject: 'subject6',
          received: sameYearTwoDigit.toISOString(),
          content: 'content6',
          unread: true,
          starred: false,
        }]));
      } else if (id === '1') {
        return res(ctx.json([{
          id: '1',
          from: {name: 'fromname1', email: 'fromemail1'},
          to: {name: 'toname1', email: 'toemail1'},
          subject: 'subject1',
          received: pastYear.toISOString(),
          content: 'content1',
          unread: true,
          starred: false,
        }]));
      } else if (id === '2') {
        return res(ctx.json([{
          id: '2',
          from: {name: 'fromname2', email: 'fromemail2'},
          to: {name: 'toname2', email: 'toemail2'},
          subject: 'subject2',
          received: todayMorning.toISOString(),
          content: 'content2',
          unread: true,
          starred: true,
        }]));
      } else if (id === '3') {
        return res(ctx.json([{
          id: '3',
          from: {name: 'fromname3', email: 'fromemail3'},
          to: {name: 'toname3', email: 'toemail3'},
          subject: 'subject3',
          received: sameYearOneDigit.toISOString(),
          content: 'content3',
          unread: true,
          starred: true,
        }]));
      } else if (id === '4') {
        return res(ctx.json([{
          id: '4',
          from: {name: 'fromname4', email: 'fromemail4'},
          to: {name: 'toname4', email: 'toemail4'},
          subject: 'subject4',
          received: yesterday.toISOString(),
          content: 'content4',
          unread: true,
          starred: true,
        }]));
      } else if (id === '5') {
        return res(ctx.json([{
          id: '5',
          from: {name: 'fromname5', email: 'fromemail5'},
          to: {name: 'toname5', email: 'toemail5'},
          subject: 'subject5',
          received: todayNoon.toISOString(),
          content: 'content5',
          unread: true,
          starred: true,
        }]));
      }
    } else if (req.url.searchParams.get('starred') !== undefined &&
      req.url.searchParams.get('starred') !== null) {
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
          starred: true,
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
          starred: false,
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
    } else {
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
          starred: false,
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
    }
  }),
  rest.put(MailURL, async (req, res, ctx) => {
    return res(ctx.status(204, 'successful'));
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
* Open an mail then close it
*/
test('Click mail then close', async () => {
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
  const close = await screen.findByLabelText('closemail');
  expect(close).not.toBe(null);
  fireEvent.click(close);
  const title = await screen.findByText('Inbox');
  expect(title).not.toBe(null);
});

/**
* Click an email from today noon
*/
test('Click mail sent from today noon then close', async () => {
  render(<App />);
  setNarrow();
  await waitFor(() => {
    const inbox = screen.getByText('Inbox');
    expect(inbox).not.toBe(null);
  });
  const label = await screen.findByLabelText('fromname6');
  fireEvent.click(label);
  await waitFor(() => {
    const cont = screen.getByText('fromemail6');
    expect(cont).not.toBe(null);
  }, {timeout: 10000});
});

/**
* Click an email from yesterday
*/
test('Click mail sent from yesterday then close', async () => {
  render(<App />);
  setNarrow();
  await waitFor(() => {
    const inbox = screen.getByText('Inbox');
    expect(inbox).not.toBe(null);
  });
  const label = await screen.findByLabelText('fromname4');
  fireEvent.click(label);
  await waitFor(() => {
    const cont = screen.getByText('fromemail4');
    expect(cont).not.toBe(null);
  }, {timeout: 10000});
});

/**
* Click an email from the same year
*/
test('Click mail sent from same year with one digit', async () => {
  render(<App />);
  setNarrow();
  await waitFor(() => {
    const inbox = screen.getByText('Inbox');
    expect(inbox).not.toBe(null);
  });
  const label = await screen.findByLabelText('fromname3');
  fireEvent.click(label);
  await waitFor(() => {
    const cont = screen.getByText('fromemail3');
    expect(cont).not.toBe(null);
  }, {timeout: 10000});
});

/**
* Click an email from today morning
*/
test('Click mail sent from today morning then close', async () => {
  render(<App />);
  setNarrow();
  await waitFor(() => {
    const inbox = screen.getByText('Inbox');
    expect(inbox).not.toBe(null);
  });
  const label = await screen.findByLabelText('fromname2');
  fireEvent.click(label);
  await waitFor(() => {
    const cont = screen.getByText('fromemail2');
    expect(cont).not.toBe(null);
  }, {timeout: 10000});
});

/**
* Click an email from last year
*/
test('Click mail sent from last year then close', async () => {
  render(<App />);
  setNarrow();
  await waitFor(() => {
    const inbox = screen.getByText('Inbox');
    expect(inbox).not.toBe(null);
  });
  const label = await screen.findByLabelText('fromname1');
  fireEvent.click(label);
  await waitFor(() => {
    const cont = screen.getByText('fromemail1');
    expect(cont).not.toBe(null);
  }, {timeout: 10000});
});

/**
* Click star button
*/
test('Click the star button in a mail', async () => {
  render(<App />);
  setNarrow();
  await waitFor(() => {
    const inbox = screen.getByText('Inbox');
    expect(inbox).not.toBe(null);
  });
  const label = await screen.findByLabelText('fromname2');
  fireEvent.click(label);
  await waitFor(() => {
    const cont = screen.getByText('fromemail2');
    expect(cont).not.toBe(null);
  }, {timeout: 1000});
  const unstar = await screen.findByLabelText('unstar');
  fireEvent.click(unstar);
  await waitFor(() => {
    const unstar = screen.getByLabelText('unstar');
    expect(unstar).not.toBe(null);
  }, {timeout: 10000});
});

/**
* Click trash button
*/
test('Click the trash button in a mail', async () => {
  render(<App />);
  setNarrow();
  await waitFor(() => {
    const inbox = screen.getByText('Inbox');
    expect(inbox).not.toBe(null);
  });
  const label = await screen.findByLabelText('fromname1');
  fireEvent.click(label);
  await waitFor(() => {
    const cont = screen.getByText('fromemail1');
    expect(cont).not.toBe(null);
  }, {timeout: 1000});
  const unstar = await screen.findByLabelText('delete');
  fireEvent.click(unstar);
  await waitFor(() => {
    const unstar = screen.getByText('Inbox');
    expect(unstar).not.toBe(null);
  }, {timeout: 1000});
});

/**
* Click unread button
*/
test('Click the unread button in a mail', async () => {
  render(<App />);
  setNarrow();
  await waitFor(() => {
    const inbox = screen.getByText('Inbox');
    expect(inbox).not.toBe(null);
  });
  const label = await screen.findByLabelText('fromname1');
  fireEvent.click(label);
  await waitFor(() => {
    const cont = screen.getByText('fromemail1');
    expect(cont).not.toBe(null);
  }, {timeout: 1000});
  const unstar = await screen.findByLabelText('unread');
  fireEvent.click(unstar);
  await waitFor(() => {
    const unstar = screen.getByText('Inbox');
    expect(unstar).not.toBe(null);
  }, {timeout: 1000});
});

/**
* Click to star an email from last year
*/
test('Click the star button of mail from last year in a mail', async () => {
  render(<App />);
  setNarrow();
  await waitFor(() => {
    const inbox = screen.getByText('Inbox');
    expect(inbox).not.toBe(null);
  });
  const label = await screen.findByLabelText('fromname1');
  fireEvent.click(label);
  await waitFor(() => {
    const cont = screen.getByText('fromemail1');
    expect(cont).not.toBe(null);
  }, {timeout: 1000});
  const star = await screen.findByLabelText('star');
  fireEvent.click(star);
  await waitFor(() => {
    const star = screen.getByLabelText('star');
    expect(star).not.toBe(null);
  }, {timeout: 3000});
});
