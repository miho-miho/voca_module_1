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
  text: "SELECT t_usage.usage_id,t_usage.word_id,t_word.basic,t_usage.explanation FROM t_usage_scene_rel JOIN t_usage ON t_usage_scene_rel.usage_id=t_usage.usage_id JOIN t_word ON t_usage.word_id=t_word.id JOIN t_scene ON t_usage_scene_rel.scene_id=t_scene.id"
};
client
  .query(query)
  .then((res) => {
    var word_obj = res.rows;
    console.log(word_obj);
    client.end();
  })
  .catch((e) => console.error(e.stack));
