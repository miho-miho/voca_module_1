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
  var client = new Client({
    user: info.db_info.user,
    host: info.db_info.host,
    database: info.db_info.database,
    password: info.db_info.password,
    port: 5432
  })
  client.connect();
  const query = {
    text: "SELECT t_scene.id AS scene,t_word.basic,t_usage.explanation,t_usage.word_id,t_usage.usage_id FROM t_usage_scene_rel JOIN t_usage ON t_usage_scene_rel.usage_id=t_usage.usage_id JOIN t_word ON t_usage.word_id=t_word.id JOIN t_scene ON t_usage_scene_rel.scene_id=t_scene.id"
  };
  client.query(query, (err, result) => {
    if (err) throw err;
    res.render(pathToLnag + '/vmod/v_catego.ejs', {
      lg : lang,
      lang_jp : info.lang_info.lang_jp,
      kiso_bamen: kiso_bamen,
      kiso_imibunrui: kiso_imibunrui,
      word_obj : result.rows
    });
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
    "相":[],
    "他":[]
  }
  var client = new Client({
    user: info.db_info.user,
    host: info.db_info.host,
    database: info.db_info.database,
    password: info.db_info.password,
    port: 5432
  })
  client.connect();
  const query = {
    text: "SELECT t_usage.usage_id,t_word.id,rui,chukoumoku_no,chukoumoku,basic,midasi FROM t_usage_classified_rel JOIN t_usage ON t_usage_classified_rel.usage_id=t_usage.usage_id JOIN t_word ON t_usage.word_id=t_word.id WHERE t_usage.selected='1'"
  };
  client.query(query, (err, result) => {
    if (err) throw err;
    result.rows.forEach((item) => {
      make_vObj[item["rui"]].push(item["chukoumoku_no"])
    });
    Object.keys(make_vObj).forEach((k) => {
      make_vObj[k] = [...new Set(make_vObj[k])]
    });
    res.render(pathToLnag + '/vmod/v_table.ejs', {
      lg : lang,
      lang_jp : info.lang_info.lang_jp,
      make_vObj : make_vObj
    });
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
  let chuno = String(req.params.chuno)
  var client = new Client({
    user: info.db_info.user,
    host: info.db_info.host,
    database: info.db_info.database,
    password: info.db_info.password,
    port: 5432
  })
  client.connect();
  const query = {
    text: "SELECT t_usage.usage_id,t_usage.word_id,chukoumoku,chukoumoku_no,basic,midasi FROM t_usage_classified_rel JOIN t_usage ON t_usage_classified_rel.usage_id=t_usage.usage_id JOIN t_word ON t_usage.word_id=t_word.id WHERE t_usage_classified_rel.chukoumoku_no=$1",
    values: [chuno]
  };
  client.query(query, [chuno], (err, result) => {
    if (err) throw err;
    res.render(pathToLnag + '/vmod/v_search_result.ejs', {
      lg : lang,
      lang_jp : info.lang_info.lang_jp,
      search_result_list: result.rows,
      category: result.rows[0]["chukoumoku"],
      chuno: chuno
    });
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
  var targetWordId = req.body.targetWordId
  var client = new Client({
    user: info.db_info.user,
    host: info.db_info.host,
    database: info.db_info.database,
    password: info.db_info.password,
    port: 5432
  })
  client.connect();
  const query = {
    //text: "SELECT t_scene.id AS scene, ARRAY_AGG(t_usage.usage_id) AS list FROM t_usage_scene_rel JOIN t_usage ON t_usage_scene_rel.usage_id=t_usage.usage_id JOIN t_scene ON t_usage_scene_rel.scene_id=t_scene.id GROUP BY t_scene.id HAVING t_scene.id=$1",
    //text: 'SELECT t_usage.usage_id FROM t_usage JOIN t_word ON t_usage.word_id = t_word.id WHERE t_word.id=$1',
    //text: 'SELECT t_usage.usage_id,t_usage.explanation,t_instance.* FROM t_usage_inst_rel JOIN t_usage ON t_usage.usage_id=t_usage_inst_rel.usage_id JOIN t_instance ON t_usage_inst_rel.inst_id=t_instance.id WHERE t_usage.usage_id IN (SELECT t_usage.usage_id FROM t_usage JOIN t_word ON t_usage.word_id=t_word.id WHERE t_word.id=$1) ORDER BY t_usage.disp_priority, t_usage_inst_rel.disp_priority',
    //text: 'SELECT t_word.id AS word_id, t_usage.usage_id, t_usage.explanation, t_instance.* FROM t_usage_inst_rel JOIN t_instance ON t_usage_inst_rel.inst_id = t_instance.id JOIN t_usage ON t_usage_inst_rel.inst_id = t_usage.usage_id JOIN t_word ON t_usage.word_id = t_word.id WHERE word_id = $1',
    text: 'SELECT t_usage.usage_id,t_usage.explanation, t_instance.* FROM t_usage JOIN t_word ON t_usage.word_id = t_word.id JOIN (SELECT * FROM t_usage_inst_rel JOIN t_usage_inst_rel ON t_usage.usage_id = t_usage_inst_rel.usage_id JOIN t_instance ON t_usage_inst_rel.inst_id = t_instance.id) as T WHERE word_id = $1',
    values: [targetWordId]
  };
  client.query(query, [targetWordId], (err, result) => {
    if (err) throw err;
    console.log(result.rows);
    res.render(pathToLnag + '/vmod/v_search_detail_kiso.ejs', {
      lg : lang,
      lang_jp : info.lang_info.lang_jp,
      targetObj : result.rows,
      category: category,
      targetWord: req.body.targetWord,
      targetWordId: req.body.targetWordId
    });
  });
  /*
  let targetObj = {};
  for(const item of word_obj_all[lang]){
    if (item.bamen === category) {
      targetObj[item.midas_go] = item.rei
    }
  }
  */
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
