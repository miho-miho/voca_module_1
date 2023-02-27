const express = require('express');
const app = express();
const fs = require('fs');
const fetch = require('node-fetch')
const bodyParser = require("body-parser");
var { Client } = require('pg');

app.set('view engine', 'ejs');
app.use(express.static('public'));

//middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var json_parts = JSON.parse(fs.readFileSync('./json/parts.json', 'utf8')); //ラベル付きjsonデータ（語彙分類表）
var json_kiso = json_parts["kisogoi"]

var kiso_bamen = json_kiso["bamen"]
var kiso_imibunrui = json_kiso["imibunrui"]
var kiso_parts = {...kiso_bamen, ...kiso_imibunrui}
var json_bunrui = json_parts["bunruigoi"]
var bunrui_tai = json_bunrui["tai"]
var bunrui_yo = json_bunrui["yo"]
var bunrui_so = json_bunrui["so"]

//トップページ
app.get('/', (req, res) => {
  res.render('index1.0.ejs');
});
let currentWorkingDirectory = process.cwd();

//語彙モジュールトップ
var indexArray = [];
app.get('/:lang/v/', (req, res) => {
  let lang = req.params.lang
  let currentWorkingDirectory = process.cwd();
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
    text: "SELECT * FROM t_index_char ORDER BY id"
  };
  client.query(query, (err, result) => {
    if (err) throw err;
    indexArray = result.rows;
    res.render(pathToLnag + '/vmod/v_top.ejs', {
      lg : lang,
      lang_jp : info.lang_info.lang_jp,
      vmod_ms1 : info.lang_info.vmod_ms1,
      vmod_ms1_url : info.lang_info.vmod_ms1_url,
      vmod_ms2 : info.lang_info.vmod_ms2,
    });
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
    text: "SELECT t_usage_scene_rel.scene_id AS scene,t_word.basic,t_usage.explanation,t_usage.word_id FROM t_usage_scene_rel JOIN t_usage ON t_usage_scene_rel.usage_id=t_usage.usage_id JOIN t_word ON t_usage.word_id=t_word.id"
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
    console.log(make_vObj);
    res.render(pathToLnag + '/vmod/v_table.ejs', {
      lg : lang,
      lang_jp : info.lang_info.lang_jp,
      make_vObj : make_vObj
    });
  });
});

//分類表_結果リスト
var search_result_list = []
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
    text: "SELECT t_usage.usage_id,t_usage.word_id,chukoumoku,chukoumoku_no,basic,midasi,hontai FROM t_usage_classified_rel JOIN t_usage ON t_usage_classified_rel.usage_id=t_usage.usage_id JOIN t_word ON t_usage.word_id=t_word.id WHERE t_usage_classified_rel.chukoumoku_no=$1",
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

