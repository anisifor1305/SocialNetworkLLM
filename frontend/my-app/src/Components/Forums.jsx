import styles from "./Forums.module.css"

function Forums() {
    return ( 
        <>
        <div className={styles.forums_out_container}>
            <div className={styles.forums_container}>
                <header>
                    <div className={styles.forums_header_left}>
                        <div className={styles.forums_item}><img className={styles.forums_header__img_logo} src="/images/logo.svg" alt="search" /></div>
                    </div>
                    <div className={styles.forums_header_right}>
                        <div className={styles.forums_item}><img className={styles.forums_header__img} src="/images/search.svg" alt="search" /></div>
                        <div className={styles.forums_item}><img className={styles.forums_header__img} src="images/profile.svg" alt="home" /></div>
                    </div>
                </header>
                <div className={styles.forums_afterheader}>
                    <div className={styles.forums_imgShapka}><img className={styles.forums_imgHat} src="/images/ForumHatExample.png" alt="The hat didn't load:("></img></div>
                </div>
                <div className={styles.forums_body}>
                    <div className={styles.forums_InfoForum}>
                        <div className={styles.forums_FormsUp}>
                            <div className={styles.forums_FormsUpLeft}>
                                <div className={styles.forums_FormImgForum}><img className={styles.forums_ImgForum} src="/images/Profile.svg"></img></div>
                                <div className={styles.forums_FormNameForum}>Name of Forum</div>
                            </div>
                            <div classNAme={styles.forums_FormButtonSubscribe}><button className={styles.forums_ButtonSubscribe}>Подписаться</button></div>
                        </div>
                        <div className={styles.forums_FormsDownLeft}>
                            <div className={styles.forums_FormDescriptionForum}>This is Description! Lorem, ipsum dolor sit amet consectetur adipisicing elit. Aliquam in vitae iure modi quos. Alias in consequatur unde modi totam voluptas accusantium eveniet dicta voluptates illo possimus veritatis, sapiente nihil ad esse voluptate optio eligendi ipsam nesciunt magnam et. Numquam voluptatum, dolore ea nesciunt accusamus nobis debitis aliquam iure architecto qui iusto praesentium officiis reprehenderit repellendus facere et illo minus! Est, mollitia. Officia dolor reiciendis ipsam ipsum maiores illo architecto quasi, perspiciatis error id corporis inventore iure nam iusto laborum hic voluptatem neque sequi, a quod earum. Molestias voluptatum quaerat iste fugiat saepe quod, porro aspernatur, assumenda illo ad quas!</div>
                        </div>
                    </div>
                    <div className={styles.forums_post}>
                    <div className={styles.forums_post__userinfo}>
                         <div className={styles.forums_item}><img className={styles.forums_profile__img} src="images/profile.svg" alt="home"/></div>
                         <div className={styles.forums_post__userinfo__text}>
                            <div className={styles.forums_head_post}>
                            <div className={styles.forums_to_not_ct}>
                                <div className={styles.forums_post__forumname}>Name of Forum</div>
                                <div className={styles.forums_item_dot}><img className={styles.forums_profile__dot} src="images/dot.svg" alt="∙"/></div>
                                <div className={styles.forums_post__username}>Jesos Bezof</div>
                            </div>
                            <div className={styles.forums_to_ct}>
                                <div className={styles.forums_textCT}>2h</div>
                            </div>
                            </div>
                    </div>
                    </div>
                    <div className={styles.forums_post__title}>This is sample post</div>

                    <div className={styles.forums_post__text}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Deleniti aliquid incidunt ipsam earum fugit voluptatum natus pariatur vero consequatur doloremque voluptatibus praesentium impedit itaque distinctio labore exercitationem soluta excepturi, eligendi magnam maxime sed qui asperiores ullam quibusdam. Perspiciatis quisquam aliquid eius ea qui ad. Voluptatum quia quas ducimus quae. Laboriosam reprehenderit pariatur fugiat quis. Eveniet et ipsum ratione? Dicta expedita laudantium assumenda ut omnis tenetur, itaque cupiditate alias, eveniet perferendis, rerum blanditiis quod exercitationem nostrum in? Voluptatem harum modi dolores doloremque quibusdam repellendus, nostrum reprehenderit cum veritatis. Similique vitae ad quos aspernatur animi quisquam culpa alias sequi. Nisi, quam quidem.</div>
                    <div className={styles.forums_reactions}>
                        <div> <img className={styles.forums_reaction} src="images/heart.svg" alt="heart"/></div>
                        <div> <img className={styles.forums_reaction} src="images/message.svg" alt="message"/></div>
                    </div>
                </div>
                </div>
                <div className={styles.forums_bottom__panel}>
                        <div className={styles.forums_bottom__item}><img className={styles.forums_bottom__img} src="images/home.svg" alt="" /></div>
                        <div className={styles.forums_bottom__item}><img className={styles.forums_bottom__img} src="images/searchZh.svg" alt="" /></div>
                        <div className={styles.forums_bottom__item}><img className={styles.forums_plus__img} src="images/plus.svg" alt="" /></div>
                        <div className={styles.forums_bottom__item}><img className={styles.forums_bottom__img} src="images/message.svg" alt="" /></div>
                        <div className={styles.forums_bottom__item}><img className={styles.forums_bottom__img} src="images/message.svg" alt="" /></div>
                </div>
            </div>
        </div>
        </>
     );
}

export default Forums;
