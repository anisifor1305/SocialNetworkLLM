import React, { useState } from 'react';
import axios from 'axios';
import styles from './NewPost.module.css';
import { useNavigate } from 'react-router-dom';
import {API_CONFIG} from '../config' //1

const NewPost = () => {
    const navigate = useNavigate();
    const [text, setText] = useState('');
    const [image, setImage] = useState(null);
    const [communityId, setCommunityId] = useState('');
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

        // 💡 FormData необходима для отправки файлов
        const formData = new FormData();
        formData.append('text', text);
        
        if (image) {
            formData.append('image', image);
        }

        // Добавляем community, только если ID введен
        if (communityId) {
            formData.append('community', communityId);
        }

        try {
            const response = await axios.post(`${API_CONFIG.BASE_URL}/api/posts/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    // Если используешь JWT токены, раскомментируй строку ниже и добавь логику получения токена
                    'Authorization': `Bearer ${localStorage.getItem('access')}`, 
                },
            });

            console.log('Success:', response.data);
            setStatus('success');
            
            // Очистка формы
            setText('');
            setImage(null);
            setCommunityId('');
            
            // Сброс статуса и (опционально) редирект через 2 секунды
            setTimeout(() => {
                setStatus('idle');
                // navigate(-1); // Можно вернуть пользователя назад после успеха
            }, 3000);

        } catch (error) {
            console.error('Error creating post:', error);
            setStatus('error');
        }
    };

    return (
        <div className={styles.out_container}>
            <div className={styles.container}>
                
                {/* Хедер */}
                <div className={styles.main_header}>
                    <div className={styles.main_header_left}>
                        {/* Логотип ведет на главную */}
                        <div className={styles.main_item} onClick={() => navigate('/')}>
                            <img className={styles.main_header__img_logo} src="images/logo.svg" alt="logo" />
                        </div>
                    </div>
                    <div className={styles.main_header_right}>
                        {/* ✅ Исправлено: возврат на предыдущую страницу */}
                        <div className={styles.main_item} onClick={() => navigate(-1)}>
                            <img className={styles.main_header__img} src="images/back.svg" alt="back" />
                        </div>
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
                        <div className={styles.fileInputWrapper}>
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleFileChange}
                                className={styles.fileInput}
                                id="file-upload"
                            />
                            {/* Кастомная метка для файла, если нужно стилизовать input type="file" */}
                        </div>
                        {image && <div className={styles.previewName}>Выбран файл: {image.name}</div>}
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
                        {status === 'loading' ? 'Публикация...' : 'Опубликовать 🚀'}
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
