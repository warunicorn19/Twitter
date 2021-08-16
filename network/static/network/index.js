document.addEventListener('DOMContentLoaded', function() {
    
    // Load login user info if logged in
    if (document.querySelector('#login-user')) {
        const loginUser = document.querySelector('#login-user');
        loginUser.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopImmediatePropagation();

            load_user(`${loginUser.innerText}`);
            return false;
        })
    } 

    // Load all posts view when click the link
    document.querySelector('#all').addEventListener('click', function(event) {
        event.preventDefault();
        event.stopImmediatePropagation();

        load_posts('all');
        return false;
    })

    // Check if there is following-view link
    if (document.querySelector('#following')) {
        // load following-view when click
        document.querySelector('#following').addEventListener('click', (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            // Load following-view
            load_posts('following');
            return false;
        })

    };

    // Check if there is compose view
    if (document.querySelector('#compose-post')) {
        // Clear out field 
        document.querySelector('#compose-content').value = '';

        // Add event when submit form
        document.querySelector('#compose-form').addEventListener('submit', function(event) {

            // Prevent default event
            event.preventDefault();

            // Get information from form input
            const content = document.querySelector('#compose-content').value;

            // Add post
            fetch('posts/compose', {
                method: 'POST', body: JSON.stringify({
                    content: content
                })
            })
            .then(response => {
                if (response.status !== 201) {
                    alert("Error: Cannot finish the request.");
                    console.log("Something wrong!");
                } else if (response.status === 201) {
                    console.log("Success");
                    return load_posts('all');
                }
            });

            document.querySelector('#compose-content').value = '';


        })
    };

    // Load all posts by default
    load_posts('all');

})

function load_posts(postview) {

    // Clear the view before loading new view
    document.querySelector('#posts-view').innerHTML = '';

    // Hide pagination of userview
    document.querySelector('#u-pagination').style.display = 'none';
    document.querySelector('#p-pagination').style.display = 'block';

    // Get posts and add posts to post view
    fetch(`posts/${postview}`)
    .then(response => response.json())
    .then(posts => {
        if (posts.length === 0) {

            // Create view with 0 post message
            const noPost = document.createElement('div');
            noPost.className = 'no-post';
            noPost.innerHTML = `You haven't followed anyone yet.`;

            // Add to view
            document.querySelector('#posts-view').append(noPost);
        } else {
            const pageInfo = posts.info;
            // Handle pagination
            add_pagination(pageInfo, postview);
            // Load posts of page 1
            posts.posts.forEach(add_post);
        }
    })

    // Hide form if it is not "all" view
    if (`${postview}` !== 'all') {
        document.querySelector('#compose-post').style.display = 'none';
    } else if (`${postview}` === 'all' && document.querySelector('#login-user')) {
        document.querySelector('#compose-post').style.display = 'block';
    }

    // Show the view name
    document.querySelector('#post-view-head').innerHTML = `<h3 class='m-2 p-2'>${postview.charAt(0).toUpperCase() + postview.slice(1)} Posts</h3>`;  

};

