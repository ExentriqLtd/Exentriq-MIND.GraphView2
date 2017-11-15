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