const puppeteer = require('puppeteer');
const http = require('http');
const path = require('path');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

require('dotenv').config();
const app = require('../../backend/src/app');
const { type } = require('os');
// const { default: test } = require('node:test');

let backend;
let frontend;
let browser;
let page;

beforeAll(() => {
  backend = http.createServer(app);
  backend.listen(3010, () => {
    console.log('Backend Running at http://localhost:3010');
  });
  frontend = http.createServer(
    express()
      .use('/v0', createProxyMiddleware({ 
        target: 'http://localhost:3010/',
        changeOrigin: true}))
      .use('/static', express.static(
        path.join(__dirname, '..', '..', 'frontend', 'build', 'static')))
      .get('*', function(req, res) {
        res.sendFile('index.html', 
            {root:  path.join(__dirname, '..', '..', 'frontend', 'build')})
      })
  );
  frontend.listen(3020, () => {
    console.log('Frontend Running at http://localhost:3020');
  });
});

afterAll((done) => {
  backend.close(() => { 
    frontend.close(done);
  });
});

beforeEach(async () => {
  browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--headless',
    ],
  });
  page = await browser.newPage();
  await page.setViewport({height: 667, width: 375});
});

afterEach(async () => {
  await browser.close();
});

/**
* Login page
*/
test('Initial login page', async () => {
  await page.goto('http://localhost:3020');
  const label = await page.$('aria/title');
  let cont = await (await label.getProperty('textContent')).jsonValue();
  expect(cont).toBe('Login');
  const button = await page.$('aria/loginButton[role="button"]');
  cont = await (await button.getProperty('textContent')).jsonValue();
  expect(cont).toBe('Sign in');
});

/**
* Login with wrong credentials
*/
test('Login with incorrect credentials', async () => {
  await page.goto('http://localhost:3020');
  const label = await page.$('aria/title');
  let cont = await (await label.getProperty('textContent')).jsonValue();
  expect(cont).toBe('Login');
  const button = await page.$('aria/loginButton[role="button"]');
  cont = await (await button.getProperty('textContent')).jsonValue();
  expect(cont).toBe('Sign in');
  await page.click('aria/username');
  await page.keyboard.type('invalid@books.com');
  await page.click('aria/password');
  await page.keyboard.type('invalidmember');
  await page.click('#button');
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("Incorrect Username or password")',
  );
  const title = await page.$('aria/title');
  cont = await (await title.getProperty('textContent')).jsonValue();
  expect(cont).toBe('Login');
});

/**
* Login with correct credentials
*/
test('Login with correct credentials', async () => {
  await page.goto('http://localhost:3020');
  const label = await page.$('aria/title');
  let cont = await (await label.getProperty('textContent')).jsonValue();
  expect(cont).toBe('Login');
  const button = await page.$('aria/loginButton[role="button"]');
  cont = await (await button.getProperty('textContent')).jsonValue();
  expect(cont).toBe('Sign in');
  await page.click('aria/username');
  await page.keyboard.type('molly@books.com');
  await page.click('aria/password');
  await page.keyboard.type('mollymember');
  await page.click('#button');
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("Inbox")',
  );
  const title = await page.$('aria/title');
  cont = await (await title.getProperty('textContent')).jsonValue();
  expect(cont).toBe('Molly\'s Inbox');
});

/**
* Use logout button at home
*/
test('Login then logout', async() => {
  await page.goto('http://localhost:3020');
  const label = await page.$('aria/title');
  let cont = await (await label.getProperty('textContent')).jsonValue();
  const button = await page.$('aria/loginButton[role="button"]');
  cont = await (await button.getProperty('textContent')).jsonValue();
  await page.click('aria/username');
  await page.keyboard.type('molly@books.com');
  await page.click('aria/password');
  await page.keyboard.type('mollymember');
  await page.click('#button');
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("Inbox")',
  );
  let title = await page.$('aria/title');
  cont = await (await title.getProperty('textContent')).jsonValue();
  expect(cont).toBe('Molly\'s Inbox');
  await page.click('aria/logout');
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("Login")',
  );
  title = await page.$('aria/title');
  cont = await (await title.getProperty('textContent')).jsonValue();
  expect(cont).toBe('Login');
});

/**
* Check mail list at initial login
*/
test('Login then see mail list', async() => {
  await page.goto('http://localhost:3020');
  const label = await page.$('aria/title');
  let cont = await (await label.getProperty('textContent')).jsonValue();
  const button = await page.$('aria/loginButton[role="button"]');
  cont = await (await button.getProperty('textContent')).jsonValue();
  await page.click('aria/username');
  await page.keyboard.type('molly@books.com');
  await page.click('aria/password');
  await page.keyboard.type('mollymember');
  await page.click('#button');
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("Gabriel")',
    'document.querySelector("body").innerText.includes("Saul")',
    'document.querySelector("body").innerText.includes("Gwen")',
    'document.querySelector("body").innerText.includes("Phebe")',
  );
  let title = await page.$('aria/title');
  cont = await (await title.getProperty('textContent')).jsonValue();
  expect(cont).toBe('Molly\'s Inbox');
  const mail = await page.$('aria/maillist');
  cont = await (await mail.getProperty('textContent')).jsonValue();
  expect(cont.search(/Gabriel/)).toBeGreaterThan(-1);
  expect(cont.search(/Saul/)).toBeGreaterThan(-1);
  expect(cont.search(/Gwen/)).toBeGreaterThan(-1);
  expect(cont.search(/Phebe/)).toBeGreaterThan(-1);
});

