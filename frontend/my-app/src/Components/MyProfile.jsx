import styles from "./MyProfile.module.css"

function MyProfile() {
    return (
        <>
            <div className={styles.MyProfileOutContainer}>  
            <div className={styles.MyProfileContainer}>
            <header>
                <div className={styles.PageName}>Профиль</div>
                <div className={styles.StrelkaPlace}><img className={styles.Strelka} src = "images/back.svg" alt = "sosite"></img></div>
            </header>
            <div className={styles.PhotoPlace}><img className={styles.MyPhoto} src = "images/artem.jpg" alt = "sosite"></img></div>
            <div className={styles.MyNick}>Eblan Eblansch</div>
            <div className={styles.MyData}>
                <div className={styles.AboutMySelf}>Дата рождения: </div>
                <div className={styles.AboutMySelf}>14.88.1488</div>
                </div>
                <div className={styles.MyInformation}>
                <div className={styles.AboutMySelf}>О себе: </div>
                <div className={styles.AboutMySelf}>Huesosina</div>
            </div>
            <div className={styles.ButtonPos}><button className={styles.Button}>Изменить Профиль</button></div>
            </div>
            </div>
        </>
    );
}

export default MyProfile;