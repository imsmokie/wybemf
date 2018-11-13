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
    if(!window.location.hash){
        //post shit for normal user
    db.collection("posts").where("textby", "==", user.uid).orderBy("time", "desc")
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
             querySnapshot.forEach(function(document){
                $("#posts").append(
                    ` <div class="container">
                    <img src="" width="100%" height="auto">
                    <div class="details">
                        <div class="who_posted">
                            <a href="profile.html#${document.data().username}" target="_blank"><b>@${document.data().username}</b></a>
                            <time>${new Date(doc.data().time).toDateString()} @ ${new Date(doc.data().time).toLocaleTimeString()}</time>
                        </div>
                        <p>
                        ${doc.data().text}
                        </p>
                        <div class="interact">
                            <button id="like_${doc.id}" onclick="like('${doc.id}')">
                            <i class="far fa-heart heart" id="liked_${doc.id}"></i> &nbsp; <b id="count_${doc.id}">0</b>
                            </button>
                            <button onclick="commentshow('${doc.id}')"><i class="far fa-comment-alt"></i> &nbsp; <b id="comt_count_${doc.id}">0</b></button>
                        </div>
                    </div>
                </div>`);
                //get likes
                db.collection("likes").where("textid", "==", doc.id)
                .onSnapshot(function(querySnapshot){
                $(`#count_${doc.id}`).html(`${querySnapshot.size}`);
                });
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
        setTimeout(function(){
          $("#loading").addClass("animated fadeOut");
          setTimeout(function(){
            $("#loading").removeClass("animated fadeOut");
            $("#loading").css("display","none");
          },800);
        },1000);
    })
    .catch(function(error) {
        console.log(error);
    });

        $("#userimg").css("background","url('"+user.photoURL+"') center center");
        $("#profile-username").html('@'+user.displayName);
        $("#whospost").html('@'+user.displayName+"'s Posts");
        $("#which-btn").html('<a href="home.html#edit"><button>Edit Profile</button></a>');

        //get followers
        db.collection("follow").where("followed", "==", user.uid)
        .onSnapshot(function(querySnapshot){
            $('#followers').html(`${querySnapshot.size}<br>Followers`);
        });
        //get following
        db.collection("follow").where("followedby", "==", user.uid)
        .onSnapshot(function(querySnapshot){
           $('#following').html(`${querySnapshot.size}<br>Following`);
        });

    }else{
    var getUserName = window.location.hash.slice(1);
    db.collection("users").where("username", "==", getUserName)
    .get()
    .then(function(querySnapshot){
        if(!querySnapshot.size){
            window.location.assign("404.html");
            return;
        }
        querySnapshot.forEach(function(doc) {
    //post shit here for #
    db.collection("posts").where("textby", "==", doc.data().userid).orderBy("time", "desc")
    .get()
    .then(function(querySnapshot){
        if(!querySnapshot.size || querySnapshot.size == 0){
            $('#posts').html('<h3 style="margin:5px 15px;">In the beginning, there was nothing.</h3>');
        }
        setTimeout(function(){
            $("#loading").addClass("animated fadeOut");
            setTimeout(function(){
              $("#loading").removeClass("animated fadeOut");
              $("#loading").css("display","none");
            },800);
          },1000);
        $('#howmanypost').html(querySnapshot.size+"<br>Posts");
        querySnapshot.forEach(function(doc) {
            db.collection("users").where("userid", "==", doc.data().textby)
             .get()
             .then(function(querySnapshot){
             querySnapshot.forEach(function(document){
                $("#posts").append(
                    ` <div class="container">
                    <img src="" width="100%" height="auto">
                    <div class="details">
                        <div class="who_posted">
                        <a href="profile.html#${document.data().username}" target="_blank"><b>@${document.data().username}</b></a>
                            <time>${new Date(doc.data().time).toDateString()} @ ${new Date(doc.data().time).toLocaleTimeString()}</time>
                        </div>
                        <p>
                        ${doc.data().text}
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

            $("#userimg").css("background","url('"+doc.data().userimg+"') center center");
            $("#profile-username").html('@'+doc.data().username);
            $("#whospost").html('@'+doc.data().username+"'s Posts");
            var user = firebase.auth().currentUser;
            if(getUserName == user.displayName){
                $("#which-btn").html('<a href="home.html#edit"><button>Edit Profile</button></a>');
            }
            else{
            //+1 impression
            db.collection("impression").doc(user.uid+doc.data().userid).get().then(function(impress){
            if(impress.exists){
             db.collection("impression").doc(user.uid+doc.data().userid).set({
                impressionBy: user.uid,
                impressionOn: doc.data().userid,
                impression: Number(impress.data().impression) + 1,
                time: Date.now()
            }).catch(function(error){
              console.log(error);
            });
            }else{
                db.collection("impression").doc(user.uid+doc.data().userid).set({
                    impressionBy: user.uid,
                    impressionOn: doc.data().userid,
                    impression: Number(1),
                    time: Date.now()
                }).catch(function(error){
                  console.log(error);
                });
            }
            });
            //get stats
            db.collection("follow").where("followed", "==", doc.data().userid).where("followedby","==", user.uid)
            .get()
            .then(function(querySnapshot){
            if(!querySnapshot.size || querySnapshot.size == 0){
                $("#which-btn").html(`<button id="follow" onclick="follow('${doc.data().userid}')">Follow</button>`);
            }else{
                $("#which-btn").html(`<button id="unfollow" onclick="unfollow('${doc.data().userid}')">Unfollow</button>`);
            }
            });
            }
               //get followers
               db.collection("follow").where("followed", "==", doc.data().userid)
               .onSnapshot(function(querySnapshot){
                   $('#followers').html(`${querySnapshot.size}<br>Followers`);
               });
               //get following
               db.collection("follow").where("followedby", "==", doc.data().userid)
               .onSnapshot(function(querySnapshot){
                  $('#following').html(`${querySnapshot.size}<br>Following`);
               });
        });
        })
        .catch(function(error) {
            console.log(error);
        });
    }
}else{
    window.location.assign("index.html");
}
});

function follow(followid){
$('#follow').attr("disabled",true);
var user = firebase.auth().currentUser;
db.collection("follow").doc(followid+user.uid).set({
    followed: followid,
    followedby: user.uid,
    time: Date.now()
})
.then(function() {
  $('#which-btn').html(`<button id="unfollow" onclick="unfollow('${followid}')">Unfollow</button>`);
  $('#follow').attr("disabled",false);
})
.catch(function(error){
  console.log(error);
});
}

function unfollow(unfollowid){
$('#unfollow').attr("disabled",true);
var user = firebase.auth().currentUser;
db.collection("follow").where("followed", "==", unfollowid).where("followedby","==", user.uid)
.get()
.then(function(querySnapshot){
    querySnapshot.forEach(function(doc){

   db.collection("follow").doc(doc.id).delete()
   .then(function() {
     $('#which-btn').html(`<button id="follow" onclick="follow('${unfollowid}')">Follow</button>`);
     $('#unfollow').attr("disabled",false);
   })
   .catch(function(error){
     console.log(error);
   });
});
});
}