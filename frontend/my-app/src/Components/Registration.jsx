import styles from  "./Registration.module.css"
import axios from "axios"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {API_CONFIG} from '../config' //1

function Registration() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [nickname, setNickname] = useState('')
    const [password, setPassword] = useState('')
    const [birthYear, setBirthYear] = useState('');

    const url = `${API_CONFIG.BASE_URL}/auth/users/`
    const valuesChanged = ()=>{
        setNickname(document.getElementById('1').value)   
        setUsername(document.getElementById('2').value)
        setEmail(document.getElementById('3').value)
        setPassword(document.getElementById('4').value)
        setBirthYear(document.getElementById('6').value)
    }
    const reg = async(e)=>{
            e.preventDefault()
            try{
                const resp = await axios.post(url, {
                username: username,
                email: email,
                nickname: nickname,
                password: password,
                birth_date: birthYear,
            })
            if(resp.status==201){
                console.log(resp);
                navigate('/auth')
            }
            else{
                const el = document.getElementById('5');
                el.style.display = 'block';
            }
            }

            catch(e){
                const el = document.getElementById('5');
                el.style.display = 'block';
            }

    }
    return ( 
        <>
            <div className={styles.registration_out_container}>
        <div className={styles.registration_container}>
            <header>
                <div className={styles.registration_header__left}>
                    <div  ><img className={styles.registration_header__img_logo} src="images/logo.svg" alt="search"/></div>
                </div>
                <div className={styles.registration_header__right}>
                    {/* <div className={styles.registration_item}><img className={styles.registration_header__img} src="images/search.svg" alt="search"/></div>
                    <div className={styles.registration_item}><img className={styles.registration_header__img} src="images/profile.svg" alt="home"/></div> */}
                </div>
            </header>
            <div className={styles.registration_main_body}>
                <div className={styles.registration_Entry}>Регистрация</div>
                <div class={styles.registration_incorrect_data} id='5'>Данные некорректны</div>
                <form action="">
                 <div className={styles.registration_NikForm}>
                    <input className={styles.registration_Nik} type="text"  id='1' name='nickname' onChange={valuesChanged} placeholder="Никнейм"/>
                </div>
                 <div className={styles.registration_PasswordForm}>
                    <input className={styles.registration_Password} type="text" id='2' name='username' onChange={valuesChanged} placeholder="Username"/>
                </div>
                <div className={styles.registration_HandlerForm}>
                    <input className={styles.registration_Handler} type="text" id='3' name='email' onChange={valuesChanged} placeholder="Почта"/>
                </div>
                <div className={styles.registration_EmailForm}>
                    <input className={styles.registration_Email} type="password" id='4' name='password' onChange={valuesChanged} placeholder="Пароль"/>
                </div>
                <div className={styles.registration_EmailForm}>
                    <input className={styles.registration_Email} type="date" id='6' name='birth_date' onChange={valuesChanged} placeholder="Год рождения"/>
                </div>
                {/* <div className={styles.registration_PasswordForm}>
                    <input className={styles.registration_Password} type="text" placeholder="Пароль"/>
                </div> */}
                <div className={styles.registration_EnterBtn}><button onClick={(e)=>reg(e)}className={styles.registration_ButtonEnter}>Зарегистрироваться</button></div>
                </form>
            </div>
        </div>
    </div>
        </>
     );
}

export default Registration;