firebase.auth().onAuthStateChanged(function(user) {
    if(user){
        if(user.displayName){
            window.location.assign("/home");
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
        window.location.assign("/");
    }
});

var db = firebase.firestore();
db.settings({
  timestampsInSnapshots: true
});
var storage = firebase.storage();

var desUserimg;

$('#details-img').change((e) => {
    desUserimg = e.target.files[0];
  var type = desUserimg.type.toString().split("/");
  if(type[1] == "png" || type[1] == "jpeg" || type[1] == "jpg" || type[1] == "gif"){
    if(desUserimg.size < 5 * 1024 * 1024 == false){
      $('#details-error').html("sorry, max image size < 5MB");
      return;
    }
  var reader = new FileReader();
  reader.readAsDataURL(e.target.files[0]);
  reader.onload = (data) => {
  $("#userimg").css("background","url('"+data.target.result+"') center center");
  $('#details-error').html("");
  }
  }else{
    $('#details-error').html("sorry only image of type png/jpeg/jpg or gif allowded");
    return;
  }
});

$('#username').keyup(function(){
if(!$(this).val()){
    $('#details-error').html("username can't be empty :)");
    $('#update').attr("disabled",true);
    return;
}
db.collection("username").doc($(this).val()).get().then(function(doc){
    if(doc.exists){
      $('#details-error').html("username not available");
      $('#update').attr("disabled",true);
      return;
    }else{
        $('#details-error').html("");
        $('#update').attr("disabled",false);
    }
});
});

$("#update").click(function(){
var user = firebase.auth().currentUser;
if(!user){
    window.location.assign("/");
    return;
}
var desUsername = $('#username').val();
if(!desUsername){
    $('#details-error').html("username field empty!!")
    return;
}
var format = /^[\w&_]*$/;
if(format.test(desUsername) == false){
  $('#details-error').html("special characters not allowded");
  return;
}
if(desUsername.length >= 30){
  $('#update-error').html("username should be less than 30 characters");
  return;
}
$('#update').attr("disabled",true);
if(!desUserimg || desUserimg.name == undefined){
  desUserimg = "https://i.imgur.com/cntrc8m.png";
  checkeverythinglol(desUserimg);
}else{
var type = desUserimg.type.toString().split("/");
if(type[1] == "png" || type[1] == "jpeg" || type[1] == "jpg" || type[1] == "gif"){
$('#details-error').html(`uploading image <b>0%</b>`);
var storageRef = storage.ref(`userimg/${user.uid}/`+user.uid+"."+type[1]);
var task_progess = storageRef.put(desUserimg);
task_progess.on("state_changed",
  function progress(snapshot){
    var prec = Math.round((snapshot.bytesTransferred/snapshot.totalBytes)*100);
    $('#details-error').html(`uploading image <b>${prec}%</b>`);
  },
  function (err){
    $('#details-error').html("error uploading image, try refreshing the page :)");
    return;
  },
  function complete(done){
    $('#details-error').html("profile image uploaded successfully...");
    task_progess.snapshot.ref.getDownloadURL().then(function(downloadURL) {
      desUserimg = downloadURL.toString();
      checkeverythinglol(desUserimg);
    });
  });
}else{ 
  $('#details-error').html("sorry only image of type png/jpeg/jpg or gif allowded :)");
  return;
}
}
function checkeverythinglol(desUserimg){
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
        takenBy: user.uid
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
                window.location.assign("/home");
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
          return;
        }
    }).catch(function(error) {
      $('#details-error').html("error, please try again later...");
      $('#update').attr("disabled",false);
    });
    $('#details-error').html("error, please try again later...");
});
}
});

function logout(){
firebase.auth().signOut().then(function() {
    alert("logged out");
  }, function(error) {
    alert("error logging out");
});
}