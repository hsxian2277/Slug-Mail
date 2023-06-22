const supertest = require('supertest');
const http = require('http');

const db = require('./db');
const app = require('../app');

let server;

beforeAll(() => {
  server = http.createServer(app);
  server.listen();
  request = supertest(server);
  return db.reset();
});

afterAll((done) => {
  server.close(done);
  db.shutdown();
});

const molly = {
  email: 'molly@books.com',
  password: 'mollymember',
};

const anna = {
  email: 'anna@books.com',
  password: 'annaadmin',
};

const invalid = {
  email: 'invalid@books.com',
  password: 'invalid',
};

const invalid2 = {
  email: 'molly@books.com',
  password: 'invalid',
};

/**
* Invalid url
*/
test('GET Invalid URL', async () => {
  await request.get('/v0/so-not-a-real-end-point-ba-bip-de-doo-da/')
    .expect(404);
});

/**
* Invalid user
*/
test('Login with invalid credentials', async () => {
  await request.post('/v0/login')
    .send(invalid)
    .expect(401);
});

/**
* Invalid password
*/
test('Login with invalid password', async () => {
  await request.post('/v0/login')
    .send(invalid2)
    .expect(401);
});

/**
* Attempting to access home before logging in
*/
test('GET Before logging in', async () => {
  await request.get('/v0/mail/anna%40books.com?mailbox=Inbox')
    .expect(401);
});

/**
* Get list of mails
*/
test('GET mails', async () => {
  let token = undefined;
  await request.post('/v0/login')
    .send(molly)
    .expect(200)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.name).toEqual('Molly');
      expect(data.body.email).toEqual('molly@books.com');
      expect(data.body.accessToken).toBeDefined();
      token = data.body.accessToken;
    });
  expect(token).toBeDefined();
  await request.get('/v0/mail/molly%40books.com?mailbox=Inbox')
    .set('Authorization', 'Bearer ' + token)
    .expect(200)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body.length).toEqual(5);
    });
});

/**
* Get list of mailboxes
*/
test('GET mailboxes', async () => {
  let token = undefined;
  await request.post('/v0/login')
    .send(anna)
    .expect(200)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.name).toEqual('Anna');
      expect(data.body.email).toEqual('anna@books.com');
      expect(data.body.accessToken).toBeDefined();
      token = data.body.accessToken;
    });
  expect(token).toBeDefined();
  await request.get('/v0/mailbox/anna%40books.com')
    .set('Authorization', 'Bearer ' + token)
    .expect(200)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body.length).toEqual(3);
    });
});

/**
* Get list of mailboxes without authorization
*/
test('GET mailboxes without invalid token', async () => {
  await request.post('/v0/login')
    .send(anna)
    .expect(200)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.name).toEqual('Anna');
      expect(data.body.email).toEqual('anna@books.com');
      expect(data.body.accessToken).toBeDefined();
    });
  await request.get('/v0/mailbox/anna%40books.com')
    .set('Authorization', 'Bearer invalidtoken')
    .expect(403);
});

/**
* Get an email by id
*/
test('GET mail by id', async () => {
  let token = undefined;
  await request.post('/v0/login')
    .send(molly)
    .expect(200)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.name).toEqual('Molly');
      expect(data.body.email).toEqual('molly@books.com');
      expect(data.body.accessToken).toBeDefined();
      token = data.body.accessToken;
    });
  expect(token).toBeDefined();
  let id = undefined;
  await request.get('/v0/mail/molly%40books.com?mailbox=Inbox')
    .set('Authorization', 'Bearer ' + token)
    .expect(200)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body.length).toEqual(5);
      id = data.body[0].id;
    });
  expect(id).toBeDefined();
  await request.get('/v0/mail/molly%40books.com?id=' + id)
    .set('Authorization', 'Bearer ' + token)
    .expect(200)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body.length).toEqual(1);
      expect(data.body[0].id).toEqual(id);
    });
});

/**
* Get number of starred mails
*/
test('GET number of starred mails', async () => {
  let token = undefined;
  await request.post('/v0/login')
    .send(molly)
    .expect(200)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.name).toEqual('Molly');
      expect(data.body.email).toEqual('molly@books.com');
      expect(data.body.accessToken).toBeDefined();
      token = data.body.accessToken;
    });
  expect(token).toBeDefined();
  await request.get('/v0/mailbox/molly%40books.com?starred=true')
    .set('Authorization', 'Bearer ' + token)
    .expect(200)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body[0].count).toEqual('1');
      expect(data.body[0].name).toEqual('Starred');
    });
});

