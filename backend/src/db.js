const {Pool} = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const secrets = require('./secrets.json');

const pool = new Pool({
  host: 'localhost',
  port: '5432',
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

// Get login info for user
exports.getLogin = async (email, password) => {
  const select = 'SELECT * from account WHERE email = $1';
  const query = {
    text: select,
    values: [email],
  };
  const {rows} = await pool.query(query);
  if (rows.length > 0) {
    if (email == rows[0].email && bcrypt.compareSync(password, rows[0].pw)) {
      const accessToken = jwt.sign(
        {email: email},
        secrets.accessToken, {
          expiresIn: '30m',
          algorithm: 'HS256',
        });
      return {email: rows[0].email,
        name: rows[0].username, accessToken: accessToken};
    } else {
      return undefined;
    }
  }
  return undefined;
};

// Get list of mailboxes
exports.selectMailbox = async (email, starred) => {
  // If star is given, count number of starred mails
  if (starred) {
    let select = 'SELECT * FROM mailbox WHERE email = $1';
    let query = {
      text: select,
      values: [email],
    };
    let {rows} = await pool.query(query);
    const ids = [];
    for (let i = 0; i < rows.length; i++) {
      ids.push(rows[i].boxid);
    }
    let count = 0;
    for (let i = 0; i < ids.length; i++) {
      select = 'SELECT * from mail WHERE boxid = $1 AND starred = $2';
      query = {
        text: select,
        values: [ids[i], starred],
      };
      rows = (await pool.query(query)).rows;
      count += rows.length;
    }
    return [{name: 'Starred', count: count.toString()}];
  // Else count number of mails in each mailbox
  } else {
    let select = 'SELECT * FROM mailbox WHERE email = $1';
    let query = {
      text: select,
      values: [email],
    };
    const {rows} = await pool.query(query);
    const boxes = [];
    for (let i = 0; i < rows.length; i++) {
      boxes.push({name: rows[i].boxname, id: rows[i].boxid});
    }
    const res = [];
    for (let i = 0; i < boxes.length; i++) {
      select = 'SELECT * from mail WHERE boxid = $1';
      query = {
        text: select,
        values: [boxes[i].id],
      };
      const {rows} = await pool.query(query);
      res.push({name: boxes[i].name, count: rows.length.toString()});
    }
    return res;
  };
};

// Get list of mails
exports.selectMail = async (email, mailbox, id, starred) => {
  // If id is given, select by id
  if (id !== undefined) {
    const select = 'SELECT * from mail WHERE mailid = $1';
    const query = {
      text: select,
      values: [id],
    };
    const {rows} = await pool.query(query);
    rows[0].email.id = rows[0].mailid;
    rows[0].email.unread = rows[0].unread;
    rows[0].email.starred = rows[0].starred;
    return [rows[0].email];
  // If star is given, select all starred mail
  } else if (starred !== undefined) {
    let select = 'SELECT * FROM mailbox WHERE email = $1';
    let query = {
      text: select,
      values: [email],
    };
    let rows = (await pool.query(query)).rows;
    const boxids = [];
    for (let i = 0; i < rows.length; i++) {
      boxids.push(rows[i].boxid);
    }
    const mails = [];
    for (let i = 0; i < boxids.length; i++) {
      select = 'SELECT * from mail WHERE boxid = $1 AND starred = $2';
      query = {
        text: select,
        values: [boxids[i], starred],
      };
      rows = (await pool.query(query)).rows;
      for (let j = 0; j < rows.length; j++) {
        rows[j].email.id = rows[j].mailid;
        rows[j].email.id = rows[j].mailid;
        rows[j].email.unread = rows[j].unread;
        rows[j].email.starred = rows[j].starred;
        mails.push(rows[j].email);
      }
    }
    return mails;
  // else select all mail
  } else {
    let select = 'SELECT * FROM mailbox WHERE email = $1 AND boxname = $2';
    let query = {
      text: select,
      values: [email, mailbox],
    };
    let rows = (await pool.query(query)).rows;
    const boxids = [];
    for (let i = 0; i < rows.length; i++) {
      boxids.push(rows[0].boxid);
    }
    const mails = [];
    for (let i = 0; i < boxids.length; i++) {
      select = 'SELECT * from mail WHERE boxid = $1';
      query = {
        text: select,
        values: [boxids[i]],
      };
      rows = (await pool.query(query)).rows;
      for (let j = 0; j < rows.length; j++) {
        rows[j].email.id = rows[j].mailid;
        rows[j].email.id = rows[j].mailid;
        rows[j].email.unread = rows[j].unread;
        rows[j].email.starred = rows[j].starred;
        mails.push(rows[j].email);
      }
    }
    return mails;
  }
};


// Update/move mail
exports.moveMail = async (email, id, unread, starred, mailbox) => {
  // Delete the email by id and return it
  const del = 'DELETE FROM mail WHERE mailid = $1 RETURNING *';
  let query = {
    text: del,
    values: [id],
  };
  const res = await pool.query(query);
  let destination = res.rows[0].boxid;
  // If mailbox is not given, update on spot
  if (mailbox !== undefined) {
    const select = 'SELECT * FROM mailbox WHERE email = $1 AND boxname = $2';
    query = {
      text: select,
      values: [email, mailbox],
    };
    const {rows} = await pool.query(query);
    destination = rows[0].boxid;
  }
  let insert = 'INSERT INTO mail(mailid, boxid, email, unread, starred)';
  insert += ' VALUES ($1, $2, $3, $4, $5)';
  query = {
    text: insert,
    values: [id, destination, res.rows[0].email, unread, starred],
  };
  await pool.query(query);
  return 204;
};
