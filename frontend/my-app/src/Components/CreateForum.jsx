import styles from "./CreateForum.module.css"

function CreateForum() {
    return ( 
        <>
        <div className={styles.crtfrm_registration_out_container}>
        <div className={styles.crtfrm_registration_container}>
            <header>
                <div className={styles.crtfrm_registration_header_left__item}>
                    <div className={styles.crtfrm_registration_item}><img className={styles.crtfrm_registration_header__img_logo} src="images/logo.svg" alt="search"/></div>
                </div>
                <div className={styles.crtfrm_registration_header_right__item}>
                    <div className={styles.crtfrm_registration_item}><img className={styles.crtfrm_registration_header__img} src="images/back.svg" alt="back"/></div>
                    <div className={styles.crtfrm_registration_item}><img className={styles.crtfrm_registration_header__img} src="images/profile.svg" alt="home"/></div>
                </div>
            </header>
            <div className={styles.crtfrm_registration_main_body}>
                <div className={styles.crtfrm_registration_Entry}>Создание форума</div>
                 <div className={styles.crtfrm_registration_NikForm}>
                    <input className={styles.crtfrm_registration_Nik} type="text" placeholder="Имя форума"/>
                </div>
                <div className={styles.crtfrm_registration_DescriptionForm}>
                    <input className={styles.crtfrm_registration_Description} type="text" placeholder="Описание"/>
                </div>
                <div className={styles.crtfrm_LowerElements}>
                     <div className={styles.crtfrm_Tags}>
                        <div className={styles.crtfrm_firstTags}>
                         <button className={styles.crtfrm_checkbox_button}>Путешествия</button>
                         <button className={styles.crtfrm_checkbox_button}>Кулинария</button>
                         <button className={styles.crtfrm_checkbox_button}>Спорт</button>
                         <button className={styles.crtfrm_checkbox_button}>Фильмы</button>
                         <button className={styles.crtfrm_checkbox_button}>Технологии</button>
                        </div>  
                        <div className={styles.crtfrm_secondTags}>
                         <button className={styles.crtfrm_checkbox_button}>Музыка</button>
                         <button className={styles.crtfrm_checkbox_button}>Литература</button>
                         <button className={styles.crtfrm_checkbox_button}>Исксство</button>
                         <button className={styles.crtfrm_checkbox_button}>Мода</button>
                         <button className={styles.crtfrm_checkbox_button}>Психология</button>
                         </div>
                    </div>
                    <div className={styles.crtfrm_UploadAvaPhoto}>
                         <label htmlFor="file-upload" className={styles.crtfrm_AvaPhotoButton}>Загрузить фото</label>
                                <input 
                                    className={styles.crtfrm_AvaPhoto} 
                                    id="file-upload" 
                                    type="file" 
                                    accept="image/*" 
                                    style={{ display: 'none' }} // Скрываем стандартный input
                                />
                    </div>
                </div>
                <div className={styles.crtfrm_registration_EnterBtn}><button className={styles.crtfrm_registration_ButtonEnter}>Создать форум</button></div>
                
            </div>
        </div>
    </div>
        </>
    );
}

export default CreateForum;