function add_post(post) {

    // Create new post with poster, content, timestamp
    const newPost = document.createElement('div');
    newPost.className = 'border rounded m-2 px-2 pt-2';

    const newPoster = document.createElement('h5');
    newPoster.innerHTML = `${post.poster}`;
    newPoster.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();

        load_user(`${post.poster}`);

        return false;

    })
    newPost.appendChild(newPoster);

    // Get logged in user
    if (document.querySelector('#login-user')) {
        const loginUser = document.querySelector('#login-user').innerText;
        if (post.poster === loginUser) {
            const linkEdit = document.createElement('button');
            linkEdit.className = 'edit-button btn btn-outline-primary btn-sm';
            linkEdit.innerHTML = 'Edit';
            linkEdit.addEventListener('click', () => {
                // Create form to edit
                const editForm = document.createElement('form');
                editForm.setAttribute('method', 'PUT');

                const editContent = document.createElement('textarea');
                editContent.setAttribute("id", `edit-post-${post.id}`);
                editContent.className = 'form-control my-1';
                editContent.innerHTML = document.querySelector(`#post-${post.id}`).innerHTML;

                const updateButton = document.createElement('button');
                updateButton.className = 'btn btn-primary btn-sm my-1';
                updateButton.innerHTML = 'Update';
                updateButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    // update post content
                    const content = document.querySelector(`#edit-post-${post.id}`).value;
                    fetch(`posts/${post.id}`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            content: content
                        })
                    })
                    .then(response => console.log(response.status));

                    // update post view
                    editForm.style.display = 'none';
                    newContent.style.display = 'block';
                    newContent.innerHTML = content;

                    return false;

                })

                const closeButton = document.createElement('button');
                closeButton.className = 'btn btn-outline-secondary btn-sm ml-1 my-1';
                closeButton.innerHTML = 'Close';
                closeButton.addEventListener('click', (event) => {
                    event.preventDefault();

                    editForm.style.display = 'none';
                    newContent.style.display = 'block';

                    return false;
                })

                editForm.appendChild(editContent);
                editForm.appendChild(updateButton);
                editForm.appendChild(closeButton);

                newPost.appendChild(editForm);
                newContent.style.display = 'none';
            })
            newPost.appendChild(linkEdit);
        }
    };

    const newContent = document.createElement('p');
    newContent.setAttribute ("id", `post-${post.id}`);
    newContent.innerHTML = `${post.content}`;

    const newTimeStamp = document.createElement('p');
    newTimeStamp.className = 'time-stamp';
    newTimeStamp.innerHTML = `${post.timestamp}`;

    // Create liked view
    // Including clickable like-icon and like-count 
    const newFavorites = document.createElement('div');
    
    // Create like-icon
    const likeIcon = document.createElement('div');
    likeIcon.className = 'd-inline';
    likeIcon.setAttribute('id', `like-icon-post-${post.id}`);
    // Create like-count
    const likeCount = document.createElement('div');
    likeCount.setAttribute('id', `like-count-post-${post.id}`);
    likeCount.className = 'd-inline ml-1';
    let numCount = post.liked.length;
    likeCount.innerHTML = `${numCount}`;
    
    // Control display 
    if (!document.querySelector('#login-user')) {
        likeIcon.disabled = true;
        likeIcon.innerHTML = `<i class="fa fa-heart-o"></i>`;
    } else if (document.querySelector('#login-user')) {
        const loginUser = document.querySelector('#login-user').innerText;
        if (post.liked.indexOf(loginUser) >= 0) {
            likeIcon.innerHTML = `<i class="fa fa-heart"></i>`;
        } else {
            likeIcon.innerHTML = `<i class="fa fa-heart-o"></i>`;
        }
    }

    likeIcon.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        
        // If disabled true, alert and do nothing
        if (likeIcon.disabled) {
            alert('Only login user can like');
        } else {
        
            fetch(`posts/${post.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    liked: "liked"
                })
            })
            .then(response => console.log(response.status));

            if (likeIcon.innerHTML === `<i class="fa fa-heart"></i>`) {
                likeIcon.innerHTML = `<i class="fa fa-heart-o"></i>`;
                if (numCount > 0) {
                    numCount--;
                } 
            } else if (likeIcon.innerHTML === `<i class="fa fa-heart-o"></i>`) {
                likeIcon.innerHTML = `<i class="fa fa-heart"></i>`;
                numCount++;
            }
            // Update number of likes 
            likeCount.innerHTML = `${numCount}`;
        }
        
        return false;
    })

    // Add icon and count to favorites
    newFavorites.appendChild(likeIcon);
    newFavorites.appendChild(likeCount);

    
    newPost.appendChild(newContent);
    newPost.appendChild(newFavorites);
    newPost.appendChild(newTimeStamp);

    // Add new post to post view
    document.querySelector('#posts-view').append(newPost);

}

function load_user(username) {

    // Clear the view before loading new view
    document.querySelector('#posts-view').innerHTML = '';

    // Hide pagination of posts view
    document.querySelector('#u-pagination').style.display = 'block';
    document.querySelector('#p-pagination').style.display = 'none';

    // Get user info to add to view
    fetch(`user/${username}`)
    .then(response => response.json())
    .then(info => {
        
        // Get following and followers count
        let followingCount = info.info.following.length;
        let followerCount = info.info.followers.length;

        // Create user info view
        const userInfo = document.createElement('div');
        userInfo.className = 'border rounded m-2 px-2 py-2';
        const userFollowers = document.createElement('div');
        userFollowers.className = 'd-inline';
        userFollowers.innerHTML = `${followerCount} Followers`;
        const userFollowing = document.createElement('div');
        userFollowing.className = 'd-inline ml-2';
        userFollowing.innerHTML = `${followingCount} Following`;
        
        // Add follow button
        const followButton = document.createElement('button');
            // Control button label
            if (!document.querySelector('#login-user')) {
                followButton.style.display = 'none';
            } else {
                const loginUser = document.querySelector('#login-user').innerText; 
                if (loginUser === username) {
                    followButton.style.display = 'none';
                } else if (info.info.followers.indexOf(loginUser) >= 0) {
                    followButton.className = 'btn btn-primary btn-sm ml-4 mb-2';
                    followButton.innerText = 'Following';
                } else {
                    followButton.className = 'btn btn-outline-primary btn-sm ml-4 mb-2';
                    followButton.innerText = 'Follow';
                }
            }
        // add event when click button
        followButton.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            fetch(`user/${username}`, {
                method: 'PUT', 
                body: JSON.stringify({
                    follow: "follow"
                })
            })
            .then(response => console.log(response.status));

            // Update follower count
            if (followButton.innerText === 'Follow') {
                followButton.className = 'btn btn-primary btn-sm ml-4 mb-2';
                followButton.innerText = 'Following';
                followerCount++;
            } else if (followButton.innerText === 'Following') {
                if (followerCount > 0) {
                    followButton.className = 'btn btn-outline-primary btn-sm ml-4 mb-2';
                    followButton.innerText = 'Follow';
                    followerCount--;
                }
            }
            userFollowers.innerHTML = `${followerCount} Followers`;

            return false;
            
        })

        userInfo.appendChild(userFollowers);
        userInfo.appendChild(userFollowing);
        
        // Add button to head-view
        document.querySelector('#post-view-head').appendChild(followButton);
        document.querySelector('#post-view-head').appendChild(userInfo);

        // Add user info to post-view
        //document.querySelector('#posts-view').append(userInfo);

        // Add posts to post-view
        info.posts.forEach(add_post);

        // Add pagination
        const pageInfo = info['paging_info']
        user_pagination(pageInfo, username);
    
    })

    // Hide compose-form
    if (document.querySelector('#compose-post')) {
        document.querySelector('#compose-post').style.display = 'none';
    }

    // Show 
    document.querySelector('#post-view-head').innerHTML = `<h3 class='d-inline ml-2'>${username}'s Profile</h3>`;

}

function add_pagination(pageInfo, postview) {

    // Init value
    const totalPages = parseInt(pageInfo['pages']);
    let currentPage = parseInt(pageInfo['current']);
    let previousPage = 0;
    let nextPage = parseInt(pageInfo['next_number']);

    // Handle previous view
    if (pageInfo['flg_previous'] === false) {
        document.querySelector('#previous').style.display = 'none';
    } else if (pageInfo['flg_previous'] === true) {
        document.querySelector('#previous').style.display = 'inline-block';
    }

    // Handle next view
    if (pageInfo['flg_next'] === false) {
        document.querySelector('#next').style.display = 'none';
    } else if (pageInfo['flg_next'] === true) {
        document.querySelector('#next').style.display = 'inline-block';
    }

    // Handle current view
    document.querySelector('#current').innerHTML = `Page ${currentPage} of ${totalPages}`;
    
    // Add event for previous and next link
    document.querySelector('#previous').addEventListener('click', (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();

        console.log('previous link was clicked');

        document.querySelector('#posts-view').innerHTML = '';
 
        fetch(`posts/${postview}`, {
            method: 'POST',
            body: JSON.stringify({
                page_number: previousPage
            })
        })
        .then(response => response.json())
        .then(posts => {

            console.log(`Loaded page ${posts.info['current']} of ${posts.info['pages']}.`)
            // Load posts of current page
            posts.posts.forEach(add_post);
        })

        // Update value
        currentPage--;
        nextPage--;
        previousPage--;

        // Hide next link if current page is equal or greater than total pages
        if (currentPage >= totalPages) {
            document.querySelector('#next').style.display = 'none';
        } else {
            document.querySelector('#next').style.display = 'inline-block';
        }

        // Hide previous link if current page is equal or less than 1
        if (currentPage <= 1) {
            document.querySelector('#previous').style.display = 'none';
        } else {
            document.querySelector('#previous').style.display = 'inline-block';
        }

        // Update current page
        document.querySelector('#current').innerHTML = `Page ${currentPage} of ${totalPages}`;

        return false;
    })

    document.querySelector('#next').addEventListener('click', (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();

        console.log('next link was clicked');

        document.querySelector('#posts-view').innerHTML = '';

        
        fetch(`posts/${postview}`, {
            method: 'POST',
            body: JSON.stringify({
                page_number: nextPage
            })
        })
        .then(response => response.json())
        .then(posts => {
                
            console.log(`Loaded page ${posts.info['current']} of ${posts.info['pages']}.`)
            // Load posts of current page
            posts.posts.forEach(add_post);
        })
        
        // Update value
        currentPage++;
        nextPage++;
        previousPage++;

        // Hide next link if current page is equal or greater than total pages
        if (currentPage >= totalPages) {
            document.querySelector('#next').style.display = 'none';
        } else {
            document.querySelector('#next').style.display = 'inline-block';
        }

        // Hide previous link if current page is equal or less than 1
        if (currentPage <= 1) {
            document.querySelector('#previous').style.display = 'none';
        } else {
            document.querySelector('#previous').style.display = 'inline-block';
        }

        // Update current page
        document.querySelector('#current').innerHTML = `Page ${currentPage} of ${totalPages}`;

        return false;
    })
}

function user_pagination(pageInfo, username) {
    
    // Init value
    const totalPages = parseInt(pageInfo['pages']);
    let currentPage = parseInt(pageInfo['current']);
    let previousPage = 0;
    let nextPage = parseInt(pageInfo['next_number']);

    // Handle previous view
    if (pageInfo['flg_previous'] === false) {
        document.querySelector('#u-previous').style.display = 'none';
    } else if (pageInfo['flg_previous'] === true) {
        document.querySelector('#u-previous').style.display = 'inline-block';
    }

    // Handle next view
    if (pageInfo['flg_next'] === false) {
        document.querySelector('#u-next').style.display = 'none';
    } else if (pageInfo['flg_next'] === true) {
        document.querySelector('#u-next').style.display = 'inline-block';
    }

    // Handle current view
    document.querySelector('#u-current').innerHTML = `Page ${currentPage} of ${totalPages}`;

    // Add event for previous and next link
    document.querySelector('#u-previous').addEventListener('click', (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();

        console.log('previous link was clicked');

        document.querySelector('#posts-view').innerHTML = '';

        fetch(`user/${username}`, {
            method: 'POST',
            body: JSON.stringify({
                page_number: previousPage
            })
        })
        .then(response => response.json())
        .then(posts => {

            console.log(`Loaded page ${posts['paging_info']['current']} of ${posts['paging_info']['pages']}.`)
            // Load posts of current page
            posts.posts.forEach(add_post);
        })

        // Update value
        currentPage--;
        nextPage--;
        previousPage--;

        // Hide next link if current page is equal or greater than total pages
        if (currentPage >= totalPages) {
            document.querySelector('#u-next').style.display = 'none';
        } else {
            document.querySelector('#u-next').style.display = 'inline-block';
        }

        // Hide previous link if current page is equal or less than 1
        if (currentPage <= 1) {
            document.querySelector('#u-previous').style.display = 'none';
        } else {
            document.querySelector('#u-previous').style.display = 'inline-block';
        }

        // Update current page
        document.querySelector('#u-current').innerHTML = `Page ${currentPage} of ${totalPages}`;

        return false;
    })

    document.querySelector('#u-next').addEventListener('click', (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();

        console.log('next link was clicked');

        document.querySelector('#posts-view').innerHTML = '';

        
        fetch(`user/${username}`, {
            method: 'POST',
            body: JSON.stringify({
                page_number: nextPage
            })
        })
        .then(response => response.json())
        .then(posts => {
                
            console.log(`Loaded page ${posts['paging_info']['current']} of ${posts['paging_info']['pages']}.`)
            // Load posts of current page
            posts.posts.forEach(add_post);
        })
        
        // Update value
        currentPage++;
        nextPage++;
        previousPage++;

        // Hide next link if current page is equal or greater than total pages
        if (currentPage >= totalPages) {
            document.querySelector('#u-next').style.display = 'none';
        } else {
            document.querySelector('#u-next').style.display = 'inline-block';
        }

        // Hide previous link if current page is equal or less than 1
        if (currentPage <= 1) {
            document.querySelector('#u-previous').style.display = 'none';
        } else {
            document.querySelector('#u-previous').style.display = 'inline-block';
        }

        // Update current page
        document.querySelector('#u-current').innerHTML = `Page ${currentPage} of ${totalPages}`;

        return false;
    })
}
