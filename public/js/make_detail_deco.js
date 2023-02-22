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