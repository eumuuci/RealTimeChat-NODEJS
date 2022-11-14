var getNome = function(){
  var nome;

  while(true){
      nome = prompt("Digite o seu nome: ");

      if(nome != null && nome.length > 0){
          break;
      }
  }

  return nome;
};

var nome = getNome();

$(function(){
  $("h1.myName").html(nome);

  var chatAtivo = -1;
  var contatosAtivos = [];

  $(document).on("click", ".listaContatos li.contato", function(){
    let nome = $(this).attr("username");
    let id = $(this).attr("userID");
    var number = $(this).find("span.number")

    if(chatAtivo == -1 ){
      $("div.aviso").hide();
      $("div.chat").show();
    }

    $(".conversa").html("");
    $("h1.conversaTitle").html(nome);
    $("textarea").attr("idTo", id);
    number.addClass("of").attr("num", "0").html("0");
    chatAtivo = id;
  });

  var addContato = function(arr){
    var elm = $("ul.listaContatos");
    var elmHTML = "";

    contatosAtivos = arr;

    for(i = 0; i < arr.length; i++){
      if(arr[i] != nome && arr[i] != null && arr[i] != ""){
        elmHTML += `<li class="contato id${i}" username=${arr[i]}" userID=${i}>
        <div class="image_support">
          <img src="https://i.pinimg.com/564x/8e/5c/22/8e5c2262b7ef357d4deea3d3e4866871.jpg" />
        </div>
        <div class="texto">
          <h1>${arr[i]} <span class="number of" num="0">0</span></h1>
          <p>xixa</p>
        </div>
      </li>`;
      }
    }
    elm.html(elmHTML);
  }

  var addMensagem = function(me, msg, from = -1){
    var nome = me == true ? "Você" : contatosAtivos[from] ;
    var time = new Date().toLocaleTimeString();
    var elm = me == true ? `<li class="me">` : `<li>`;
        elm += `<div class="header"> <img src="https://i.pinimg.com/564x/93/84/45/938445c98cac5cd8d717529fad64b5a1.jpg"/> <div class="info"> <span class="nome">${nome}</span> <span class="data">Hoje às ${time}</span> </div> </div> <div class="mensagem"><p>${msg}</p> </div> </li>`;
    $("ul.conversa").append(elm);
  }

  let socket = io.connect("http://localhost:3333/");

  socket.emit("message", JSON.stringify({type: "c", data: nome}));
  socket.on("message", mensagem => {
    mensagem = JSON.parse(mensagem);

    switch(mensagem.type){
      case "l":
        addContato(mensagem.data)
        break;
      
      case "m":
        var from = mensagem.data[0];
        var msg = mensagem.data[1];

        if(chatAtivo == parseInt(from)){
          addMensagem(false, msg, from)
        }else{
          var elm = $(`li.contato.id${from}`);
          var number = elm.find("span.number");

          var count = parseInt(number.attr("num"));
          count += 1;

          number.removeClass("of").attr("num", count).html(count);
        }

        break;
    }
  });

  $("textarea").keydown(function(e){
    if(e.keyCode === 13){
      e.preventDefault();

      var to = $(this).attr("idTo");
      var msg = $(this).val();

      socket.emit("message", JSON.stringify({type: "m", data: [to, msg]}));
      addMensagem(true, msg)

      $(this).val("");
    }
  })
});