//詳細
var mkDetail = require('./public/js/make_search_detail.js');
app.post('/:lang/v/search_detail=:tag', (req, res) => {
  let lang = req.params.lang
  let currentWorkingDirectory = process.cwd();
  let targetWordIds = req.body.targetWordIds.split(',').map(Number);
  let pathToLnag = currentWorkingDirectory+'/views/'+lang
  var info = require(pathToLnag + "/config")
  let tag = req.params.tag;
  var client = new Client({
    user: info.db_info.user,
    host: info.db_info.host,
    database: info.db_info.database,
    password: info.db_info.password,
    port: 5432
  })
  client.connect();
  const query = {
    //text: 'SELECT t_word.basic, t_word.id, t_usage.usage_id, t_usage.explanation, T.targetlanguage, T.trans, T.function, T.pronun, T.module_id, T.explanation as t_ex, T.xml_file_name, T.xpath, T.web_url, T.inst_id as instid, T.token, T.token_index FROM t_usage LEFT OUTER JOIN t_usage_scene_rel ON t_usage.usage_id=t_usage_scene_rel.usage_id JOIN t_word ON t_usage.word_id = t_word.id JOIN (SELECT * FROM t_usage_inst_rel JOIN t_instance ON t_usage_inst_rel.inst_id = t_instance.id) as T ON T.usage_id=t_usage.usage_id WHERE t_word.id=any($1) AND t_usage.selected=1 ORDER BY t_usage.disp_priority, T.disp_priority',
    text: 'SELECT t_word.basic, t_word.id, t_usage.usage_id, t_usage.explanation, T.targetlanguage, T.trans, T.function, T.pronun, T.module_id, T.explanation as t_ex, T.xml_file_name, T.xpath, T.web_url, T.inst_id as instid, T.token, T.token_index, t_usage_photo.file_name as photo_name FROM t_usage LEFT OUTER JOIN t_usage_scene_rel ON t_usage.usage_id=t_usage_scene_rel.usage_id LEFT OUTER JOIN t_usage_photo ON t_usage.usage_id=t_usage_photo.usage_id JOIN t_word ON t_usage.word_id = t_word.id JOIN (SELECT * FROM t_usage_inst_rel JOIN t_instance ON t_usage_inst_rel.inst_id = t_instance.id) as T ON T.usage_id=t_usage.usage_id WHERE t_word.id=any($1) AND t_usage.selected=1 ORDER BY t_usage.disp_priority, T.disp_priority',
    values: [targetWordIds]
  };
  client.query(query, [targetWordIds], (err, result) => {
    if (err) throw err;
    var result_list = result.rows
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
    var insts = []
    instances.forEach((item) => {
      var midasi = item[0].basic
      var li = []
      for (var e of item) {
        var ex = e.explanation
        e = (({ basic, usage_id, explanation, ...rest }) => rest)(e)
        var link = "";
        if (e.xml_file_name != null) {
          link = mkDetail.makeModLink(e.module_id, e.xml_file_name, e.xpath, e.web_url, midasi, lang)
        } else {
          link = mkDetail.makeInstSound(e.instid, lang)
        }
        e.link = link
        li.push(e)
      }
      var midashiaudio = mkDetail.makeWordSound(item[0].id, lang)
      var inst = []
      var sameMidasi = insts.find((element) => element.midasi === midasi)
      li = li.filter((element, index, self) => self.findIndex(e => e.instid === element.instid ) === index);
      if (sameMidasi) {
        sameMidasi.inst.push({"usage":ex, "photo":item[0].photo_name, "reibun":[li]})
      } else {
        inst.push({"usage":ex, "photo":item.photo_name, "reibun":[li]})
        var result = {"midasi":midasi, "midashiaudio":midashiaudio, "inst":inst}
        insts.push(result)
      }
    });
    res.render(pathToLnag + '/vmod/v_search_detail.ejs', {
      lg : lang,
      lang_jp : info.lang_info.lang_jp,
      targetObj : insts,
      category: req.body.category,
      targetWord: req.body.targetWord,
      targetWordId: req.body.targetWordId,
      tag: tag,
      targetChar: "",
      targetSt: ""
    });
  });
});
//検索
app.get('/:lang/v/v_search', (req, res) => {
  let lang = req.params.lang
  let currentWorkingDirectory = process.cwd();
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
    text: `SELECT ic.id, ic.index_char, tw.index_char as charcheck 
    FROM t_index_char  ic left join t_word tw
    on ic.index_char = tw.index_char
    GROUP BY ic.id, ic.index_char, tw.index_char
    ORDER BY ic.id`
  };
  client.query(query, (err, result) => {
    if (err) throw err;
    var char_list = [];
    var resultArray = result.rows;
    res.render(pathToLnag + '/vmod/v_search.ejs', {
      lg : lang,
      lang_jp : info.lang_info.lang_jp,
      indexArray : resultArray
    });
  });
});
//文字検索_結果一覧
app.get('/:lang/v/v_search_list-char=:char', (req, res) => {
  let lang = req.params.lang;
  let targetChar = req.params.char;
  let currentWorkingDirectory = process.cwd();
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
    text: "SELECT t_word.basic, t_word_inst_rel.sense, t_word.id FROM t_word LEFT OUTER JOIN t_word_inst_rel ON t_word.id = t_word_inst_rel.word_id WHERE t_word.selected = 1 AND t_word.index_char = $1", //AND t_word_inst_rel.sense IS NOT NULL",
    values: [targetChar]
  };
  client.query(query, [targetChar], (err, result) => {
    if (err) throw err;
    var result_list = result.rows;
    var id_list = [];
    for (var i of result_list) {
      id_list.push(i.id)
    }
    var r_list = []
    id_list = Array.from(new Set(id_list))
    for (var i of id_list) {
      var a = result_list.filter(function(val) {
        return val.id == i
      });
      var k = {};
      k["midasi"] = a[0].basic;
      k["id"] = a[0].id;
      var s_list = []
      for (const s of a) {
        if (s.sense != null) {
          s_list.push(s.sense); 
        }
      }
      s_list = Array.from(new Set(s_list))
      k["senses"] = s_list
      r_list.push(k);
    }
    res.render(pathToLnag + '/vmod/v_search_result_list.ejs', {
      lg : lang,
      lang_jp : info.lang_info.lang_jp,
      search_result_list: r_list,
      targetChar: targetChar,
      targetSt : ""
    });
  });
});

