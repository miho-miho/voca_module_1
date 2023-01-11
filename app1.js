const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require("body-parser");
var { Client } = require('pg');

app.set('view engine', 'ejs');
app.use(express.static('public'));

//middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var json_parts = JSON.parse(fs.readFileSync('./json/parts.json', 'utf8')); //ラベル付きjsonデータ（語彙分類表）
var json_kiso = json_parts["kisogoi"]
var json_kiso = JSON.parse(fs.readFileSync('./json/parts.json', 'utf8')); //ラベル付きjsonデータ（語彙分類表）
json_kiso = json_kiso["kisogoi"]

var kiso_bamen = json_kiso["bamen"]
var kiso_imibunrui = json_kiso["imibunrui"]
var json_bunrui = json_parts["bunruigoi"]
var bunrui_tai = json_bunrui["tai"]
var bunrui_yo = json_bunrui["yo"]
var bunrui_so = json_bunrui["so"]
//console.log(kiso_imibunrui);
/*
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
*/
//トップページ
app.get('/', (req, res) => {
  res.render('index1.0.ejs');
});
let currentWorkingDirectory = process.cwd();
//語彙モジュールトップ
app.get('/:lang/v/', (req, res) => {
  let lang = req.params.lang
  let pathToLnag = currentWorkingDirectory+'/views/'+lang
  var info = require(pathToLnag + "/config")
  res.render(pathToLnag + '/vmod/v_top.ejs', {
    lg : lang,
    lang_jp : info.lang_info.lang_jp,
    vmod_ms1 : info.lang_info.vmod_ms1,
    vmod_ms1_url : info.lang_info.vmod_ms1_url,
  });
});

//利用の手引き
app.get('/:lang/v/howto', (req, res) => {
  let lang = req.params.lang
  let pathToLnag = currentWorkingDirectory+'/views/'+lang
  var info = require(pathToLnag + "/config")
  res.render(pathToLnag + '/vmod/v_tebiki.ejs', {
    lg : lang,
    lang_jp : info.lang_info.lang_jp
  });
});

var word_obj_all = JSON.parse(fs.readFileSync('./json/newJSON.json', 'utf8'));
//基礎語彙の学習
app.get('/:lang/v/catego', (req, res) => {
  let lang = req.params.lang
  let pathToLnag = currentWorkingDirectory+'/views/'+lang
  var info = require(pathToLnag + "/config")
  res.render(pathToLnag + '/vmod/v_catego.ejs', {
    lg : lang,
    lang_jp : info.lang_info.lang_jp,
    kiso_bamen: kiso_bamen,
    kiso_imibunrui: kiso_imibunrui,
    word_obj : word_obj_all[lang]
  });
});
//分類表
app.get('/:lang/v/table', (req, res) => {
  let lang = req.params.lang
  let currentWorkingDirectory = process.cwd();
  let pathToLnag = currentWorkingDirectory+'/views/'+lang
  var info = require(pathToLnag + "/config")
  var make_vObj = {
    "体":[],
    "用":[],
    "相":[]
  }
  var client = new Client({
    user: info.db_info.user,
    host: info.db_info.host,
    database: info.db_info.database,
    password: info.db_info.password,
    port: 5432
})
const query = {
  text: "SELECT t_usage.usage_id,t_usage.word_id,rui,chukoumoku_no,chukoumoku,basic,midasi FROM t_usage_classified_rel JOIN t_usage ON t_usage_classified_rel.usage_id=t_usage.usage_id JOIN t_word ON t_usage.word_id=t_word.id WHERE t_usage_classified_rel.chukoumoku_no='4.30'"
};
client
  .query(query)
  .then((res) => {
    var word_obj = res.rows;
    client.end();
  })
  .catch((e) => console.error(e.stack));
  console.log(word_obj);
  Object.keys(word_obj_all[lang]).forEach(function (key) {
    Object.keys(make_vObj).forEach((k) => {
      if (k === word_obj_all[lang][key]["rui"]) {
        make_vObj[k].push(word_obj_all[lang][key]["chukoumoku_no"])
      }
      make_vObj[k] = [...new Set(make_vObj[k])]
    });
  });
  res.render(pathToLnag + '/vmod/v_table.ejs', {
    lg : lang,
    lang_jp : info.lang_info.lang_jp,
    make_vObj : make_vObj
  });
});

var search_result_list = []
//分類表_結果リスト
app.get('/:lang/v/t_search_list=:chuno', (req, res)=> {
  let lang = req.params.lang
  let currentWorkingDirectory = process.cwd();
  let pathToLnag = currentWorkingDirectory+'/views/'+lang
  var info = require(pathToLnag + "/config")
  var category;
  let chuno = req.params.chuno
    Object.keys(word_obj_all[lang]).forEach(function(key) {
      if(word_obj_all[lang][key]["chukoumoku_no"] === chuno){
        category = word_obj_all[lang][key]["chukoumoku"]
        search_result_list.push(word_obj_all[lang][key]);
      }
    });
  res.render(pathToLnag + '/vmod/v_search_result.ejs', {
    lg : lang,
    lang_jp : info.lang_info.lang_jp,
    search_result_list: search_result_list,
    category: category,
    chuno: chuno
  });
  search_result_list = []
});
//詳細_基礎
app.post('/:lang/v/c_detail=:category', (req, res) => {
  let lang = req.params.lang
  let category = req.params.category
  let currentWorkingDirectory = process.cwd();
  let pathToLnag = currentWorkingDirectory+'/views/'+lang
  var info = require(pathToLnag + "/config")
  let targetObj = {};
  for(const item of word_obj_all[lang]){
    if (item.bamen === category) {
      targetObj[item.midas_go] = item.rei
    }
  }
  res.render(pathToLnag + '/vmod/v_search_detail_kiso.ejs', {
    lg : lang,
    lang_jp : info.lang_info.lang_jp,
    targetObj : targetObj,
    category: category,
    targetWord: req.body.targetWord
  });
});
//詳細_分類表
app.post('/:lang/v/t_search_detail=:chuno', (req, res) => {
  let lang = req.params.lang
  let currentWorkingDirectory = process.cwd();
  let pathToLnag = currentWorkingDirectory+'/views/'+lang
  var info = require(pathToLnag + "/config")
  let chuno = req.params.chuno
  let targetObj = {};
  for(const item of word_obj_all[lang]){
    if (item.chuno === req.body.chuno) {
      targetObj[item.midas_go] = item.rei
    }
  }
  res.render(pathToLnag + '/vmod/v_search_detail_table.ejs', {
    lg : lang,
    lang_jp : info.lang_info.lang_jp,
    targetObj : targetObj,
    category: req.body.category,
    targetWord: req.body.targetWord,
    chuno: chuno
  })
});
//検索
app.get('/:lang/v/v_search', (req, res) => {
  let lang = req.params.lang
  let currentWorkingDirectory = process.cwd();
  let pathToLnag = currentWorkingDirectory+'/views/'+lang
  var info = require(pathToLnag + "/config")
  var words = []
  for (var i of word_obj_all[lang]) {
    words.push(i.midas_go)
  }
  res.render(pathToLnag + '/vmod/v_search.ejs', {
    lg : lang,
    lang_jp : info.lang_info.lang_jp,
    words : words,
    word_obj : word_obj_all[lang]
  });
});

//エラー処理
app.use((req, res, next) => {
  res.status(404).send("<h1>準備中…</h1><p>404</p>");
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("<h1>準備中…</h1><p>500</p>");
});

app.listen(3030);
console.log("サーバーを起動しました");
