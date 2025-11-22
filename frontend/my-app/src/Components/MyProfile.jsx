import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Импортируем useNavigate
import styles from "./MyProfile.module.css";
import axios from 'axios';

function MyProfile() {
    const navigate = useNavigate(); // Хук для навигации
    const [userdata, setUserdata] = useState()
    // Функция для перехода назад
    const handleGoBack = () => {
        navigate(-1); // -1 означает возврат на предыдущую страницу
    };

    useEffect(()=>{
        const resp = async()=>{
             await axios.get('http://10.124.215.133:8000/auth/users/me/', {
            headers:{
                "Authorization": `Bearer ${localStorage.getItem('access')}`
            }
        } ).then((result)=>{
            setUserdata(result.data)})
    }
    resp();
    }, [])
    return (
        <div className={styles.MyProfileOutContainer}>
            <div className={styles.MyProfileContainer}>
                
                <header className={styles.Header}>
                    {/* Кнопка "Назад" */}
                    <div style={{width: '40px'}}></div> {/* Пустышка для центровки заголовка */}
                    <div className={styles.PageName}>Профиль</div>
                    <div className={styles.StrelkaPlace}>
                        <img 
                            className={styles.Strelka} 
                            src="/images/back.svg" 
                            alt="Go back" 
                            onClick={handleGoBack} // Добавляем обработчик клика на стрелку
                            style={{ cursor: 'pointer' }} // Указатель, чтобы показать интерактивность
                        />
                    </div>
                </header>

                <div className={styles.ContentWrapper}>
                    {/* Фото */}
                    <div className={styles.PhotoPlace}>
                        <img className={styles.MyPhoto} src="/images/artem.jpg" alt="User Avatar" />
                    </div>

                    {/* Никнейм */}
                    <div className={styles.MyNick}></div>

                    {/* Данные */}
                    <div className={styles.InfoBlock}>
                        <div className={styles.Row}>
                            <span className={styles.Label}>Ник: {userdata?.nickname? userdata.nickname : "Не найдено"}</span>
                            <span className={styles.Value}></span>
                        </div>
                        <div className={styles.Row}>
                            <span className={styles.Label}>Хэндл: {userdata?.handle? userdata.handle : "Не найдено"}</span>
                            <span className={styles.Value}></span>
                        </div>
                        <div className={styles.Row}>
                            <span className={styles.Label}>Дата рождения: {userdata?.birth_date? userdata.birth_date : "Не найдено"}</span>
                            <span className={styles.Value}></span>
                        </div>
                        <div className={styles.Row}>
                            <span className={styles.Label}>О себе:</span>
                            <span className={styles.Value}>{userdata?.bio? userdata.bio : "Не найдено"}</span>
                        </div>
                    </div>

                    {/* Кнопка */}
                    <div className={styles.ButtonPlace}>
                        <button className={styles.Button} onClick={(e)=>{navigate('/profile/edit')}}>Изменить Профиль</button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default MyProfile;