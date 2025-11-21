import styles from  "./Main.module.css"
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
         <div className={styles.main_post} id={props.data.id}>
            <div className={styles.main_post__userinfo}>
                <div className={styles.main_item}><img className={styles.main_profile__img} src="images/profile.svg" alt="home" /></div>
                <div className={styles.main_post__userinfo__text}>
                    <div className={styles.main_post__username}>{props.data.author.nickname}</div>
                    <div className={styles.main_post__user__miniinf}>
                        <div className={styles.main_post__user__handle}>{props.data.author.handle}</div>
                        <div className={styles.main_post__user__online}>{props.data.author.status}</div>
                    </div>
                </div>
            </div>
            <div className={styles.main_post__title}>{props.data.title}</div>
            <div className={styles.main_post__text}>{props.data.text}</div>
            <div className={styles.main_reactions}>
                <div className={styles.main_likes}> <div className={styles.main_like_btn} onClick={(e)=>liked(e)}><img className={styles.main_reaction} src="images/heart.svg" alt="heart" /></div>
                    <div className={styles.main_likes_count}>+{props.data.likes_count}</div></div>
                <div> <img className={styles.main_reaction} src="images/message.svg" alt="message" /></div>
            </div>
        </div>
    );
}

export default Post;