import axios from "axios";
import { useState, useEffect } from "react";
import styles from "./Main.module.css"

function Post(props) {
    const [isLiked, setIsLiked] = useState(props.data.is_liked);
    const [likesCount, setLikesCount] = useState(props.data.likes_count);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLiked(props.data.is_liked);
        setLikesCount(props.data.likes_count);
    }, [props.data.is_liked, props.data.likes_count]);

    const toggleLike = async (e) => {
        e.preventDefault();
        
        if (isLoading) return; 
        
        setIsLoading(true);

        const previousIsLiked = isLiked;
        const previousLikesCount = likesCount;
        
        setIsLiked(!isLiked);
        setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

        try {
            const resp = await axios.post(
                `http://192.168.3.27:8000/api/posts/${props.data.id}/like/`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access')}`
                    }
                }
            );

            if (resp.status === 200 || resp.status === 201) {
                setIsLiked(resp.data.is_liked);
                setLikesCount(resp.data.likes_count);
                console.log('Like toggled:', resp.data);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            setIsLiked(previousIsLiked);
            setLikesCount(previousLikesCount);
        } finally {
            setIsLoading(false);
        }
    };

    return (  
        <div className={styles.main_post} id={props.data.id}>
            <div className={styles.main_post__userinfo}>
                <div className={styles.main_item}>
                    <img className={styles.main_profile__img} src="images/profile.svg" alt="profile" />
                </div>
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
                <div className={styles.main_likes}>
                    <div 
                        className={styles.main_like_btn} 
                        onClick={toggleLike}
                        style={{ opacity: isLoading ? 0.5 : 1, cursor: isLoading ? 'wait' : 'pointer' }}
                    >
                        <img 
                            className={styles.main_reaction} 
                            src={isLiked ? "images/heart1.svg" : "images/heart.svg"} 
                            alt="heart" 
                        />
                    </div>
                    <div className={styles.main_likes_count}>{likesCount}</div>
                </div>
                <div>
                    <img className={styles.main_reaction} src="images/message.svg" alt="message" />
                </div>
            </div>
        </div>
    );
}

export default Post;
