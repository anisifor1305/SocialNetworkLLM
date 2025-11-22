import axios from "axios"
import { useState } from "react"
import styles from "./Messanger.module.css"
import { useNavigate } from "react-router-dom"



function Messanger() {
    const navigate = useNavigate();
    return ( 
        <>
        <div className={styles.msngr_out_container}>
            <div className={styles.msngr_container}>
                <div className={styles.msngr_leftSide}>
                    <div className={styles.msngr_headLeft}>
                    <div className={styles.msngr_logo} onClick={() => navigate('/')}><img className={styles.msngr_logoImg} src="images/logo.svg" alt="logo"/></div>
                    <div className={styles.msngr_search}><img className={styles.msngr_searchImg} src="images/searchZh.svg" alt="search"/></div>
                    </div>
                    <div className={styles.msngr_chats}>
                        <div className={styles.msngr_chat}>
                            <div className={styles.msngr_ProfileIconForm}><img className={styles.msngr_ProfileIcon} src="images/profile.svg" alt="profile"></img></div>
                                    <div className={styles.msngr_NickBlock}>
                                    <div className={styles.msngr_NickName}>Nick</div>
                                    <div className={styles.msngr_HT}>
                                    <div className={styles.msngr_UserName}>@handle</div>
                                    <div className={styles.msngr_Dot}>∙</div>
                                    <div className={styles.msngr_Time}>2h</div>
                                </div>
                            </div>
                         </div>
                         <div className={styles.msngr_chat}>
                            <div className={styles.msngr_ProfileIconForm}><img className={styles.msngr_ProfileIcon} src="images/profile.svg" alt="profile"></img></div>
                                    <div className={styles.msngr_NickBlock}>
                                    <div className={styles.msngr_NickName}>Nick</div>
                                    <div className={styles.msngr_HT}>
                                    <div className={styles.msngr_UserName}>@handle</div>
                                    <div className={styles.msngr_Dot}>∙</div>
                                    <div className={styles.msngr_Time}>2h</div>
                                </div>
                            </div>
                         </div>
                         <div className={styles.msngr_chat}>
                            <div className={styles.msngr_ProfileIconForm}><img className={styles.msngr_ProfileIcon} src="images/profile.svg" alt="profile"></img></div>
                                    <div className={styles.msngr_NickBlock}>
                                    <div className={styles.msngr_NickName}>Nick</div>
                                    <div className={styles.msngr_HT}>
                                    <div className={styles.msngr_UserName}>@handle</div>
                                    <div className={styles.msngr_Dot}>∙</div>
                                    <div className={styles.msngr_Time}>2h</div>
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
                <div className={styles.msngr_centerSide}></div>
                <div className={styles.msngr_rightSide}>
                    <div className={styles.msngr_headRight}>
                        <div className={styles.msngr_ProfileIconForm}><img className={styles.msngr_ProfileIcon} src="images/profile.svg" alt="profile"></img></div>
                        <div className={styles.msngr_NickBlock}>
                            <div className={styles.msngr_NickName}>Nick</div>
                            <div className={styles.msngr_HT}>
                            <div className={styles.msngr_UserName}>@handle</div>
                            <div className={styles.msngr_Dot}>∙</div>
                            <div className={styles.msngr_Time}>2h</div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.msngr_BottomRight}>
                        <div className={styles.msngr_Messages}> 
                            <div className={styles.msngr_ToMessage}>
                                <div className={styles.msngr_OtherMessage}>Bye Bye world!\n</div>
                            </div>
                            <div className={styles.msngr_ToMessage}>
                                <div className={styles.msngr_MyMessage}>Hellow world!\n</div>
                            </div>
                            <div className={styles.msngr_ToMessage}>
                                <div className={styles.msngr_MyMessage}>Hellow world2!\n</div>
                            </div>
                            <div className={styles.msngr_ToMessage}>
                                <div className={styles.msngr_OtherMessage}>Артём лох? От Гоши❤️</div>
                            </div>
                            <div className={styles.msngr_ToMessage}>
                                <div className={styles.msngr_MyMessage}>Нееееееееееееееееет, от Саши)</div>
                            </div>
                        </div>
                        <div className={styles.msngr_Sender}>
                            <div className={styles.msngr_FormInput}><input className={styles.msngr_Input} placeholder="Сообщение"></input></div>
                            <div className={styles.msngr_SendButtonForm}><button className={styles.msngr_ButtonSend}>Отправить</button></div>
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
        </>
    );
}

export default Messanger;