import axios from "axios";
import { useEffect, useState } from "react";
import Post from "./Post";
import styles from  "./Main.module.css"
function Main() {

    const [data, setData] = useState([]);
    useEffect(() => {
        const parseData = async() => {
            try {
                const response = await axios.get("http://10.124.215.133:8000/api/posts/");
                return response.data.results; 
            } catch (error) {
                console.error("Ошибка при загрузке данных:", error);
                return []; 
            }
        }
        
        parseData().then(result => {
            setData(result);
        });
    }, []);
    let i = 0;
    return ( 
        <>

        <div className={styles.out_container}>
            <div className={styles.container}>
                <header>
                    <div className={styles.header_left}>
                        <div className={styles.item}><img className={styles.header__img_logo} src="images/logo.svg" alt="search" /></div>
                    </div>
                    <div className={styles.header_right}>
                        <div className={styles.item}><img className={styles.header__img} src="images/search.svg" alt="search" /></div>
                        <div className={styles.item}><img className={styles.header__img} src="images/profile.svg" alt="home" /></div>
                    </div>
                </header>
                <div className={styles.afterheader}>
                    <div className={styles.afterheader__item}>Home</div>
                    <div className={styles.afterheader__item}>Explore</div>
                    <div className={styles.afterheader__item}>Message</div>
                </div>
                <div className={styles.main_body}>
                    {/* <Post/>   */}
                    {data.map((element)=>(
                        <Post data={data[i++]}/>
                    )
                    )}
                    
                </div>
                <div className={styles.bottom__panel}>
                        <div className={styles.bottom__item}><img className={styles.bottom__img} src="images/home.svg" alt="" /></div>
                        <div className={styles.bottom__item}><img className={styles.bottom__img} src="images/searchZh.svg" alt="" /></div>
                        <div className={styles.bottom__item}><img className={styles.plus__img} src="images/plus.svg" alt="" /></div>
                        <div className={styles.bottom__item}><img className={styles.bottom__img} src="images/message.svg" alt="" /></div>
                        <div className={styles.bottom__item}><img className={styles.bottom__img} src="images/message.svg" alt="" /></div>
                </div>
            </div>
        </div>
        </>
     );
}

export default Main;