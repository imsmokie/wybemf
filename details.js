firebase.auth().onAuthStateChanged(function(user) {
    if(user){
        if(user.displayName){
            window.location.assign("home.html");
            return;
        }
        setTimeout(function(){
            $("#loading").addClass("animated fadeOut");
            setTimeout(function(){
              $("#loading").removeClass("animated fadeOut");
              $("#loading").css("display","none");
            },800);
          },1000);
    }else{
        window.location.assign("index.html");
    }
});

$( "#details-img").keyup(function() {
    var url = $( "#details-img").val();
    $('#userimg').css("background",`url('${url}') center center`)
});

var db = firebase.firestore();
db.settings({
  timestampsInSnapshots: true
});

$("#update").click(function(){
var user = firebase.auth().currentUser;
if(!user){
    window.location.assign("index.html");
    return;
}
var desUsername = $('#username').val();
if(!desUsername){
    $('#details-error').html("username field empty!!")
    return;
}
var desUserimg = $('#details-img').val();
if(!desUserimg){
desUserimg = "https://i.imgur.com/cntrc8m.png";
}
if(desUsername.length >= 30){
  $('#update-error').html("username should be less than 30 characters");
  return;
}
$('#update').attr("disabled",true);
$('#details-error').html("checking if everthing is at right place *elevator music plays*, please wait...");
var user = firebase.auth().currentUser;
db.collection("users").doc(user.uid).set({
    username: desUsername,
    userid: user.uid,
    userimg: desUserimg
})
.then(function(){
    db.collection("username").doc(desUsername).set({
        username: desUsername,
        takenBy: user.uid,
    })
    .then(function(){
        var user = firebase.auth().currentUser;
        user.updateProfile({
            displayName: desUsername,
            photoURL: desUserimg
        }).then(function() {
            setTimeout(function(){
                $('#details-error').html("3");
            },100);
            setTimeout(function(){
                $('#details-error').html("2");
            },200);
            setTimeout(function(){
                $('#details-error').html("1");
            },300);
            setTimeout(function(){
                $('#details-error').html("done");
                $('#update').attr("disabled",false);
                window.location.assign("home.html");
            },500);
        }).catch(function(error) {
            $('#details-error').html(error.message)
            $('#update').attr("disabled",false);
        });
    }).catch(function(error){
    $('#details-error').html("error dude");
    $('#update').attr("disabled",false);
    });
}).catch(function(error){
    db.collection("username").doc(desUsername).get().then(function(doc){
        if (doc.exists) {
          $('#details-error').html("username not available");
          $('#update').attr("disabled",false);
        }
    }).catch(function(error) {
      $('#details-error').html("error, please try again later...");
      $('#update').attr("disabled",false);
    });
});
});

function logout(){
firebase.auth().signOut().then(function() {
    alert("logged out");
  }, function(error) {
    alert("error logging out");
});
}