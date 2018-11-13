function login(){
    document.getElementById("login").style.display = "inline";
    document.getElementById("signup").style.display = "none";
}
function signup(){
    document.getElementById("login").style.display = "none";
    document.getElementById("signup").style.display = "inline";
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