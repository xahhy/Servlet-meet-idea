// JavaScript Document
/*页面初始化：播放器*/

var thePlayer;  //保存当前播放器以便操作  
$(function() {
	thePlayer = jwplayer('player').setup({
		file:nowrtmp,
		width: "100%",
		aspectratio: "16:9",
		//height:"100%",
		primary: 'html5',
		autostart:true,
		bufferlength:10,
		rtmp:{ bufferlength:3},
		stretching:"exactfit",
		startparam:"start",
        });
		//thePlayer.load([{file:nowrtmp}]);
});

function replace_ip(url,ip)
{
  url = url.substr(url.indexOf("/",10));
  return "http://" + ip + url;  
}

/*功能：外联节目列表*/
function playTrailer(video) { 
  // video = replace_ip(video,cur_ip);

  thePlayer.load([{
    file: video,
  }]);
}

/*页面初始化：节目单*/
//var firstjiemudan;
function firstjiemudan(e){
	$('ul[name=list] li').detach();
	$.getJSON(ip_url+'/meet/serv?feed=channel&list='+e+'&d=0',function(data){
	var s = data.list;
	$(s).each(function(index) {
		var arry=this.start_time.substring(11,16);
		var brry=this.end_time.substring(11,16);
		var timebegin=parseInt(this.start_time.substring(11,13).concat(this.start_time.substring(14,16)));
		var timeend=parseInt(this.end_time.substring(11,13).concat(this.end_time.substring(14,16)));  
		var timed=new Date();var timedh=timed.getHours();var timedm=timed.getMinutes();var timenow=timedh*100+timedm;
		var nowplaying=" ", nowplayingtxt=" ";
		var crry="finish";
		
		// if(timenow<=timeend && timenow>timebegin){
		// 	// nowplaying="nowzhibo";nowplayingtxt="正在直播：";
		// 	// $('ul[name=list]').append('<li class="'+crry+' '+nowplaying+'"st="'+this.start_time+'" et="'+this.end_time+'"><a href="javascript:('+"'"+nowrtmp+"'"+')">'+nowplayingtxt+arry+"--"+brry+" "+this.title+"</a></li>");
		// }
		// else{
		
		if(this.finished==0){
			// if(timenow<=timeend){
			// crry="";
			// $('ul[name=list]').append('<li class="'+crry+' '+nowplaying+'"st="'+this.start_time+'" et="'+this.end_time+'">'+nowplayingtxt+arry+"--"+brry+" "+this.title+"</li>");
			// }
		}
		else{
			$('ul[name=list]').append('<li class="'+crry+' '+nowplaying+'"st="'+this.start_time+'" et="'+this.end_time+'"><a href="javascript:playTrailer('+"'"+replace_ip(this.url,cur_ip)+"'"+')">'+nowplayingtxt+arry+"--"+brry+" "+this.title+"</a></li>");
		
		}
		// }
		$("ul[name=list]>li>a").click(function(){
		$("ul[name=list]>li").removeClass("nowplaying");
		$(this).parent().addClass("nowplaying");
		});
		});
	});
};
firstjiemudan(now_channel);
/*页面初始化：日历*********功能：日期筛选节目单*/
var day=new Date().getDay();
var dd=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
var year=new Date().getFullYear();
var month=new Date().getMonth()+1;
var date=new Date().getDate();
for(var i in dd){
	$(function(n){
		var m=n*1+day*1+1;
		var ddate=date-6+n*1;
		var jsond=6-n*1;
		if(m>6){m-=7;}
		$(document).ready(function(){
			$("[name=week]").append('<li name="'+dd[m]+'">'+month+'.'+ddate+"<br/>"+dd[m]+'</li>');//生成日期导航
			
		});
	}(i));
}; 
function huikan_click(e){
	for(var i in dd){
		$(function(n){
			var m=n*1+day*1+1;
			var ddate=date-6+n*1;
			var jsond=6-n*1;
			if(m>6){m-=7;}
			//$("[name=week]").append('<li name="'+dd[m]+'">'+month+'.'+ddate+"<br/>"+dd[m]+'</li>');//生成日期导航
			if($("[name="+dd[m]+"]").hasClass("nowplaying")){
				$('ul[name=list] li').detach();
				$.getJSON(ip_url+'/meet/serv?feed=channel&list='+e+'&d='+jsond,function(data){
					var s = data.list;
					$(s).each(function(index) {
					var arry=this.start_time.substring(11,16);
					var brry=this.end_time.substring(11,16);
					var crry="finish";
					if(this.finished==0){}
					else{
						$('ul[name=list]').append('<li class="'+crry+' '+'"st="'+this.start_time+'" et="'+this.end_time+'"><a href="javascript:playTrailer('+"'"+replace_ip(this.url,cur_ip)+"'"+')">'+arry+"--"+brry+" "+this.title+"</a></li>");
					}
					});
					$("ul[name=list]>li>a").click(function(){
		$("ul[name=list]>li").removeClass("nowplaying");
		$(this).parent().addClass("nowplaying");
		});
				});
				
			}
			
		}(i));
	}; 
};
function weekjiemudan(e){
for(var i in dd){
	$(function(n){
		var m=n*1+day*1+1;
		var ddate=date-6+n*1;
		var jsond=6-n*1;
		if(m>6){m-=7;}
			//$("[name=week]").append('<li name="'+dd[m]+'">'+month+'.'+ddate+"<br/>"+dd[m]+'</li>');//生成日期导航
		$("[name="+dd[m]+"]").off("click");
		$("[name="+dd[m]+"]").click(function(){
				$("[name=week] li").removeClass("nowplaying");
				$("[name="+dd[m]+"]").addClass("nowplaying");
				$('ul[name=list] li').detach();
				$.getJSON(ip_url+'/meet/serv?feed=channel&list='+e+'&d='+jsond,function(data){
					var s = data.list;
					$(s).each(function(index) {
						var arry=this.start_time.substring(11,16);
						var brry=this.end_time.substring(11,16);
						var crry="finish";
						if(this.finished==0){}
						else{
							$('ul[name=list]').append('<li class="'+crry+' '+'"st="'+this.start_time+'" et="'+this.end_time+'"><a href="javascript:playTrailer('+"'"+replace_ip(this.url,cur_ip)+"'"+')">'+arry+"--"+brry+" "+this.title+"</a></li>");
						}
					});
					$("ul[name=list]>li>a").click(function(){
		$("ul[name=list]>li").removeClass("nowplaying");
		$(this).parent().addClass("nowplaying");
		});
				});
		});
					
	}(i));
}; 
$("[name=week] li").hasClass("nowplaying",function(){
	alert("123");
	$('ul[name=list] li').detach();
	$.getJSON(ip_url+'/meet/serv?feed=channel&list='+e+'&d='+jsond,function(data){
		var s = data.list;
		$(s).each(function(index) {
			var arry=this.start_time.substring(11,16);
			var brry=this.end_time.substring(11,16);
			var crry="finish";
			if(this.finished==0){}
			else{
				$('ul[name=list]').append('<li class="'+crry+' '+'"st="'+this.start_time+'" et="'+this.end_time+'"><a href="javascript:playTrailer('+"'"+replace_ip(this.url,cur_ip)+"'"+')">'+arry+"--"+brry+" "+this.title+"</a></li>");
			}
		});
	});
});
};
weekjiemudan(now_channel);
$(document).ready(function(){$("ul[name=week] li:last-child").css({"margin-right":"0"}).addClass("nowplaying");;});//调整边距，对齐

