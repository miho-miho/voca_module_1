//-----------------------------//
const fetch = require('node-fetch')
const fs = require('fs');
//-----------------------------//
//-----------------------------//

//-----------------------------//
exports.makeModLink = function(module_id, xml_file_name, xpath, web_url, targetlanguage, lang){
  var file_path = `../../mt/${lang}` 
  var url_path = `../../../mt/${lang}`
  //getDmodlink
  function getDmodlink(xml_file_name, xpath, lang){
    function getDmodSoundFile(htmlfile, xpath, lang){
      var line =  "";
      var sentence = "";
      var matches = xpath.match(/line\[(\d+)\]\/sentence\[(\d+)\]/)
      if (matches != null) {
        line = matches[1] - 1;
        sentence = matches[2] -1;
      }
      var stid = "st_"+Number(line)+"_"+Number(sentence);
      var pmodpage = "";
      var result;
      if (htmlfile === "" | htmlfile === null) {
        return "";
      } else {
        try {
          result = fs.readFileSync(htmlfile, 'utf8')
          var lines = result.split('\n');
          for (var i = 0; i < lines.length; i++) {
            if (lines[i].indexOf("_timeCounterStArray") !== -1) {
              if (lines[i].indexOf(`["${stid}"]`) !== -1) {
                pmodpage = lines[i]        // _timeCounterStArray["st_0_0"] = new Array("2.5", "4.98");
              }
            }
          }
        } catch (err) {
          result = ""
        }
      }
      var matches = pmodpage.match(/new Array\(\"([\d|\.]+)\", \"([\d|\.]+)\"\);/)
      if (matches === null) {
        return "";
      }
      var start = matches[1];
      var stop = matches[2];
      var matches = htmlfile.match(/.*(\d{2})\.html/)
      if (matches === null) {
        return "";
      }
      var dmodsound = `${url_path}/dmod/class/movie/${lang}_ja${matches[1]}.mp4`
      if (fs.existsSync(`${file_path}/dmod/class/movie/${lang}_ja${matches[1]}.mp4`) != true) {
        return "";
      } else {
        var ret = `
        <!-- ${dmodsound} -->
        <button  class='dmodsound btn btn-outline-primary' onclick="playDmodSound('${dmodsound}', '${start}', '${stop}')">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play-circle" viewBox="0 0 16 16">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
          <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z"/>
          </svg>
        </button>
        `
        return ret 
      }
    }
    var dmod_funcId = "";
    var matches = xml_file_name.match(/^(.*)(\d{2})\.xml/)
    if (matches != null) {
      dmod_funcId = matches[2]; // ex. 15
    }
    var lang_matches = lang.match(/ja_([a-z][a-z])/)
    // 英語ページ 英語はHTMLファイルの名前がfunc_01.htmlとstory_01.htmlの２種ある
    if (lang === "en") {
      htmlfile = `${file_path}/dmod/class/func_${dmod_funcId}.html`
    } else if (lang_matches != null) {  // ex. ja_th
      htmlfile = `${file_path}/dmod/class/${lang_matches[1]}_${dmod_funcId}.html` // 多言語版会話は日本語でもth_01.htmlという命名則
    } else {
      htmlfile = `${file_path}/dmod/class/ja_${dmod_funcId}.html`;
    }
    var dmodsound = getDmodSoundFile(htmlfile, xpath, lang);
    var link = `
      <!--■■■Dモジュールへのリンク■■■-->
      <div class="dmodsound soundAria">
        ${dmodsound}
        <a href="../${htmlfile}" target="blank" class="dmodlink btn btn-success">会</a>
      </div>
      <!--■■■Dモジュールへのリンク終了■■■-->
      `
    return link
  }
  //getGmodLink
  function getGmodLink(xml_file_name, xpath, lang){
    function getGmodSoundFile(xml_file_name, xpath, lang){
      if (xml_file_name == null || xml_file_name == "" || xpath == null || xpath == "")  {
        return "";
      } else {
        var expORins = "";
        var fileno = "";
        var matches = xml_file_name.match(/([a-z]+)(\d{3})\.xml/)
        if (matches != null) {
          expORins = matches[1].substring(0, 3) // exp or ins
          fileno = matches[2]
        }
        var no1 = "";
        var no2 = "";
      // xpathから音声ファイル名を作成
        var matches = xpath.match(/gmod:instanceblock\[(\d+)\]\/gmod:instance\[(\d+)\]/)
        if (matches != null) {
          no1 = matches[1] - 1;
          no2 = matches[2] - 1;
        }
        var gmodsound = `${url_path}/gmod/sound/instances/${expORins}${fileno}_${no1}_${no2}.mp3`;
        if (fs.existsSync(`${file_path}/gmod/sound/instances/${expORins}${fileno}_${no1}_${no2}.mp3`) != true) {
          return "";
        } else {
          var ret = `
          <!-- ${gmodsound} -->
            <audio class="gmodaudio">
              <source src='${gmodsound}' type='audio/mp3'>
            </audio>
            <button type="button" class="btn btn-outline-primary soundLink instSound">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play-circle" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z"/>
              </svg>
            </button>
          `
          return ret
        }
      }
    }
    var htmlfile = xml_file_name.replace(/(explanation|instances)(\d{3})\.xml/, '$1/$2.html')
    var gmodsound = getGmodSoundFile(xml_file_name, xpath, lang)
    var link = `
      <!--■■■Gモジュールへのリンク■■■-->
      <div class="gmodsound soundAria">
      ${gmodsound}
      <a href="${url_path}/gmod/contents/${htmlfile}" target="blank" class="gmodlink btn btn-info">文</a>
      </div>
    `
    return link
  }
  //getPmodLink
  function getPmodLink(targetlanguage, web_url, lang){
    function getPmodSoundFile(targetlanguage, web_url, lang){
      var matches = [];
      var pmodNo = "";
      if (lang == "id") {
        pmodNo = "pmod1";
      } else {
        pmodNo = "pmod2";
      }
      var pmodPath = `${file_path}/${pmodNo}/${web_url}`
      var result = fs.readFileSync(pmodPath, 'utf8');
      var lines = result.split('\n');
      for (var i = 0; i < lines.length; i++) {
        if (lines[i].indexOf(`<span class="targetlang">${targetlanguage}`) !== -1) {
          matches = lines[i].match(/<.*?playItem\('(.*)'\)/);
        } else {
          return "";
        }
      }
      var pmodsound = `${url_path}/${pmodNo}/sound/${matches[1]}.mp3`;
      var ret = `
        <audio class="pmodaudio">
          <source src='${pmodsound}' type='audio/mp3'>
        </audio>
        <button type="button" class="btn btn-outline-primary soundLink instSound">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play-circle" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z"/>
          </svg>
        </button>
        `
      return ret;
    }
      var pmodsound = getPmodSoundFile(targetlanguage, web_url, lang);
      var pmodPath = "";
      if (lang === "id") {
        pmodPath = `${file_path}/pmod1/${web_url}`
      } else {
        pmodPath = `${file_path}/pmod2/${web_url}`
      }
      var link = `
        <!--■■■Pモジュールへのリンク■■■-->
        <div class="pmodsound soundAria">
        ${pmodsound}
        <a href="../${pmodPath}" target="blank" class="pmodlink btn btn-warning">発</a>
        </div>
      `
      return link;
  }
  var link = "";
  if (module_id != "" || module_id != null) {
    if (module_id == "gmod") {
      link = getGmodLink(xml_file_name, xpath, lang)
    } else if (module_id == "dmod") {
      link = getDmodlink(xml_file_name, xpath, lang)
    } else if (module_id == "pmod"){
      link = getPmodLink(targetlanguage, web_url, lang)
    }
  }
  return link;
}

exports.makeInstSound = function(instid, lang){
  var file_path = `..'/../mt/${lang}` 
  var url_path = `../../../mt/${lang}`
  var audioBlock = "";
  var instsoundfile = `${url_path}/vmod/sound/inst/inst_${instid}.mp3`;
  if (fs.existsSync(`${file_path}/vmod/sound/inst/inst_${instid}.mp3`)) {
    audioBlock = `
    <div class="vmodsound soundAria">
      <audio id='instSound_${instid}' class="vmodaudio">
        <source src='${instsoundfile}' type='audio/mp3'>
        <source src='${url_path}/vmod/sound/inst/inst_${instid}.ogg' type='audio/ogg'>
        <p>※ご利用のブラウザでは再生することができません。</p>
      </audio>
      <button type="button" class="btn btn-outline-primary soundLink instSound">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play-circle" viewBox="0 0 16 16">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
          <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z"/>
        </svg>
      </button>
      <a href='${instsoundfile}'>
        <button type="button" class="btn btn-secondary soundLink instSoundLink">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16">
            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
            <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
          </svg>
        </button>
      </a>
    </div>
    `
  }
  return audioBlock;
}

exports.makeWordSound = function(wordid, lang){
  var file_path = `../../mt/${lang}` 
  var url_path = `../../../mt/${lang}`
  var wordsoundfile = `${url_path}/vmod/sound/word/word_${wordid}.mp3`;
  if (fs.existsSync(`${file_path}/vmod/sound/word/word_${wordid}.mp3`)) {
    var audioBlock = `
      <div class="wordsound soundAria">
        <audio class="basicaudio">
          <source src='${wordsoundfile}' type='audio/mp3'>
          <source src='${url_path}/vmod/sound/word/word_${wordid}.ogg' type='audio/ogg'>
          <p>※ご利用のブラウザでは再生することができません。</p>
        </audio>
        <button type="button" class="btn btn-outline-primary soundLink instSound">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play-circle" viewBox="0 0 16 16">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
          <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z"/>
        </svg>
      </button>
      <a href='${wordsoundfile}'>
        <button type="button" class="btn btn-secondary soundLink instSoundLink">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16">
            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
            <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
          </svg>
        </button>
      </a>
    </div>
    `
  }
  return audioBlock
}