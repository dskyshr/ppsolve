jQuery(function ($) {

  /* global ****************************************/
  var direction_lotate = ["top","right","bottom","left"];
  var d = 0; // lotateカウントアップ用
  var i = 0;          // ルート数カウントアップ用
  var through   = {}; // 通過マスチェック用
  var route     = []; // ルート記録 global
  var direction = []; // 方向記録用
  var solution  = []; // 解記録用
  var step  = 0;      // 歩数
  //var retry = false;
  var next_check = {};
  /*************************************************/

  
  $(document).on("click", ".operation input[name=check]", function(){
    init()
    .then(function(){
      serachRoute()
    })
    .then(function(){
      final()
    });
  });
  
/*
var test1 = function(passval){
  var defer = new $.Deferred();
  console.log("test1 s");
  setTimeout(
    function(){
      console.log("test1 e");
      defer.resolve();
    },
    5000
  );
  return defer.promise();
}
var test2 = function(passval){
  console.log("test2");
}
*/

var init = function(passVal){
    var defer = new $.Deferred();

    $("div.result").empty();
    $(".result").append("<div class=\"checking\">計算中</div>");
    $("div.canvas div.search").removeClass("search");
    $("input[name=abort]").prop("disabled", false);

    // 操作無効
    //var start = $("div.canvas div.pointer").removeClass("pointer");
    //var start = $("div.square span.pointer").removeClass("pointer");
    //var start = $("div.square span.wall").removeClass(":hover");
    //$(document).off("click, mouseover",".square .wall");

    // 外壁を有効にする
    var max_x = $("select[name=num_x]").val();
    var max_y = $("select[name=num_y]").val();
    $("div.canvas div[id^=1_]").addClass("wall-left");
    $("div.canvas div[id$=_1]").addClass("wall-top");
    $("div.canvas div[id^=" + max_x + "_]").addClass("wall-right");
    $("div.canvas div[id$=_" + max_y + "]").addClass("wall-bottom");

    console.log('#1 END');
  
    defer.resolve();
    return defer.promise();

};

/*
var checkUnique = function(passVal){
    var defer = new $.Deferred();

    console.log('#2');

    var position_start = $("div.canvas div.start").attr("id");
    serachRoute(position_start, null) // 長い処理
    .then(defer.resolve()); 

    console.log('#2 END');
    return defer.promise();
};
*/

var final = function(passVal){

      console.log('#3');

     $(".result div.checking").remove();

      $("input[name=abort]").prop("disabled", true);
      if(solution.length > 0){
        console.log("solutions count：" + solution.length);
        if(solution.length == 1){
          //console.log("一意解です。");
          $("div.result").append("<p>一意解です。</p>");
        }
        else{
          //console.log("複数解があります。");
          $("div.result").append("<p>"+solution.length+"個の解が見つかりました。</p>");
        }
        $("div.result").append("<ul>");
        var sol = 1;
        solution.forEach(function(index){
          $("div.result").append("<li class=\"solution\" id=\"" + index + "\">ルート " + sol + "</li>");
          sol++;
        });
        $("div.result").append("</ul>");
      }
      else{
        //console.log("解なし");
        $("div.result").append("<p>解が見つかりませんでした。</p>");
      }
      // global変数初期化
      i = 0;
      d = 0;
      through = {}; // 通過マスチェック用
      solution  = []; // 解記録用
      step = 0;
      next_check = {};

      console.log('#3 END');

}; 

  // ルート表示
  $(document).on("click", "li.solution", function(){

    $(".solution").css("font-weight","");
    $(this).css("font-weight","bold");
    $(".route").removeClass("route");
    //$(".solution").css("font-weight","bold");
    $(".square div#arrow").remove();

    var sol_i = Number($(this).attr("id"));
    //console.log(direction[sol_i]);

    route[sol_i].forEach(function(pos, pos_i){
        var arrow = direction[sol_i][pos_i];
        if(arrow){
          $("div#"+pos).append("<div id=\"arrow\" class=\"arrow-" + arrow + "\">");
        }
    })

  });


  var serachRoute = function(){
    var defer = new $.Deferred();

    var position = $("div.canvas div.start").attr("id");　// 初期位置
    var position_from = "";
    // 再帰呼び出しだとcall stackdo overになってしまうのでdo whileを使う
    do {
      console.log("Start of do{}");
      //console.table(route);
      // 無限ループ防止(デバッグ時)
       //if(i > 1000){ 
       //console.log("force stop.");
       //return true;
      //}

      console.log("Current position: " + position);
      //console.log("Total steps: "+ step);
      // 通過済みフラグON
      through[position] = true;

      // 初期時
      if(i == 0 && step == 0){
        route[i] = [];
        route[i].push(position);
        direction[i] = [];
        //direction[i].push(direction_lotate[0]);
        next_check[position] = 0;
      }
      // 新しいマスに来た時はnext_check[position]はundefinedなので0に戻す
      if(!next_check[position]){
        d = next_check[position] = 0;
      }
      // 同じマスで再チェックの時
      else{
        d = next_check[position];
      }

      $("div#" + position).addClass("search");

      // ゴール到達時
      if($("div#" + position).hasClass("goal")){
        $("div.canvas div.search").removeClass("search");
        console.log("The Goal is discovered");
        // 解として保存
        if($("select[name=rule]").val() == "through_all"){
          // ルール:全てのマスを通る
          if( (step + 1) == Number($("select[name=num_x]").val()) * Number($("select[name=num_y]").val()) ){
            solution.push(i);
          }
        }
        else{
          // ルール:全ルート検索
          solution.push(i);
        }
        //console.log("Being back to the square from teh Goal");
        // ルート数をカウントアップ
        i++;
        // 前回のルート情報をコピー
        route[i] = route[i-1];
        direction[i] = direction[i-1];

        // 最後の位置情報は削除
        // 直接popすると全体がpopされるため一旦値渡しで配列作成してからpopする
        var this_route = route[i].concat();
        this_route.pop();
        route[i] = this_route;
        var this_direction = direction[i].concat();
        this_direction.pop();
        direction[i] = this_direction;
        //console.table(route);
        //console.table(direction);

        /* 戻る準備 ************/
        // 歩数カウントダウン
        step--;
        // 戻る際は通過済みマスから除外、チェック済み方向を初期化。
        through[position] = false;
        next_check[position] = 0;
        /**********************/
        //1つ戻って再検索
        console.log("-------------------------");

        // 位置情報を更新して次のループへ
        position = route[i][step];
        position_from = route[i][step-1] || null;
        continue;
      } // end ゴール到達
      else{

        // 隣のマスの要素を取得
        var pos  = position.match(/^([0-9]+)_([0-9]+)$/);
        var posX = Number(pos[1]); var posY = Number(pos[2]);
        var posNext = {
          "top"    :  posX    + "_" + (posY-1),
          "right"  : (posX+1) + "_" +  posY   ,
          "bottom" :  posX    + "_" + (posY+1),
          "left"   : (posX-1) + "_" +  posY
        };


        var direction_next = direction_lotate[d];
        var position_next = direction_next ? posNext[direction_next] : undefined;
        if(
          (direction_next && !$("div#" + position).hasClass("wall-" + direction_next)) && // 進む方向に壁が無い
          (position_next && $("div#" + position_next).length)                          && // 次のマスが存在する
          position_from != position_next                                              && // 次のマスは来たマスではない
          !through[position_next]                                                         // 次のマスは通ったマスではない

        ){
          // 次のチェック方向を更新
          next_check[position]++;
          // 歩数をカウントアップ
          step++;

          // 次のルートを記録
          // 直接pushするとすべて結合されてしまうので一旦値渡しで取り出してからから代入する
          var this_route = route[i];
          route[i] = this_route.concat(position_next);
          var this_direction = direction[i];
          direction[i] = this_direction.concat(direction_next);
          // 起点を次のマスに
          // 位置情報を更新して次のループへ
          position = position_next;
          position_from = position;
          continue;
        }
        else{
          $("div.canvas div.search").removeClass("search");
          // 進めない時
          // ルート数をカウントアップ
          i++;
          // 前ルートの情報をコピー
          route[i] = route[i-1];
          direction[i] = direction[i-1];
          // 方向ローテションカウントアップ
          d++;
          // このマスの次回チェック方向も更新
          next_check[position] = d;

          // チェックが一周したら行き先無し
          if(next_check[position] > 3){
            //console.log("4方向チェック済みです。");

            // 最後のルート情報を削除
            // 直接popすると全体がpopされるため一旦値渡しで配列作成してからpopする
            var this_route = route[i].concat();
            this_route.pop();
            route[i] = this_route;
            var this_direction = direction[i].concat();
            this_direction.pop();
            direction[i] = this_direction;

            // 1つ前のマス情報がもうなければ検索終了
            if(route[i].length == 0){
              console.log("Searching Completion.");
              console.log("Total route: "+i+" (includes failed routes)");

              defer.resolve(); // 処理終了を伝える
              return defer.promise();
              
              break; // while抜ける

            }
            // 1つ前のマスがあれば戻って再チェック
            else{
              //console.log("Being back to the square before.");
              //console.log("-------------------------");
              /* 戻る準備 **********************/
              // 歩数カウントダウン
              step--;
              // 戻る際は通過済みマスから除外、チェック済み方向を初期化。
              through[position] = false;
              next_check[position] = 0;
              /********************************/
              // 位置情報を更新して次のループへ
              position = route[i][step];
              position_from = route[i][step-1] || null;
              continue;
            }
          }
          // 同じマスで方向を変えて再チェック
          else{
            //console.log("-------------------------");
            console.log("i:"+i);
            // 位置情報は更新せず次のループへ
            continue;
          }
        } // else
      } // else 
      // ここには絶対来ないようにする
      console.log("侵入しちゃってます！！");
    } while(true);

    defer.resolve(); // 処理終了を伝える
    // while ループを抜けてここにくれば完了
    return defer.promise();

  } // function

});

