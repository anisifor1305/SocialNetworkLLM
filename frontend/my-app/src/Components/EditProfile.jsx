import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "./MyProfile.module.css"; // Используем те же стили для консистентности
import axios from 'axios';

function EditProfile() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    
    // Состояние для хранения данных формы
    const [formData, setFormData] = useState({
        nickrname: '',   // nickname в запросе
        email: '',
        bio: '',
        status: '',
        birth_date: ''
    });
    
    // Отдельное состояние для файла аватара и его превью
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("/images/artem.jpg"); // Дефолтное фото или текущее

    // Загрузка текущих данных пользователя
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('access');
                const response = await axios.get('http://10.124.215.133:8000/auth/users/me/', {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                
                const data = response.data;
                
                // Заполняем форму текущими данными
                setFormData({
                    nickname: data.nickname || '',
                    email: data.email || '', // Предполагаем, что email приходит с бэка
                    bio: data.bio || '',
                    status: data.status || '',
                    birth_date: data.birth_date || ''
                });

                // Если с бэка приходит ссылка на аватар, устанавливаем её
                if (data.avatar) {
                    setAvatarPreview(data.avatar);
                }
            } catch (error) {
                console.error("Ошибка при загрузке профиля:", error);
                alert("Не удалось загрузить данные профиля");
            }
        };
        fetchUserData();
    }, []);

    // Обработчик изменения текстовых полей
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Обработчик выбора файла
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            // Создаем URL для предпросмотра
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    // Отправка формы
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const token = localStorage.getItem('access');
            const dataToSend = new FormData();

            // Добавляем все текстовые поля в FormData
            // Важно: ключи должны совпадать с тем, что ждет бэкенд (nickname vs username)
            // Если бэкенд ждет 'nickname', замените 'username' ниже
            dataToSend.append('nickname', formData.nickname); 
            dataToSend.append('email', formData.email);
            dataToSend.append('bio', formData.bio);
            dataToSend.append('status', formData.status);
            dataToSend.append('birth_date', formData.birth_date);

            // Добавляем файл только если он был изменен
            if (avatarFile) {
                dataToSend.append('avatar', avatarFile);
            }

            await axios.put('http://10.124.215.133:8000/auth/users/me/', dataToSend, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            alert("Профиль успешно обновлен!");
            navigate(-1); // Возвращаемся назад в профиль


        } catch (error) {
            console.error("Ошибка при обновлении:", error);
            if (error.response && error.response.data) {
                // Вывод ошибок валидации с сервера (например, email занят)
                alert(`Ошибка: ${JSON.stringify(error.response.data)}`);
            } else {
                alert("Произошла ошибка при сохранении.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.MyProfileOutContainer}>
            <div className={styles.MyProfileContainer}>
                
                <header className={styles.Header}>
                    <div style={{width: '40px'}}></div>
                    <div className={styles.PageName}>Редактирование</div>
                    <div className={styles.StrelkaPlace}>
                        <img 
                            className={styles.Strelka} 
                            src="/images/back.svg" 
                            alt="Go back" 
                            onClick={() => navigate(-1)} 
                            style={{ cursor: 'pointer' }} 
                        />
                    </div>
                </header>

                <div className={styles.ContentWrapper}>
                    <form onSubmit={handleSubmit} className={styles.InfoBlock}>
                        
                        {/* Секция фото */}
                        <div className={styles.PhotoPlace} style={{flexDirection: 'column', gap: '10px'}}>
                            <img 
                                className={styles.MyPhoto} 
                                src={avatarPreview} 
                                alt="Avatar Preview" 
                                style={{objectFit: 'cover'}}
                            />
                            <label className={styles.Button} style={{fontSize: '12px', padding: '5px 10px', cursor: 'pointer', width: 'auto'}}>
                                Сменить фото
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleFileChange}
                                    style={{display: 'none'}} 
                                />
                            </label>
                        </div>

                        {/* Поля ввода */}
                        <div className={styles.Row}>
                            <label className={styles.Label}>Никнейм:</label>
                            <input 
                                className={styles.Input} // Добавьте класс .Input в CSS
                                type="text"
                                name="nickname"
                                value={formData.nickname}
                                onChange={handleChange}
                                placeholder="Ваш никнейм"
                            />
                        </div>

                        <div className={styles.Row}>
                            <label className={styles.Label}>Email:</label>
                            <input 
                                className={styles.Input}
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="example@mail.com"
                            />
                        </div>


                        <div className={styles.Row}>
                            <label className={styles.Label}>Статус:</label>
                            <input 
                                className={styles.Input}
                                type="text"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                placeholder="Ваш статус"
                            />
                        </div>

                        <div className={styles.Row}>
                            <label className={styles.Label}>Дата рождения:</label>
                            <input 
                                className={styles.Input}
                                type="date"
                                name="birth_date"
                                value={formData.birth_date}
                                onChange={handleChange}
                            />
                        </div>

                        <div className={styles.Row} style={{alignItems: 'flex-start'}}>
                            <label className={styles.Label}>О себе:</label>
                            <textarea 
                                className={styles.Input}
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder="Расскажите о себе"
                                rows="4"
                                style={{resize: 'vertical', fontFamily: 'inherit'}}
                            />
                        </div>

                        {/* Кнопка сохранения */}
                        <div className={styles.ButtonPlace} style={{marginTop: '20px'}}>
                            <button 
                                type="submit" 
                                className={styles.Button}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
                            </button>
                        </div>

                    </form>
                </div>

            </div>
        </div>
    );
}

export default EditProfile;
