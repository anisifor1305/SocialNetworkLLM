import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./Community.module.css";
import NotificationBell from "./NotificationBell";
import {API_CONFIG} from '../config' //1

function Community() {
    const { id } = useParams();
    const navigate = useNavigate(); 
    const handleGoBack = () => {
        navigate(-1); 
    };
    const [posts, setPosts] = useState([]);
    const [community, setCommunity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [communityId, setCommunityId] = useState(null)
    const [isMember, setIsMember] = useState(false)

    const handleJoin = async (e) => {
        console.log('dfdjfhudfhuf');
        // e.stopPropagation();
        console.log(e.target);
        console.log(isMember);
        try {
            if(isMember){
                await axios.post(`${API_CONFIG.BASE_URL}/api/communities/${communityId}/leave/`, {}, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
            });
            setIsMember(false)
            e.target.textContent = "Подписаться"
            }
            else{
                await axios.post(`${API_CONFIG.BASE_URL}/api/communities/${communityId}/join/`, {}, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
            });
            setIsMember(true)
            e.target.textContent = "Отписаться"
            }

        } catch (err) { console.error(err); }
    };
    const fetchCommunityInfo = async () => {
        try {
            const resp = await axios.get(`${API_CONFIG.BASE_URL}/api/communities/${id}/`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
            });
            setIsMember(resp.data.is_member)
            setCommunityId(resp.data.id)
        } catch (err) {
            console.error("Err loading community", err);
        }
    };

    const fetchPosts = async () => {
        try {
            const resp = await axios.get(`${API_CONFIG.BASE_URL}/api/posts/?community=${id}&limit=5`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
            });
            const postsResp = resp.data.results || resp.data;
            setPosts(postsResp);
        } catch (err) {
            console.error("Err loading posts", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (postId, isCurrentlyLiked) => {
        try {
            console.log(isMember);
            if (isCurrentlyLiked) {
                await axios.post(`${API_CONFIG.BASE_URL}/api/posts/${postId}/like/`, {}, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
                });
                document.getElementById("12").textContent="dddd";
                isMember = false;
            } else {
                await axios.post(`${API_CONFIG.BASE_URL}/api/posts/${postId}/like/`, {}, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
                });
                document.getElementById("12").textContent="dddd";
                isMember=true;
            }
            fetchPosts();
        } catch (err) {
            console.error("Err with like", err);
        }
    };


    useEffect(() => {
        fetchCommunityInfo();
        fetchPosts();
    }, [id]);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Загрузка сообщества...</p>
            </div>
        );
    }

    return (
        <div className={styles.community_out_container}>
            <div className={styles.main_container}>
                {/* Старая шапка */}
                <div className={styles.main_header}>
                    <div className={styles.main_header_left}>
                        <div className={styles.main_item} onClick={() => navigate('/')}>
                            <img className={styles.main_header__img_logo} src="/images/logo.svg" alt="логотип" />
                        </div>
                    </div>
                    <div className={styles.main_header_right}>
                        <div className={styles.main_item} onClick={() => navigate('/notifications')}>
                            <NotificationBell/>
                        </div>
                        <div className={styles.main_item} onClick={() => navigate('/myprofile/')}>
                            <img className={styles.main_header__img} src="/images/profile.svg" alt="профиль" />
                        </div>
                        <div className="StrelkaPlace">
                            <img 
                                className={styles.Strelka} 
                                src="/images/back.svg" 
                                alt="Go back" 
                                onClick={handleGoBack} // Добавляем обработчик клика на стрелку
                                style={{ cursor: 'pointer' }} // Указатель, чтобы показать интерактивность
                            />
                        </div>
                    </div>
                </div>


                {/* Основной контент */}
                <div className={styles.community_body}>
                    {/* Информация о сообществе */}
                    <div className={styles.community_InfoForum}>
                        <div className={styles.community_FormsUp}>
                            <div className={styles.community_FormsUpLeft}>
                                <div className={styles.community_FormImgForum}>
                                    <img 
                                        className={styles.community_ImgForum} 
                                        src={community?.avatar || "/images/Profile.svg"} 
                                        alt="аватар сообщества" 
                                    />
                                </div>
                                <div className={styles.community_FormNameForum}>
                                    {community?.title || "Название сообщества"}
                                </div>
                            </div>
                            <div className={styles.community_FormButtonSubscribe}>
                                <button className={styles.community_ButtonSubscribe} id="12" onClick={(e)=>handleJoin(e)}> 
                                    {isMember ? 'Отписаться' : 'Подписаться'}
                                </button>
                            </div>
                        </div>
                        <div className={styles.community_FormsDownLeft}>
                            <div className={styles.community_FormDescriptionForum}>
                                {community?.description || "Описание сообщества пока отсутствует."}
                            </div>
                        </div>
                    </div>

                    {/* Посты сообщества */}
                    <div className={styles.community_posts}>
                        <h2 className={styles.community_posts_title}>Публикации сообщества</h2>
                        
                        {posts.length === 0 ? (
                            <div className={styles.community_empty}>
                                <p>В этом сообществе пока нет публикаций</p>
                                <button className={styles.community_create_post}>
                                    Создать первый пост
                                </button>
                            </div>
                        ) : (
                            posts.map(post => (
                                <div key={post.id} className={styles.community_post}>
                                    <div className={styles.community_post__userinfo}>
                                        <div className={styles.community_item}>
                                            <img 
                                                className={styles.community_profile__img} 
                                                src={post.author.avatar || "/images/profile.svg"} 
                                                alt="аватар пользователя" 
                                            />
                                        </div>
                                        <div className={styles.community_post__userinfo__text}>
                                            <div className={styles.community_head_post}>
                                                <div className={styles.community_to_not_ct}>
                                                    <div className={styles.community_post__forumname}>
                                                        {community?.name}
                                                    </div>
                                                    <div className={styles.community_item_dot}>
                                                        <img 
                                                            className={styles.community_profile__dot} 
                                                            src="/images/dot.svg" 
                                                            alt="∙" 
                                                        />
                                                    </div>
                                                    <div className={styles.community_post__username}>
                                                        {post.author.nickname || post.author.handle}
                                                    </div>
                                                </div>
                                                <div className={styles.community_to_ct}>
                                                    <div className={styles.community_textCT}>2 часа назад</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* <div className={styles.community_post__title}>
                                        {post.community_title || "Без названия"}
                                    </div> */}

                                    <div className={styles.community_post__text}>
                                        {post.text}
                                    </div>

                                    {post.image && (
                                        <div className={styles.community_post_image}>
                                            <img className={`${styles.community_post_image}`} src={post.image} alt="Изображение поста" />
                                        </div>
                                    )}

                                    <div className={styles.community_reactions}>
                                        <div 
                                            className={`${styles.community_reaction_item} ${post.is_liked ? styles.community_reaction_active : ''}`}
                                            onClick={() => handleLike(post.id, post.is_liked)}
                                        >
                                            <img 
                                                className={styles.community_reaction} 
                                                src={post.is_liked ? "/images/heart1.svg" : "/images/heart.svg"} 
                                                alt="нравится" 
                                            />
                                            <span className={styles.community_reaction_count}>
                                                {post.likes_count}
                                            </span>
                                        </div>
                                        <div className={styles.community_reaction_item}>
                                            <img 
                                                className={styles.community_reaction} 
                                                src="/images/message.svg" 
                                                alt="комментарии" 
                                            />
                                            <span className={styles.community_reaction_count}>
                                                {post.comments_count || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Старое нижнее меню */}
                <div className={styles.community_bottom__panel}>
                    <div className={styles.community_bottom__item}>
                        <img 
                            className={styles.community_bottom__img} 
                            onClick={() => navigate('/')} 
                            src="/images/home.svg" 
                            alt="главная" 
                        />
                    </div>
                    <div className={styles.community_bottom__item}>
                        <img 
                            className={styles.community_bottom__img} 
                            onClick={() => navigate('/search')} 
                            src="/images/searchZh.svg" 
                            alt="поиск" 
                        />
                    </div>
                    <div className={styles.community_bottom__item}>
                        <img 
                            className={styles.community_plus__img} 
                            onClick={() => navigate('/newpost')} 
                            src="/images/plus.svg" 
                            alt="новая публикация" 
                        />
                    </div>
                    <div className={styles.community_bottom__item}>
                        <img 
                            className={styles.community_bottom__img} 
                            onClick={() => navigate('/messages')} 
                            src="/images/message.svg" 
                            alt="сообщения" 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Community;