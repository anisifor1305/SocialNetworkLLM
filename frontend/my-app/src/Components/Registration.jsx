import styles from  "./Registration.module.css"
function Registration() {
    return ( 
        <>
            <div className={styles.registration_out_container}>
        <div className={styles.registration_container}>
            <header>
                <div className={styles.registration_header__left}>
                    <div  ><img className={styles.registration_header__img_logo} src="images/logo.svg" alt="search"/></div>
                </div>
                <div className={styles.registration_header__right}>
                    {/* <div className={styles.registration_item}><img className={styles.registration_header__img} src="images/search.svg" alt="search"/></div>
                    <div className={styles.registration_item}><img className={styles.registration_header__img} src="images/profile.svg" alt="home"/></div> */}
                </div>
            </header>
            <div className={styles.registration_main_body}>
                <div className={styles.registration_Entry}>Регистрация</div>
                 <div className={styles.registration_NikForm}>
                    <input className={styles.registration_Nik} type="text" placeholder="Никнейм"/>
                </div>
                <div className={styles.registration_HandlerForm}>
                    <input className={styles.registration_Handler} type="text" placeholder="Уникальное имя пользователя"/>
                </div>
                <div className={styles.registration_EmailForm}>
                    <input className={styles.registration_Email} type="text" placeholder="Эллектронная почта"/>
                </div>
                <div className={styles.registration_PasswordForm}>
                    <input className={styles.registration_Password} type="text" placeholder="Пароль"/>
                </div>
                <div className={styles.registration_EnterBtn}><button className={styles.registration_ButtonEnter}>Зарегистрироваться</button></div>
                
            </div>
        </div>
    </div>
        </>
     );
}

export default Registration;