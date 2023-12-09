const token = localStorage.getItem("token");
const baseUrl = "https://tarmeezacademy.com/api/v1";
const id = new URLSearchParams(window.location.search).get("id")
checkDarkMode()
authnUI()
getProfileInfo()
getPosts()

function preloader(state = "off")
{
    if(state == "on"){
        document.getElementById("preloader").style.visibility = "visible"
    }
    else
    if(state == "off")
    {
        document.getElementById("preloader").style.visibility = "hidden"
    }
}

function showAlert(message,type)
{
    const alertPlaceholder = document.getElementById('liveAlertPlaceholder')
    const appendAlert = (message, type) => {
      const wrapper = document.createElement('div')
      wrapper.innerHTML = 
      [
        `<div class="alert alert-${type} alert-dismissible" role="alert">`,
        `   <div>${message}</div>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        '</div>'
      ].join('')
    
      alertPlaceholder.append(wrapper)
    }

        appendAlert(message, type)


}

function authnUI()   
{
    const loggedOut = document.getElementById("guest");
    const loggedIn = document.getElementById("nav-user");
    
    if(localStorage.getItem("token") === null)
    {
        loggedIn.style.setProperty("display","none","important")
        loggedOut.style.display ="flex"
    }
    else 
    {
        loggedIn.style.setProperty("display","flex","important")
        loggedOut.style.setProperty("display","none","important")
        let user = currentUser();
        const userPic = document.getElementById("user-pic").src = user.profile_image;
        const username = document.getElementById("user-username").innerHTML = user.username;
    }
    
}

function registerUser()  
{
    let formData = new FormData();
    formData.append("image",document.getElementById("reg-image").files[0])
    formData.append("username",document.getElementById("reg-username").value)
    formData.append("password",document.getElementById("reg-password").value)
    formData.append("name",document.getElementById("reg-name").value)
    formData.append("email",document.getElementById("reg-email").value)

    axios.post(`${baseUrl}/register`,formData)
    .then((result) => {
       localStorage.setItem("token",result.data.data.token)
       localStorage.setItem("user",JSON.stringify(result.data.user))
       let modal = bootstrap.Modal.getInstance(document.getElementById("reg-modal"));
       modal.hide()
       authnUI()
       showAlert("User registered successfully","success")
    }).catch((err) => {
        showAlert(err.response.data.error,"danger")
    });
    /* toggle modal off */

}
document.getElementById("reg-user").addEventListener("click",registerUser);

// CURRENT USER INFORMATION
function currentUser() {
    let user = "";
    if(localStorage.getItem("user") !== null)
    {
       user = JSON.parse(localStorage.getItem("user"))
    }
    return user
}
 
function signInUser()
{
    const params = {
        "username" : document.getElementById("lgn-username").value,
        "password" : document.getElementById("lgn-password").value
    }
    axios.post(`${baseUrl}/login`,params,{
        headers:{
            "Accept":"application/json"
        }
    })
    .then((result) => {
        localStorage.setItem("token",result.data.token);
        localStorage.setItem("user",JSON.stringify(result.data.user))
        let modal = bootstrap.Modal.getInstance(document.getElementById("sgnin-modal"))
        modal.hide()
        authnUI()
        showAlert("Logged in successfully","success")
    }).catch((err) => {
        // showAlert(err.response.data.error,"danger")
    });
}
document.getElementById("log-me-in").addEventListener("click",signInUser);

function logout() 
{
    localStorage.removeItem("token");
    authnUI()
    showAlert("logged out successfully","success")
}
document.getElementById("lg-out-btn").addEventListener("click",logout);

function addNewPost()
{
    const title = document.getElementById("create-post-title").value;
    const body  = document.getElementById("create-post-body").value;
    const image = document.getElementById("create-post-image").files[0];
    
    const formData = new FormData();
    formData.append("title",title)
    formData.append("body",body)
    formData.append("image",image)

    axios.post(`${baseUrl}/posts`,formData,{
        headers:{
            "authorization": `Bearer ${token}`
        }
    })
    .then(response => {
        let modal = bootstrap.Modal.getInstance(document.getElementById("create-post-modal"));
        modal.hide()
        getPosts("on",1)
        showAlert("Your post has been created successfully","success")
    })
    .catch(error => {
        showAlert(error,"danger")
    })
}

function addNewComment()
{   
    const id = document.getElementById("comment-post-id").value;
    const comment = document.getElementById("comment-body").value;
    let params = {
        "body" : comment,
    }
    axios.post(`${baseUrl}/posts/${id}/comments`,params,{
        headers:{
            "authorization": `Bearer ${token}`
        }
    })
    .then(response =>{
        showAlert("Your comment has been created successfully","success")
        getComments(id,"on")
    })
    .catch(error => {
        showAlert(error.response.data.message,"danger")
    })
}

function editTrigger(id)
{   
    document.getElementById("edit-post-id").value = id;
    let modal = new bootstrap.Modal(document.getElementById("edit-post-modal"));
    modal.toggle()
}

function updatePost()
{
    const id = document.getElementById("edit-post-id").value;
    let formData = new FormData();
    formData.append("image",document.getElementById('edit-post-image').files[0])
    formData.append("title",document.getElementById('edit-post-title').value)
    formData.append("body",document.getElementById('edit-post-body').value)
    formData.append("_method","put")

    axios.post(`${baseUrl}/posts/${id}`,formData,{
        headers:{
            "Authorization":`Bearer ${token}`
        }
    })
    .then(response => {
        showAlert("You post has been updated successfully","success")
        const modal = bootstrap.Modal.getInstance(document.getElementById("edit-post-modal"))
        modal.hide();
        getPosts("on",1)
    })
    .catch(error => {
        showAlert(error.response.data.message,"danger")
    })
}

function deleteTrigger(id)
{
    document.getElementById("delete-post-id").value = id;
    let modal = new bootstrap.Modal(document.getElementById("delete-post-modal"));
    modal.toggle();
}

function deleteConfirmed()
{
    const id = document.getElementById("delete-post-id").value;
    axios.delete(`${baseUrl}/posts/${id}`,{
        headers:{
            "authorization":`Bearer ${token}`
        }
    })
    .then(response => {
        showAlert("Your post has been deleted successfully","success");
        let modal = bootstrap.Modal.getInstance(document.getElementById("delete-post-modal"));
        modal.hide();
        getPosts("on",1)
    })
}

function getProfileInfo()
{
    axios.get(`${baseUrl}/users/${id}`)
    .then(response => {
        const user = response.data.data;
        let profilePic = ""
        Object.values(user.profile_image).join("") === "" ? profilePic ="../imgs/nobody.png": profilePic = user.profile_image;
        document.getElementById("profile-user-image").src = profilePic
        document.getElementById("profile-username").innerHTML = user.username
        document.getElementById("profile-name").innerHTML = user.name
        document.getElementById("posts-count").innerHTML = user.posts_count
        document.getElementById("comments-count").innerHTML = user.comments_count
    })

}

function getPosts(reload ="off",currentPage=1)
{   
    preloader('on')
    const container =  document.getElementById("posts-container");
    if(reload === "on") {
        container.innerHTML = "";
    }
    
    let content = ``;
    axios.get(`${baseUrl}/users/${id}/posts`)
    .then((result) => {
        const posts = result.data.data;
        if(posts.length == 0) {
            container.innerHTML = "";
            preloader('off')
        }
        for(let post of posts)
        {
            
            /* CHECK IF IMAGE EXISTS */
            let postImg;
            Object.values(post.image).join("") === ""? postImg ="../imgs/noimage.jpg":postImg = post.image;
            

            /* CHECK IF PROFILE PICTURE EXISTS */
            let profilePic;
            Object.values(post.author.profile_image).join("") === ""? profilePic ="../imgs/nobody.png":profilePic = post.author.profile_image;
            /* CHECK IF IT IS THE USER POST */
            let user = currentUser();
            const itsMyPost = post.author.id === user.id
            let postIsYours = "";
            if(itsMyPost)
            {
                postIsYours = 
                `
                <button class="btn btn-primary btn-sm me-1" onclick="editTrigger(${post.id})">
                    <i class="bi  bi-pencil-square"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteTrigger(${post.id})"><i class="bi bi-trash"></i></button>
                `
            }
            content =
            `
            <div class="post mb-5 shadow rounded">
                <div class="card">
                    <div class="card-header post-header d-flex justify-content-between align-items-center">
                        <div>
                            <img onclick="viewProfile(${post.author.id})" id="post-user-image" loading ="lazy" class="temp-pp" src="${profilePic}" />
                            <b  onclick="viewProfile(${post.author.id})"id="post-user-name" class="temp-user fs-6">${post.author.name}</b>
                        </div>
                        <div>${postIsYours}</div>
                        </div>
                        <div class="card-body post-bdy">
                        <div class="skeleton">
                            <img
                            id="post-main-image"
                            class="w-100"
                            src="${postImg}"
                            loading ="lazy"
                                />
                        </div>

                        <div class="post-text mt-4 skeleton">
                                <p style="color:grey;font-size:12px;" >${post.created_at}</p>
                                <b class="fs-3">${post.title !== "" ? post.title:"no title"}</b>
                                <p class="mt-3">
                                    ${post.body !== "" ? post.body : "body is empty"}
                                </p>
                                
                                <hr style="color:#4e4e4e"/>
                                <div 
                                class = "comment-container" 
                                data-bs-toggle="modal" 
                                data-bs-target="#comments"
                                style = "cursor:pointer;"
                                onclick = "getComments(${post.id})"
                                >
                                    <i class="bi bi-chat-dots"></i>
                                    <span>(${post.comments_count}) Comments</span>
                                </div>
                        </div>
                    </div>
                </div>
            </div>
            
            `
            container.innerHTML += content
            if(document.getElementById("dark-mode").checked) {
                document.body.style.backgroundColor = "#18191a"
                document.getElementById("nav-bar").style.backgroundColor = "#242526"
                document.querySelectorAll(".nav-txt-color").forEach(el => {
                    el.style.cssText = "color:white;"
                })
                document.querySelectorAll(".card").forEach(el=>{
                    el.style.cssText = "background-color:#242526;color:white"
                })
                document.querySelectorAll(".modal-content").forEach(el=>{
                    el.style.cssText = "background-color:#18191a;color:#fff;"
                })
                document.querySelectorAll(".btn-close").forEach(el=>{
                    el.style.cssText = "filter:invert(1);"
                })
            }
            else if(!document.getElementById("dark-mode").checked){
                document.body.style.backgroundColor = "#f0f2f5"
                document.querySelectorAll(".nav-txt-color").forEach(el => {
                    el.style.cssText = "color:black;"
                })
                document.querySelectorAll(".card").forEach(el=>{
                    el.style.cssText = "background-color:#ffffff;color:black"
                })
                document.querySelectorAll(".modal-content").forEach(el=>{
                    el.style.cssText = "background-color:#ffffff;color:black"
                })
                document.querySelectorAll(".btn-close").forEach(el=>{
                    el.style.cssText = "filter:invert(0);"
                })
                
            }
        }
        preloader('off')
    })
    .then(()=>{
        if(document.getElementById("main-loader") != null)
        {
            document.getElementById("main-loader").remove()
        }
    })
    
}

function getComments(id,reload ="off")
    {   

    document.getElementById("comment-post-id").value = id;
    axios.get(`${baseUrl}/posts/${id}`)
    .then((result) => {
        if(reload === "on"){
            document.getElementById("all-comments").innerHTML = ""
        }
        // IF THERE IS NO COMMENTS
        const comments = result.data.data.comments;
        if(result.data.data.comments.length < 1)
        {
            document.getElementById("all-comments").innerHTML = "<P> no comments yet</P>"
            document.getElementById("all-comments").innerHTML += "<img class='w-50 no-comment-img' src='../imgs/nocomments.png'/>"
            document.querySelector("#all-comments p").style.cssText = "position:absolute;top:70%;left:50%;transform:translateX(-50%);"
            document.querySelector("#all-comments img").style.cssText = "position:absolute;left:50%;transform:translatex(-50%)"
            
            if(localStorage.getItem("dark-mode") === "on")
            {
                document.getElementById("comments-color").style.setProperty("background-color","#18191a")
                document.getElementById("comments-color").style.setProperty("color","#fff")
                document.getElementById("comment-body").style.setProperty("background-color","#242526")
                document.getElementById("comment-body").style.setProperty("color","#fff")
                document.getElementById("comment-body").classList.add("drk-input")

            }
            else{
                document.getElementById("comments-color").style.setProperty("background-color","#fff")
                document.getElementById("comments-color").style.setProperty("color","#000")
                document.getElementById("comment-body").style.setProperty("background-color","#fff")
                document.getElementById("comment-body").style.setProperty("color","#000")
                document.getElementById("comment-body").classList.remove("drk-input")  

            }
        }
        else // if comments exists
        {

            document.getElementById("all-comments").innerHTML = "";

            for(let comment of comments)
            {

                const user = comment.author.username;
                const profileImg = comment.author.profile_image;
                Object.values(comment.author.profile_image).join("") === ""? profilePic ="../imgs/nobody.png":profilePic = comment.author.profile_image;
                const commentBdy = comment.body;
                let content = 
                `
                <div class="comment d-flex w-100 mb-3">
                    <img id="post-user-image" class="temp-pp mt-2" src="${profileImg}" onclick="viewProfile(${comment.author.id})" />
                    <div class="card p-3 w-100 shadow the-comment">
                        <div class="post-header ">
                            <b id="post-user-name" class="temp-user fs-7" onclick="viewProfile(${comment.author.id})">@${user}</b>
                        </div>
                        <div class="post-text">
                            <p class="mt-3">
                                ${commentBdy}
                            </p>
                        </div>
                    </div>
                </div>
                `
                document.getElementById("all-comments").innerHTML += content

                if(localStorage.getItem("dark-mode") === "on")
                {
                    document.getElementById("comments-color").style.setProperty("background-color","#18191a")
                    document.getElementById("comments-color").style.setProperty("color","#fff")
                    document.getElementById("comment-body").style.setProperty("background-color","#242526")
                    document.getElementById("comment-body").style.setProperty("color","#fff")
                    document.getElementById("comment-body").classList.add("drk-input")  
                    document.querySelectorAll(".the-comment").forEach(el => {
                        el.style.cssText = "background-color:#242526;color:#fff"
                    })
                }
                else{
                
                    document.getElementById("comments-color").style.setProperty("background-color","#f0f2f5")
                    document.getElementById("comments-color").style.setProperty("color","#000")
                    document.getElementById("comment-body").style.setProperty("background-color","#f0f2f5")
                    document.getElementById("comment-body").style.setProperty("color","#000")
                    document.getElementById("comment-body").classList.remove("drk-input")  
                    document.querySelectorAll(".the-comment").forEach(el => {
                        el.style.cssText = "background-color:#fff;color:#000"
                    })

                }
                

                
            }
        }
    }).catch((err) => {
        
    });

}

function viewProfile (id)
{
    window.location = "../pages/profile.html"+`?id=${id}`
}

function viewMyProfile()
{
    const id = currentUser().id
    window.location = "../pages/profile.html"+`?id=${id}`
}

function checkDarkMode()
{
    if(localStorage.getItem("dark-mode") === "on")
    {
        document.getElementById("dark-mode").checked = true
        document.querySelector(".navbar-toggler-icon").style.cssText = "filter:invert(1);"
    }
    else{
        document.getElementById("dark-mode").checked = false
        document.querySelector(".navbar-toggler-icon").style.cssText = "filter:invert(0);"
    }
}

function darkMode()
 {
    
            if(document.getElementById("dark-mode").checked) {

                document.body.style.backgroundColor = "#18191a"
                document.getElementById("nav-bar").style.backgroundColor = "#242526"
                document.querySelectorAll(".nav-txt-color").forEach(el => {
                    el.style.cssText = "color:white;"
                })
                document.querySelectorAll(".card").forEach(el=>{
                    el.style.cssText = "background-color:#242526;color:white"
                })
                document.querySelectorAll(".modal-content").forEach(el=>{
                    el.style.cssText = "background-color:#18191a;color:#fff;"
                })
                document.querySelector(".navbar-toggler-icon").style.cssText = "filter:invert(1);"
                document.querySelectorAll("input").forEach(el => {
                    el.classList.add("drk-input")
                })
                document.querySelectorAll("textarea").forEach(el => {
                    el.classList.add("drk-input")
                })
                localStorage.setItem("dark-mode","on")
            }
            else if(!document.getElementById("dark-mode").checked){

                document.body.style.backgroundColor = "#f0f2f5"
                document.getElementById("nav-bar").style.backgroundColor = "#ffffff"
                document.querySelectorAll(".nav-txt-color").forEach(el => {
                    el.style.cssText = "color:black;"
                })
                document.querySelectorAll(".card").forEach(el=>{
                    el.style.cssText = "background-color:#ffffff;color:black"
                })
                document.querySelectorAll(".modal-content").forEach(el=>{
                    el.style.cssText = "background-color:#ffffff;color:black"
                })
                document.querySelector(".navbar-toggler-icon").style.cssText = "filter:invert(0);"
                document.querySelectorAll("input").forEach(el => {
                    el.classList.remove("drk-input")
                })
                document.querySelectorAll("textarea").forEach(el => {
                    el.classList.remove("drk-input")
                })
                localStorage.setItem("dark-mode","off")

            }
}
darkMode()
document.getElementById("dark-mode").addEventListener("click",darkMode);


