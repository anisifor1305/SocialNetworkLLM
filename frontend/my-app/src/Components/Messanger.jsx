
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from "./Messanger.module.css";
import {API_CONFIG} from '../config' //1

const Messanger = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    
    // --- Состояния ---
    const [inbox, setInbox] = useState([]);          
    const [activeChat, setActiveChat] = useState(null); 
    const [messages, setMessages] = useState([]);    
    const [text, setText] = useState("");            
    const [currentUserId, setCurrentUserId] = useState(null); 
    const [loading, setLoading] = useState(false);
    
    // Поиск
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);

    // --- 1. Инициализация ---
    useEffect(() => {
        const init = async () => {
            const token = localStorage.getItem('access');
            if (!token) return navigate('/login');

            try {
                const meResp = await axios.get(`${API_CONFIG.BASE_URL}/auth/users/me/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setCurrentUserId(meResp.data.id);

                fetchInbox(token);

                const chatHandle = searchParams.get('chat');
                if (chatHandle) {
                    loadChatByHandle(chatHandle, token);
                }
            } catch (err) {
                console.error("Ошибка инициализации", err);
            }
        };
        init();
    }, []);

    // --- POLLING 1: Обновляем список чатов каждые 5 секунд ---
    useEffect(() => {
        const interval = setInterval(() => {
            fetchInbox(); // Тихий запрос без лоадеров
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchInbox = async (token = localStorage.getItem('access')) => {
        try {
            const resp = await axios.get(`${API_CONFIG.BASE_URL}/api/messages/inbox/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Чтобы не перерисовывать зря, можно сравнивать длину или ID последнего сообщения
            // Но для простоты пока просто обновляем стейт
            setInbox(resp.data);
        } catch (err) {
            console.error(err);
        }
    };

    // --- 2. Логика открытия чата ---
    const handleChatClick = (partner) => {
        setActiveChat(partner);
        setSearchParams({ chat: partner.handle });
        loadMessages(partner.id, true); // true = показать лоадер
        setIsSearching(false);
        setSearchQuery("");
    };

    const loadChatByHandle = async (handle, token = localStorage.getItem('access')) => {
        setLoading(true);
        try {
            const resp = await axios.get(`${API_CONFIG.BASE_URL}/api/messages/conversation/?handle=${handle}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log(resp);
            setActiveChat(resp.data.partner);
            setMessages(resp.data.messages);
            scrollToBottom();
        } catch (err) {
            console.error("Не удалось открыть чат", err);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (partnerId, showLoader = false) => {
        if (showLoader) setLoading(true);
        try {
            const resp = await axios.get(`${API_CONFIG.BASE_URL}/api/messages/conversation/?with=${partnerId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
            });
            setMessages(resp.data.messages); 
            if (showLoader) scrollToBottom();
        } catch (err) {
            console.error(err);
        } finally {
            if (showLoader) setLoading(false);
        }
    };




    // --- POLLING 2: Обновляем активный чат каждые 3 секунды ---
    useEffect(() => {
        if (!activeChat) return;

        const interval = setInterval(() => {
            // Делаем "тихий" запрос, чтобы не мигал лоадер
            loadMessages(activeChat.id, false);
        }, 3000);

        return () => clearInterval(interval);
    }, [activeChat]);

    // Скролл вниз только если мы уже внизу (или при первом открытии)
    // Для простоты пока скроллим всегда при отправке, а при поллинге оставляем как есть
    // Но можно добавить логику: 
    // const isAtBottom = container.scrollHeight - container.scrollTop === container.clientHeight;

    // --- 3. Поиск ---
    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setIsSearching(false);
            return;
        }
        
        setIsSearching(true);
        try {
            const resp = await axios.get(`${API_CONFIG.BASE_URL}/api/profiles/?search=${query}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
            });
            setSearchResults(resp.data.results || []);
        } catch (err) {
            console.error(err);
        }
    };

    // --- 4. Отправка ---
    const handleSend = async () => {
        if (!text.trim() || !activeChat) return;

        try {
            const resp = await axios.post(`${API_CONFIG.BASE_URL}/api/messages/`, {
                receiver_id: activeChat.id,
                text: text
            }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
            });

            setMessages(prev => [...prev, resp.data]);
            setText("");
            scrollToBottom();
            fetchInbox(); // Сразу обновляем левую колонку
        } catch (err) {
            alert("Ошибка отправки");
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return ( 
        <div className={styles.msngr_out_container}>
            <div className={styles.msngr_container}>
                
                {/* === ЛЕВАЯ КОЛОНКА === */}
                <div className={styles.msngr_leftSide}>
                    <div className={styles.msngr_headLeft}>
                        <div className={styles.msngr_logo} onClick={() => navigate('/')}>
                            <img className={styles.msngr_logoImg} src="images/logo.svg" alt="logo"/>
                        </div>
                        <div className={styles.searchWrapper}>
                            <input 
                                className={styles.searchInput} 
                                placeholder="Поиск..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                            <img className={styles.msngr_searchImg} src="images/searchZh.svg" alt="search"/>
                        </div>
                    </div>




                    <div className={styles.msngr_chats}>
                        {isSearching ? (
                            searchResults.length > 0 ? (
                                searchResults.map((profile) => (
                                    <div 
                                        key={profile.id} 
                                        className={styles.msngr_chat}
                                        onClick={() => handleChatClick({
                                            id: profile.id, 
                                            ...profile 
                                        })}
                                    >
                                        <div className={styles.msngr_ProfileIconForm}>
                                            <img className={styles.msngr_ProfileIcon} src={profile.avatar || "images/profile.svg"} alt="ava" onError={(e)=>{e.target.src="images/profile.svg"}}/>
                                        </div>
                                        <div className={styles.msngr_NickBlock}>
                                            <div className={styles.msngr_NickName}>{profile.nickname}</div>
                                            <div className={styles.msngr_UserName}>@{profile.handle}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.emptyState}>Никого не нашли 🤷‍♂️</div>
                            )
                        ) : (
                            inbox.length > 0 ? inbox.map((chat, index) => (
                                <div 
                                    key={index} 
                                    className={`${styles.msngr_chat} ${activeChat?.id === chat.partner.id ? styles.active_chat : ''}`}
                                    onClick={() => handleChatClick(chat.partner)}
                                >
                                    <div className={styles.msngr_ProfileIconForm}>
                                        <img 
                                            className={styles.msngr_ProfileIcon} 
                                            src={chat.partner.avatar || "images/profile.svg"} 
                                            alt="profile"
                                            onError={(e) => {e.target.src="images/profile.svg"}}
                                        />
                                    </div>
                                    <div className={styles.msngr_NickBlock}>
                                        <div className={styles.msngr_NickName}>{chat.partner.nickname}</div>
                                        <div className={styles.msngr_HT}>
                                            <div className={styles.msngr_UserName}>
                                                {chat.last_message.am_i_sender ? 'Вы: ' : ''}
                                                {chat.last_message.text.slice(0, 15)}...
                                            </div>
                                            <div className={styles.msngr_Dot}>∙</div>
                                            <div className={styles.msngr_Time}>{formatTime(chat.last_message.created_at)}</div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className={styles.emptyState}>Нет диалогов 📭</div>
                            )
                        )}
                    </div>
                </div>
                
                {/* === ПРАВАЯ КОЛОНКА === */}
                <div className={styles.msngr_rightSide}>
                    {activeChat ? (
                        <>
                            <div className={styles.msngr_headRight}>
                                <div className={styles.msngr_ProfileIconForm}>
                                    <img



                                        className={styles.msngr_ProfileIcon} 
                                        src={activeChat.avatar || "images/profile.svg"} 
                                        alt="profile"
                                        onError={(e)=>{e.target.src="images/profile.svg"}}
                                        onClick={() => navigate(`/${activeChat.handle}`)}
                                        style={{cursor: 'pointer'}}
                                    />
                                </div>
                                <div className={styles.msngr_NickBlock}>
                                    <div className={styles.msngr_NickName}>{activeChat.nickname}</div>
                                    <div className={styles.msngr_HT}>
                                        <div className={styles.msngr_UserName}>@{activeChat.handle}</div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.msngr_BottomRight} ref={messagesContainerRef}>
                                <div className={styles.msngr_Messages}> 
                                    {loading && <div style={{textAlign:'center', padding: '10px'}}>Загрузка истории...</div>}
                                    
                                    {messages.map((msg) => {
                                        const isMe = (msg.sender.id === currentUserId) || (msg.sender === currentUserId);
                                        return (
                                            <div key={msg.id} className={styles.msngr_ToMessage}>
                                                <div className={isMe ? styles.msngr_MyMessage : styles.msngr_OtherMessage}>
                                                    {msg.text}
                                                    <span className={styles.msgTime}>{formatTime(msg.created_at)}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>

                            <div className={styles.msngr_Sender}>
                                <div className={styles.msngr_FormInput} style={{width: '100%'}}>
                                    <input 
                                        className={styles.msngr_Input} 
                                        placeholder="Напишите сообщение..."
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    />
                                </div>
                                <div className={styles.msngr_SendButtonForm}>
                                    <button className={styles.msngr_ButtonSend} onClick={handleSend}>➤</button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className={styles.emptyState}>
                            <p>Выберите собеседника или найдите нового друга 🔎</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Messanger;