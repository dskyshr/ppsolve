jQuery(function ($) {

  // Onload
  //drawOutline();

  $("input[name=drawSquare]").click(function(){
    //console.log("x");
    var max_x = $("select[name=num_x]").val();
    var max_y = $("select[name=num_y]").val();
    var el_square = "";
    for (var y = 1; y <= max_y; y++) {
      for (var x = 1; x <= max_x; x++) {
        el_square += "<div class=\"square pointer\" id=\"" + x + "_"+ y + "\"></div>\n";
      }  
    }
    if(el_square != ""){$("div.canvas").html(el_square)};
    drawOutline();
    $("div.operation input[name=check]").remove();
    $("div.operation input[name=abort]").remove();
    $("div.result").empty();
  });

  $(document).on("click", "div.canvas div.pointer", function(){
    //console.log("a");
    if( !$("div.canvas div.start").length && !$("div.canvas div.goal").length ){
      // スタートマス選択
        $(this).addClass("start");
        $(this).html("<span class=\"marker_start\">START</span>");
    }
    else if( $("div.canvas div.start").length && !$("div.canvas div.goal").length ){
      if($(this).hasClass("start")){
        // 自分自身がスタートなら削除
        $(this).removeClass("start");
        $(this).empty();
      }
      else{
        // ゴールマス選択
        $(this).addClass("goal");
        $(this).html("<span class=\"marker_goal\">GOAL</span>");
        // 自分以外のポインタ削除
        $("div.pointer").removeClass("pointer");
        $(this).addClass("pointer");
        // 壁クリック準備
        prepareWall();
      }
    }
    else if( $("div.canvas div.start").length && $("div.canvas div.goal").length ){
      if($(this).hasClass("goal")){
        // 自分自身がゴールなら削除
        $(this).removeClass("goal");
        $(this).empty();
        // ポインタ復活
        $("div.canvas div.square").addClass("pointer");
        // 壁削除
        removeWall();
      }
    }

  });


  $(document).on("click", ".square .wall", function(){
    // 位置を取得
    var pos = $(this).parent(".square").attr("id").match(/^([0-9]+)_([0-9]+)$/);
    var posX = Number(pos[1]); var posY = Number(pos[2]);
    //console.log("x=" + posX + ", y=" + posY);

    if(!$(this).hasClass("wall-on")){
      $(this).addClass("wall-on");
      // 親要素のマスと壁を挟んで隣り合ったマスに壁情報を持たせる
      if($(this).hasClass("x")){
        $(this).parent(".square").addClass("wall-left"); // 親要素のマス
        $(".canvas div#" + (posX-1) + "_" + posY).addClass("wall-right"); // 親要素のマスの左のマス
      }
      else if($(this).hasClass("y")){
        $(this).parent(".square").addClass("wall-top"); // 親要素のマス
        $(".canvas div#" + posX + "_" + (posY-1)).addClass("wall-bottom"); // 親要素のマスの上のマス
      }
      else{
        alert("エラーが発生しました。")
      }
      // マスのポインタ全削除
      $("div.pointer").removeClass("pointer");
    }
    else{
      $(this).removeClass("wall-on");
      // 親要素のマスと壁を挟んで隣り合ったマスの壁情報削除
      if($(this).hasClass("x")){
        $(this).parent(".square").removeClass("wall-left");
        $(".canvas div#" + (posX-1) + "_" + posY).removeClass("wall-right"); // 親要素のマスの左のマス
      }
      else if($(this).hasClass("y")){
        $(this).parent(".square").removeClass("wall-top");
        $(".canvas div#" + posX + "_" + (posY-1)).removeClass("wall-bottom"); // 親要素のマスの上のマス
      }
      else{
        alert("エラーが発生しました。")
      }
      // 壁が1つもなければgoalポインタ復活
      if(!$(".canvas .square .wall-on").length){
        $(".canvas .goal").addClass("pointer");
      }
    }



  });


  function drawOutline(){
    // floatを指定
    $("div.canvas div[id^=1_]").css("clear", "left");
    var max_x = $("select[name=num_x]").val();
    var max_y = $("select[name=num_y]").val();
    // 外枠を描画
    //$('div.bigin').css("border-left","2px solid #333333");
    $("div.canvas div[id^=1_]").css("border-left", "6px solid #333333");
    $("div.canvas div[id$=_1]").css("border-top", "6px solid #333333");
    //console.log(max_y);
    $("div.canvas div[id^=" + max_x + "_]").css("border-right", "6px solid #333333");
    $("div.canvas div[id$=_" + max_y + "]").css("border-bottom", "6px solid #333333");
   
  }

  function prepareWall(){
    $("div.canvas div.square:not([id^=1_])").prepend("<span class=\"wall x pointer\"></span>");
    $("div.canvas div.square:not([id$=_1])").prepend("<span class=\"wall y pointer\"></span>");
    $("div.operation").append("<input type=\"button\" name=\"check\" value=\"チェック\" />\n");
    $("div.operation").append("<input type=\"button\" name=\"abort\" value=\"中止\" disabled=\"disabled\" />\n");
  }

  function removeWall(){
    $("div.canvas div.square span.wall").remove();
    $("div.canvas div.square span.wall").remove();
    $("div.operation input[name=check]").remove();
    $("div.operation input[name=abort]").remove();
  }


});