//詳細_検索
app.post('/:lang/v/s_search_detail-tg=:char', (req, res) => {
  let lang = req.params.lang
  let currentWorkingDirectory = process.cwd();
  let targetChar = req.params.char;
  let targetWordIds = req.body.targetWordIds.split(',').map(Number);
  let pathToLnag = currentWorkingDirectory+'/views/'+lang
  var info = require(pathToLnag + "/config")
  let chuno = req.params.chuno
  var client = new Client({
    user: info.db_info.user,
    host: info.db_info.host,
    database: info.db_info.database,
    password: info.db_info.password,
    port: 5432
  })
  client.connect();
  const query = {
    text: 'SELECT t_word.basic, t_word.id, t_usage.usage_id, t_usage.explanation, T.targetlanguage, T.trans, T.function, T.pronun, T.module_id, T.explanation as t_ex, T.xml_file_name, T.xpath, T.web_url, T.inst_id as instid, T.token, T.token_index FROM t_usage LEFT OUTER JOIN t_usage_scene_rel ON t_usage.usage_id=t_usage_scene_rel.usage_id JOIN t_word ON t_usage.word_id = t_word.id JOIN (SELECT * FROM t_usage_inst_rel JOIN t_instance ON t_usage_inst_rel.inst_id = t_instance.id) as T ON T.usage_id=t_usage.usage_id WHERE t_word.id=any($1) AND t_usage.selected=1 ORDER BY t_usage.disp_priority, T.disp_priority',
    values: [targetWordIds]
  };
  client.query(query, [targetWordIds], (err, result) => {
    if (err) throw err;
    var result_list = result.rows
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
    var insts = []
    instances.forEach((item) => {
      var li = []
      for (var e of item) {
        var ex = e.explanation
        e = (({ basic, usage_id, explanation, ...rest }) => rest)(e)
        var link = "";
        if (e.xml_file_name != null) {
          link = mkDetail.makeModLink(e.module_id, e.xml_file_name, e.xpath, e.web_url, e.targetlanguage, lang)
        } else {
          link = mkDetail.makeInstSound(e.instid, lang)
        }
        e.link = link
        li.push(e)
      }
      var midasi = item[0].basic
      var midashiaudio = mkDetail.makeWordSound(item[0].id, lang)
      var inst = []
      var sameMidasi = insts.find((element) => element.midasi === midasi)
      li = li.filter((element, index, self) => self.findIndex(e => e.instid === element.instid ) === index);
      if (sameMidasi) {
        sameMidasi.inst.push({"usage":ex, "reibun":[li]})
      } else {
        inst.push({"usage":ex, "reibun":[li]})
        var result = {"midasi":midasi, "midashiaudio":midashiaudio, "inst":inst}
        insts.push(result)
      }
    });
    res.render(pathToLnag + '/vmod/v_search_detail.ejs', {
      lg : lang,
      lang_jp : info.lang_info.lang_jp,
      targetObj : insts,
      category: req.body.category,
      targetWord: req.body.targetWord,
      targetWordId: req.body.targetWordId,
      targetChar : targetChar,
      targetSt : req.body.targetSt,
      tag: "",
      category: "",
    });
  });
});

//単語検索_結果一覧
app.get('/:lang/v/v_search_list-str=:char&st=:st', (req, res) => {
  let lang = req.params.lang;
  let targetSt = req.params.st;
  var targetChar = "";
  switch (targetSt) {
    case "1":
      targetChar = `${req.params.char}%`;
      break;
    case "2":
      targetChar = `%${req.params.char}`;
      break;
    case "3":
      targetChar = `%${req.params.char}%`;
      break;
  }
  let currentWorkingDirectory = process.cwd();
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
    text: "SELECT t_word.basic, t_word_inst_rel.sense, t_word.id FROM t_word LEFT OUTER JOIN t_word_inst_rel ON t_word.id = t_word_inst_rel.word_id WHERE t_word.selected = 1 AND t_word.basic LIKE $1", //AND t_word_inst_rel.sense IS NOT NULL
    values: [targetChar]
  };
  client.query(query, [targetChar], (err, result) => {
    if (err) throw err;
    var result_list = result.rows;
    var id_list = [];
    for (var i of result_list) {
      id_list.push(i.id)
    }
    var r_list = []
    id_list = Array.from(new Set(id_list))
    for (var i of id_list) {
      var a = result_list.filter(function(val) {
        return val.id == i
      });
      var k = {};
      k["midasi"] = a[0].basic;
      k["id"] = a[0].id;
      var s_list = []
      for (const s of a) {
        if (s.sense != null) {
          s_list.push(s.sense); 
        }
      }
      s_list = Array.from(new Set(s_list))
      k["senses"] = s_list
      r_list.push(k);
    }
    targetChar = targetChar.replace(/%/g, "~")
    res.render(pathToLnag + '/vmod/v_search_result_list.ejs', {
      lg : lang,
      lang_jp : info.lang_info.lang_jp,
      search_result_list: r_list,
      targetChar: targetChar,
      targetSt: targetSt
    });
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
