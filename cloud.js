firebase.auth().onAuthStateChanged(function(user) {
    if(user){
        if(!user.displayName){
            window.location.assign("/details");
            return;
        }
        if(window.location.hash){
            var cloudname = window.location.hash.slice(1);
            db.collection("cloud").doc(cloudname).get().then(function(cloud){
                if(cloud.exists){
                    $("#userimg").css("background","url('"+cloud.data().cloudImage+"') center center");
                    $("#profile-username").html('#'+cloud.data().cloudName);
                    $("#whospost").html("Post's tagged with #"+cloud.data().cloudName);
                  setTimeout(function(){
                    $("#loading").addClass("animated fadeOut");
                    setTimeout(function(){
                      $("#loading").removeClass("animated fadeOut");
                      $("#loading").css("display","none");
                },800);
                },1000);
                var user = firebase.auth().currentUser;
                if(cloud.data().cloudOwner == user.uid){
                    $("#which-btn").html('<a href="/home#editcloud"><button>Edit Cloud</button></a>');
                }
                else{
                //+1 impression
                db.collection("impression").doc(user.uid+cloud.data().cloudName).get().then(function(impress){
                if(impress.exists){
                 db.collection("impression").doc(user.uid+cloud.data().cloudName).set({
                    impressionBy: user.uid,
                    impressionOn: cloud.data().cloudName,
                    impression: Number(impress.data().impression) + 1,
                    time: Date.now()
                }).catch(function(error){
                  console.log(error);
                });
                }else{
                    db.collection("impression").doc(user.uid+cloud.data().cloudName).set({
                        impressionBy: user.uid,
                        impressionOn: cloud.data().cloudName,
                        impression: Number(1),
                        time: Date.now()
                    }).catch(function(error){
                      console.log(error);
                    });
                }
                });
                   //get stats
                   db.collection("follow").where("followed", "==", cloud.data().cloudName).where("followedby","==", user.uid)
                   .get()
                   .then(function(querySnapshot){
                   if(!querySnapshot.size || querySnapshot.size == 0){
                       $("#which-btn").html(`<button id="follow" onclick="follow('${cloud.data().cloudName}')">Follow</button>`);
                   }else{
                       $("#which-btn").html(`<button id="unfollow" onclick="unfollow('${cloud.data().cloudName}')">Unfollow</button>`);
                   }
                   });
                }
                 //get followers for cloud
                 db.collection("follow").where("followed", "==", cloud.data().cloudName)
                 .onSnapshot(function(querySnapshot){
                  $('#followers').html(`${querySnapshot.size}<br>Followers`);
                  if(querySnapshot.empty == true){
                      $('#follow-stats').html('<h2>Followers</h2><div onclick="followhide()" class="forFollow"><i class="fas fa-times"></i></div>');
                      $('#follow-stats').append("nothing to see here");
                      return;
                  }
                  querySnapshot.docChanges().forEach(function(change) {
                    if (change.type === "added") {
                        $('#follow-stats').html('<h2>Followers</h2><div onclick="followhide()" class="forFollow"><i class="fas fa-times"></i></div>');
                    }
                    if (change.type === "removed") {
                        $('#follow-stats').html('<h2>Followers</h2><div onclick="followhide()" class="forFollow"><i class="fas fa-times"></i></div>');
                    }
                  });
                  querySnapshot.forEach(function(doc){
                      db.collection("users").doc(doc.data().followedby).get().then(function(user){
                      if (doc.exists) {
                      $('#follow-stats').append(`
                      <a href="/profile#${user.data().username}" target="_blank">
                      <table class="followTbl">            
                      <tr>
                          <td><div style="background:url('${user.data().userimg}') center center;"></div></td>
                          <td>${user.data().username}</td>
                      </tr>
                      </table>
                      </a>
                      `);
                   }
                  });
                  });
                 });
                 var matchCloud = [];
                 matchCloud.push("#"+cloudname);
                 db.collection("posts").where("cloud", "==", matchCloud).orderBy("time", "desc")
                 .get()
                 .then(function(querySnapshot){
                     if(!querySnapshot.size || querySnapshot.size == 0){
                         $('#posts').html('<h3 style="margin:5px 15px;">In the beginning, there was nothing.</h3>');
                     }
                     $('#howmanypost').html(querySnapshot.size+"<br>Posts");
                     querySnapshot.forEach(function(doc) {
                         db.collection("users").where("userid", "==", doc.data().textby)
                          .get()
                          .then(function(querySnapshot){
                             var text = doc.data().text;
                             text = text.replace(/#(\w+)/g, '<a href="/cloud#$1" target="_blank">#$1</a>');
                          querySnapshot.forEach(function(document){
                             $("#posts").append(
                                 `<div class="container">
                                 <img src="" width="100%" height="auto">
                                 <div class="details">
                                     <div class="who_posted">
                                     <a href="/profile#${document.data().username}" target="_blank"><b>@${document.data().username}</b></a>
                                         <time>${new Date(doc.data().time).toDateString()} @ ${new Date(doc.data().time).toLocaleTimeString()}</time>
                                     </div>
                                     <p>
                                     ${text}
                                     </p>
                                     <div class="interact">
                                         <button id="like_${doc.id}" onclick="like('${doc.id}')">
                                         <i class="far fa-heart heart" id="liked_${doc.id}"></i> &nbsp; <b id="count_${doc.id}">0</b>
                                         </button>
                                         <button onclick="commentshow('${doc.id}')"><i class="far fa-comment-alt"></i> &nbsp; <b id="comt_count_${doc.id}">0</b></button>
                                     </div>
                                 </div>
                             </div>`);
                             //get likes number
                             db.collection("likes").where("textid", "==", doc.id)
                             .onSnapshot(function(querySnapshot){
                             $(`#count_${doc.id}`).html(`${querySnapshot.size}`);
                             });
                             //get comment number
                             db.collection("comment").where("commentOn", "==", doc.id)
                             .onSnapshot(function(querySnapshot){
                             $(`#comt_count_${doc.id}`).html(`${querySnapshot.size}`);
                             });
                             //check for like
                             var user = firebase.auth().currentUser;
                             db.collection("likes").where("textid", "==", doc.id).where("likeby", "==", user.uid)
                             .onSnapshot(function(querySnapshot){
                                 if(!querySnapshot.size || querySnapshot.size == 0){
                                     $(`#like_${doc.id}`).attr('onclick',`like('${doc.id}')`);
                                     $(`#liked_${doc.id}`).attr('class','far fa-heart heart');
                                 }else{
                                     $(`#like_${doc.id}`).attr('onclick',`dislike('${doc.id}')`);
                                     $(`#liked_${doc.id}`).attr('class','fas fa-heart heart');
                                 }
                             });
                          });
                          })
                          .catch(function(error){
                              console.log(error);
                          });
                     });
                 })
                 .catch(function(error) {
                     console.log(error);
                 });
                }else{
                    window.location.assign("/error");
                    return;
                }
            }).catch(function(error) {
              console.log(error);
            });
        }else{
            window.location.assign("/home");
            return;
        }
    }else{
        window.location.assign("/home");
        return;
    }
});