/**
* Open menu drawer and check mailboxes
*/
test('Login then open drawer', async() => {
  await page.goto('http://localhost:3020');
  const label = await page.$('aria/title');
  let cont = await (await label.getProperty('textContent')).jsonValue();
  const button = await page.$('aria/loginButton[role="button"]');
  cont = await (await button.getProperty('textContent')).jsonValue();
  await page.click('aria/username');
  await page.keyboard.type('molly@books.com');
  await page.click('aria/password');
  await page.keyboard.type('mollymember');
  await page.click('#button');
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("Inbox")',
  );
  await page.click('aria/menu[role="button"]');
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("Inbox")',
    'document.querySelector("body").innerText.includes("Sent")',
    'document.querySelector("body").innerText.includes("Trash")',
  );
  const list = await page.$('aria/boxlist');
  cont = await (await list.getProperty('textContent')).jsonValue();
  expect(cont.search(/Inbox/)).toBeGreaterThan(-1);
  expect(cont.search(/Sent/)).toBeGreaterThan(-1);
  expect(cont.search(/Trash/)).toBeGreaterThan(-1);
});

/**
* Use menu drawer to change mailbox
*/
test('Click on drawer to change mailbox', async() => {
  await page.goto('http://localhost:3020');
  const label = await page.$('aria/title');
  let cont = await (await label.getProperty('textContent')).jsonValue();
  const button = await page.$('aria/loginButton[role="button"]');
  cont = await (await button.getProperty('textContent')).jsonValue();
  await page.click('aria/username');
  await page.keyboard.type('molly@books.com');
  await page.click('aria/password');
  await page.keyboard.type('mollymember');
  await page.click('#button');
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("Inbox")',
  );
  await page.click('aria/menu[role="button"]');
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("Trash")',
  );
  await page.click('aria/Trash');
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("Molly\'s Trash")',
  );
  title = await page.$('aria/title');
  cont = await (await title.getProperty('textContent')).jsonValue();
  expect(cont).toBe("Molly\'s Trash");
  const mail = await page.$('aria/maillist');
  cont = await (await mail.getProperty('textContent')).jsonValue();
  expect(cont.search(/Frannie/)).toBeGreaterThan(-1);
  expect(cont.search(/Kellina/)).toBeGreaterThan(-1);
  expect(cont.search(/Maressa/)).toBeGreaterThan(-1);
  expect(cont.search(/Ruperta/)).toBeGreaterThan(-1);
});

/**
* Click on star to star a mail
* Note: this test will fail due to running out of mail if db
* is not resetting
*/
test('Click on star to add a mail to starred', async() => {
  await page.goto('http://localhost:3020');
  const label = await page.$('aria/title');
  let cont = await (await label.getProperty('textContent')).jsonValue();
  const button = await page.$('aria/loginButton[role="button"]');
  cont = await (await button.getProperty('textContent')).jsonValue();
  await page.click('aria/username');
  await page.keyboard.type('molly@books.com');
  await page.click('aria/password');
  await page.keyboard.type('mollymember');
  await page.click('#button');
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("Inbox")',
  );
  await page.click('aria/menu[role="button"]');
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("Starred")',
  );
  const list = await page.$('aria/boxlist');
  cont = await (await list.getProperty('textContent')).jsonValue();
  let count = 0;
  if (cont.search(/1/) > -1) {
    count += 1;
  } else if (cont.search(/0/) > -1) {
    count += 1;
  }
  expect(count).toBe(1);
  await page.click('aria/Inbox');
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("Molly\'s Inbox")',
  );
  await page.click('aria/1[role="button"]');
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("Gabriel Attyeo")',
  );
  await page.click('aria/menu[role="button"]');
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("Starred")',
  );
  cont = await (await list.getProperty('textContent')).jsonValue();
  if (cont.search(/1/) > -1) {
    count += 1;
  } else if (cont.search(/0/) > -1) {
    count += 1;
  }
  expect(count).toBe(2);
  await page.click('aria/Inbox');
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("Molly\'s Inbox")',
  );
  await page.click('aria/1[role="button"]');
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("Gabriel Attyeo")',
  );
});

/**
* Click on mail to view it
*/
test('Click on a mail to view it', async() => {
  await page.goto('http://localhost:3020');
  const label = await page.$('aria/title');
  let cont = await (await label.getProperty('textContent')).jsonValue();
  const button = await page.$('aria/loginButton[role="button"]');
  cont = await (await button.getProperty('textContent')).jsonValue();
  await page.click('aria/username');
  await page.keyboard.type('molly@books.com');
  await page.click('aria/password');
  await page.keyboard.type('mollymember');
  await page.click('#button');
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("Gwen Boorman")',
  );
  await page.click('aria/Gwen Boorman');
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("Gwen Boorman")',
  );
  const mail = await page.$('aria/content');
  cont = await (await mail.getProperty('textContent')).jsonValue();
  expect(cont.search(/Nullam/)).toBeGreaterThan(-1);
});
