import { useParams, useNavigate } from "react-router-dom";
import styles from "./NotYourProfile.module.css"
import axios from "axios";
import { useEffect, useState } from "react";

function NotYourProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [friendLoading, setFriendLoading] = useState(false);
    const { handle } = useParams();
    const navigate = useNavigate();

    // Функция для преобразования ошибки в строку
    const getErrorMessage = (error) => {
        if (typeof error === 'string') return error;
        if (error?.detail) return error.detail;
        if (error?.message) return error.message;
        if (typeof error === 'object') {
            // Пытаемся извлечь первую ошибку из объекта
            const firstKey = Object.keys(error)[0];
            if (error[firstKey]) {
                if (Array.isArray(error[firstKey])) {
                    return error[firstKey][0];
                }
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
            await axios.post('http://192.168.3.27:8000/api/subscriptions/', {
                "target_user_id": profile.results[0].id
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`
                }
            });
            // Можно добавить уведомление об успешной отправке запроса
            console.log("Запрос в друзья отправлен");
        } catch (err) {
            const errorMessage = getErrorMessage(err.response?.data);
            setError(errorMessage);
            console.error('Ошибка:', err);
        } finally {
            setFriendLoading(false);
        }
    }

    const handleBack = () => {
        navigate(-1);
    };

    const handleLogoClick = () => {
        navigate("/");
    };

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

                const result = await axios.get(`http://192.168.3.27:8000/api/profiles/?search=${handle}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!result.data?.results?.length) {
                    setError("Профиль не найден");
                    return;
                }

                setProfile(result.data);
            } catch (err) {
                const errorMessage = getErrorMessage(err.response?.data);
                setError(errorMessage);
                console.error('Ошибка:', err);
            } finally {
                setLoading(false);
            }
        };

        if (handle) {
            fetchProfile();
        } else {
            setError("Handle не указан");
            setLoading(false);
        }
    }, [handle]);

    // Показываем загрузку
    if (loading) return <div className={styles.loading}>Загрузка профиля...</div>;
    
    // Показываем ошибку (теперь error всегда строка)
    if (error) return <div className={styles.error}>Ошибка: {error}</div>;
    
    // Проверяем наличие данных профиля
    if (!profile?.results?.[0]) return <div className={styles.error}>Профиль не найден</div>;

    const userData = profile.results[0];

    return (
        <div className={styles.nyprofile_out_container}>
            <div className={styles.nyprofile_container}>
                <header>
                    <div className={styles.nyprofile_header_left__item}>
                        <div className={styles.nyprofile_item}>
                            <img 
                                className={styles.nyprofile_header__img_logo} 
                                src="images/logo.svg" 
                                alt="logo"
                                onClick={handleLogoClick}
                                style={{ cursor: 'pointer' }}
                            />
                        </div>
                    </div>
                    <div className={styles.nyprofile_header_right__item}>
                        <div className={styles.nyprofile_item}>
                            <img 
                                className={styles.nyprofile_header__img} 
                                src="images/back.svg" 
                                alt="back"
                                onClick={handleBack}
                                style={{ cursor: 'pointer' }}
                            />
                        </div>
                    </div>
                </header>
                
                <div className={styles.nyprofile_BlockOfInformation} id={userData.id}>
                    <div className={styles.nyprofile_UserPhoto}>
                        <img 
                            className={styles.nyprofile_profile__img} 
                            src={userData.avatar || "images/profile.svg"} 
                            alt="Profile" 
                            onError={(e) => {
                                e.target.src = "images/profile.svg";
                            }}
                        />
                    </div>
                    <div className={styles.nyprofile_NickName}>{userData.nickname || "Без имени"}</div>
                    <div className={styles.nyprofile_Handler}>@{userData.handle || "user"}</div>
                    <div className={styles.nyprofile_Description}>{userData.bio || "Нет описания"}</div>
                    
                    <div className={styles.nyprofile_SomeInfo}>
                        <div className={styles.nyprofile_number_post}>
                            <div className={styles.nyprofile_ChisloPostov}>{profile.posts_count || 0}</div>
                            <div className={styles.nyprofile_StringPosts}>Posts</div>
                        </div>
                        <div className={styles.nyprofile_number_friends}>
                            <div className={styles.nyprofile_ChisloFriends}>{profile.friends_count || 0}</div>
                            <div className={styles.nyprofile_StringFriends}>Friends</div>
                        </div>
                    </div>
                    
                    <div className={styles.nyprofile_ButtonTwo}>
                        <button 
                            className={styles.nyprofile_MakeFriendButton} 
                            onClick={makeFriend}
                            disabled={friendLoading}
                        >
                            {friendLoading ? "Отправка..." : "Make Friend"}
                        </button>
                        <button className={styles.nyprofile_MessageButton}>Message</button>
                    </div>
                </div>
                
                <div className={styles.nyprofile_afterheader}>
                    <div className={styles.nyprofile_afterheader__item}>Posts</div>
                    <div className={styles.nyprofile_afterheader__item}>Friends</div>
                    <div className={styles.nyprofile_afterheader__item}>Photos</div>
                </div>
            </div>
        </div>
    );
}

export default NotYourProfile;