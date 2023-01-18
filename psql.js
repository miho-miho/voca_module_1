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
  text: 'SELECT t_word.basic, t_usage.usage_id, t_usage.explanation, T.targetlanguage, T.trans, T.function, T.pronun, T.explanation as t_ex, T.xml_file_name, T.xpath, T.web_url FROM t_usage JOIN t_usage_scene_rel ON t_usage.usage_id=t_usage_scene_rel.usage_id JOIN t_word ON t_usage.word_id = t_word.id JOIN (SELECT * FROM t_usage_inst_rel JOIN t_instance ON t_usage_inst_rel.inst_id = t_instance.id ORDER BY t_usage_inst_rel.disp_priority) as T ON T.usage_id=t_usage.usage_id WHERE scene_id=1 ORDER BY t_usage_scene_rel.usage_id, t_usage.disp_priority'
};
client
  .query(query)
  .then((result) => {
    var result_list = result.rows
    //console.log(result.rows);
    var id_list = [];
    for (var i of result_list) {
      id_list.push(i.usage_id)
    }
    var instances = []
    id_list = Array.from(new Set(id_list))
    for (var id of id_list) {
      var a = result_list.filter((val) => {
        return val.usage_id === id
      });
      instances.push(a)
    }
    //console.log(instances);
    var rObj = {}
    //rObj.midasi = result_list[0].basic
    rObj.insts = []
    instances.forEach((item) => {
      var li = []
      for (var e of item) {
        var ex = e.explanation
        e = (({ basic, usage_id, explanation, ...rest }) => rest)(e)
        li.push(e)
      }
      var result = {"usage":ex, "inst":li}
      rObj.insts.push(result)
    });
    console.log([rObj]);
    client.end();
  })
  .catch((e) => console.error(e.stack));
/*
var result_list = [
  {
basic: 'aller',
usage_id: 59,
explanation: '行く。～しに行く。\n＊ aller には「順調である、元気である」という意味もある。',
targetlanguage: ' On va au cinéma ?',
trans: '（私たちは）映画に行こうか？',
function: 'null',
pronun: '',
t_ex: null,
xml_file_name: 'instances054.xml',
xpath: '/gmod:instances[1]/gmod:instanceblock[2]/gmod:instance[1]',
web_url: null
},
{
basic: 'aller',
usage_id: 59,
explanation: '行く。～しに行く。\n＊ aller には「順調である、元気である」という意味もある。',
targetlanguage: ' Je compte aller en Mongolie. ',
trans: 'モンゴルに行こうと思ってるのよ。',
function: '予定を言う',
pronun: '',
t_ex: 'yes',
xml_file_name: 'fr10.xml',
xpath: '/dmodule[1]/body[1]/dialogue[1]/line[2]/sentence[1]',
web_url: null
},
{
basic: 'aller',
usage_id: 59,
explanation: '行く。～しに行く。\n＊ aller には「順調である、元気である」という意味もある。',
targetlanguage: 'Cet été, ils vont aller en Australie.',
trans: '今年の夏、彼らはオーストラリアに行く予定です',
function: 'null',
pronun: '',
t_ex: null,
xml_file_name: 'instances039.xml',
xpath: '/gmod:instances[1]/gmod:instanceblock[1]/gmod:instance[4]',
web_url: null
},
{
basic: 'aller',
usage_id: 59,
explanation: '行く。～しに行く。\n＊ aller には「順調である、元気である」という意味もある。',
targetlanguage: 'En fait, je pense y aller en voyage organisé.',
trans: '実はツアーで行くことを考えているの。',
function: '予定を述べる',
pronun: '',
t_ex: 'yes',
xml_file_name: 'fr10.xml',
xpath: '/dmodule[1]/body[1]/dialogue[1]/line[8]/sentence[2]',
web_url: null
},
{
basic: 'aller',
usage_id: 959,
explanation: '～するつもりだ。近い未来の行為を表す。',
targetlanguage: 'Je voudrais aller passer un an en France...',
trans: 'フランスに1年ほど行きたいと思ってるのですが…',
function: '希望を述べる',
pronun: '',
t_ex: 'no',
xml_file_name: 'fr37.xml',
xpath: '/dmodule[1]/body[1]/dialogue[1]/line[1]/sentence[1]',
web_url: null
}
]
var id_list = [];
for (var i of result_list) {
  id_list.push(i.usage_id)
}
var instances = []
id_list = Array.from(new Set(id_list))
for (var id of id_list) {
  var a = result_list.filter((val) => {
    return val.usage_id === id
  });
  instances.push(a)
}
//console.log(instances);
var rObj = {}
rObj.midasi = result_list[0].basic
rObj.insts = []
instances.forEach((item, i) => {
  var li = []
  for (var e of item) {
    var ex = e.explanation
    e = (({ basic, usage_id, explanation, ...rest }) => rest)(e)
    li.push(e)
  }
  var result = {"usage":ex, "inst":li}
  rObj.insts.push(result)
});
console.log([rObj]);
*/
