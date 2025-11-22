import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './NotificationBell.module.css';
import {API_CONFIG} from '../config' //1

const NotificationBell = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [nextPage, setNextPage] = useState(null); 
    
    const dropdownRef = useRef(null);
    const listRef = useRef(null); 


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    useEffect(() => {
  
        fetchNotifications(true);
        
        const interval = setInterval(() => {
            fetchNotifications(true, true);
        }, 10000);
        
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async (reset = false, silent = false) => {
        if (loading && !silent) return;
        

        if (!reset && !nextPage) return;

        if (!silent) setLoading(true);

        try {
            const token = localStorage.getItem('access');
            const url = reset 
                ? `${API_CONFIG.BASE_URL}/api/notifications/` 
                : nextPage;

            const resp = await axios.get(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const newItems = resp.data.results || [];
            setNextPage(resp.data.next); 

            if (reset) {
                setNotifications(newItems);

                const count = newItems.filter(n => !n.is_read).length;
                setUnreadCount(count);
            } else {
                setNotifications(prev => [...prev, ...newItems]);
            }
        } catch (err) {
            console.error("Ошибка уведомлений:", err);
        } finally {
            if (!silent) setLoading(false);
        }
    };


    const handleMarkAllRead = async (e) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem('access');
            await axios.post(`${API_CONFIG.BASE_URL}/api/notifications/mark_all_read/`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error("Не удалось пометить как прочитанное", err);
        }
    };

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight + 50 && nextPage && !loading) {
            fetchNotifications(false); 
        }
    };


    const handleItemClick = (notif) => {
        setIsOpen(false);
        if (notif.sender) {
            const target = notif.sender.handle || notif.sender.id;
            navigate(`/${target}`);
        }
    };

    return (
        <div className={styles.container} ref={dropdownRef}>
            <div className={styles.bellWrapper} onClick={() => setIsOpen(!isOpen)}>
                <img src="/images/bell.svg" alt="Bell" className={styles.bellIcon} />
                {unreadCount > 0 && (
                    <div className={styles.badge}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                )}
            </div>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.header}>
                        <div className={styles.title}>Уведомления</div>
                        <button className={styles.markReadBtn} onClick={handleMarkAllRead}>
                            ✓ Прочитать все
                        </button>
                    </div>

                    <div className={styles.list} onScroll={handleScroll} ref={listRef}>
                        {notifications.length > 0 ? (
                            notifications.map((notif) => (
                                <div 
                                    key={notif.id} 
                                    className={`${styles.item} ${!notif.is_read ? styles.unread : ''}`}
                                    onClick={() => handleItemClick(notif)}
                                >
                                    <img 
                                        src={notif.sender?.avatar || "/images/profile.svg"} 
                                        className={styles.avatar} 
                                        alt="ava"
                                        onError={(e)=>{e.target.src="/images/profile.svg"}}
                                    />
                                    <div className={styles.content}>
                                        <div className={styles.text}>
                                            <span className={styles.name}>{notif.sender?.nickname}</span>
                                            {notif.text}
                                        </div>
                                        <div className={styles.date}>
                                            {new Date(notif.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    {!notif.is_read && <div className={styles.dot}></div>}
                                </div>
                            ))
                        ) : (
                            <div className={styles.empty}>Здесь пока тихо... 🍃</div>
                        )}

                        {loading && <div className={styles.loader}>Загрузка...</div>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
