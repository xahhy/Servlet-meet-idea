(function($) {

//////////////////////////////////////////////////////////////////////////////////////////
  // $(function() {
  //   var $fullText = $('.admin-fullText');
  //   $('#admin-fullscreen').on('click', function() {
  //     $.AMUI.fullscreen.toggle();
  //   });

  //   $(document).on($.AMUI.fullscreen.raw.fullscreenchange, function() {
  //     $.AMUI.fullscreen.isFullscreen ? $fullText.text('关闭全屏') : $fullText.text('开启全屏');
  //   });
  // });

///////////////////////////////////////////////////////////////////////////////////////////
var loadPath = "am";//serv
var deletePath = "am";
var editPath = "am";
var addPath = "am";

var cur_click_id;

var TStable = {
    init : function(){
      LoadDataGet();
    }  
};

TStable.list = new Array();
TStable.display_list = new Array();

TStable.sel_list = new Array();

function DATA(channel_id ,channel_name,rtmp_url,client_ip,status){
  this.channel_id = channel_id;
  this.channel_name = channel_name;
  this.rtmp_url = rtmp_url;
  this.client_ip = client_ip;
  this.state = status;
}

function SEL(channel_id,channel_name)
{
  this.channel_id = channel_id;
  this.channel_name = channel_name;
}

var curPage =1;

//get 方法同步
// $.ajaxSetup({  
//     async : false  
// }); 

//HTTP协议下使用，使用本站数据
var LoadDataGet = function(){
    TStable.list = [];
    TStable.display_list = [];

    TStable.sel_list = [];


    $.get(loadPath, { op: "category"},function(data){
        //alert(String(data));
        var parsedJson = jQuery.parseJSON(data); 
        //alert(parsedJson.users); 
        $.each(parsedJson.category,function(idx,item){ 
          //alert(item.username);

          TStable.list.push(new DATA(item.channel_id,item.channel_name,item.rtmp_url,item.client_ip,item.st));

       });
        $.each(parsedJson.sel,function(idx,item){ 
          //alert(item.username);
          TStable.sel_list.push(new SEL(item.channel_id,item.channel_name));

       });


        var status_temp;
        var button_delete_temp;
        var button_edit_temp;

        //alert(TStable.list.length);
        for(var i =0;i<TStable.list.length;i++)
        {
          if(TStable.list[i].state == 1)
          {
            status_temp = '<button type="button" class="am-btn am-btn-default am-btn-xs am-text-danger bt-status"><span class="am-icon-stop"></span> </button>已运行';
          }else if( TStable.list[i].state == 0)
          {
            status_temp = '<button type="button" class="am-btn am-btn-default am-btn-xs am-text-secondary bt-status"><span class="am-icon-play"></span> </button>未运行';
          }else if(TStable.list[i].state == 2)
          {
            status_temp = '<button type="button" class="am-btn am-btn-default am-btn-xs am-text-secondary bt-status"><span class="am-icon-spinner am-icon-spin"></span> </button>';
          }else
          {
             status_temp = '<button type="button" class="am-btn am-btn-default am-btn-xs am-text-danger bt-status"><span class="am-icon-stop"></span> </button>错误';
          }

          if(TStable.list[i].state == 0)
          {
            button_edit_temp =  '<button type="button" class="am-btn am-btn-default am-btn-xs am-text-secondary bt-edit"><span class="am-icon-pencil-square-o"></span> Edit</button>';
            button_delete_temp = '<button type="button" class="am-btn am-btn-default am-btn-xs am-text-danger am-hide-sm-only bt-delete"><span class="am-icon-trash-o"></span> Delete</button>';
          }else{
            button_edit_temp =  '<button type="button" class="am-btn am-btn-default am-btn-xs am-text-secondary bt-edit am-disabled"><span class="am-icon-pencil-square-o"></span> Edit</button>';
            button_delete_temp = '<button type="button" class="am-btn am-btn-default am-btn-xs am-text-danger am-hide-sm-only bt-delete am-disabled"><span class="am-icon-trash-o"></span> Delete</button>';

          }

          //var t = TStable.list[i].username;
          //var temp = t;//t.substr(0,2) + '-' + t.substr(2,2) + '-' + t.substr(4,2) + '-' + t.substr(6,2) + '-' + t.substr(8,2) + '-' + t.substr(10,2);
          TStable.display_list[i] = $('<tr id="'+ TStable.list[i].channel_id +'">' +
                      '<td>' + (i+1) + '</td>' +
                      '<td>'+ TStable.list[i].channel_id +'</td>' +
                      '<td>'+TStable.list[i].channel_name +'</td>' +
                      '<td>'+TStable.list[i].rtmp_url +'</td>' +
                      '<td>'+TStable.list[i].client_ip +'</td>' +
                      '<td>' +
                      '<div class="am-btn-toolbar">'+
                      '<div class="am-btn-group am-btn-group-xs" >'+
                      button_edit_temp +
                      button_delete_temp +                      
                      '</div></div></td>' +
                      '<td class="td-status"> '+
                      status_temp+
                      '</td>'+
                      '<td class="td-time">None</td>'+
                      '<td></td>'+
                      '</tr>'

                      );
          TStable.display_list[i].find('.bt-delete').click(deleteClick);
          TStable.display_list[i].find('.bt-edit').click(editClick);
          TStable.display_list[i].find('.bt-status').click(statusClick);
          }
        //maxPage = Math.ceil(TStable.list.length/Num);
        
        display();
        setBottom();
      });
};

//每页显示信息条数
var Num = 10;
var maxPage = 0; 

function display(){
  //curPage = page;
  $('tbody').find('tr').detach();
  var t = TStable.list.length;
  for(var i=0 ; i<t ; i++)
  {
    $('tbody').append(TStable.display_list[i]);
  }
 // setPagination(page);
  setBottom();

}

TStable.display1 = function(page){
  display(page);
}

function setBottom(){

    $("#bottom").text('共 '+ TStable.list.length+' 条记录');
  //$("#bottom").text('');
}

function setPagination(page){
  //remove
  //$(".am-pagination").find("li").remove();
  $(".am-pagination").html("");

  $(".am-pagination").append('<li><a class="am-icon-angle-double-left" href="#" onclick="TStable.display1(1)"></a></li>');

  if(page==1){
    $(".am-pagination").append('<li class="am-disabled"><a class="am-icon-angle-left" href="#" onclick="TStable.display1('+(page-1)+')"></a></li>');
  }else
  {
    $(".am-pagination").append('<li><a class="am-icon-angle-left" href="#" onclick="TStable.display1('+(page-1)+')"></a></li>');
  }

  console.log(maxPage);
  if(maxPage < 3.1)
  {

    for(i=0;i<maxPage;i++)
    {
      $(".am-pagination").append('<li id="page-'+(i+1)+'"><a href="#" onclick="TStable.display1('+(i+1)+')">'+(i+1)+'</a></li>');
    }

    $("#page-"+(page)).addClass("am-active");
    
  }else
  {
    var temp1 = page;
    var temp;
    if(page < 3)
    {
      temp = 1;
    }else if(page > maxPage - 3) 
    {
      temp = maxPage - 2;
    }else temp = temp1 -1;

    console.log("temp:"+temp);

    for(var i=temp - 1;i<temp+2;i++)
    {
      $(".am-pagination").append('<li id="page-'+(i+1)+'"><a href="#" onclick="TStable.display1('+(i+1)+')">'+(i+1)+'</a></li>');
    }

    $("#page-"+(page)).addClass("am-active");

  }

  if(page==maxPage){
    $(".am-pagination").append('<li class="am-disabled"><a class="am-icon-angle-right" href="#" onclick="TStable.display1('+(page+1)+')"></a></li>');
  }else
  {
    $(".am-pagination").append('<li><a class="am-icon-angle-right" href="#" onclick="TStable.display1('+(page+1)+')"></a></li>');
  }

  $(".am-pagination").append('<li><a class="am-icon-angle-double-right" href="#" onclick="TStable.display1('+maxPage+')"></a></li>');

  $(".am-pagination").append('  '+((curPage-1)*10+1) +'~'+ (TStable.list.length<((curPage-1)*10+10)?TStable.list.length:((curPage-1)*10+10)) +' of '+ TStable.list.length +' items');
  
}
//搜索
TStable.search = function(inputString){
  if(inputString == '') 
  {
    //alert('null!');
    display(curPage);
  }else
  {
	inputString = inputString.replace(/\-/g,'');
	console.log(inputString);
    //alert('not null!');
    var reg = new RegExp(inputString.toLowerCase());
    //alert('name:'+TStable.list[0].username + '   test:'+ reg.test(TStable.list[0].username.toLowerCase()));

    $('tbody').find('tr').detach();
    for(var i=0; i<TStable.list.length; i++)
    {
      if(reg.test(TStable.list[i].username.toLowerCase()))
      {
        $('tbody').append(TStable.display_list[i]);
      }
      //$(".am-text-danger").click(deleteClick);

      //remove
      $("#bottom").text('');
      $(".am-pagination").html("");
    }
  } 

}

function deleteClick(){

  $('#my-confirm').modal({
        relatedTarget: this,
        onConfirm: function(options) {
          var name = $(this.relatedTarget).parents("td").prev().prev().prev().prev().text();
          DeleteOneData(name);
        },
        // closeOnConfirm: false,
        onCancel: function() {
          //alert('Cancel');
        }
      });
}


var DeleteOneData = function(channel_id)
{
  //alert("delete:"+ TStable.list[id-1].username);
  $.get(deletePath, { op: "delete", id: channel_id },
    function(data){
      if(data=='Operate successed')
      {
        alert("Succeed!");
        LoadDataGet();
        return;
      }else if(data == 'Invalid Request'){
      alert("Failed!");
      LoadDataGet();
      return;
    }
  });

}
function continueClick()
{
	console.log('continue Click');
	$("#meet-prompt").modal({
        relatedTarget: this,
        closeViaDimmer: 0,
        onConfirm: function(e) {
          console.log('你输入的是：' + e.data[0] + '');
          console.log('number：' + e.data[1] + '');
          console.log(this);
          if(e.data=="" )
          {
            alert("continue failed");
          }else
          {
            // TStable.addData(e.data[0],e.data[1],e.data[2],e.data[3]);
             TStable.updateMeet(cur_click_id,e.data[0],e.data[1]);
          }        
          $.get(deletePath, { op: "status", id: cur_click_id ,s:"continue", time: e.data[1]},
      	        function(data){
      	          if(data=='Operate successed')
      	          {
      	            return;
      	          }else if(data == 'Invalid Request'){

      	          return;
      	        }else{
      	        }
      	      });         
          TStable.fresh();
          //count down start
          var time=parseInt(e.data[1])*60;
          m_timer(cur_click_id,time);
          TStable.fresh();
          button_edit.removeClass('am-disabled');
          button_delete.removeClass('am-disabled');
        },
        onCancel: function(e) {
      	  console.log('取消录制')
      	  TStable.fresh();
            button_edit.removeClass('am-disabled');
            button_delete.removeClass('am-disabled');
          //alert('不想说!');
        }
      })
}
function statusClick()
{
      console.log('status Click');

      cur_click_id = $(this).parents("td").prev().prev().prev().prev().prev().text();
      var operate ;

      if($(this).parents("td").text().indexOf("未运行") != -1)
      {
          operate = "start";
      }else{
          operate = "stop";
      }

     var temp = $(this).parents("td");
     var temp_this = $(this);
     var button_edit = $(this).parents("td").prev().find("button.bt-edit");
     var button_delete = $(this).parents("td").prev().find("button.bt-delete");
     var time_text = $(this).parent().next();
     console.log(time_text.html);
//     temp.html('<button type="button" class="am-btn am-btn-default am-btn-xs am-text-secondary bt-status"><span class="am-icon-spinner am-icon-spin"></span> </button>');
     TStable.fresh();
      //var id = $(this).parent().prev().prev().prev().prev().prev().text();
      if(operate == "start")
      {
        button_edit.addClass('am-disabled');
        button_delete.addClass('am-disabled');

        $("#meet-prompt").find("#meet-prompt-name").val("meet");

        $("#meet-prompt").modal({
          relatedTarget: this,
          closeViaDimmer: 0,
          onConfirm: function(e) {
            console.log('你输入的是：' + e.data[0] + '');
            console.log('number：' + e.data[1] + '');
            console.log(this);
            if(e.data=="" )
            {
              alert("添加失败");
            }else
            {
               TStable.updateMeet(cur_click_id,e.data[0],e.data[1]);
            }
            
            $.get(deletePath, { op: "status", id: cur_click_id ,s:operate, time: e.data[1]},
        	        function(data){
        	          if(data=='Operate successed')
        	          {

        	            return;
        	          }else if(data == 'Invalid Request'){

        	          return;
        	        }else{
        	        }
        	      });
//            console.log(temp_this);
//            temp_this.parent("tb").parent("tr").children("tb").find('.tb-time').html(e.data[1]);
            TStable.fresh();
            //count down start
            var time=parseInt(e.data[1])*60;
            m_timer(cur_click_id,time);
            TStable.fresh();
            button_edit.removeClass('am-disabled');
            button_delete.removeClass('am-disabled');
          },
          onCancel: function(e) {
        	  console.log('取消录制')
        	  TStable.fresh();
              button_edit.removeClass('am-disabled');
              button_delete.removeClass('am-disabled');
            //alert('不想说!');
          }
        });

      }else if(operate == "stop")
      {
     $.get(deletePath, { op: "status", id: cur_click_id ,s:operate},
  	        function(data){
  	          if(data=='Operate successed')
  	          {

  	            return;
  	          }else if(data == 'Invalid Request'){

  	          return;
  	        }else{
  	        }
  	      });
        button_edit.removeClass('am-disabled');
        button_delete.removeClass('am-disabled');
      }

      
}

TStable.deleteAllData = function(users)
{
	$.post(deletePath, { op: "deleteall", mac: users.toString() },
	    function(data){
	      if(data=='Operate successed')
	      {
	        alert("Succeed!");
	        LoadDataGet();
	        return;
	      }else if(data == 'Invalid Request'){
	      alert("Failed!");
	      LoadDataGet();
	      return;
	    }
	  });
}

function editClick()
{
  var name = $(this).parents("td").prev().prev().prev().prev().text();
  var password = $(this).parents("td").prev().prev().prev().text();
  var total =  $(this).parents("td").prev().prev().text();
  var client_ip =  $(this).parents("td").prev().text();
  $("#edit-prompt").find("#prompt-user").val(name);
  $("#edit-prompt").find("#prompt-password").val(password);
  $("#edit-prompt").find("#prompt-total").val(total);
  // $("#edit-prompt").find("#prompt-ip").val(client_ip);
  $("#edit-prompt").modal({
    relatedTarget: this,
    onConfirm: function(e) {
      //alert('你输入的是：' + e.data[1] || '');

      if(e.data[1]=="" || e.data[2] == "" || e.data[3] == "")
      {
        alert("编辑失败！" + e.data[1]+ '  ' + e.data[2] +'  ' + e.data[3] );
      }else{
         editData(e.data[0],e.data[1],e.data[2],e.data[3]);
      }
     
    },
    onCancel: function(e) {
      //alert('不想说!');
    }
  });
}

function editData(channel_id ,channel_name,rtmp_url,client_ip)
{
  //name = name.replace(/\-/g,'');
  $.get(editPath, { op: "edit", id:channel_id, name:channel_name ,url:rtmp_url,ip:client_ip },
    function(data){
      if(data=='Operate successed')
      {
        alert("Succeed!");
        LoadDataGet();
        return;
      }else if(data == 'Invalid Request'){
      alert("Failed!");
      LoadDataGet();
      return;
    }
  });
}

TStable.addData = function(channel_id,channel_name ,url,client_ip)
{
 //username = username.replace(/\-/g,'');
  $.get(addPath, { op: "add", id: channel_id , name:channel_name ,url: url ,ip: client_ip },
    function(data){
      if(data=='Operate successed')
      {
        alert("Succeed!");
        LoadDataGet();
        return;
      }else if(data == 'Invalid Request'){
      alert("Failed!");
      LoadDataGet();
      return;
    }else if(data == 'exist'){
    	alert("already exist!");
    	LoadDataGet();
        return;
    }
  });

}

TStable.updateMeet = function(channel_id,name,time)
{
	console.log("name="+name);
    $.get(addPath, { op: "meet", id: channel_id , name:name ,time:time},
    function(data){
      if(data=='Operate successed')
      {
        alert("Succeed!");
        return;
      }else if(data == 'Invalid Request'){
      alert("Failed!");
      return;
    }
  });
}

TStable.fresh = function()
{

  //console.log("inside call");
  var temp_list = [];

  $.get(loadPath, { op: "category"},function(data){
        //alert(String(data));
        var parsedJson = jQuery.parseJSON(data); 
        //alert(parsedJson.users); 
        $.each(parsedJson.category,function(idx,item){ 
          //alert(item.username);

          temp_list.push(new DATA(item.channel_id,item.channel_name,item.rtmp_url,item.client_ip,item.st));

       });

      for(var i=0;i<temp_list.length;i++)
      {
        if(temp_list[i].channel_id == TStable.list[i].channel_id)
        {
          //console.log('true');
//          if(  temp_list[i].state != 2)
//          {

            var t = $("#" + temp_list[i].channel_id);
            if(temp_list[i].state == 2)
            {
                t.children().find('.td-status').html('<button type="button" class="am-btn am-btn-default am-btn-xs am-text-secondary bt-status"><span class="am-icon-spinner am-icon-spin"></span> </button>');
            }else if(temp_list[i].state == 0)
            {
                t.children().find('.td-status').html('<button type="button" class="am-btn am-btn-default am-btn-xs am-text-secondary bt-status"><span class="am-icon-play"></span> </button>未运行');
                t.find('.bt-status').click(statusClick);
            }else if(temp_list[i].state == 1)
            {
                t.children().find('.td-status').html('<button type="butto" class="am-btn am-btn-default am-btn-xs am-text-danger bt-status"><span class="am-icon-stop"></span> </button>已运行');
                t.find('.bt-status').click(statusClick);
            }else
            {
                t.children().find('.td-status').html('<button type="butto" class="am-btn am-btn-default am-btn-xs am-text-danger bt-status"><span class="am-icon-stop"></span> </button>错误');
                t.find('.bt-status').click(statusClick);
            }
            t.children().last().html('<button type="button" class="am-btn am-btn-default am-btn-xs am-text-secondary bt-edit bt-continue"><span class="am-icon-pencil-square-o"></span>Continue</button>');
            t.find('.bt-continue').click(continueClick);
            if(temp_list[i].state == 3)
            {
                alert(temp_list[i].channel_id + "  启动失败");
                t.find('.bt-status').trigger('click');
            }

        }
      }

        //console.log(temp_list[i].channel_id + '  '+ TStable.list[i].channel_id);
       
  });


  // for(var i = 0;i < TStable.list.length;i++)
  // {

  //   var client_ip;
  //   if(TStable.list[i].client_ip.indexOf(":") == -1)
  //   {
  //     client_ip = TStable.list[i].client_ip;

  //   }else 
  //   {
  //     var client_ip = TStable.list[i].client_ip.substr(0,TStable.list[i].client_ip.indexOf(":"));
  //   }

    

  //   var replay_url = 'http://' + client_ip + ':9999/status/' + TStable.list[i].channel_id;

  //   // $.get(replay_url,function(data){
  //   //   console.log('get  ' + replay_url)
  //   //   var t = $("#" + TStable.list[i].channel_id);
  //   //   t.children().last().html(data);

  //   // });
  //   getStatus(replay_url,TStable.list[i].channel_id);

  // }
  

}


function getStatus(url, id)
{

  // $.get(url,function(data,status){
  //     //console.log('get  ' + url)
  //     var t = $("#" + id);
  //     // console.log(status)
  //     if(status == "success")
  //     {      
  //       t.children().last().html(data);
  //     }else
  //     {
  //       t.children().last().html("");
  //     }

  // });

}
//function daoJiShi(id)
//{
// var now=new Date();
// var oft=Math.round((endDate-now)/1000);
// var ofd=parseInt(oft/3600/24);
// var ofh=parseInt((oft%(3600*24))/3600);
// var ofm=parseInt((oft%3600)/60);
// var ofs=oft%60;
// document.getElementById('timer').innerHTML='还有 '+ofd+' 天 ' +ofh+ ' 小时 ' +ofm+ ' 分钟 ' +ofs+ ' 秒';
// if(ofs<0){document.getElementById('timer').innerHTML='倒计时结束！';return;};
// setTimeout('daoJiShi()',1000);
//}
//@id: channel_id
//@time: time in seconds
function m_timer(id,time)
{
	var t = parseInt(time);
	var min = parseInt(t/60);
	var sec = parseInt(t%60);
	$("#"+id).children().last().innerText(min+":"+sec);
	if(t == 0){	
		return;
	}
	t -=1;
	setTimeout(function(){
		m_timer(id,t);
	},1000);
}
$(function (){
	console.log("init done");
});

//绑定全局变量
window.TStable = TStable;

})(jQuery);
