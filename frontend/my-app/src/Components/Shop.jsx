import { useEffect, useState } from "react";
import Products from "./Products";
import axios from "axios"
function ShopView() {
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
            setData(result);
        });
    }, []);
    return ( 
        <>
        <div class="container">
            <div class="shopTitle"><h1>Магазин.</h1></div>
            <div class="productsTitle"><h2>Товары</h2></div>
        </div>
        <div className="cardContainer">
            <Products data={data}/>
        </div>
        </>
     );
}

export default ShopView;