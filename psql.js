const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require("body-parser");
var { Client } = require('pg');


var client = new Client({
    user: 'fr',
    host: 'localhost',
    database: 'vmod_fr',
    password: 'foagura',
    port: 5432
})

client.connect((err) => {
  if (err) {
    console.log('error connecting: ' + err.stack);
    return;
  } else {
    console.log('success');　　//問題なければ「success」を
  }
});

const query = {
  text: 'SELECT * FROM t_usage_classified_rel WHERE chukoumoku_no=1.19'
};
client
  .query(query)
  .then((res) => {
    console.log(res.rows[0]);
    client.end();
  })
  .catch((e) => console.error(e.stack));
