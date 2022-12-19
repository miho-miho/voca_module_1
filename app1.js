const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require("body-parser");

app.set('view engine', 'ejs');
app.use(express.static('public'));

//middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var word_obj_b = JSON.parse(fs.readFileSync('./json/polish4.json', 'utf8')); //ラベル付きjsonデータ（語彙分類表）
var word_obj_b1 = word_obj_b["体"]
var word_obj_b2 = word_obj_b["用"]
var word_obj_b3 = word_obj_b["相"]
const category_b1 = Object.keys(word_obj_b1) //語彙分類表の分類一覧
const category_b2 = Object.keys(word_obj_b2) //語彙分類表の分類一覧
const category_b3 = Object.keys(word_obj_b3) //語彙分類表の分類一覧
var vocab_obj_b1 = {};
var vocab_obj_b2 = {};
var vocab_obj_b3 = {};
var li = [];
function make_vObj(category_list, w_obj, v_obj){
  category_list.forEach((item) => {
    w_obj[item].forEach((it) => {
      it["語彙"].forEach((item) => {
        li.push(item)
      });
    });
    v_obj[item] = li
    li = []
  });
}
make_vObj(category_b1, word_obj_b1, vocab_obj_b1);
make_vObj(category_b2, word_obj_b2, vocab_obj_b2);
make_vObj(category_b3, word_obj_b3, vocab_obj_b3);

var json_kiso = JSON.parse(fs.readFileSync('./json/parts.json', 'utf8')); //ラベル付きjsonデータ（語彙分類表）
json_kiso = json_kiso["kisogoi"]
var kiso_bamen = json_kiso["bamen"]
var kiso_imibunrui = json_kiso["imibunrui"]
//console.log(kiso_imibunrui);

//トップページ
app.get('/', (req, res) => {
  res.render('index1.0.ejs');
});
/*
//言語トップ
app.get("/mt/:lang", (req, res) => {
  let lang = req.params.lang
  let currentWorkingDirectory = process.cwd();
  let pathToLnag = currentWorkingDirectory+'/views/'+lang
  var info = require(pathToLnag + "/config")
  res.render(pathToLnag + '/top/top.ejs', {
    lg : lang,
    lang : info.lang_info.lang,
    lang_jp : info.lang_info.lang_jp,
    message1 : info.lang_info.message1,
    message2 : info.lang_info.message2,
    sidebar_setting : info.sidebar_setting
  });
});
*/
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

//基礎語彙の学習
app.get('/:lang/v/catego', (req, res) => {
  let lang = req.params.lang
  let pathToLnag = currentWorkingDirectory+'/views/'+lang
  var info = require(pathToLnag + "/config")
  res.render(pathToLnag + '/vmod/v_catego.ejs', {
    lg : lang,
    lang_jp : info.lang_info.lang_jp,
    kiso_bamen: kiso_bamen,
    kiso_imibunrui: kiso_imibunrui
  });
});
var vocab_obj_b_all = Object.assign(vocab_obj_b1, vocab_obj_b2, vocab_obj_b3)
//分類表
app.get('/:lang/v/table', (req, res) => {
  let lang = req.params.lang
  let currentWorkingDirectory = process.cwd();
  let pathToLnag = currentWorkingDirectory+'/views/'+lang
  var info = require(pathToLnag + "/config")
  res.render(pathToLnag + '/vmod/vmod_table.ejs', {
    lg : lang,
    lang_jp : info.lang_info.lang_jp,
    vocab_obj_b: vocab_obj_b_all,
    category_b1: category_b1,
    category_b2: category_b2,
    category_b3: category_b3,
  });
});
/*
//検索(日・ポ)
app.get('/vmod_search', (req, res) => {
  res.render(__dirname + '/views/ polish/vmod_search0.ejs', {
    vocab_obj_k1: vocab_obj_k1,
    vocab_obj_k2: vocab_obj_k2,
    vocab_obj_b: vocab_obj_b_all,
    category: category_b1.concat(category_b2, category_b3)
  });
});
var word_obj_b_all = Object.assign(word_obj_b1, word_obj_b2, word_obj_b3)
//例文検索
app.get('/smod', (req,res) => {
  res.render(__dirname + '/views/ polish/smod1.ejs', {
    data1: word_obj_b_all,
    data2: word_obj_k1,
    data3: word_obj_k2,
    category_b: category_b1.concat(category_b2, category_b3),
    category_k: category_k1.concat(category_k2)
    });
});
*/
var word_obj_b_all = Object.assign(word_obj_b1, word_obj_b2, word_obj_b3)
//詳細_分類表
app.post('/:lang/v/detail', (req, res) => {
  let lang = req.params.lang
  let currentWorkingDirectory = process.cwd();
  let pathToLnag = currentWorkingDirectory+'/views/'+lang
  var info = require(pathToLnag + "/config")
  res.render(pathToLnag + '/vmod/vmod_search_detail.ejs', {
    lg : lang,
    lang_jp : info.lang_info.lang_jp,
    data1: word_obj_b_all,
    category: req.body.category,
    pl_word: req.body.pl_word
  });
});
//詳細_基礎
app.post('/:lang/v/detail_kiso', (req, res) => {
  let lang = req.params.lang
  let currentWorkingDirectory = process.cwd();
  let pathToLnag = currentWorkingDirectory+'/views/'+lang
  var info = require(pathToLnag + "/config")
  res.render(pathToLnag + '/vmod/vmod_search_detail_kiso.ejs', {
    lg : lang,
    lang_jp : info.lang_info.lang_jp,
    word_obj1: word_obj_k1,
    word_obj2: word_obj_k2,
    category: req.body.category,
    pl_word: req.body.pl_word
  });
});
app.use((req, res, next) => {
  res.status(404).send("<h1>準備中…</h1><p>404</p>");
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("<h1>準備中…</h1><p>500</p>");
});

app.listen(3030);
console.log("サーバーを起動しました");
