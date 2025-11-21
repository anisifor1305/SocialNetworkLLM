import { useEffect, useState } from "react";
function Products(props) {
    console.log(props.data);
    let i = 1;
    return props.data.map((element)=><>
     <div className="placeOnOneCard">
        <h2 className="card-header">Товарчик намбер {i++}!</h2>
        <div className="cardplace">        <p>{element.title} </p>
        <p>{element.item_category} </p>
        <p class="price">{element.price}</p>
        </div>
    </div>
        </>)
}

export default Products;