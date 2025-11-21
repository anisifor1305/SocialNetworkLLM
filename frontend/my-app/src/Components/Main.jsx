import axios from "axios";
import { useEffect, useState } from "react";
import Post from "./Post";

function Main() {

    const [data, setData] = useState([]);
    useEffect(() => {
        const parseData = async() => {
            try {
                const response = await axios.get("http://localhost:8000/api/products/");
                return response.data.results; 
            } catch (error) {
                console.error("Ошибка при загрузке данных:", error);
                return []; 
            }
        }
        
        parseData().then(result => {
            // setData(result);
            setData([1,2,3]);
        });
    }, []);
    return ( 
        <>

        <div className="out_container">
            <div className="container">
                <header>
                    <div className="header-left--item">
                        <div className="item item_logo"><img className="header__img_logo" src="images/logo.svg" alt="search" /></div>
                    </div>
                    <div className="header-right--item">
                        <div className="item item_3"><img className="header__img" src="images/search.svg" alt="search" /></div>
                        <div className="item item_4"><img className="header__img" src="images/profile.svg" alt="home" /></div>
                    </div>
                </header>
                <div className="afterheader">
                    <div className="afterheader__item">Home</div>
                    <div className="afterheader__item">Explore</div>
                    <div className="afterheader__item">Message</div>
                </div>
                <div className="main_body">
                    {/* <Post/>   */}
                    {data.map((element)=>(
                        <div>HELLO</div>
                    )
                    )}
                    
                </div>
                <div className="bottom__panel">
                        <div className="bottom__item bottom__item1"><img className="bottom__img" src="images/home.svg" alt="" /></div>
                        <div className="bottom__item bottom__item2"><img className="bottom__img" src="images/searchZh.svg" alt="" /></div>
                        <div className="bottom__item bottom__item3"><img className="plus__img" src="images/plus.svg" alt="" /></div>
                        <div className="bottom__item bottom__item4"><img className="bottom__img" src="images/message.svg" alt="" /></div>
                        <div className="bottom__item bottom__item5"><img className="bottom__img" src="images/message.svg" alt="" /></div>
                </div>
            </div>
        </div>
        </>
     );
}

export default Main;