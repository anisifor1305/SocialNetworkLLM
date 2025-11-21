import axios from "axios"
import { useState } from "react"


function Auth() {
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    
    const url = "http://localhost:8000/auth/users/"
    const valuesChanged = ()=>{
        setUsername(document.getElementById('1').value)
        setPassword(document.getElementById('3').value)
    }
    const login = async(e)=>{
            e.preventDefault()
            const resp = await axios.post(url, {
                username: username,
                password: password
            })
            return resp

    }
    return ( 
        <>
        <form action="#">
        <p>Имя</p>
        <input type="text" id='1' name="username" onChange={valuesChanged}/>
        <p>Пароль</p>
        <input type="password" id='3' name="password" onChange={valuesChanged}/>
        <button onClick={login}></button>
        </form>
        </>
    );
}

export default Auth;