/**
* Get starred mails
*/
test('GET mail by starred', async () => {
  let token = undefined;
  await request.post('/v0/login')
    .send(molly)
    .expect(200)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.name).toEqual('Molly');
      expect(data.body.email).toEqual('molly@books.com');
      expect(data.body.accessToken).toBeDefined();
      token = data.body.accessToken;
    });
  expect(token).toBeDefined();
  await request.get('/v0/mail/molly%40books.com?starred=true')
    .set('Authorization', 'Bearer ' + token)
    .expect(200)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body.length).toEqual(1);
      expect(data.body[0].from.name).toEqual('Gabriel Attyeo');
      expect(data.body[0].starred).toEqual(true);
    });
});

/**
* Update starred or unread property of an email by id
*/
test('PUT mail with modified propertiese at same mailbox', async () => {
  let token = undefined;
  await request.post('/v0/login')
    .send(molly)
    .expect(200)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.name).toEqual('Molly');
      expect(data.body.email).toEqual('molly@books.com');
      expect(data.body.accessToken).toBeDefined();
      token = data.body.accessToken;
    });
  expect(token).toBeDefined();
  let id = undefined;
  let starred = undefined;
  let unread = undefined;

  await request.get('/v0/mail/molly%40books.com?mailbox=Inbox')
    .set('Authorization', 'Bearer ' + token)
    .expect(200)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body.length).toEqual(5);
      id = data.body[0].id;
      starred = data.body[0].starred;
      unread = data.body[0].unread;
    });
  expect(id).toBeDefined();
  expect(starred).toBeDefined();
  expect(unread).toBeDefined();
  let path = '/v0/mail/molly%40books.com?id=' + id;
  path += '&unread=' + !unread + '&starred=' + !starred;
  await request.put(path)
    .set('Authorization', 'Bearer ' + token)
    .expect(204);
  await request.get('/v0/mail/molly%40books.com?id=' + id)
    .set('Authorization', 'Bearer ' + token)
    .expect(200)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body.length).toEqual(1);
      expect(data.body[0].id).toEqual(id);
      expect(data.body[0].starred).toEqual(!starred);
      expect(data.body[0].unread).toEqual(!unread);
    });
});

/**
* Move an email to another mailbox
*/
test('PUT mail with modified propertiese at different mailbox', async () => {
  let token = undefined;
  await request.post('/v0/login')
    .send(molly)
    .expect(200)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.name).toEqual('Molly');
      expect(data.body.email).toEqual('molly@books.com');
      expect(data.body.accessToken).toBeDefined();
      token = data.body.accessToken;
    });
  expect(token).toBeDefined();
  let id = undefined;
  let starred = undefined;
  let unread = undefined;

  await request.get('/v0/mail/molly%40books.com?mailbox=Inbox')
    .set('Authorization', 'Bearer ' + token)
    .expect(200)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body.length).toEqual(5);
      id = data.body[0].id;
      starred = data.body[0].starred;
      unread = data.body[0].unread;
    });
  expect(id).toBeDefined();
  expect(starred).toBeDefined();
  expect(unread).toBeDefined();
  let path = '/v0/mail/molly%40books.com?id=' + id;
  path += '&unread=' + !unread + '&starred=' + !starred;
  path += '&mailbox=Trash';
  await request.put(path)
    .set('Authorization', 'Bearer ' + token)
    .expect(204);
  await request.get('/v0/mail/molly%40books.com?id=' + id)
    .set('Authorization', 'Bearer ' + token)
    .expect(200)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body.length).toEqual(1);
      expect(data.body[0].id).toEqual(id);
      expect(data.body[0].starred).toEqual(!starred);
      expect(data.body[0].unread).toEqual(!unread);
    });
  await request.get('/v0/mail/molly%40books.com?mailbox=Trash')
    .set('Authorization', 'Bearer ' + token)
    .expect(200)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body.length).toEqual(7);
      expect(data.body[6].id).toEqual(id);
    });
});
