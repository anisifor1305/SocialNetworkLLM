import axios from "axios";
import { useEffect, useState } from "react";
import Post from "./Post";
import styles from  "./Main.module.css"
import { useNavigate } from "react-router-dom";

function Main() {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    useEffect(() => {
        const parseData = async() => {
            try {
                const token = localStorage.getItem('access')
                const response = await axios.get("http://10.124.215.133:8000/api/posts/feed/", {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
                });
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

        <div className={styles.main_out_container}>
            <div className={styles.main_container}>
                <div className={styles.main_header}>
                    <div className={styles.main_header_left}>
                        <div className={styles.main_item}><img className={styles.main_header__img_logo} src="images/logo.svg" alt="search" /></div>
                    </div>
                    <div className={styles.main_header_right}>
                        <div className={styles.main_item}><img className={styles.main_header__img} src="images/bell.svg" alt="search" /></div>
                        <div className={styles.main_item}><img className={styles.main_header__img} onClick={(e)=>navigate('/myprofile/')}src="images/profile.svg" alt="home" /></div>
                    </div>
                </div>
                <div className={styles.main_afterheader}>
                    <div className={styles.main_afterheader__item} onClick={(e)=>navigate('/')}>Главная</div>
                    <div className={styles.main_afterheader__item} onClick={(e)=>navigate('/forums')}>Форум</div>
                    <div className={styles.main_afterheader__item}>Сообщения</div>
                </div>
                <div className={styles.main_body}>
                    {/* <Post/>   */}
                    {data.map((element)=>(
                        <Post data={data[i++]}/>
                    )
                    )}
                    
                </div>
                <div className={styles.main_bottom__panel}>
                        {/* <div className={styles.main_bottom__item}><img className={styles.main_bottom__img} src="images/home.svg" alt="" /></div> */}
                        <div className={styles.main_bottom__item}><img className={styles.main_bottom__img}  src="images/searchZh.svg" alt="" /></div>
                        <div className={styles.main_bottom__item} onClick={(e)=>navigate('/newpost')}><img className={styles.main_plus__img} src="images/plus.svg" alt="" /></div>
                        <div className={styles.main_bottom__item}><img className={styles.main_bottom__img} src="images/message.svg" alt="" /></div>
                        {/* <div className={styles.main_bottom__item}><img className={styles.main_bottom__img} src="images/message.svg" alt="" /></div> */}
                </div>
            </div>
        </div>
        </>
     );
}

export default Main;