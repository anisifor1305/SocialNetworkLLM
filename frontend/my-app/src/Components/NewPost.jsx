import styles from "./NewPost.module.css"

function NewPost() {
    return ( 
        <>
        <div className={styles.outOfBody}>
        <div className={styles.Body}>
        <header>
            <div className={styles.ZagolovokBlyat}>Новый Пост</div>
            <div className={styles.Strelka}><img className={styles.EbanayaStrelka} src="images/back.svg" alt="sosite huy"></img></div>
            
        </header>
        </div>
        </div>
        </>
     );
}

export default NewPost;