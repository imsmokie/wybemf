var storage = firebase.storage();
firebase.auth().onAuthStateChanged(function(user) {
    if(user){
        if(!user.displayName){
            window.location.assign("/details");
            return;
        }
        $("#userimg").css("background","url('"+user.photoURL+"') center center");
        $("#home-username").val(user.displayName);
        //get notification
        db.collection("notification").where("notificationFor", "==", user.uid).orderBy("time","desc")
        .onSnapshot(function(snapshot) {
          snapshot.docChanges().forEach(function(change){
            if(change.type === "added"){
            db.collection("users").doc(change.doc.data().notificationBy).get().then(function(docs){
            $('#theseNotify').html(`<i class="fas fa-bell circle"></i><sup>${snapshot.size}</sup>`);
            $('#notification').append(`
            <h4 id="notify${change.doc.id}"><a href="/profile#${docs.data().username}" target="_blank">@${docs.data().username}</a> ${change.doc.data().type}<button onclick="deleteNotify('${change.doc.id}')"><i class="far fa-trash-alt"></i></button></h4>
           `);
            });
            $('#newNotify')[0].play();
           };
          });
          if(snapshot.empty == true){
            $('#theseNotify').html('<i class="fas fa-bell circle"></i>');
          }else{
            $('#theseNotify').html(`<i class="fas fa-bell circle"></i><sup>${snapshot.size}</sup>`);
            $('#theseNotify').attr("onclick","notification()");
            $('#hideNotify').attr("onclick","hidenotification()");
          }
         });
        //get following
        db.collection("follow").where("followedby", "==", user.uid)
        .get()
        .then(function(querySnapshot){
          querySnapshot.forEach(function(doc){
            db.collection("users").where("userid", "==", doc.data().followed)
             .get()
             .then(function(querySnapshot){
             querySnapshot.forEach(function(document){
             //get dreams
              db.collection("dreams").where("dreamBy", "==", document.data().userid)
              .get()
              .then(function(querySnapshot){
                if(querySnapshot.size || querySnapshot.size >=1)
                  {
                  $('#options').append(
                    `<div class="option2" id="user_${document.data().userid}" style="background:url('${document.data().userimg}') center center;" title="${document.data().username}"><b>${document.data().username}</b></div>`
                   );
                  $(`#user_${document.data().userid}`).attr("onclick",`showDream('${document.data().userid}')`);
                  querySnapshot.forEach(function(doc){
                  var circle = new ProgressBar.Circle(`#user_${document.data().userid}`, {
                    color: "rgb(255,100,100)",
                    trailColor: "#fff",
                    trailWidth: 0,
                    duration: 1800,
                    easing: "bounce",
                    strokeWidth: 6,
                    });
                  circle.animate(1.0);
                  });
                }
              });
             });
            });
        });
        });
             //get feed
             //todo : make them so that followers come at top and feed gets sorted according to impression(relevancy in this case)
             //get follower
              db.collection("follow").where("followedby", "==", user.uid)
              .get()
              .then(function(querySnapshot){
                var followers = [];
                querySnapshot.forEach(function(doc){
                   followers.push({userid:doc.data().followed});
              });
             //get people suggestions
             db.collection("impression").where("impressionBy", "==", user.uid).where("impression",">",20).orderBy("impression","desc")
             .get()
             .then(function(querySnapshot){
               var ids = [];
               querySnapshot.forEach(function(doc){
                 //relevancy here = impression (future shit tbh idc about it rn but in future ic ;) xD)
                 ids.push({userid:doc.data().impressionOn,relevancy:doc.data().impression});
               });
                var newids = [];
                for(var i = 0; i < ids.length;i++){
                 newids.push(ids[i]);
                }
                for(var i = 0; i < followers.length;i++){
                  newids.push(followers[i]);
                 }
                 if(!newids || newids.length == 0){
                  $('#feed').html("<h4>In the beginning, there was nothing.</h4>");
                  return;
                 }
                var isDataThere = "nope";
                var postIds = [];

                for(var i = 0; i < newids.length;i++){
                  db.collection("posts").where("textby", "==", newids[i].userid).orderBy("time", "desc")
                  .get()
                  .then(function(querySnapshot){
                  querySnapshot.forEach(function(docs){
                    postIds.push({postid:docs.id,order:docs.data().time});
                    isDataThere = "yes";
                    okdataishere();
                  });
                  });
                }
                var doneids = [];
                //big thanks to Rafael Mariano de Oliveira for this findObjectByKey function
                //https://www.linkedin.com/pulse/javascript-find-object-array-based-objects-property-rafael
                //owo
                function findObjectByKey(array, key, value) {
                  for (var i = 0; i < array.length; i++) {
                      if (array[i][key] === value) {
                          return array[i];
                      }
                  }
                  return null;
                }
                function okdataishere(){
                  if(isDataThere == "yes"){
                  isDataThere = "nope";
                  var sorted_arr = postIds.sort(function(a,b){return b.order - a.order; });
                  var newId = [];
                  for(var i = 0; i < sorted_arr.length; i++){
                    newId.push({id:sorted_arr[i].postid});
                  }
                  for(var i = 0; i < newId.length; i++){
                    var result = findObjectByKey(doneids, 'done', newId[i].id) === null;
                      if(result == true){
                      db.collection("posts").doc(newId[i].id).get().then(function(docs){
                        if(docs.exists){
                          db.collection("users").where("userid", "==", docs.data().textby)
                          .get()
                          .then(function(querySnapshot){
                            if(querySnapshot.empty == true){
                              $('#feed').html("<h4>In the beginning, there was nothing.</h4>");
                            }
                          querySnapshot.forEach(function(document){
                            var text = docs.data().text;
                            text = text.replace(/#(\w+)/g, '<a href="/cloud#$1" target="_blank">#$1</a>');
                          $("#feed").append(
                            `<div class="container">
                            <img src="" width="100%" height="auto">
                            <div class="details">
                                <div class="who_posted">
                                <a href="/profile#${document.data().username}" target="_blank"><b>@${document.data().username}</b></a>
                                    <time>${new Date(docs.data().time).toDateString()} @ ${new Date(docs.data().time).toLocaleTimeString()}</time>
                                </div>
                                <p>
                                ${text}
                                </p>
                                <div class="interact">
                                    <button id="like_${docs.id}" onclick="like('${docs.id}')">
                                    <i class="far fa-heart heart" id="liked_${docs.id}"></i> &nbsp; <b id="count_${docs.id}">0</b>
                                    </button>
                                    <button onclick="commentshow('${docs.id}')"><i class="far fa-comment-alt"></i> &nbsp; <b id="comt_count_${docs.id}">0</b></button>
                                </div>
                            </div>
                        </div>`);
                         //get likes
                         db.collection("likes").where("textid", "==", docs.id)
                         .onSnapshot(function(querySnapshot){
                         $(`#count_${docs.id}`).html(`${querySnapshot.size}`);
                         });
                         db.collection("comment").where("commentOn", "==", docs.id)
                         .onSnapshot(function(querySnapshot){
                         $(`#comt_count_${docs.id}`).html(`${querySnapshot.size}`);
                         });
                         //check for like
                         var user = firebase.auth().currentUser;
                         db.collection("likes").where("textid", "==", docs.id).where("likeby", "==", user.uid)
                         .onSnapshot(function(querySnapshot){
                             if(!querySnapshot.size || querySnapshot.size == 0){
                                 $(`#like_${docs.id}`).attr('onclick',`like('${docs.id}')`);
                                 $(`#liked_${docs.id}`).attr('class','far fa-heart heart');
                             }else{
                                 $(`#like_${docs.id}`).attr('onclick',`dislike('${docs.id}')`);
                                 $(`#liked_${docs.id}`).attr('class','fas fa-heart heart');
                             }
                         });
                        });
                        });
                        }
                      });
                     }
                      doneids.push({done:newId[i].id});
                    }
                 }
                }
             });
        });
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

function showpost(){
  $('#newpost').slideDown(600);
  $('#newpost').css("display","inherit");
  $('#option1').attr("onclick","hidepost()");
  $('.plus').css("transform","rotate(45deg)");
  $('#cloud').slideUp(600);
  setTimeout(function(){
    $('#cloud').css("display","none");
  },800);
}

function hidepost(){
  $('#newpost').slideUp(600);
  setTimeout(function(){
    $('#newpost').css("display","none");
  },800);
  $('#option1').attr("onclick","showpost()");
  $('.plus').css("transform","rotate(0deg)");
}

function showcloud(){
  $('#cloud').slideDown(600);
  $('#cloud').css("display","inherit");
  $('#newpost').slideUp(600);
  setTimeout(function(){
    $('#newpost').css("display","none");
  },800);
  $('#option1').attr("onclick","showpost()");
  $('.plus').css("transform","rotate(0deg)");
}

function hidecloud(){
  $('#cloud').slideUp(600);
  setTimeout(function(){
    $('#cloud').css("display","none");
  },800);
}

$("#addDream").click(function(){
  $('#dream').css("display","inherit");
  $('#post').css("display","none");
  $('#addPost').css("color","#797979");
  $('#addDream').css("color","#000");
  $('#dream').addClass("animated fadeIn");
  setTimeout(function(){
    $('#dream').removeClass("animated fadeIn");
  },800);
});

$("#addPost").click(function(){
  $('#dream').css("display","none");
  $('#post').css("display","inherit");
  $('#addPost').css("color","#000");
  $('#addDream').css("color","#797979");
  $('#post').addClass("animated fadeIn");
  setTimeout(function(){
    $('#post').removeClass("animated fadeIn");
  },800);
});

$("#description").keyup(function(){
var text = $('#description').val();
if(text == ""){$("#cloudTags").html(""); return;}
text = text.match(/#(\w+)/g);
if(!text){$("#cloudTags").html(""); return;}
if(text == null){return;}
var html = "";
html += text[0];
$("#cloudTags").html('Tagged Post with : '+html);
});

$("#post_data").click(function(){
const description = $('#description').val();
var cloudTag = description.match(/#(\w+)/g);
if(!description) {$('#post_status').html("empty field"); return;}
if(cloudTag.length > 1){$('#post_status').html("only one tag allowded"); return;}
$('#post_data').attr("disabled",true);
var user = firebase.auth().currentUser;
$('#post_status').html("posting, please wait...");
db.collection("posts").doc().set({
    textby: user.uid,
    text: description,
    cloud: cloudTag,
    time: Date.now()
})
.then(function(){
  $('#post_status').html("post successfully posted");
  $('#description').val("");
  $("#cloudTags").html("");
  $('#post_data').attr("disabled",false);
})
.catch(function(error){
  $('#post_status').html(error.message);
  $('#post_data').attr("disabled",false);
});
});

$("#dream_data").click(function(){
  const dream = $('#dreamText').val();
  if(!dream){
    $('#dream_status').html("empty field"); 
    return;
  }
  $('#dream_data').attr("disabled",true);
  var user = firebase.auth().currentUser;
  $('#dream_status').html("posting, please wait...");
  db.collection("dreams").doc().set({
    dreamBy: user.uid,
    dreamText: dream,
    time: Date.now()
})
.then(function() {
  $('#dream_status').html("dream successfully posted");
  $('#dreamText').val("");
  $('#dream_data').attr("disabled",false);
})
.catch(function(error){
  $('#dream_status').html("an error occurred, try again later");
});
});

var cloudImage;

$('#cloudimg').change((e) => {
  cloudImage = e.target.files[0];
  var type = cloudImage.type.toString().split("/");
  if(type[1] == "png" || type[1] == "jpeg" || type[1] == "jpg" || type[1] == "gif"){
    if(cloudImage.size < 5 * 1024 * 1024 == false){
      $('#cloud_error').html("sorry, max image size < 5MB");
      return;
    }
  var reader = new FileReader();
  reader.readAsDataURL(e.target.files[0]);
  reader.onload = (data) => {
  $("#cloudDefaultImg").css("background","url('"+data.target.result+"') center center");
  $('#cloud_error').html("");
  }
  }else{
    $('#cloud_error').html("sorry only image of type png/jpeg/jpg or gif allowded");
    return;
  }
});

$("#cloud_data").click(function(){
var user = firebase.auth().currentUser;
var cloudname = $("#cloudname").val();
if(!cloudname){
  $("#cloud_error").html("empty field");
  return;
}
var format = /^[\w&_]*$/;
if(format.test(cloudname) == false){
  $('#cloud_error').html("special characters not allowded");
  return;
}
if(cloudname.length >= 30){
  $('#cloud_error').html("cloud name should be less than 30 characters :)");
  return;
}
$('#cloud_data').attr("disabled",true);
if(!cloudImage || cloudImage.name == undefined){
  cloudImage = "https://i.imgur.com/VuduONt.png";
  completecloud(cloudImage);
}else{
var type = cloudImage.type.toString().split("/");
if(type[1] == "png" || type[1] == "jpeg" || type[1] == "jpg" || type[1] == "gif"){
$('#cloud_error').html(`uploading image <b>0%</b>`);
var storageRef = storage.ref(`cloudimg/${cloudname}/${user.uid}/`+user.uid+"."+type[1]);
var task_progess = storageRef.put(cloudImage);
task_progess.on("state_changed",
  function progress(snapshot){
    var prec = Math.round((snapshot.bytesTransferred/snapshot.totalBytes)*100);
    $('#cloud_error').html(`uploading image <b>${prec}%</b>`);
  },
  function (err){
    $('#cloud_error').html("error uploading image, try refreshing the page :)");
    return;
  },
  function complete(done){
    $('#cloud_error').html("profile image uploaded successfully...");
    task_progess.snapshot.ref.getDownloadURL().then(function(downloadURL) {
      cloudImage = downloadURL.toString();
      completecloud(cloudImage);
    });
  });
}else{ 
  $('#cloud_error').html("sorry only image of type png/jpeg/jpg or gif allowded :)");
  return;
}
}
function completecloud(cloudImage){
  $('#cloud_error').html("creating a new cloud, please wait...");
  db.collection("cloud").doc(cloudname).set({
    cloudOwner: user.uid,
    cloudName: cloudname,
    cloudImage: cloudImage,
    time: Date.now()
})
.then(function() {
  $('#cloud_error').html("cloud successfully created");
  $("#cloudname").val("");
  $("#cloudimg").val("");
  $("#cloudDefaultImg").css("background","url('https://i.imgur.com/VuduONt.png') center center");
  $('#cloud_data').attr("disabled",false);
})
.catch(function(error){
  db.collection("cloud").doc(cloudname).get().then(function(doc){
    if (doc.exists) {
      $('#cloud_error').html("cloud name already exists");
      $('#cloud_data').attr("disabled",false);
      return;
    }
  });
  $('#cloud_error').html("an error occurred, try again later");
  $('#cloud_data').attr("disabled",false);
});
}
});

var updatedUserimg;

$('#home-userimg').change((e) => {
  updatedUserimg = e.target.files[0];
  var type = updatedUserimg.type.toString().split("/");
  if(type[1] == "png" || type[1] == "jpeg" || type[1] == "jpg" || type[1] == "gif"){
    if(updatedUserimg.size < 5 * 1024 * 1024 == false){
      $('#update-error').html("sorry, max image size < 5MB");
      return;
    }
  var reader = new FileReader();
  reader.readAsDataURL(e.target.files[0]);
  reader.onload = (data) => {
  $("#userimg").css("background","url('"+data.target.result+"') center center");
  $('#update-error').html("");
  }
  }else{
    $('#update-error').html("sorry only image of type png/jpeg/jpg or gif allowded");
    return;
  }
});

$("#updateProfile").click(function(){
var user = firebase.auth().currentUser;
var updatedUsername = $('#home-username').val();
if(!updatedUsername){
  $('#update-error').html("all fields are required");
  return;
}
var format =  /^[\w&_]*$/;
if(format.test(updatedUsername) == false){
  $('#update-error').html("special characters not allowded");
  return;
}
if(updatedUsername.length >= 30){
  $('#update-error').html("username should be less than 30 characters :)");
  return;
}
$('#updateProfile').attr("disabled",true);
if(!updatedUserimg || updatedUserimg.name == undefined){
updatedUserimg = user.photoURL;
completeRestUpdate(updatedUserimg);
}else{
  var type = updatedUserimg.type.toString().split("/");
  if(type[1] == "png" || type[1] == "jpeg" || type[1] == "jpg" || type[1] == "gif"){
  $('#update-error').html(`uploading image <b>0%</b>`);
  var storageRef = storage.ref(`userimg/${user.uid}/`+user.uid+"."+type[1]);
  var task_progess = storageRef.put(updatedUserimg);
  task_progess.on("state_changed",
    function progress(snapshot){
      var prec = Math.round((snapshot.bytesTransferred/snapshot.totalBytes)*100);
      $('#update-error').html(`uploading image <b>${prec}%</b>`);
    },
    function (err){
      $('#update-error').html("error uploading image, try refreshing the page :)");
      console.log(err);
      return;
    },
    function complete(done){
      $('#update-error').html("profile image uploaded successfully...");
      task_progess.snapshot.ref.getDownloadURL().then(function(downloadURL) {
        updatedUserimg = downloadURL.toString();
        completeRestUpdate(updatedUserimg);
      });
    });
  }else{ 
    $('#update-error').html("sorry only image of type png/jpeg/jpg or gif allowded :)");
    return;
    }
}
function completeRestUpdate(imageUpdated){
$('#update-error').html("updating...");
db.collection("users").doc(user.uid)
  .update({
    username: updatedUsername,
    userimg: imageUpdated
  })
.then(function(){
    var user = firebase.auth().currentUser;
    db.collection("username").doc(user.displayName).delete().then(function(){
      db.collection("username").doc(updatedUsername).set({
        username: updatedUsername,
        takenBy: user.uid,
    });
    });
    user.updateProfile({
      displayName: updatedUsername,
      photoURL: imageUpdated
    }).then(function(){
      $('#update-error').html("profile updated successfully :)");
      $('#updateProfile').attr("disabled",false);
    }).catch(function(error) {
      $('#update-error').html("error updating profile, please try again later...");
    });
})
.catch(function(error) {
  $('#update-error').html("error updating profile, please try again later...");
  db.collection("username").doc(updatedUsername).get().then(function(doc){
    if (doc.exists) {
      $('#update-error').html("username not available");
      $('#updateProfile').attr("disabled",false);
      return;
    }
}).catch(function(error) {
  $('#update-error').html("error updating profile, please try again later...");
});
});
}
});

if(window.location.hash.slice(1) == "edit"){
  $('#edit-container').css("display","flex");
  $('#edit-container').addClass("animated fadeIn");
  setTimeout(function(){
    $('#edit-container').removeClass("animated fadeIn");
  },800);
}

function showedit(){
  $('#edit-container').css("display","flex");
  $('#edit-container').addClass("animated fadeIn");
  setTimeout(function(){
    $('#edit-container').removeClass("animated fadeIn");
  },800);
}

function hidedit(){
  $('#edit-container').addClass("animated fadeOut");
  setTimeout(function(){
    $('#edit-container').css("display","none");
    $('#edit-container').removeClass("animated fadeOut");
  },800);
}

function notification(){
  $('#notification-container').css("display","flex");
  $('#notification-container').addClass("animated fadeIn");
  setTimeout(function(){
    $('#notification-container').removeClass("animated fadeIn");
  },800);
}

function hidenotification(){
  $('#notification-container').addClass("animated fadeOut");
  setTimeout(function(){
    $('#notification-container').css("display","none");
    $('#notification-container').removeClass("animated fadeOut");
  },800);
}

function deleteNotify(notifyId) {
  db.collection("notification").doc(notifyId).delete().then(function(){
    $(`#notify${notifyId}`).addClass("animated fadeOut");
    setTimeout(function(){
      $(`#notify${notifyId}`).css("display","none");
      $(`#notify${notifyId}`).removeClass("animated fadeOut");
    },800);
  }).catch(function(error){
    console.log(error);
  });
}

function showDream(dreamid){
  $('#dream-container').css("display","flex");
  $('#dream-container').addClass("animated fadeIn");
  db.collection("dreams").where("dreamBy", "==", dreamid)
  .get()
  .then(function(querySnapshot){
    querySnapshot.forEach(function(dream){
      db.collection("users").where("userid", "==", dream.data().dreamBy)
      .get()
      .then(function(querySnapshot){
      querySnapshot.forEach(function(document){
          $('#dream-time').html(`${new Date(dream.data().time).toDateString()} @ ${new Date(dream.data().time).toLocaleTimeString()}`);
          $('#dream-text').html(dream.data().dreamText);
          $('#dream-username').html('@'+document.data().username);
          $("#dreamerimg").css("background","url('"+document.data().userimg+"') center center");
       });
      });
    });
  });
  setTimeout(function(){
    $('#dream-container').removeClass("animated fadeIn");
  },800);
}

function hideDream(){
  $('#dream-container').css("display","none");
  setTimeout(function(){
    $('#dream-time').html("loading...");
    $('#dream-text').html("loading...");
    $('#dream-username').html("loading...");
    $("#dreamerimg").css("background","#000");
  },280);
}