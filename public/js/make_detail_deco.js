//showResult
function showResult(index){
    if (index === "" || index === null) {
      $("#now_item").text("0");
      $(".targetWord").text("<%= targetWord %>");
      $(".btn_previous").prop("disabled", true);
      $(".btn_next").prop("disabled", true);
    } else {
    $("#now_item").text(index+1);
    var targetItem = targetArray[index]
    $(".targetWord").text(targetItem.midasi)
    $(".targetWordAudio").append(targetItem.midashiaudio)
    var num = 1;
    targetItem.inst.forEach((item) => {
      let explain = item.usage
      var imi_list = []
      if (explain.includes("＊")) {
        imi_list.push(explain.replace("＊", "<br>＊"))
      } else if(explain.includes("\n")) {
        imi_list.push(explain.replace(/\n/, "<br>"))
      } else {
        imi_list.push(explain)
      }
      $(".result-card-area").append('<p class="explain"><span>（'+num+'）</span>'+imi_list+'</p>')
      $(".result-card-area").append('<div class="card"><div class="card-header col"><h5 class="card-title text-center">＜例文＞</h5></div><div class="card-body examples row"></div></div>')
      item.reibun.forEach((element) => {
        for (var s of element) {
          if ("<%= lg %>" === "ar") { //アラビア語の場合（例文の右寄せ、見出し語の表示調整
            $(".examples:last").append('<div class="row example">')
            $(".example:last").append('<div class="col col-xs-12 instlink text-end">'+s.link+'</div>')
            var sentence = replaceTokenColor(s.token, s.targetlanguage, s.token_index);
            if (s.trans.length > 0) {
              $(".example:last").append('<div class="col-auto col-xs-12 inst text-end"><p class="text-end ar type_ar">・'+sentence+'</p><p class="text-end">'+s.trans+' </p></div>') 
            } else {
              $(".example:last").append('<div class="col-auto col-xs-12 inst text-end"><p class="text-en ar type_ar">・'+sentence+'</p></div>')
            }
          } else { //それ以外の言語の場合
              $(".examples:last").append('<div class="row example">')
              var sentence = replaceTokenColor(s.token, s.targetlanguage, s.token_index);
              if (s.trans.length > 0) {
                $(".example:last").append('<div class="col-sm-auto col-xs-12 inst"><p>・'+sentence+'</p><p>・'+s.trans+'</p></div>') 
              } else {
                $(".example:last").append('<div class="col-sm-auto col-xs-12 inst"><p>・'+sentence+'</p></div>')
              }
              $(".example:last").append('<div class="col-sm-auto col-xs-12 instlink">'+s.link+'</div>')
            }
          }
      });
      num+=1;
    });
    switch (index) {
        case 0:
          $(".btn_previous").prop("disabled", true);
          break;
        case targetArray.length-1:
          $(".btn_next").prop("disabled", true);
          break;
      }
      if (targetArray.length === 1) {
        $(".btn_previous").prop("disabled", true);
        $(".btn_next").prop("disabled", true);
      }
    }
  }
//replaceTokenColor
function replaceTokenColor(token, sentence, token_index){
    var tokenafter = "";
    var topenTagStr = "1234567890";
    var closeTagStr = "0987654321";
    var changeStr = "";
    var searchStrt = 0;
    if (token === "" || token === null) {
      return sentence
   } else {
      if (token_index != "" && token_index != null) {
        // 指定された言葉が文中に複数出てきている場合。
        // 何番目の言葉を変換するのか指定されているので、forでまわして位置を探す。
        for (let i = 0; i < token_index; i++) {
          // 文字列を検索して、最初に見つかった位置を返す
          // 例）文字列:AAAABCAAAABAC 検索対象文字列:ABC 返ってくる値:3
          searchStrt = sentence.indexOf(token, searchStrt)
          // 検索対象の文字列が次に出てくる位置を探すために、検索開始位置に対象文字列数を足す
          // 検索開始位置 = 前回文字列があった場所 + 検索対象文字列
          // 例）文字列:AAAABCAAAABAC 検索対象文字列:ABC 検索開始位置 = 3 + (3-1)
          // ※指定された検索回数に到達していなければ次の検索用に数値を足す
          if (i < token) {
            searchStrt ++;
          }
        }
          // 指定された言葉が文章の中にあったら、$searchStrtに数値が返ってくるので
          // その時は文字を赤くする。数値が帰って来ない場合は$sentenceをそのまま返す
       if (typeof searchStrt === Number) {
         // 指定された言葉より前の文章を取得する
         changeStr = sentence.indexOf(0, searchStrt);
  
         // 前の文章 + 指定された言葉
          changeStr = changeStr+'<span class="token">'+token+'</span>';
          // $changeStr = $changeStr ."<span class=\"token\">" .$token ."</span>";
          // 前の文章 + 指定された言葉 + 後の文章
          var token_b = function byteLengthOf(token) {
          return Buffer.byteLength(token);
          }
          changeStr = changeStr+sentence.indexOf(searchStrt + token_b);
          sentence = changeStr;
        }
      } else {
          tokenafter = topenTagStr+token+closeTagStr;
          sentence = sentence.replace(token, tokenafter);
          sentence = sentence.replace(topenTagStr, '<span class="token">');
          sentence = sentence.replace(closeTagStr, "</span>");
    }
      return sentence;
    }
  }