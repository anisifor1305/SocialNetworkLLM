import { useParams } from "react-router-dom";
import styles from "./NotYourProfile.module.css"
import axios from "axios";
import { useEffect, useState } from "react";

function NotYourProfile() {
    const [res, setRes] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { handle } = useParams();
    const makeFriend = async(e) => {
        e.preventDefault();
         try {
                setLoading(true);
                const result = await axios.post('http://192.168.3.27:8000/api/subscriptions/',{
                    "target_user_id" : e.target.closest(`.${styles.nyprofile_BlockOfInformation}`).getAttribute('id')
                },
                 {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access')}`
                    }
                });
                setRes(result.data);
                console.log(result.data);
            } catch (err) {
                setError(err.response?.data || 'Ошибка загрузки профиля');
                console.error('Ошибка:', err);
            } finally {
                setLoading(false);
            }
    }
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const result = await axios.get(`http://192.168.3.27:8000/api/profiles/?search=${handle}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access')}`
                    }
                });
                setRes(result.data);
                console.log(result.data);
            } catch (err) {
                setError(err.response?.data || 'Ошибка загрузки профиля');
                console.error('Ошибка:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [handle]);

    // Показываем загрузку или ошибку
    if (loading) return <div className={styles.loading}>Загрузка профиля...</div>;
    if (error) return <div className={styles.error}>Ошибка: {error}</div>;
    if (!res) return <div className={styles.error}>Профиль не найден</div>;

    return (
        <div className={styles.nyprofile_out_container}>
            <div className={styles.nyprofile_container}>
                <header>
                    <div className={styles.nyprofile_header_left__item}>
                        <div className={styles.nyprofile_item}><img className={styles.nyprofile_header__img_logo} src="images/logo.svg" alt="search"/></div>
                    </div>
                    <div className={styles.nyprofile_header_right__item}>
                        <div className={styles.nyprofile_item}><img className={styles.nyprofile_header__img} src="images/back.svg" alt="home"/></div>
                    </div>
                </header>
                
                <div className={styles.nyprofile_BlockOfInformation} id={res.results[0].id}>
                    <div className={styles.nyprofile_UserPhoto}>
                        <img className={styles.nyprofile_profile__img} src={res.avatar || "images/profile.svg"} alt="Profile" />
                    </div>
                    <div className={styles.nyprofile_NickName}>{res.results[0].nickname || "Без имени"}</div>
                    <div className={styles.nyprofile_Handler}>@{res.results[0].handle || "user"}</div>
                    <div className={styles.nyprofile_Description}>{res.results[0].bio || "Нет описания"}</div>
                    
                    <div className={styles.nyprofile_SomeInfo}>
                        <div className={styles.nyprofile_number_post}>
                            <div className={styles.nyprofile_ChisloPostov}>{res.posts_count || 0}</div>
                            <div className={styles.nyprofile_StringPosts}>Posts</div>
                        </div>
                        <div className={styles.nyprofile_number_friends}>
                            <div className={styles.nyprofile_ChisloFriends}>{res.friends_count || 0}</div>
                            <div className={styles.nyprofile_StringFriends}>Friends</div>
                        </div>
                    </div>
                    
                    <div className={styles.nyprofile_ButtonTwo}>
                        <button className={styles.nyprofile_MakeFriendButton} onClick={(e)=>makeFriend(e)}>Make Friend</button>
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