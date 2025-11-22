import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Communities.module.css';

const MiniPost = ({ post }) => {
    if (!post) return null; // Если поста нет, просто ничего не показываем, чтобы не портить дизайн
    
    return (
        <div className={styles.miniPostContainer}>
            <div className={styles.miniPostHeader}>Последняя активность</div>
            <div className={styles.miniPostContent}>
                {post.text && <div className={styles.miniPostText}>{post.text}</div>}
                {post.image && <img src={post.image} alt="post attachment" className={styles.miniPostImage} />}
            </div>
        </div>
    );
};

const CommunityCard = ({ community }) => {
    const navigate = useNavigate();
    const [isMember, setIsMember] = useState(false);
    const [lastPost, setLastPost] = useState(null);

    useEffect(() => {
        if (community.is_member==true){
            console.log(community.is_member);
            setIsMember(true);
        }   
        const fetchLastPost = async () => {
            try {
                const resp = await axios.get(`http://10.124.215.133:8000/api/posts/?community=${community.id}&limit=1`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
                });
                const posts = resp.data.results || resp.data;
                if (posts.length > 0) {
                    setLastPost(posts[0]);
                }
            } catch (err) {
                console.error("Err loading post", err);
            }
        };
        if(community.id) fetchLastPost();
    }, [community.id]);

    const handleJoin = async (e) => {
        e.stopPropagation();
        try {
            await axios.post(`http://10.124.215.133:8000/api/communities/${community.id}/join/`, {}, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
            });
            setIsMember(true);
        } catch (err) { console.error(err); }
    };

    const handleLeave = async (e) => {
        e.stopPropagation();
        try {
            await axios.post(`http://10.124.215.133:8000/api/communities/${community.id}/leave/`, {}, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
            });
            setIsMember(false);
        } catch (err) { console.error(err); }
    };

    return (
        <div className={styles.community_InfoForum} onClick={() => navigate(`/communities/${community.id}`)} style={{cursor: 'pointer'}}>
            {/* Верхняя часть: Аватар, Название, Кнопка */}
            <div className={styles.community_FormsUp}>
                <div className={styles.community_FormsUpLeft}>
                    <div className={styles.community_FormImgForum}>
                        <img 
                            className={styles.community_ImgForum}
                            src={community.avatar || "/images/community_placeholder.svg"}
                            alt={community.title}
                            onError={(e) => {e.target.src="/images/community_placeholder.svg"}}
                        />
                    </div>
                    <div className={styles.community_FormNameForum}>
                        {community.title}
                    </div>
                </div>
                
                <div className={styles.community_FormButtonSubscribe}>
                    <button 
                        className={styles.community_ButtonSubscribe}
                        onClick={isMember ? handleLeave : handleJoin}
                    >
                        {isMember ? "Выйти" : "Вступить"}
                    </button>
                </div>
            </div>

            {/* Описание */}
            {community.description && (
                <div className={styles.community_FormDescriptionForum}>
                    {community.description.slice(0, 150)}...
                </div>
            )}

            {/* Последний пост */}
            <MiniPost post={lastPost} />
        </div>
    );
};

export default CommunityCard;