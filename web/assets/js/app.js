(function ($) {

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
        init: function () {
            LoadDataGet();
        }
    };

    TStable.list = [];
    TStable.display_list = [];
    TStable.sel_list = [];

    function DATA(channel_id, channel_name, rtmp_url, client_ip, status) {
        this.channel_id = channel_id;
        this.channel_name = channel_name;
        this.rtmp_url = rtmp_url;
        this.client_ip = client_ip;
        this.state = status;
    }

    var meet_name_map = {};
    var has_timer = {};
    var time_map = {};
    var status_map = {};

    function SEL(channel_id, channel_name) {
        this.channel_id = channel_id;
        this.channel_name = channel_name;
    }

    var curPage = 1;

//get 方法同步
// $.ajaxSetup({
//     async : false
// });

//HTTP协议下使用，使用本站数据
    var LoadDataGet = function () {
        TStable.list = [];
        TStable.display_list = [];
        TStable.sel_list = [];

        $.get(loadPath, {op: "category"}, function (data) {
            //alert(String(data));
            var parsedJson = jQuery.parseJSON(data);
            $.each(parsedJson.category, function (idx, item) {
                TStable.list.push(new DATA(item.channel_id, item.channel_name, item.rtmp_url, item.client_ip, item.st));
            });
            $.each(parsedJson.sel, function (idx, item) {
                TStable.sel_list.push(new SEL(item.channel_id, item.channel_name));
            });
            var status_temp;
            var button_delete_temp;
            var button_edit_temp;
            var button_continue;

            //alert(TStable.list.length);
            for (var i = 0; i < TStable.list.length; i++) {
                if (TStable.list[i].state == 1) {
                    status_temp = '<button type="button" class="am-btn am-btn-default am-btn-xs am-text-danger bt-status"><span class="am-icon-stop"></span> </button>已运行';
                } else if (TStable.list[i].state == 0) {
                    status_temp = '<button type="button" class="am-btn am-btn-default am-btn-xs am-text-secondary bt-status"><span class="am-icon-play"></span> </button>未运行';
                } else if (TStable.list[i].state == 2) {
                    status_temp = '<button type="button" class="am-btn am-btn-default am-btn-xs am-text-secondary bt-status"><span class="am-icon-spinner am-icon-spin"></span> </button>';
                } else {
                    status_temp = '<button type="button" class="am-btn am-btn-default am-btn-xs am-text-danger bt-status"><span class="am-icon-stop"></span> </button>错误';
                }

                if (TStable.list[i].state == 0) {
                    button_edit_temp = '<button type="button" class="am-btn am-btn-default am-btn-xs am-text-secondary bt-edit"><span class="am-icon-pencil-square-o"></span> Edit</button>';
                    button_delete_temp = '<button type="button" class="am-btn am-btn-default am-btn-xs am-text-danger am-hide-sm-only bt-delete"><span class="am-icon-trash-o"></span> Delete</button>';
                    button_continue= '<button type="button" class="am-btn am-btn-default am-btn-xs am-text-secondary bt-continue am-disabled"><span class="am-icon-pencil-square-o"></span>Continue</button>';
                } else {
                    button_edit_temp = '<button type="button" class="am-btn am-btn-default am-btn-xs am-text-secondary bt-edit am-disabled"><span class="am-icon-pencil-square-o"></span> Edit</button>';
                    button_delete_temp = '<button type="button" class="am-btn am-btn-default am-btn-xs am-text-danger am-hide-sm-only bt-delete am-disabled"><span class="am-icon-trash-o"></span> Delete</button>';
                    button_continue= '<button type="button" class="am-btn am-btn-default am-btn-xs am-text-secondary bt-continue"><span class="am-icon-pencil-square-o"></span>Continue</button>';
                }

                //var t = TStable.list[i].username;
                //var temp = t;//t.substr(0,2) + '-' + t.substr(2,2) + '-' + t.substr(4,2) + '-' + t.substr(6,2) + '-' + t.substr(8,2) + '-' + t.substr(10,2);
                TStable.display_list[i] = $('<tr id="' + TStable.list[i].channel_id + '">' +
                    '<td>' + (i + 1) + '</td>' +
                    '<td>' + TStable.list[i].channel_id + '</td>' +
                    '<td>' + TStable.list[i].channel_name + '</td>' +
                    '<td>' + TStable.list[i].rtmp_url + '</td>' +
                    '<td>' + TStable.list[i].client_ip + '</td>' +
                    '<td>' +
                    '<div class="am-btn-toolbar">' +
                    '<div class="am-btn-group am-btn-group-xs" >' +
                    button_edit_temp +
                    button_delete_temp +
                    '</div></div></td>' +
                    '<td class="td-status"> ' +
                    status_temp +
                    '</td>' +
                    '<td class="td-time">-:-:-</td>' +
                    '<td>'+button_continue+'</td>' +
                    '</tr>'
                );
                TStable.display_list[i].find('.bt-delete').click(deleteClick);
                TStable.display_list[i].find('.bt-edit').click(editClick);
                TStable.display_list[i].find('.bt-status').click(statusClick);
                TStable.display_list[i].find('.bt-continue').click(continueClick);
            }
            display();
            setBottom();
        });
    };

//每页显示信息条数
    var Num = 10;
    var maxPage = 0;

    function display() {
        $('tbody').find('tr').detach();
        var t = TStable.list.length;
        for (var i = 0; i < t; i++) {
            $('tbody').append(TStable.display_list[i]);
        }
        setBottom();
    }

    TStable.display1 = function (page) {
        display(page);
    }

    function setBottom() {
        $("#bottom").text('共 ' + TStable.list.length + ' 条记录');
    }

    function deleteClick() {
        $('#my-confirm').modal({
            relatedTarget: this,
            onConfirm: function (options) {
                var name = $(this.relatedTarget).parents("td").prev().prev().prev().prev().text();
                DeleteOneData(name);
            },
            // closeOnConfirm: false,
            onCancel: function () {
                //alert('Cancel');
            }
        });
    }


    var DeleteOneData = function (channel_id) {
        //alert("delete:"+ TStable.list[id-1].username);
        $.get(deletePath, {op: "delete", id: channel_id},
            function (data) {
                if (data == 'Operate successed') {
                    alert("Succeed!");
                    LoadDataGet();
                } else if (data == 'Invalid Request') {
                    alert("Failed!");
                    LoadDataGet();
                }
            });

    }

    function continueClick() {
        console.log('continue Click');
        cur_click_id = $(this).parents("td").parent().children().first().next().text();
        console.log(cur_click_id);
        var pre_name = meet_name_map[cur_click_id];
        if(pre_name == ""){
            $("#meet-continue").find("#meet-continue-name").val("new meet");
        }else{
            $("#meet-continue").find("#meet-continue-name").val(pre_name);
        }
        $("#meet-continue").modal({
            relatedTarget: this,
            closeViaDimmer: 0,
            onConfirm: function (e) {
                status_map[cur_click_id] = false;
                console.log('你输入的是：' + e.data[0] + '');
                console.log('number：' + e.data[1] + '');
//          status_map[cur_click_id]=true;
                console.log("continue send op: continue");
                if (e.data == "") {
                    alert("continue failed");
                } else {
                    // TStable.addData(e.data[0],e.data[1],e.data[2],e.data[3]);
                    TStable.updateMeet(cur_click_id, e.data[0], e.data[1]);
                }
                console.log("continue send op: continue");
                $.get(deletePath, {op: "status", id: cur_click_id, s: "continue", time: e.data[1]},
                    function (data) {
                        if (data == 'Operate successed') {
                            status_map[cur_click_id] = true;
                            //count down start
                            TStable.fresh();
                            var time = parseInt(e.data[1]) * 60;
                            console.log("new time=" + time);
                            time_map[cur_click_id] = time;
                        } else if (data == 'Operate failed') {
                            status_map[cur_click_id] = false;
                        } else if (data == 'Cancel Ok') {
                            status_map[cur_click_id] = false;
                        }
                    });
            },
            onCancel: function (e) {
                console.log('取消录制')
                TStable.fresh();
            }
        })
    }

    function statusClick() {

        console.log('status Click');
        cur_click_id = $(this).parents("td").prev().prev().prev().prev().prev().text();
        var operate;

        if ($(this).parents("td").text().indexOf("未运行") != -1) {
            operate = "start";
        } else {
            operate = "stop";
        }
        var temp = $(this).parents("td");
        var temp_this = $(this);
        var button_edit = $("#"+cur_click_id).find("button.bt-edit");
        var button_delete = $("#"+cur_click_id).find("button.bt-delete");
        if (operate == "start") {
            button_edit.addClass('am-disabled');
            button_delete.addClass('am-disabled');

            $("#meet-prompt").find("#meet-prompt-name").val("meet");

            $("#meet-prompt").modal({
                relatedTarget: this,
                closeViaDimmer: 0,
                onConfirm: function (e) {
                    console.log('你输入的是：' + e.data[0] + '');
                    console.log('number：' + e.data[1] + '');
                    status_map[cur_click_id] = true;
                    meet_name_map[cur_click_id] = e.data[0];
                    if (e.data == "") {
                        alert("添加失败");
                    } else {
                        TStable.updateMeet(cur_click_id, e.data[0], e.data[1]);
                    }

                    $.get(deletePath, {op: "status", id: cur_click_id, s: operate, time: e.data[1]},
                        function (data) {
                            if (data == 'Operate successed') {
                                console.log("regester continue click done");
                                TStable.fresh();
                                //count down start
                                var time = parseInt(e.data[1]) * 60;
                                time_map[cur_click_id] = time;
                                if (has_timer[cur_click_id]) {
//            	has_timer[cur_click_id]=true;
                                } else {
                                    m_timer(cur_click_id);
                                    has_timer[cur_click_id] = true;
                                }
                            } else if (data == 'Invalid Request') {
                            } else {
                            }
                        });
//            TStable.fresh();
//                     var t = $("#" + cur_click_id);
                    // t.children().last().html('<button type="button" class="am-btn am-btn-default am-btn-xs am-text-secondary bt-continue"><span class="am-icon-pencil-square-o"></span>Continue</button>');
                    // t.find('.bt-continue').click(continueClick);


                },
                onCancel: function (e) {
                    console.log('取消录制')
//    	      TStable.fresh();
                    console.log(button_edit);
                    $("#"+cur_click_id).find("button.bt-edit").removeClass('am-disabled');
                    $("#"+cur_click_id).find("button.bt-delete").removeClass('am-disabled');
                    //alert('不想说!');
                }
            });

        }
        if (operate == "stop") {
            $.get(deletePath, {op: "status", id: cur_click_id, s: operate},
                function (data) {
                    if (data == 'Operate successed') {
                        time_map[cur_click_id] = 0;
                        TStable.fresh();
                    } else if (data == 'Invalid Request') {
                    } else {
                    }
                });
            button_edit.removeClass('am-disabled');
            button_delete.removeClass('am-disabled');
        }
    }

    TStable.deleteAllData = function (users) {
        $.post(deletePath, {op: "deleteall", mac: users.toString()},
            function (data) {
                if (data == 'Operate successed') {
                    alert("Succeed!");
                    LoadDataGet();
                } else if (data == 'Invalid Request') {
                    alert("Failed!");
                    LoadDataGet();
                }
            });
    }

    function editClick() {
        var name = $(this).parents("td").prev().prev().prev().prev().text();
        var password = $(this).parents("td").prev().prev().prev().text();
        var total = $(this).parents("td").prev().prev().text();
        var client_ip = $(this).parents("td").prev().text();
        $("#edit-prompt").find("#prompt-user").val(name);
        $("#edit-prompt").find("#prompt-password").val(password);
        $("#edit-prompt").find("#prompt-total").val(total);
        // $("#edit-prompt").find("#prompt-ip").val(client_ip);
        $("#edit-prompt").modal({
            relatedTarget: this,
            onConfirm: function (e) {
                //alert('你输入的是：' + e.data[1] || '');
                if (e.data[1] == "" || e.data[2] == "" || e.data[3] == "") {
                    alert("编辑失败！" + e.data[1] + '  ' + e.data[2] + '  ' + e.data[3]);
                } else {
                    editData(e.data[0], e.data[1], e.data[2], e.data[3]);
                }
            },
            onCancel: function (e) {
            }
        });
    }

    function editData(channel_id, channel_name, rtmp_url, client_ip) {
        //name = name.replace(/\-/g,'');
        $.get(editPath, {op: "edit", id: channel_id, name: channel_name, url: rtmp_url, ip: client_ip},
            function (data) {
                if (data == 'Operate successed') {
                    alert("Succeed!");
                    LoadDataGet();
                } else if (data == 'Invalid Request') {
                    alert("Failed!");
                    LoadDataGet();
                }
            });
    }

    TStable.addData = function (channel_id, channel_name, url, client_ip) {
        //username = username.replace(/\-/g,'');
        $.get(addPath, {op: "add", id: channel_id, name: channel_name, url: url, ip: client_ip},
            function (data) {
                if (data == 'Operate successed') {
                    alert("Succeed!");
                    LoadDataGet();
                } else if (data == 'Invalid Request') {
                    alert("Failed!");
                    LoadDataGet();
                } else if (data == 'exist') {
                    alert("already exist!");
                    LoadDataGet();
                }
            });

    }

    TStable.updateMeet = function (channel_id, name, time) {
        console.log("name=" + name);
        $.get(addPath, {op: "meet", id: channel_id, name: name, time: time},
            function (data) {
                if (data == 'Operate successed') {
                    alert("Succeed!");
                } else if (data == 'Invalid Request') {
                    alert("Failed!");
                }
            });
    }

    TStable.fresh = function () {
        //console.log("inside call");
        var temp_list = [];
        $.get(loadPath, {op: "category"}, function (data) {
            //alert(String(data));
            var parsedJson = jQuery.parseJSON(data);
            //alert(parsedJson.users);
            $.each(parsedJson.category, function (idx, item) {
                //alert(item.username);
                temp_list.push(new DATA(item.channel_id, item.channel_name, item.rtmp_url, item.client_ip, item.st));
            });

            for (var i = 0; i < temp_list.length; i++) {
                if (temp_list[i].channel_id == TStable.list[i].channel_id) {
                    var t = $("#" + temp_list[i].channel_id);
                    var button_edit = t.find("button.bt-edit");
                    var button_delete = t.find("button.bt-delete");
                    var button_continue = t.find("button.bt-continue");
                    if (temp_list[i].state == 2) {
                        t.find('.td-status').html('<button type="button" class="am-btn am-btn-default am-btn-xs am-text-secondary bt-status"><span class="am-icon-spinner am-icon-spin"></span> </button>');
                    } else if (temp_list[i].state == 0) {
                        t.find('.td-status').html('<button type="button" class="am-btn am-btn-default am-btn-xs am-text-secondary bt-status"><span class="am-icon-play"></span> </button>未运行');
                        t.find('.bt-status').click(statusClick);
                        button_continue.addClass('am-disabled');
                    } else if (temp_list[i].state == 1) {
                        t.find('.td-status').html('<button type="button" class="am-btn am-btn-default am-btn-xs am-text-danger bt-status"><span class="am-icon-stop"></span> </button>已运行');
                        t.find('.bt-status').click(statusClick);
                        button_continue.removeClass('am-disabled');
                    } else {
                        t.find('.td-status').html('<button type="button" class="am-btn am-btn-default am-btn-xs am-text-danger bt-status"><span class="am-icon-stop"></span> </button>错误');
                        t.find('.bt-status').click(statusClick);
                    }

                    if (temp_list[i].state == 3) {
                        alert(temp_list[i].channel_id + "  启动失败");
                        t.find('.bt-status').trigger('click');
                    }
                }
            }

            //console.log(temp_list[i].channel_id + '  '+ TStable.list[i].channel_id);

        });

    }
    function zfill(num, size){
        var s = "000000000" + num;
        return s.substr(s.length-size);
    }
    function m_timer(id) {
        window.setInterval(function () {
            if (time_map[id] == 0)
                time_map[id] = 0;
            else
                time_map[id]--;

            var t = parseInt(time_map[id]);
            // console.log(t);
            if (t == 0) {
                $("#" + id).children().last().prev().html("-:-:-");
                //console.log("timer done");
                return;
            }
            var hour = parseInt(t / 3600);
            var min = parseInt(t / 60 % 60);
            var sec = parseInt(t % 60);
            hour= zfill(hour,2);
            min = zfill(min, 2);
            sec = zfill(sec, 2);
            $("#" + id).children().last().prev().html(hour + ":" + min + ":" + sec);
        }, 1000);
    }

    $(function () {
        console.log("init done");
        // $('.bt-status').click(statusClick);
    });

//绑定全局变量
    window.TStable = TStable;

})(jQuery);
