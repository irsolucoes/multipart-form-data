'use strict';

const express = require('express');
const multer = require('multer');
const morgan = require('morgan');

const app = express();

app.use(morgan('dev'));
app.use(multer({ dest: '/tmp' }).any());
app.use(express.static('./demo'));
app.use('/src', express.static('./src'));

app.post('/api/multipart', (req, res) => {
  console.log(req.body);
  console.log(req.files);
  res.send(req.body);
});

app.listen(9090, () => {
  console.log('server listening at port 9090');
});
