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
  text: "SELECT t_instance.id FROM t_instance JOIN t_usage ON t_usage_inst_rel.inst_id=t_instance.id WHERE t_usage_inst_rel='1' ORDER BY t_usage_inst_rel.disp_priority"
};
client
  .query(query)
  .then((res) => {
    var word_obj = res.rows;
    console.log(word_obj);
    client.end();
  })
  .catch((e) => console.error(e.stack));
