import { useParams, useNavigate } from "react-router-dom";
import styles from "./NotYourProfile.module.css"
import axios from "axios";
import { useEffect, useState } from "react";
import Post from "./Post";

function NotYourProfile({ part = 'posts' }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [postUserid, setPostUserId] = useState();
    const [friendLoading, setFriendLoading] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    
    // Состояния для контента и счетчиков
    const [userPosts, setUserPosts] = useState([]);
    const [userFriends, setUserFriends] = useState([]);
    const [postsCount, setPostsCount] = useState(0);
    const [friendsCount, setFriendsCount] = useState(0);

    const { handle } = useParams();
    const navigate = useNavigate();

    const getErrorMessage = (error) => {
        if (typeof error === 'string') return error;
        if (error?.detail) return error.detail;
        if (error?.message) return error.message;
        if (typeof error === 'object') {
            const firstKey = Object.keys(error)[0];
            if (error[firstKey]) {
                if (Array.isArray(error[firstKey])) return error[firstKey][0];
                return error[firstKey];
            }
        }
        return 'Произошла неизвестная ошибка';
    };

    const makeFriend = async (e) => {
        e.preventDefault();
        if (!profile?.results?.[0]?.id) {
            setError("ID пользователя не найден");
            return;
        }
        setFriendLoading(true);
        try {
            await axios.post('http://10.124.215.133:8000/api/subscriptions/', {
                "target_user_id": profile.results[0].id
            }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
            });
            console.log("Запрос в друзья отправлен");
            // После отправки запроса обновляем счетчик друзей
            fetchFriendsCount();
        } catch (err) {
            const errorMessage = getErrorMessage(err.response?.data);
            e.target.textContent = errorMessage;
            document.getElementById("10").style.display="block";
            // setError(errorMessage);
        } finally {
            setFriendLoading(false);
        }
    }

    // Функция для получения количества постов пользователя
    const fetchPostsCount = async (userId) => {
        try {
            const resp = await axios.get(`http://10.124.215.133:8000/api/posts/?author=${userId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
            });
            // Если API возвращает пагинацию с count, используем его, иначе считаем длину массива
            const count = resp.data.count || (Array.isArray(resp.data) ? resp.data.length : (resp.data.results ? resp.data.results.length : 0));
            setPostsCount(count);
        } catch (err) {
            console.error('Ошибка при загрузке количества постов:', err);
            setPostsCount(0);
        }
    }

    // Функция для получения количества друзей/подписок пользователя
    const fetchFriendsCount = async () => {
        if (!profile?.results?.[0]?.id) return;
        const id = profile.results[0].id;
        
        try {
            const resp = await axios.get(`http://10.124.215.133:8000/api/subscriptions/?subscriber=${id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
            });
            // Аналогично постам - используем count или длину массива
            const count = resp.data.count || (Array.isArray(resp.data) ? resp.data.length : (resp.data.results ? resp.data.results.length : 0));
            setFriendsCount(count);
        } catch (err) {
            console.error('Ошибка при загрузке количества друзей:', err);
            setFriendsCount(0);
        }
    }

    const fetchUserPosts = async () => {
        if (!profile?.results?.[0]?.id) return;
        const id = profile.results[0].id;
        try {
            const resp = await axios.get(`http://10.124.215.133:8000/api/posts/?author=${id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
            });
            const posts = resp.data.results || resp.data || [];
            setUserPosts(posts);
            // Обновляем счетчик постов
            setPostsCount(posts.length);
        } catch (err) {
            console.error('Ошибка при загрузке постов:', err);
            setPostsCount(0);
        }
    }

    const fetchUserFriends = async () => {
        if (!profile?.results?.[0]?.id) return;
        const id = profile.results[0].id;

        try {
            const resp = await axios.get(`http://10.124.215.133:8000/api/subscriptions/?subscriber=${id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
            });
            
            const friends = resp.data.results || resp.data || [];
            setUserFriends(friends);    
            // Обновляем счетчик друзей
            setFriendsCount(friends.length);
        } catch (err) {
            console.error('Ошибка при загрузке друзей:', err);
            setFriendsCount(0);
        }
    }

    const handleBack = () => navigate(-1);
    const handleLogoClick = () => navigate("/");

    // Загрузка профиля
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError(null);
                const token = localStorage.getItem('access');
                if (!token) {
                    setError("Требуется авторизация");
                    setLoading(false);
                    return;
                }
                const result = await axios.get(`http://10.124.215.133:8000/api/profiles/?search=${handle}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!result.data?.results?.length) {
                    setError("Профиль не найден");
                    return;
                }
                else{
                    console.log(result.data.results[0].is_subscribed);
                    if(result.data.results[0].is_subscribed==true){
                        setIsSubscribed(true);
                    }
                }
                setProfile(result.data);
                
                // После загрузки профиля загружаем счетчики
                const userId = result.data.results[0].id;
                await fetchPostsCount(userId);
                await fetchFriendsCount();
            } catch (err) {
                setError(getErrorMessage(err.response?.data));
            } finally {
                setLoading(false);
            }
        };
        if (handle) fetchProfile();
        else {
            setError("Handle не указан");
            setLoading(false);
        }
    }, [handle]);

    // Логика выбора, что загружать: Посты или Друзей
    useEffect(() => {
        if (profile?.results?.[0]?.id) {
            setPostUserId(profile?.results?.[0]?.id);
            if (part === 'friends') {
                fetchUserFriends();
            } else {
                fetchUserPosts();
            }
        }
    }, [profile, part]);

    if (loading) return <div className={styles.loading}>Загрузка профиля...</div>;
    if (error) return <div className={styles.error}>Ошибка: {error}</div>;
    if (!profile?.results?.[0]) return <div className={styles.error}>Профиль не найден</div>;

    const userData = profile.results[0];

    return (
        <div className={styles.nyprofile_out_container}>
            <div className={styles.nyprofile_container}>
                {/* Header */}
                <header>
                    <div className={styles.nyprofile_header_left__item}>
                         <div className={styles.nyprofile_item}>
                            <img className={styles.nyprofile_header__img_logo} src="/images/logo.svg" alt="logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }} />
                        </div>
                    </div>
                    <div className={styles.nyprofile_header_right__item}>
                        <div className={styles.nyprofile_item}>
                            <img className={styles.nyprofile_header__img} src="/images/bell.svg" alt="notifications" onClick={() => navigate('/notifications')} />
                        </div>
                        <div className={styles.nyprofile_item}>
                            <img className={styles.nyprofile_header__img} src="/images/profile.svg" alt="profile" onClick={() => navigate('/myprofile')} />
                        </div>
                        <div className={styles.nyprofile_item}>
                            <img className={styles.nyprofile_header__img} src="/images/back.svg" alt="back" onClick={handleBack} style={{ cursor: 'pointer' }} />
                        </div>
                    </div>
                </header>
                
                {/* Блок информации о пользователе */}
                <div className={styles.nyprofile_BlockOfInformation} id={userData.id}>
                    <div className={styles.nyprofile_UserPhoto}>
                        <img 
                            className={styles.nyprofile_profile__img} 
                            src={userData.avatar || "/images/profile.svg"} 
                            alt="Profile" 
                            onError={(e) => { e.target.src = "/images/profile.svg"; }}
                        />
                    </div>
                    <div className={styles.nyprofile_NickName}>{userData.nickname || "Без имени"}</div>
                    <div className={styles.nyprofile_Handler}>@{userData.handle || "user"}</div>
                    <div className={styles.nyprofile_Description}>{userData.bio || "Нет описания"}</div>
                    
                    {/* Блок с реальными счетчиками */}
                    <div className={styles.nyprofile_SomeInfo}>
                        <div className={styles.nyprofile_number_post}>
                            <div className={styles.nyprofile_ChisloPostov}>{postsCount}</div>
                            <div className={styles.nyprofile_StringPosts}>Посты</div>
                        </div>
                        <div className={styles.nyprofile_number_friends}>
                            <div className={styles.nyprofile_ChisloFriends}>{friendsCount}</div>
                            <div className={styles.nyprofile_StringFriends}>Друзья</div>
                        </div>
                    </div>
                    
                    <div className={styles.nyprofile_ButtonTwo}>
                        <div id="10" className={styles.nyprofile_incorrect_data}>Запрос уже отправлен!</div>
                        <button 
                            className={styles.nyprofile_MakeFriendButton} 
                            onClick={(e)=>makeFriend(e)}
                            disabled={friendLoading}
                        >
                            {isSubscribed ? "Заявка отправлена" : "Добавить в друзья"}
                        </button>
                        <button className={styles.nyprofile_MessageButton}>Сообщение</button>
                    </div>
                </div>
                
                {/* Меню вкладок */}
                <div className={styles.nyprofile_afterheader}>
                    <div 
                        className={styles.nyprofile_afterheader__item}
                        style={{ 
                            fontWeight: part !== 'friends' ? 'bold' : 'normal',
                            borderBottom: part !== 'friends' ? '2px solid #2c2c2c' : 'none'
                        }} 
                        onClick={() => navigate(`/${handle}`)}
                    >
                        Посты
                    </div>
                    <div 
                        className={styles.nyprofile_afterheader__item}
                        style={{ 
                            fontWeight: part === 'friends' ? 'bold' : 'normal',
                            borderBottom: part === 'friends' ? '2px solid #2c2c2c' : 'none'
                        }} 
                        onClick={() => navigate(`/${handle}/friends`)}
                    >
                        Друзья
                    </div>
                </div>

                {/* Условный рендеринг контента */}
                <div className={styles.postsContainer}>
                    {part === 'friends' ? (
                        // === БЛОК ДРУЗЕЙ ===
                        <div className={styles.friendsList}>
                            {userFriends.length > 0 ? (
                                userFriends.map((item) => (
                                    <div key={item.id} className={styles.friendItem}>
                                        <img 
                                            src={item.target_user?.avatar || "/images/profile.svg"} 
                                            alt="avatar" 
                                            className={styles.friendAvatar}
                                            onError={(e) => { e.target.src = "/images/profile.svg"; }}
                                        />
                                        <div className={styles.friendInfo}>
                                            <div className={styles.friendName}>
                                                {item.target_user?.nickname || "Без имени"}
                                            </div>
                                            <div 
                                                className={styles.friendHandle}
                                                onClick={() => navigate(`/${item.target_user?.handle}`)}
                                            >
                                                @{item.target_user?.handle}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.emptyState}>
                                    <p>Список друзей пуст</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        // === БЛОК ПОСТОВ ===
                        <div className={styles.postsList}>
                            {userPosts.length > 0 ? (
                                userPosts.map((post) => (
                                    <Post key={post.id} data={post} />
                                ))
                            ) : (
                                <div className={styles.emptyState}>
                                    <p>Постов нет</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default NotYourProfile;