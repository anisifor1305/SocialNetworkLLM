function Post(props) {
    function liked(e) {
        let element = e.target;
        if(element.getAttribute('src')=='images/heart.svg'){
            element.setAttribute('src', 'images/heart1.svg');
        }
        else{
            element.setAttribute('src', 'images/heart.svg');
        }
        console.log(element);
    }
    return (  
         <div class="post" id={props.data.id}>
            <div class="post__userinfo">
                <div class="item item_4"><img className="profile__img" src="images/profile.svg" alt="home" /></div>
                <div class="post__userinfo__text">
                    <div class="post__username">{props.data.author.username}</div>
                    <div class="post__user__miniinf">
                        <div class="post__user__handle">@handle</div>
                        <div class="post__user__online">{props.data.author.status}</div>
                    </div>
                </div>
            </div>
            <div class="post__title">{props.data.title}</div>
            <div class="post__text">{props.data.text}</div>
            <div class="reactions">
                <div class="likes"> <div class="like_btn" onClick={(e)=>liked(e)}><img className="reaction" src="images/heart.svg" alt="heart" /></div>
                    <div class="likes-count">+{props.data.likes_count}</div></div>
                <div> <img className="reaction" src="images/message.svg" alt="message" /></div>
            </div>
        </div>
    );
}

export default Post;