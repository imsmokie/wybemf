function like(postid){
$(`#like_${postid}`).attr("disabled",true);
var user = firebase.auth().currentUser;
db.collection("likes").doc(postid+user.uid).set({
    textid: postid,
    likeby: user.uid,
    likedon: Date.now()
})
.then(function(){
    $(`#like_${postid}`).attr("onclick",`dislike('${postid}')`);
    $(`#like_${postid}`).addClass("animated rubberBand");
    $(`#liked_${postid}`).attr("class","fas fa-heart heart");
    db.collection("posts").doc(postid).get().then(function(post){
       if(user.uid != post.data().textby){
    //+1 impression
    db.collection("impression").doc(user.uid+post.data().textby).get().then(function(impress){
        if(impress.exists){
         db.collection("impression").doc(user.uid+post.data().textby).set({
            impressionBy: user.uid,
            impressionOn: post.data().textby,
            impression: Number(impress.data().impression) + 1,
            time: Date.now()
        }).catch(function(error){
          console.log(error);
        });
        }else{
            db.collection("impression").doc(user.uid+post.data().textby).set({
                impressionBy: user.uid,
                impressionOn: post.data().textby,
                impression: Number(1),
                time: Date.now()
            }).catch(function(error){
              console.log(error);
            });
        }
    });
    }
    });
    setTimeout(function(){
        $(`#like_${postid}`).removeClass("animated rubberBand");
    },800);
    $(`#like_${postid}`).attr("disabled",false);
})
.catch(function(error){
console.log(error);
});
}

function dislike(postid){
$(`#like_${postid}`).attr("disabled",true);
var user = firebase.auth().currentUser;
db.collection("likes").where("textid", "==", postid).where("likeby","==",user.uid)
    .get()
    .then(function(querySnapshot){
    querySnapshot.forEach(function(doc){
       db.collection("likes").doc(doc.id).delete().then(function() {
          $(`#like_${postid}`).addClass("animated rubberBand");
          $(`#liked_${postid}`).attr("class","far fa-heart heart");
          setTimeout(function(){
              $(`#like_${postid}`).removeClass("animated rubberBand");
          },800);
          $(`#like_${postid}`).attr("onclick",`like('${postid}')`);
          $(`#like_${postid}`).attr("disabled",false);
       }).catch(function(error) {
           console.error(error);
       });
   });
})
.catch(function(error){
     console.log(error);
});
}
    
function commentshow(commentid) {
    displayComments(commentid);
    $('#whoscomment').html(window.location.hash.slice(1));
    $('#comment-container').css("display","flex");
    $('#comment-container').addClass("animated fadeIn");
    $('#comment-btn').attr("onclick",`postcomment('${commentid}')`);
    setTimeout(function(){
        $('#comment-container').removeClass("animated fadeIn");
    },800);
}

function displayComments(id){
db.collection("comment").where("commentOn", "==", id).orderBy("time","desc")
.get()
.then(function(querySnapshot){
    if(!querySnapshot.size || querySnapshot.size == 0)
    {
        $('#all-comments').html("Be the first to comment");
        return;
    }else{
        $('#all-comments').html("");
    }
    querySnapshot.forEach(function(doc){
        db.collection("users").where("userid", "==", doc.data().commentBy)
        .get()
        .then(function(querySnapshot){
        querySnapshot.forEach(function(document){
        $('#all-comments').append(
            `<div class="comments animated fadeIn">
            <a href="profile.html#${document.data().username}" target="_blank">
            @${document.data().username}</a> &nbsp; ${doc.data().commentText}
            </div>`
        );
        });
    });
    });
});
}

function postcomment(commentid){
var text = $('#text-input').val();
$('#comment-error').css("display","inherit");
if(!text || text == ""){
    $('#comment-error').html("empty field");
    return;
}else{
$('#comment-btn').attr("disabled",true);
$('#comment-error').html("commenting, please wait...");
var user = firebase.auth().currentUser;
db.collection("comment").doc().set({
    commentText: text,
    commentOn: commentid,
    commentBy: user.uid,
    time: Date.now()
})
.then(function() {
  $('#text-input').val("");
  $('#comment-error').html("commented");
  db.collection("posts").doc(commentid).get().then(function(commentData){
      if(user.uid != commentData.data().textby){
   //+1 impression
   db.collection("impression").doc(user.uid+commentData.data().textby).get().then(function(impress){
    if(impress.exists){
     db.collection("impression").doc(user.uid+commentData.data().textby).set({
        impressionBy: user.uid,
        impressionOn: commentData.data().textby,
        impression: Number(impress.data().impression) + 1,
        time: Date.now()
    }).catch(function(error){
      console.log(error);
    });
    }else{
        db.collection("impression").doc(user.uid+commentData.data().textby).set({
            impressionBy: user.uid,
            impressionOn: commentData.data().textby,
            impression: Number(1),
            time: Date.now()
        }).catch(function(error){
          console.log(error);
        });
    }
  });
  }
  });
  $('#comment-btn').attr("disabled",false);
  setTimeout(function(){
    $('#comment-error').css("display","none");
  },1500);
})
.catch(function(error){
    $('#comment-error').html("error, please try again later...");
});
}
}

function commenthide() {
    $('#comment-container').addClass("animated fadeOut");
    $('#comment-btn').attr("onclick",'');
    setTimeout(function(){
        $('#comment-container').removeClass("animated fadeOut");
        $('#comment-container').css("display","none");
        $('#all-comments').html("loading...");
    },800);
}

$("#search").keyup(function(){
    var searchTerm = $(this).val();
    $("#results").html("");
    $("#results").css("display","inherit");
    $("#results").addClass("animated fadeIn");
    if(!searchTerm){
        $("#results").css("display","none");
        return;
    }else{
    db.collection("users").orderBy("username").startAt(searchTerm).endAt(searchTerm + "\uf8ff")
    .get()
    .then(function(querySnapshot){
        $("#results").html("");
        if(querySnapshot.empty == true){
            $("#results").html("<center>nothing to show here</center>");
            return;
        }
    querySnapshot.forEach(function(doc){
        $("#results").append(`<a href="profile.html#${doc.data().username}" target="_blank"><div class="tr"><table><tr><td><div style="background:url('${doc.data().userimg}') center center;"></div></td><td>${doc.data().username}</td></tr></table></div></a>`);
    });
    });
    }
});

function logout(){
    firebase.auth().signOut().then(function(){
        alert("Logged Out");
    }, function(error){
        alert("Error Logging out");
    });
}

//text.replace(/#(\w+)/g, '<a href="search.html#$1">#$1</a>');