/*响应式页面设置*/
var w = $(window).width(); 
var h = $(window).height();
var nav = h/2 - 50;
$(window).resize(function(){
w = $(window).width();
h = $(window).height();
nav = h/2 - 50;
$(document).ready(function(){$("#container,#menu,#nav").height(h);$(".nav").css({"top":nav});});
});//实时调整各模块大小
$(document).ready(function(){$("#container,#menu,#nav").height(h);$(".nav").css({"top":nav});});

///*功能：导航栏的展开与收起*/
//$(document).ready(function() {
//	$('.icono-outdent').click(function(){
//		$("#menu").css({width:'0'}).hide('slow');
//		$("#container").css({width:'90%'});
//		$(this).hide();
//		$('.icono-indent').show();
//	});//关闭侧栏
//	$('.icono-indent').click(function(){
//		$("#menu").css({width:'30%'}).show();
//		$("#container").css({width:'60%'});
//		$(this).hide();
//		$('.icono-outdent').show();
//	});//展开侧栏
//});
/*功能：点播页面和直播页面的相互切换(1)*/
$(document).ready(function() {
		$('.dianbo').click(function(){
			huikan_click(now_channel);
    	$('.zhibo').css({width:'30%'}).removeClass('now');
		$('.dianbo').css({width:'69%'}).ready(function(){$('[name=week]').show();weekjiemudan(now_channel);}).addClass('now');
		
	});//切换到点播标签
	$('.zhibo').click(function(){	
		$('[name=week]').hide();
		$('.zhibo').css({width:'69%'}).addClass('now');
		$('.dianbo').css ({width:'30%'}).ready(function(){firstjiemudan(now_channel);}).removeClass('now');
	});
}); //切换到直播标签

/*页面初始化：当前直播的频道与节目*/
//$(document).ready(function() {
//   // $(".finish:last").next().addClass("nowplaying").css({"color":"#000"}).children(this).prepend("<b>正在直播：</b>");
//	//$("[name=CCTV1]").css({'color':"#red"});//('<i class="icono-youtube"></i>');
//});

/*功能：选择观看的节目高亮*//*
$(document).ready(function() {
    $("ul[name=list]>li>a").click(function(){
		alert("test");
		$("ul[name=list] li").removeClass("nowplaying");
		$(this).addClass("nowplaying");
	});
});*/

/*页面初始化：频道列表*/
$(document).ready(function() {
	$.getJSON(ip_url+'/meet/serv?feed=category',function(data){
		var dchan=data.category;
		$(dchan).each(function(key,index){
			var nowchannelcss=' ';
			if(this.channel_id==now_channel){
				nowchannelcss='class="now";';
			}
		  $(".channel").append('<li '+nowchannelcss+' name="'+this.channel_id+'"><a href="javascript:playTrailer('+"'"+this.rtmp_url+"'"+')">'+this.channel_name+'</a></li>');
		  var kkey=key+2;
		  $("ul.channel li:nth-child("+kkey+")").addClass("'"+key+"'").click(function(){
			  $('ul.channel li').removeClass('now');
			  $(this).addClass('now');
				now_channel=index.channel_id;
				nowrtmp=index.rtmp_url;
				if($('.zhibo').hasClass('now')){
					firstjiemudan(now_channel);
				}
				else{
					huikan_click(now_channel);weekjiemudan(now_channel);
				}
		  });
		});
	});
});
