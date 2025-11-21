import axios from "axios"
import { useState } from "react"
import styles from "./Auth.module.css"
import { useNavigate } from "react-router-dom"


function Auth() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    
    const url = "http://10.124.215.133:8000/auth/jwt/create/"
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
            if(resp.status==200){
                console.log(resp);
                localStorage.setItem('refresh', resp.data.refresh)
                localStorage.setItem('access', resp.data.access)
            }
            navigate('/')

    }
    return ( 
        <>
        <div className={styles.auth_out_container}>
            <div className={styles.auth_container}>
                <header>
                    <div className={styles.auth_header_left}>
                        <div className={styles.item}><img className={styles.auth_header__img_logo} src="images/logo.svg" alt="search" /></div>
                    </div>
                    <div className={styles.auth_header_right}>
                        {/* <div className={styles.item}><img className={styles.auth_header__img} src="images/search.svg" alt="search" /></div>
                        <div className={styles.item}><img className={styles.auth_header__img} src="images/profile.svg" alt="home" /></div> */}
                    </div>
                </header>
                <div className={styles.auth_auth_body}>
                    <div className={styles.auth_Entry}>Вход</div>
                    <form>
                    <div className={styles.auth_EmailForm}>
                        <input className={styles.auth_Email} id='1' onChange={valuesChanged} name="username" type="text" placeholder="Логин"/>
                    </div>
                    <div className={styles.auth_PasswordForm}>
                        <input className={styles.auth_Password} id='3' onChange={valuesChanged} name="password" type="password" placeholder="Пароль"/>
                    </div>
                    <div className={styles.auth_FrgtPsswrd}><button className={styles.auth_BtnFrgtPswrd}>Забыли пароль?</button></div>
                    <div className={styles.auth_EnterBtn}><button onClick={(e)=>login(e)} className={styles.auth_ButtonEnter}>Войти</button></div>
                    <div className={styles.auth_bottom__panel}>
                        <div>Нет аккаунта?</div>
                        <div className={styles.auth_RegistrationB}><button className={styles.auth_BtnRegistration}>Регистрация</button></div>
                    </div> 
                    </form>
                </div>
            </div>
        </div>
        </>
    );
}

export default Auth;