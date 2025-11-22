import React, { useState } from 'react';
import axios from 'axios';
import styles from './NewPost.module.css';
import { useNavigate } from 'react-router-dom';
const NewPost= () => {
    const navigate = useNavigate();
    const [text, setText] = useState('');
    const [image, setImage] = useState(null);
    const [communityId, setCommunityId] = useState(''); // ID группы (строка, которую превратим в число)
    const [status, setStatus] = useState('idle'); // idle, loading, success, error

    // Обработка выбора файла
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');

        // 💡 Ключевой момент: используем FormData для файлов
        const formData = new FormData();
        formData.append('text', text);
        
        if (image) {
            formData.append('image', image);
        }

        // Логика: добавляем community только если ID введен
        if (communityId) {
            formData.append('community', communityId);
        }

        try {
            // Замени URL на свой реальный адрес API
            const response = await axios.post('http://127.0.0.1:8000/api/posts/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    // Не забудь добавить Authorization, если нужна аутентификация:
                    // 'Authorization': `Bearer ${token}`, 
                },
            });

            console.log('Success:', response.data);
            setStatus('success');
            
            // Очистка формы
            setText('');
            setImage(null);
            setCommunityId('');
            
            // Сброс статуса через 3 секунды
            setTimeout(() => setStatus('idle'), 3000);

        } catch (error) {
            console.error('Error creating post:', error);
            setStatus('error');
        }
    };

    return (
        <div className={styles.out_container}>
            <div className={styles.container}>
                 <div className={styles.main_header}>
                    <div className={styles.main_header_left}>
                        <div className={styles.main_item} onClick={(e)=>navigate('/')}><img className={styles.main_header__img_logo} src="images/logo.svg" alt="search" /></div>
                    </div>
                    <div className={styles.main_header_right}>
                        {/* TODO сделай переход бека не на главную, а на предыдущую страницу */}
                        <div className={styles.main_item} onClick={(e)=>navigate('/')}><img className={styles.main_header__img} src="images/back.svg" alt="back" /></div>
                    </div>
                </div>
                <h2 className={styles.title}>Создать пост</h2>

                <form onSubmit={handleSubmit} className={styles.form}>

                    {/* Текстовое поле */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Текст поста</label>
                        <textarea 
                            className={styles.textarea}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="О чем думаете?"
                            required
                        />
                    </div>

                    {/* Загрузка картинки */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Изображение</label>
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                            className={styles.fileInput}
                        />
                    </div>


                    {/* ID Сообщества (опционально) */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>ID Сообщества (необязательно)</label>
                        <input 
                            type="number" 
                            value={communityId}
                            onChange={(e) => setCommunityId(e.target.value)}
                            placeholder="Например: 1"
                            className={styles.input}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className={styles.submitBtn} 
                        disabled={status === 'loading'}
                    >
                        {status === 'loading' ? 'Публикация...' : 'Опубликовать'}
                    </button>



                    {/* Сообщения о статусе */}
                    {status === 'success' && (
                        <div className={styles.successMsg}>Пост успешно создан! ✅</div>
                    )}
                    {status === 'error' && (
                        <div className={styles.errorMsg}>Ошибка при создании поста ❌</div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default NewPost;
