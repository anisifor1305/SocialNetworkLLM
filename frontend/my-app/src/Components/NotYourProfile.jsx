import { useParams, useNavigate } from "react-router-dom";
import styles from "./NotYourProfile.module.css"
import axios from "axios";
import { useEffect, useState } from "react";
import Post from "./Post";

// 1. Добавляем деструктуризацию пропса part (по умолчанию 'posts')
function NotYourProfile({ part = 'posts' }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const[postUserid, setPostUserId] = useState();
    const [friendLoading, setFriendLoading] = useState(false);
    
    // Состояния для контента
    const [userPosts, setUserPosts] = useState([]);
    const [userFriends, setUserFriends] = useState([]); // 2. State для друзей

    const { handle } = useParams();
    const navigate = useNavigate();

    const getErrorMessage = (error) => {
        // ... (твоя функция getErrorMessage без изменений) ...
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

    // ... (функция makeFriend без изменений) ...
    const makeFriend = async (e) => {
        e.preventDefault();
        if (!profile?.results?.[0]?.id) {
            setError("ID пользователя не найден");
            return;
        }
        setFriendLoading(true);
        try {
            await axios.post('http://192.168.3.27:8000/api/subscriptions/', {
                "target_user_id": profile.results[0].id
            }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
            });
            console.log("Запрос в друзья отправлен");
        } catch (err) {
            const errorMessage = getErrorMessage(err.response?.data);
            setError(errorMessage);
        } finally {
            setFriendLoading(false);
        }
    }

    // ... (функция fetchUserPosts без изменений) ...
    const fetchUserPosts = async () => {
        if (!profile?.results?.[0]?.id) return;
        const id = profile.results[0].id;
        try {
            const resp = await axios.get(`http://10.124.215.133:8000/api/posts/?author=${id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
            });
            setUserPosts(resp.data.results || resp.data || []);
        } catch (err) {
            console.error('Ошибка при загрузке постов:', err);
        }
    }

    // 3. Новая функция для загрузки друзей
    const fetchUserFriends = async () => {
        if (!profile?.results?.[0]?.id) return;
        const id = profile.results[0].id;

        try {
            // ВАЖНО: Проверь URL. Обычно список друзей - это подписки этого пользователя.
            // Я предполагаю, что мы ищем, на кого подписан этот user (subscriber=id).
            const resp = await axios.get(`http://10.124.215.133:8000/api/subscriptions/?subscriber=${id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
            });
            
            console.log("Друзья получены:", resp.data);
            // Сохраняем массив из results, если API возвращает пагинацию
            setUserFriends(resp.data.results || resp.data || []);
        } catch (err) {
            console.error('Ошибка при загрузке друзей:', err);
        }
    }

    // ... (функции навигации handleBack, handleLogoClick без изменений) ...
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
                setProfile(result.data);
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

    // 4. Логика выбора, что загружать: Посты или Друзей
    useEffect(() => {
        if (profile?.results?.[0]?.id) {
            setPostUserId(profile?.results?.[0]?.id);
            if (part === 'friends') {
                fetchUserFriends();
            } else {
                fetchUserPosts();
            }
        }
    }, [profile, part]); // Добавили part в зависимости

    if (loading) return <div className={styles.loading}>Загрузка профиля...</div>;
    if (error) return <div className={styles.error}>Ошибка: {error}</div>;
    if (!profile?.results?.[0]) return <div className={styles.error}>Профиль не найден</div>;

    const userData = profile.results[0];

    return (
        <div className={styles.nyprofile_out_container}>
            <div className={styles.nyprofile_container}>
                {/* Header без изменений */}
                <header>
                    <div className={styles.nyprofile_header_left__item}>
                         <div className={styles.nyprofile_item}>
                            <img className={styles.nyprofile_header__img_logo} src="/images/logo.svg" alt="logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }} />
                        </div>
                    </div>
                    <div className={styles.nyprofile_header_right__item}>
                        <div className={styles.nyprofile_item}><img className={styles.nyprofile_header__img} src="/images/bell.svg" alt="notifications" /></div>
                        <div className={styles.nyprofile_item}><img className={styles.nyprofile_header__img} src="/images/profile.svg" alt="profile" /></div>
                        <div className={styles.nyprofile_item}>
                            <img className={styles.nyprofile_header__img} src="/images/back.svg" alt="back" onClick={handleBack} style={{ cursor: 'pointer' }} />
                        </div>
                    </div>
                </header>
                
                {/* Блок информации о пользователе без изменений */}
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
                    
                    <div className={styles.nyprofile_SomeInfo}>
                        <div className={styles.nyprofile_number_post}>

                            <div className={styles.nyprofile_ChisloPostov}>{profile.posts_count || 0}</div>
                            <div className={styles.nyprofile_StringPosts}>Посты</div>
                        </div>
                        <div className={styles.nyprofile_number_friends}>
                            <div className={styles.nyprofile_ChisloFriends}>{profile.friends_count || 0}</div>
                            <div className={styles.nyprofile_StringFriends}>Друзья</div>
                        </div>
                    </div>
                    
                    <div className={styles.nyprofile_ButtonTwo}>
                        <button 
                            className={styles.nyprofile_MakeFriendButton} 
                            onClick={makeFriend}
                            disabled={friendLoading}
                        >
                            {friendLoading ? "Отправка..." : "Подружиться"}
                        </button>
                        <button className={styles.nyprofile_MessageButton}>Написать</button>
                    </div>
                </div>
                
                {/* Меню вкладок - здесь можно добавить визуальное выделение активной вкладки */}
                <div className={styles.nyprofile_afterheader}>
                    <div 
                        className={styles.nyprofile_afterheader__item}
                        style={{ fontWeight: part !== 'friends' ? 'bold' : 'normal' }} onClick={(e)=>navigate(`/${handle}`)}
                    >
                        Posts
                    </div>
                    <div 
                        className={styles.nyprofile_afterheader__item}
                        style={{ fontWeight: part === 'friends' ? 'bold' : 'normal' }} onClick={(e)=>navigate(`/${handle}/friends`)}
                    >
                        Friends
                    </div>
                    {/* <div className={styles.nyprofile_afterheader__item}>Photos</div> */}
                </div>

                {/* 5. Условный рендеринг контента */}
                <div className={styles.postsContainer}>
                    {part === 'friends' ? (
                        // === БЛОК ДРУЗЕЙ ===
                        <div className={styles.friendsList}>
                            {userFriends.length > 0 ? (
                                userFriends.map((item) => (
                                    // Предполагаем, что item содержит target_user (тот, на кого подписаны)
                                    <div key={item.id} className={styles.friendItem} style={{ padding: '10px', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <img 
                                            src={item.target_user?.avatar || "/images/profile.svg"} 
                                            alt="avatar" 
                                            style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                                        />
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>{item.target_user?.nickname}</div>
                                            <div style={{ fontSize: '0.8em', color: '#888' }} onClick={(e)=>navigate(`/${e.target.textContent.slice(1)}`)}>@{item.target_user?.handle}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ textAlign: 'center', color: '#888' }}>Список друзей пуст</p>
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
                                <p style={{ textAlign: 'center', color: '#888' }}>Постов нет</p>

                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default NotYourProfile;
