function login(){
    document.getElementById("login").style.display = "inline";
    document.getElementById("signup").style.display = "none";
    document.getElementById("forgot_password").style.display = "none";
}
function signup(){
    document.getElementById("login").style.display = "none";
    document.getElementById("signup").style.display = "inline";
    document.getElementById("forgot_password").style.display = "none";
}
$("#signup_form").click(function(){
    const email = $('#signup_email').val(); const password = $('#signup_pass').val();
    if(!email || !password) {alert("fields empty");return;}
    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error){alert(error.message);});
});
  
$("#login_form").click(function(){
    const email = $('#login_email').val(); const password = $('#login_pass').val();
    if(!email || !password) {alert("fields empty");return;}
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error){alert(error.message);});
});

$("#forgot").click(function(){
    document.getElementById("login").style.display = "none";
    document.getElementById("signup").style.display = "none";
    document.getElementById("forgot_password").style.display = "inline";
});

$("#password_form").click(function(){
var email = $("#passwordReset_email").val();
if(!email){
    alert("email can't be empty");
    return;
}
var auth = firebase.auth();
auth.sendPasswordResetEmail(email).then(function() {
    alert("email send, check your inbox");
}).catch(function(error) {
    alert("error sending email");
});
});

firebase.auth().onAuthStateChanged(function(user) {
    if(user){
        if(!user.displayName){
            window.location.assign("details.html");
            return;
        }
        window.location.assign("home.html");
    }else{
        setTimeout(function(){
          $("#loading").addClass("animated fadeOut");
          setTimeout(function(){
            $("#loading").removeClass("animated fadeOut");
            $("#loading").css("display","none");
          },800);
        },1000);
    }
});