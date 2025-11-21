import styles from "./NewPost.module.css"

function NewPost() {
    return ( 
        <>
        <div className={styles.OutOfBody}>
        <div className={styles.Body}>
        <header>
            <div className={styles.ZagolovokBlyat}>Новый Пост</div>
            <div><img className={styles.EbanayaStrelka} src="images/back" alt="sosite huy"></img></div>
        </header>
        </div>
        </div>
        </>
     );
}

export default NewPost;