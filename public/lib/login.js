function openSignup(){
    $("#signinBox").hide();
    $("#signupBox").show();
    return false;
}

function openSignin(){
    $("#signupBox").hide();
    $("#signinBox").show();
    return false;
}

function submitSignin(){
    $.cookie('egraph', 'true', { expires: 365});
    document.location.reload(true);
    return false;
}

function submitSignup(){
    $.cookie('egraph', 'true', { expires: 365});
    document.location.reload(true);
    return false;
}

function logout(){
    $.removeCookie("egraph");
    document.location.reload(true);
    return false;
}
function openSignupStep2(){
    $("#signupBox").hide();
    $("#signupBoxStep2-1").show();
    return false;
}

function finishRegistration()
{
    $("#signupBoxStep2-1").hide();
    $("#lastBox").show();
    return false;
}

function backToLogin()
{
    $("#signupBox").hide();
    $("#signupBoxStep2-1").hide();
    $("#lastBox").hide();
    $("#signinBox").show();
    return false;
}



$( document ).ready(function() {

    $( "a.next_button_step-1" ).on( "click", function() {
        $(this).parent().parent().parent().siblings().children("a").trigger("click");
        $(this).parent().parent().parent().parent().next().children().children("a").trigger("click");
    });

});


