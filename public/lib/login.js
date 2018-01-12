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


$( document ).ready(function() {

    $( "a.next_button_step-1" ).on( "click", function() {
        console.log($(this).parent().parent().parent().siblings(".eq-ui-collapsible-header a"));
        /*console.log($(this).parent().parent().parent().parent().siblings("li .eq-ui-collapsible-header a"));*/



        $(this).parent().parent().parent().siblings(".eq-ui-collapsible-header a").trigger("click");
        /*$(this).parent().parent().parent().parent().siblings("li .eq-ui-collapsible-header a").trigger("click");*/

    });

});


