
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

export const getTableData  = (req, res, next) => {
const query = {
  text: "SELECT t_usage.usage_id,t_usage.word_id,rui,chukoumoku_no,chukoumoku,basic,midasi FROM t_usage_classified_rel JOIN t_usage ON t_usage_classified_rel.usage_id=t_usage.usage_id JOIN t_word ON t_usage.word_id=t_word.id WHERE t_usage_classified_rel.chukoumoku_no='4.30'"
};
client
  .query(query)
  .then((res) => {
    return res.rows
    client.end();
  })
  .catch((e) => console.error(e.stack));
};
