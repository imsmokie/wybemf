var db = firebase.firestore();
db.settings({
  timestampsInSnapshots: true
});
firebase.auth().onAuthStateChanged(function(user) {
    if(user){
        if(!user.displayName){
            window.location.assign("details.html");
            return;
        }
        $("#userimg").css("background","url('"+user.photoURL+"') center center");
        $("#home-username").val(user.displayName);
        $("#home-userimg").val(user.photoURL);
        //get following
        db.collection("follow").where("followedby", "==", user.uid)
        .get()
        .then(function(querySnapshot){
          querySnapshot.forEach(function(doc){
            db.collection("users").where("userid", "==", doc.data().followed)
             .get()
             .then(function(querySnapshot){
             querySnapshot.forEach(function(document){
             $('#options').append(
              `<div class="option2" id="user_${document.data().userid}" style="background:url('${document.data().userimg}') center center;" title="${document.data().username}"><b>${document.data().username}</b></div>`
             );
             //get dreams
              db.collection("dreams").where("dreamBy", "==", document.data().userid)
              .get()
              .then(function(querySnapshot){
                if(!querySnapshot.size || querySnapshot.size == 0)
                {
                  $(`#user_${document.data().userid}`).css("border","0px solid #fff");
                }else{
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
                    var startDate = doc.data().time;
                    var maxAdded = new Date(startDate + 60 * 60 * 24 * 1000);
                    var now = new Date();
                    var timeDifference = now.getTime() - startDate;
                    var percentage =  timeDifference / maxAdded.getTime() * 10000;
                    percentage = 1 - percentage;
                    circle.animate(`${percentage}`);

                    setInterval( () => {
                      var maxAdded = new Date(startDate + 60 * 60 * 24 * 1000);
                      var now = new Date();
                      var timeDifference = now.getTime() - startDate;
                      var percentage = timeDifference / maxAdded.getTime() * 10000;
                      percentage = 1 - percentage;
                      circle.animate(`${percentage}`);
                      },60000);
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
                 //relebamcy here = impression (future shit tbh idc about it rn but in future ic ;) xD)
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
                          $("#feed").append(
                            `<div class="container">
                            <img src="" width="100%" height="auto">
                            <div class="details">
                                <div class="who_posted">
                                <a href="profile.html#${document.data().username}" target="_blank"><b>@${document.data().username}</b></a>
                                    <time>${new Date(docs.data().time).toDateString()} @ ${new Date(docs.data().time).toLocaleTimeString()}</time>
                                </div>
                                <p>
                                ${docs.data().text}
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
       window.location.assign("index.html");
    }
});

function showpost(){
  $('#newpost').slideDown(600);
  $('#newpost').css("display","inherit");
  $('#option1').attr("onclick","hidepost()");
  $('.plus').css("transform","rotate(45deg)");
}

function hidepost(){
  $('#newpost').slideUp(600);
  setTimeout(function(){
    $('#newpost').css("display","none");
  },800);
  $('#option1').attr("onclick","showpost()");
  $('.plus').css("transform","rotate(0deg)");
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

$("#post_data").click(function(){
const description = $('#description').val();
if(!description) {$('#post_status').html("empty field"); return;}
$('#post_data').attr("disabled",true);
var user = firebase.auth().currentUser;
$('#post_status').html("posting, please wait...");
db.collection("posts").doc().set({
    textby: user.uid,
    text: description,
    time: Date.now()
})
.then(function() {
  $('#post_status').html("post successfully posted");
  $('#description').val("");
  $('#post_data').attr("disabled",false);
})
.catch(function(error){
  $('#post_status').html(error);
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

$("#updateProfile").click(function(){
var user = firebase.auth().currentUser;
var updatedUsername = $('#home-username').val();
var updatedUserimg = $('#home-userimg').val();
if(!updatedUsername || !updatedUserimg){
  $('#update-error').html("all fields are required");
  return;
}
var format = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
if(format.test(updatedUsername)){
  $('#update-error').html("special characters not allowded");
  return;
}
if(updatedUsername.length >= 30){
  $('#update-error').html("username should be less than 30 characters");
  return;
}
$('#updateProfile').attr("disabled",true);
$('#update-error').html("updating...");
db.collection("users").doc(user.uid)
  .update({
    username: updatedUsername,
    userimg: updatedUserimg
  })
.then(function(){
    var user = firebase.auth().currentUser;
    user.updateProfile({
      displayName: updatedUsername,
      photoURL: updatedUserimg
    }).then(function(){
      $('#update-error').html("profile updated successfully");
      $('#updateProfile').attr("disabled",false);
    }).catch(function(error) {
      $('#update-error').html("error updating profile, please try again later...");
    });
})
.catch(function(error) {
  db.collection("username").doc(updatedUsername).get().then(function(doc){
    if (doc.exists) {
      $('#update-error').html("username not available");
      $('#updateProfile').attr("disabled",false);
      return;
    }
    $('#update-error').html("error updating profile, please try again later...");
}).catch(function(error) {
  $('#update-error').html("error updating profile, please try again later...");
});
});
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