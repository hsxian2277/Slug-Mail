const db = require('./db');

exports.getMailbox = async (req, res) => {
  const mailboxes = await db.selectMailbox(req.params.email, req.query.starred);
  res.status(200).json(mailboxes);
};

exports.getMail = async (req, res) => {
  const mails = await db.selectMail(req.params.email, req.query.mailbox,
    req.query.id, req.query.starred);
  res.status(200).json(mails);
};

exports.putMail = async (req, res) => {
  const code = await db.moveMail(req.params.email, req.query.id,
    req.query.unread, req.query.starred, req.query.mailbox);
  res.status(code).send();
};