// 全ルート検索
//4*4 start:4_1,goal:1_4 no wall -> max i = 3,622   , sol = 184.
//4*4 start:2_2,goal:3_3 no wall -> max i = 965     , sol = 82.
//5*5 start:1_1,goal:5_5 no wall -> max i = 265,106 , sol = 8,512.
//5*5 start:5_1,goal:1_5 no wall -> max i = 269,545 , sol = 8,512.
//5*5 start:2_2,goal:4_4 no wall -> max i = 73,690  , sol = 4,330.
//5*5 wall = 5 -> sol = 616
//5*5 wall = 4 -> sol = 1,057
//5*5 wall = 3 -> sol = 1,771
//5*5 wall = 2 -> sol = 3,003 (limit)
//6*6 理論上 sol = 1,262,816
//6*6 wall = 12 -> sol = 1,358
//6*6 wall = 10 -> sol = 4,051 (limit)

// 最短ルートの場合は、歩数が今までの最少ゴール歩数でゴールでなかった場合に、
// そこからゴールまでのマス差（Xの差＋Yの差）の分もどる(差が2であれば2マス戻る)ことで早くなる

// 全マス通る場合は、角があればそこを仮のゴールとして分割計算することで早くなる？
// またスタートとゴール以外に三方囲まれたマスがあったらその時点で解無し
// すでに通ったマスか壁で3方囲まれたマスが発生した場合は次にそこに行かなければ解無しになる
