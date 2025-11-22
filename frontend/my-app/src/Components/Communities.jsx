import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './Communities.module.css';
import CommunityCard from './CommunityCard';
import { useAuth } from '../Contexts/AuthContext';

const Communities = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null); // Храним ID юзера

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('access');
                
                // 1. Узнаем, кто мы (чтобы правильно рисовать кнопки "Вступить/Выйти")
                const meResp = await axios.get('http://10.124.215.133:8000/auth/users/me/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setCurrentUserId(meResp.data.id);

                // 2. Грузим сообщества
                const commResp = await axios.get('http://10.124.215.133:8000/api/communities/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setCommunities(commResp.data.results || commResp.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className={styles.communities_out_container}>
            <div className={styles.main_container}>
                
                <header className={styles.main_header}>
                    <div className={styles.main_header_left}>
                        <div className={styles.main_item} onClick={() => navigate('/')}>
                            <img className={styles.main_header__img_logo} src="/images/logo.svg" alt="logo" />
                        </div>
                    </div>
                    <div className={styles.main_header_right}>
                        <div className={styles.main_item} onClick={() => navigate('/notifications')}>
                            <img className={styles.main_header__img } src="/images/bell.svg" alt="notifications" />
                        </div>
                        <div className={styles.main_item}>
                            <img className={styles.main_header__img} src="/images/back.svg" alt="back" onClick={() => navigate(-1)} />
                        </div>
                        <div className={styles.main_item} onClick={logout}><img className={styles.main_header__img} src="images/logout.svg" alt="home" /></div>
                    </div>
                </header>

                <div className={styles.main_afterheader}>
                    <div className={styles.main_afterheader__item} onClick={() => navigate('/')}>Главная</div>
                    <div className={styles.main_afterheader__item} style={{borderBottom: '3px solid rgb(43, 39, 39)'}}>Сообщества</div>
                    <div className={styles.main_afterheader__item} onClick={() => navigate('/messanger')}>Сообщения</div>
                </div>

                <div className={styles.communities_body}>
                    {loading ? (
                        <div style={{textAlign: 'center', padding: '20px', fontSize: '1.5rem'}}>Загрузка... 🎲</div>
                    ) : (
                        communities.map((comm) => (
                            <CommunityCard 
                                key={comm.id} 
                                community={comm} 
                                currentUserId={currentUserId} 
                            />
                        ))
                    )}
                </div>
              <div className={styles.communities_bottom__panel}>
                    <div className={styles.communities_bottom__item} onClick={() => navigate('/')}>
                        <img className={styles.communities_bottom__img} src="/images/home.svg" alt="home" />
                    </div>
                    <div className={styles.communities_bottom__item} onClick={() => navigate('/search')}>
                        <img className={styles.communities_bottom__img} src="/images/searchZh.svg" alt="search" />
                    </div>
                    <div className={styles.communities_bottom__item} onClick={() => navigate('/newpost')}>
                        <img className={styles.communities_plus__img} src="/images/plus.svg" alt="plus" />
                    </div>
                    <div className={styles.communities_bottom__item} onClick={() => navigate('/messanger')}>
                        <img className={styles.communities_bottom__img} src="/images/message.svg" alt="messages" />
                    </div>
                    <div className={styles.communities_bottom__item} onClick={() => navigate('/myprofile')}>
                        <img className={styles.communities_bottom__img} src="/images/profile.svg" alt="profile" />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Communities;