function initAdmin()
	{
	$.templates("userList", "#userList");
	
	
	$("#admin")
		.on("click",function()
			{
			$('#topbar').removeClass("init");
			
			$('#topbar').removeClass("help");
			$("#helppanel").removeClass("open");
			
			$('#topbar').toggleClass("admin");
			$("#adminpanel").toggleClass("open");
			updateUserList();
			});
	$("#help")
		.on("click",function()
			{
			if($("#helppanel iframe").attr("src")=="")
				{
				//$("#helppanel iframe").attr("src","/hariterms/web/viewer.html?file=/hariterms/help.pdf");
				$("#helppanel iframe").attr("src","http://hariscience.exeq.me/")
				}
				
			$('#topbar').removeClass("init");
			
			$('#topbar').toggleClass("help");
			$("#helppanel").toggleClass("open");
			
			$('#topbar').removeClass("admin");
			$("#adminpanel").removeClass("open");
			updateUserList();
			});
	$("#topbar .textlogo")
		.on("click",function()
			{
			$('#topbar').removeClass("admin");
			$("#adminpanel").removeClass("open");
			
			$('#topbar').removeClass("help");
			$("#helppanel").removeClass("open");
			});
	$("#adduser")
		.on("click",function()
			{
			togglePassword(true);
			$("#addconfirm").data("action","new");
			$('#addUserForm [name=username]').removeAttr("readonly");
			$('#addUserForm')[0].reset();
			$("#addUserModal .modal-title").text("ADD USER");
			$("#addUserModal").modal("show");
			});
	
	
	$("#addUserForm").on("click","#passwordbutton",function(e)
		{
		togglePassword(true);
		
		e.preventDefault();
		e.stopPropagation();
		return false;
		});		
			
	$("#userlist").on("click",".edituser",function()
		{
		$(".tooltip").remove();
		$('#addUserForm')[0].reset();
		var user = $(this).parents("tr").data();
		console.log(user)
		
		$('#addUserForm [name=username]').val(user.username);
		$('#addUserForm [name=email]').val(user.email);
		$('#addUserForm [name=role]').val(user.role);
		
		
		togglePassword(false);
		$("#addconfirm").data("action","edit");
		$('#addUserForm [name=username]').attr("readonly","true");
		$("#addUserModal .modal-title").text("EDIT USER");
		$("#addUserModal").modal("show");
		});		
	
		
	$("#addUserForm")
		.on("submit",function(e)
			{
			var newUser = formObject("addUserForm");
			var action  = $("#addconfirm").data("action");
			if(action == "new")
				addUser(newUser);
			else
				updateUser(newUser);
			$("#addUserModal").modal("hide");
			
			e.preventDefault();
			e.stopPropagation();
			return false;
			});
			
	$("#userlist").on("click",".removeuser",function()
		{
		$(".tooltip").remove();
		var username = $(this).parents("tr").data("username");
		removeUser({username:username});
		});
	}

function togglePassword(show)
	{
	var passwordfield = '<div id="passwordfield" class="form-group"><label>Password</label><input name="password" type="password" class="form-control" placeholder="Password" required=""></div>';
	var passwordbutton = '<button id="passwordbutton" class="btn btn-block btn-primary">CHANGE PASSWORD</button>';
	if(show && $("#passwordfield").length ===0)
		{
		$("#passwordbutton").replaceWith(passwordfield);
		}
	if(!show && $("#passwordbutton").length ===0)
		{
		$("#passwordfield").replaceWith(passwordbutton);
		}
	}


function updateUserList()
	{
	$.getJSON("/rest/terms/listUser")
		.done(function(data, textStatus, jqXHR)
			{
			var html = $.render.userList({users:data});
			$("#userlist").html(html);
			})
		.fail(function()
			{
			
			})
	}
function addUser(newuser)
	{
	$.getJSON("/rest/terms/addUser",newuser)
		.always(updateUserList)
	}
function updateUser(newuser)
	{
	$.getJSON("/rest/terms/updateUser",newuser)
		.always(updateUserList)
	}
function removeUser(user)
	{
	$.getJSON("/rest/terms/removeUser",user)
		.always(updateUserList)
	}
	
