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

var json4_kiso = JSON.parse(fs.readFileSync('./json/polish4_kiso.json', 'utf8')); //ラベル付きjsonデータ（語彙分類表）
var word_obj_k1 = json4_kiso["場面"]
var word_obj_k2 = json4_kiso["意味分類"]
var category_k1 = Object.keys(word_obj_k1) //「場面」の分類一覧
var category_k2 = Object.keys(word_obj_k2) //「意味分類」の分類一覧
var vocab_obj_k1 = {};
var vocab_obj_k2 = {};

make_vObj(category_k1, word_obj_k1, vocab_obj_k1);
make_vObj(category_k2, word_obj_k2, vocab_obj_k2);

//基礎語彙の学習
app.get('/vmod_catego', (req, res) => {
  res.render(__dirname + '/views/ polish/vmod_catego0.ejs', {
    word_obj1: vocab_obj_k1,
    word_obj2: vocab_obj_k2,
    category1: category_k1,
    category2: category_k2
  });
});
var vocab_obj_b_all = Object.assign(vocab_obj_b1, vocab_obj_b2, vocab_obj_b3)
//分類表
app.get('/vmod_table', (req, res) => {
  res.render(__dirname + '/views/ polish/vmod_table0.ejs', {
    vocab_obj_b: vocab_obj_b_all,
    category_b1: category_b1,
    category_b2: category_b2,
    category_b3: category_b3,
  });
});
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
//詳細_分類表
app.post('/vmod_detail', (req, res) => {
  res.render(__dirname + '/views/ polish/vmod_search_detail0.ejs', {
    data1: word_obj_b_all,
    category: req.body.category,
    pl_word: req.body.pl_word
  });
});
//詳細_基礎
app.post('/vmod_detail_kiso', (req, res) => {
  res.render(__dirname + '/views/ polish/vmod_search_detail_kiso0.ejs', {
    word_obj1: word_obj_k1,
    word_obj2: word_obj_k2,
    category: req.body.category,
    pl_word: req.body.pl_word
  });
});

//トップページ
app.get('/', (req, res) => {
  res.render('index1.0.ejs');
});
//ポーランド語トップ
app.get('/polish', (req, res) => {
  res.render('polish0.ejs');
});
//利用の手引き
app.get('/howto', (req, res) => {
res.render(__dirname + '/views/ polish/howtouse.ejs')
});
app.listen(3030);
