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
                    <div className={styles.crtfrm_registration_item}><img className={styles.crtfrm_registration_header__img} src="images/search.svg" alt="search"/></div>
                    <div className={styles.crtfrm_registration_item}><img className={styles.crtfrm_registration_header__img} src="images/profile.svg" alt="home"/></div>
                </div>
            </header>
            <div className={styles.crtfrm_registration_main_body}>
                <div className={styles.crtfrm_registration_Entry}>Регистрация</div>
                 <div className={styles.crtfrm_registration_NikForm}>
                    <input className={styles.crtfrm_registration_Nik} type="text" placeholder="Никнейм"/>
                </div>
                <div className={styles.crtfrm_registration_HandlerForm}>
                    <input className={styles.crtfrm_registration_Handler} type="text" placeholder="Уникальное имя пользователя"/>
                </div>
                <div className={styles.crtfrm_registration_EmailForm}>
                    <input className={styles.crtfrm_registration_Email} type="text" placeholder="Эллектронная почта"/>
                </div>
                <div className={styles.crtfrm_registration_PasswordForm}>
                    <input className={styles.crtfrm_registration_Password} type="text" placeholder="Пароль"/>
                </div>
                <div className={styles.crtfrm_registration_EnterBtn}><button className={styles.crtfrm_registration_ButtonEnter}>Зарегестрироваться</button></div>
                
            </div>
        </div>
    </div>
        </>
    );
}

export default CreateForum;