import styles from  "./Notifications.module.css"
function notification() {
    return ( 
        <>

        <div className={styles.notification_out_container}>
            <div className={styles.notification_container}>
                <div className={styles.notification_header}>
                    <div className={styles.notification_header_left}>
                        <div className={styles.notification_item}><img className={styles.notification_header__img_logo} src="images/logo.svg" alt="search" /></div>
                    </div>
                    <div className={styles.notification_header_right}>
                        <div className={styles.notification_item}><img className={styles.notification_header__img} src="images/bell.svg" alt="search" /></div>
                        <div className={styles.notification_item}><img className={styles.notification_header__img} src="images/profile.svg" alt="home" /></div>
                    </div>
                </div>
                <div className={styles.notification_afterheader}>
                    <div className={styles.notification_afterheader__item}>Главная</div>
                    <div className={styles.notification_afterheader__item}>Форум</div>
                    <div className={styles.notification_afterheader__item}>Сообщения</div>
                </div>
                <div className={styles.notification_bottom__panel}>
                        {/* <div className={styles.notification_bottom__item}><img className={styles.notification_bottom__img} src="images/home.svg" alt="" /></div> */}
                        <div className={styles.notification_bottom__item}><img className={styles.notification_bottom__img} src="images/searchZh.svg" alt="" /></div>
                        <div className={styles.notification_bottom__item}><img className={styles.notification_plus__img} src="images/plus.svg" alt="" /></div>
                        <div className={styles.notification_bottom__item}><img className={styles.notification_bottom__img} src="images/message.svg" alt="" /></div>
                        {/* <div className={styles.notification_bottom__item}><img className={styles.notification_bottom__img} src="images/message.svg" alt="" /></div> */}
                </div>
            </div>
        </div>
               <div className={styles.notification_menu}>
                <div className={styles.notification_menu_glav_border}>
                <div className={styles.notification_menu_text}>Уведомления</div></div>
                <div className={styles.notification_menu_border}>
                <div className={styles.notification_menu_obj}>Ti loh, pomni</div></div>
                <div className={styles.notification_menu_border}>
                <div className={styles.notification_menu_obj}>Ti loh, pomni</div></div>        </div>
        </>
     );
}

export default notification;