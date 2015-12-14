/**
 * Created by SZ on 2015/11/26.
 */
var origin = $("#origin");
var newPwd = $("#new");
var again = $("#again");
function checkOrigin(){
    var originPwd=$("#originPwd");
    if(origin.val()==""){
        originPwd.css({'color':'red'},{'margin-left':'10px'});
        originPwd.html("密码为空，请重新输入密码");
    }
    else{
        $.ajax({
            type:"post",
            url:"/author/getPwd/",
            data:{'password':origin.val()},
            dataType:"json",
            success:function(data){
                if(data.done==true){
                    originPwd.css({'color':'green'},{'margin-left':'10px'});
                    originPwd.html("密码正确");

                }
                else{
                    originPwd.css({'color':'red'},{'margin-left':'10px'});
                    originPwd.html("密码错误");
                    origin.focus();

                }
            }
        })
    }

}
function checkNew(){
    var newPassword=$("#newPassword");
    if(newPwd.val()==""||newPwd.val().length<6||newPwd.val().length>12){
        newPassword.css({'color':'red'},{'margin-left':'10px'});
        newPassword.html("设置密码:6-12位字符（由数字、字母组合）");
        newPassword.focus();
    }
    else{
        newPassword.css({'color':'green'},{'margin-left':'10px'});
        newPassword.html("密码可用");

    }
}
function checkAgain() {
    var newAgain = $("#newAgain");
    if (again.val() == ""){
        newAgain.css({'color': 'red'}, {'margin-left': '10px'});
        newAgain.html("请再次输入您的密码");
        newAgain.focus();

    }
    else {
        if (again.val() != newPwd.val()) {
            newAgain.css({'color': 'red'}, {'margin-left': '10px'});
            newAgain.html("两次密码输入不一致，请再次输入");
            newAgain.focus();
        }
        else {
            newAgain.css({'color': 'green'}, {'margin-left': '10px'});
            newAgain.html("密码输入正确");

        }
    }
}
$("#submit").click(function(){
    if(origin.val()==""||$("#originPwd").html()=="密码错误"){
        origin.focus();
    }
    else{
        $.ajax({
            //method:"post",
            type:"post",
            url:"/author/resetPwd/",
            dataType:"json",
            data:{'newPwd1':newPwd.val()},
            success:function(data){
                if(data.done==true){
                    window.location.href="/author/index/";
                }
                else{
                    alert("重置密码失败");
                }
            }
        })
    }
});