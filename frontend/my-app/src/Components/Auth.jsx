import axios from "axios"
import { useState } from "react"
import styles from "./Auth.module.css"

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
                <div className={styles.main_body}>
                    <div className={styles.Entry}>Вход</div>
                    <div className={styles.EmailForm}>
                        <input className={styles.Email} type="text" placeholder="Эллектронная почта"/>
                    </div>
                    <div className={styles.PasswordForm}>
                        <input className={styles.Password} type="text" placeholder="Пароль"/>
                    </div>
                    <div className={styles.FrgtPsswrd}><button className={styles.BtnFrgtPswrd}>Забыли пароль?</button></div>
                    <div className={styles.EnterBtn}><button className={styles.ButtonEnter}>Войти</button></div>
                    <div className={styles.bottom__panel}>
                        <div>Нет аккаунта?</div>
                        <div className={styles.RegistrationB}><button className={styles.BtnRegistration}>Регистрация</button></div>
                    </div>  
                </div>
            </div>
        </div>
        </>
    );
}

export default Auth;