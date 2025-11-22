import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from "./Messanger.module.css";

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

    // --- 1. Инициализация ---
    useEffect(() => {
        const init = async () => {
            const token = localStorage.getItem('access');
            if (!token) return navigate('/login');

            try {
                // Кто я?
                const meResp = await axios.get('http://10.124.215.133:8000/auth/users/me/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setCurrentUserId(meResp.data.id);

                // Грузим список диалогов
                fetchInbox(token);

                // Если в URL есть ?chat=username, открываем его сразу
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

    const fetchInbox = async (token = localStorage.getItem('access')) => {
        try {
            const resp = await axios.get('http://10.124.215.133:8000/api/messages/inbox/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setInbox(resp.data);
        } catch (err) {
            console.error(err);
        }
    };

    // --- 2. Логика открытия чата ---
    
    // Открытие по клику из списка
    const handleChatClick = (partner) => {
        setActiveChat(partner);
        setSearchParams({ chat: partner.handle }); // Обновляем URL
        loadMessages(partner.id);
        setIsSearching(false); // Закрываем поиск
        setSearchQuery("");
    };

    // Загрузка чата по хендлу (из URL или поиска)
    const loadChatByHandle = async (handle, token = localStorage.getItem('access')) => {
        setLoading(true);
        try {
            // Используем новый метод бэка, который умеет искать по handle
            const resp = await axios.get(`http://10.124.215.133:8000/api/messages/conversation/?handle=${handle}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            // Бэк теперь возвращает { partner: {...}, messages: [...] }
            setActiveChat(resp.data.partner);
            setMessages(resp.data.messages);
            scrollToBottom();
        } catch (err) {
            console.error("Не удалось открыть чат", err);
        } finally {
            setLoading(false);
        }
    };

    // Обычная загрузка сообщений по ID (если кликнули из списка)
    const loadMessages = async (partnerId) => {
        setLoading(true);
        try {
            const resp = await axios.get(`http://10.124.215.133:8000/api/messages/conversation/?with=${partnerId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
            });
            // Тут бэк возвращает объект { partner, messages }, берем messages
            setMessages(resp.data.messages); 
            scrollToBottom();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };


    // --- 3. Поиск пользователей ---
    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setIsSearching(false);
            return;
        }
        
        setIsSearching(true);
        try {
            const resp = await axios.get(`http://10.124.215.133:8000/api/profiles/?search=${query}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
            });
            // API профилей возвращает список профилей, нам нужно преобразовать в формат для списка
            setSearchResults(resp.data.results || []);
        } catch (err) {
            console.error(err);
        }
    };

    // --- 4. Отправка ---
    const handleSend = async () => {
        if (!text.trim() || !activeChat) return;

        try {
            const resp = await axios.post('http://10.124.215.133:8000/api/messages/', {
                receiver_id: activeChat.id,
                text: text
            }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
            });

            setMessages([...messages, resp.data]);
            setText("");
            scrollToBottom();
            fetchInbox(); // Обновляем список слева, чтобы чат прыгнул вверх
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
                        {/* Поиск */}
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
                        {/* Если ищем - показываем результаты поиска, иначе - Inbox */}
                        {isSearching ? (
                            searchResults.length > 0 ? (
                                searchResults.map((profile) => (
                                    <div 
                                        key={profile.id} 
                                        className={styles.msngr_chat}
                                        onClick={() => handleChatClick({
                                            id: profile.id, // ВАЖНО: API профилей может отдавать user_id внутри, проверь структуру!
                                            // Обычно: profile.id - это ID профиля, а нам нужен ID юзера.
                                            // Если бэк API profiles возвращает вложенный user, бери profile.user.id.
                                            // Если просто данные профиля, убедись что там есть поле handle/username.
                                            // Для примера считаю, что id профиля совпадает или API отдает нужный id.
                                            ...profile // Распыляем все данные (nickname, avatar и т.д.)
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
                            // Обычный список диалогов
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
                                        onClick={() => navigate(`/${activeChat.handle}`)} // Переход в профиль
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

                            <div className={styles.msngr_BottomRight}>
                                <div className={styles.msngr_Messages}> 
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
