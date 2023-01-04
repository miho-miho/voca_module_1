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
  text: "SELECT rui,chukoumoku_no,chukomoku,basic,midasi FROM t_usage_classified_rel JOIN t_usage ON t_usage_classified_rel.usage_id=t_usage.usage_id JOIN t_word ON t_usage.word_id=t_word.word_id WHERE t_usage_classified_rel.chukoumoku_no='4.30'"
};
client
  .query(query)
  .then((res) => {
    console.log(res.rows);
    client.end();
  })
  .catch((e) => console.error(e.stack));
