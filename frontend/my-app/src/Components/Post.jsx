function Post(props) {
    return (  
         <div class="post">
            <div class="post__userinfo">
                <div class="item item_4"><img className="profile__img" src="images/profile.svg" alt="home" /></div>
                <div class="post__userinfo__text">
                    <div class="post__username">Jeff Besos</div>
                    <div class="post__user__miniinf">
                        <div class="post__user__handle">@handle</div>
                        <div class="post__user__online">2h</div>
                    </div>
                </div>
            </div>
            <div class="post__title">This is sample post</div>
            <div class="post__text">Lorem ipsum dolor sit amet consectetur adipisicing elit. Deleniti aliquid incidunt ipsam earum fugit voluptatum natus pariatur vero consequatur doloremque voluptatibus praesentium impedit itaque distinctio labore exercitationem soluta excepturi, eligendi magnam maxime sed qui asperiores ullam quibusdam. Perspiciatis quisquam aliquid eius ea qui ad. Voluptatum quia quas ducimus quae. Laboriosam reprehenderit pariatur fugiat quis. Eveniet et ipsum ratione? Dicta expedita laudantium assumenda ut omnis tenetur, itaque cupiditate alias, eveniet perferendis, rerum blanditiis quod exercitationem nostrum in? Voluptatem harum modi dolores doloremque quibusdam repellendus, nostrum reprehenderit cum veritatis. Similique vitae ad quos aspernatur animi quisquam culpa alias sequi. Nisi, quam quidem.</div>
            <div class="reactions">
                <div> <img className="reaction" src="images/heart.svg" alt="heart" /></div>
                <div> <img className="reaction" src="images/message.svg" alt="message" /></div>
            </div>
        </div>
    );
}

export default Post;