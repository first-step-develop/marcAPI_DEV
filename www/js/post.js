/**
 * 投稿閲覧画面を読み込む
 * @param tabType 表示種別
 */
function loadPost(){
    
    //初期表示は新着順タブ
    var tabType = 1;
    
    //モーダルstart
    fn.showModal();
    
    //ページをロード
    fn.load('post.html')
        //ロード完了後の処理
        .then(function(){
            
            //スプリッターの有効化
            $('ons-splitter-side').attr('swipeable','true');
            
            //ヘッダーの移動
            moveHeader();
            
            //検索ボックスの設定
            setSearch(tabType);
            
            //投稿画面を構築
            return buildPostPage(tabType);
        })
        //モーダルend
        .then(
            fn.hideModal,
            function(){
                
                fn.hideModal();
                $('.reload').show();
            }
        );   
}

/**
 * 投稿画面構築
 * @param orderType 表示順序
 * @param keyword 検索文字列
 * @param userID 投稿者ID
 */
function buildPostPage(tabType,keyword = '',postUserID = null){
    
    //投稿を取得して画面を構築
    var data = {
                "order_type":tabType,
                "search_string":keyword,
                "user_id":postUserID,
            };
    return getPosts(data)
                .done(function(posts){
                    
                    //表示方法選択タブを設定
                    switch(tabType){
                        case 0:
                            $('.tab.own')
                                .addClass('selected')
                                .off('click');
                            $('.tab.new')
                                .removeClass('selected')
                                .off('click')
                                .on('click',function(){
                                    rebuildPostPage(1);
                                });
                        break;
                        
                        case 1:
                            $('.tab.new')
                                .addClass('selected')
                                .off('click');
                            $('.tab.own')
                                .removeClass('selected')
                                .off('click')
                                .on('click',function(){
                                    rebuildPostPage(0);
                                });
                        break;
                    }
                    
                    //検索ボックスをリフレッシュ
                    $('input[type=search]').val(keyword);
                    
                    //投稿を表示する
                    showPosts(posts);
                                                
                });
}

/**
 * 投稿画面再構築
 * @param tabType タブ種別
 * @param keyword 検索文字列
 * @param userID 投稿者ID
 */
function rebuildPostPage(tabType,keyword = '',postUserID = null){
    
    //モーダルstart
    fn.showModal();
    
    //検索ボックスの設定
    setSearch(tabType);
    
    buildPostPage(tabType,keyword,postUserID)
        //モーダルend
        .then(fn.hideModal,fn.hideModal);   
}

/**
 * 投稿追加読み込み
 * @param lastPostID 最後に取得した投稿ID
 * @param userID 投稿者ID
 */
function loadAdditionalPosts(){
    
    //追加読み込みボタンを隠す
    $('#post_next').hide();
    
    //ローディングサーキュラを表示
    $('#post_next_loading').show();
    
    var lazyRepeat = document.getElementById('lazy_repeat');
    
    //表示中の最終投稿ID
    var curSource = lazyRepeat.source;
    var lastPostID = curSource[curSource.length - 1].post_id;
    
    //取得条件
    var data = lazyRepeat.condition;
    data.last_post_id = lastPostID;
    
    getPosts(data)
        .done(function(posts){

            //ローディングサーキュラを非表示
            $('#post_next_loading').hide();
            
            //追加データが存在する時
            if(posts.data.length > 0){
                
                //投稿を追加表示
                lazyRepeat.source = curSource.concat(posts.data);
                lazyRepeat.customRefresh();
            }
            
            //取得件数が上限を下回った時
            if(posts.data.length < POST_VIEW_LIMIT){

                //追加読み込みボタンのメッセージを変更
                $('#post_next')
                    .find('span')
                    .text('これ以上表示できる投稿はありません');
                
                //イベントを削除して表示
                $('#post_next')
                    .removeAttr('onclick')
                    .show();
            }else{
                
                //追加読み込みボタンを再表示
                $('#post_next')
                    .attr('onclick','loadAdditionalPosts()')
                    .show();
            }
        })
        .fail(function(){
            
            //ローディングサーキュラを非表示
            $('#post_next_loading').hide();
            
            //追加読み込みボタンを再表示
            $('#post_next')
                .attr('onclick','loadAdditionalPosts()')
                .show();
        });
}

/**
 * 投稿取得
 * @param data リクエストパラメータ
 */
function getPosts(data){
    
    //取得条件を保存
    document
        .getElementById('lazy_repeat')
        .condition = data;
    
    return callAPI('GET','posts',data);
}

/**
 * 投稿を表示する
 * @param posts 投稿データ
 */
function showPosts(posts){
    
    //投稿データ
    postDatas = posts.data;

    var lazyRepeat = document.getElementById('lazy_repeat');
    lazyRepeat.source = postDatas;
    
    if(postDatas.length > 0){
        
        $('#post_isempty').hide();
        var postTemplate = $('#post_template');
        
        lazyRepeat.img = {
            "full":{},
            "thum":{},
        };
        
        lazyRepeat.delegate = {
            createItemContent: function(i) {
                
                var postData = lazyRepeat.source[i];
                
                var newPost = postTemplate.clone();
                newPost[0].sourceIndex = i;
                
                var postID = postData.post_id;
                
                //投稿ID
                newPost
                    .attr('id',postID);
                
                //投稿者名
                newPost
                    .find('.author .name')
                    .text(postData.nickname);
                
                //カテゴリ
                newPost
                    .find('.category .name')
                    .text(postData.category_nmj);
                
                //都道府県名
                newPost
                    .find('.tdf .name')
                    .text(postData.tdf_nmj);
                
                //コメント
                var comment = postData.comment.replace(/\r?\n/g, '<br>');
                newPost
                    .find('.comment')
                    .html(comment);
                
                //現在いいね件数
                newPost
                    .find('.like .button .text')
                    .text(postData.cur_like_cnt);
                
                //フッターボタン表示設定
                newPost
                    .find('.post-footer .button')
                    .removeAttr('ripple');
                newPost
                    .find('.post-footer .button .ripple')
                    .remove();
                if(postData.isown == "1"){
                    
                    //通報ボタン非表示
                    newPost
                        .find('.operation .report')
                        .hide();
                    
                    //編集ボタン
                    newPost
                        .find('.operation .edit')
                        .on('click',function(){
                            loadPostEdit(postID);
                        });
                    
                    //削除ボタン
                    newPost
                        .find('.operation .delete')
                        .on('click',function(){
                            deletePost(postID);
                        });
                }else{
                    
                    //編集・削除ボタン非表示
                    newPost
                        .find('.operation .edit,.operation .delete')
                        .hide();
                    
                    //通報ボタン
                    newPost
                        .find('.operation .report')
                        .on('click',function(){
                            reportPost(postID);
                        });
                }
                
                //いいねボタン
                var isLike = postData.islike == 1;
                var likeButton = newPost.find('.like');
                likeButton
                    .on('click',function(){
                        
                        like(postID,isLike,this);
                    })
                    .find('ons-icon')
                    .attr('icon',getLikeIconName(isLike));
                
                if(postData.like_button_disabled != null){
                    
                    likeButton.prop('disabled',postData.like_button_disabled);
                }
                
                //写真データ配列
                var photos = postData.photos;
                //カルーセル
                var carousel = newPost.find('ons-carousel');
                //カルーセルアイテムテンプレート
                var itemTemplate = newPost.find('ons-carousel-item');

                //カルーセルに写真を追加
                for(var photoIndex in photos){
                    
                    //テンプレートをコピー
                    var newItem = itemTemplate.clone();
                    
                    //写真データ
                    var photo = photos[photoIndex];
                    
                    var imgID = postID + '_' + photo.file_name;
                    var newImg = newItem.find('div');
                    newImg
                        .attr('thumbnail-data',photo.thum_url)
                        .attr('original-data',photo.file_url)
                        .attr('id',imgID);
                    
                    newItem
                        .appendTo(carousel);
                    
                    //サムネイル画像未読み込み時は画像をプリロード
                    if(lazyRepeat.img.thum[imgID] == null){
                        
                        lazyRepeat.img.thum[imgID] = {
                                'complete':false,
                            };
                        
                        $('<img>')
                            .attr('src',photo.thum_url)
                            .attr('imgID',imgID)
                            .css('display','hidden')
                            .bind('load',function(){
                                
                                var targetID = $(this).attr('imgID');
                                var target = $('#' + targetID);
                                
                                target.find('.loading').remove();
                                
                                $('<img>')
                                    .attr('src',target.attr('thumbnail-data'))
                                    .attr('original-data',target.attr('original-data'))
                                    .attr('width','200px')
                                    .attr('height','150px')
                                    .on('click',function(){
                                        
                                        var fullSrc = $(this).attr('original-data');
                                        console.log(fullSrc);
                                        var fullImg = $('<img>').attr('src',fullSrc);
                                        showFullImg(fullImg);
                                    })
                                    .appendTo(target);
                                
                                if(lazyRepeat.img.thum[targetID] != null){
                                    
                                    lazyRepeat.img.thum[targetID].complete = true;
                                }
                                $(this).remove();
                            })
                            .appendTo('body');

                    }
                    //読み込み済み時
                    else if(lazyRepeat.img.thum[imgID].complete){
                        
                        newImg.find('.loading').remove();
                        
                        $('<img>')
                            .attr('src',newImg.attr('thumbnail-data'))
                            .attr('original-data',newImg.attr('original-data'))
                            .attr('width','200px')
                            .attr('height','150px')
                            .on('click',function(){
                                
                                var fullSrc = $(this).attr('original-data');
                                console.log(fullSrc);
                                var fullImg = $('<img>').attr('src',fullSrc);
                                showFullImg(fullImg);
                            })
                            .appendTo(newImg);
                    }
                }
                itemTemplate.remove();
                
                return newPost[0];
            },
            countItems: function() {
              return lazyRepeat.source.length;
            }
        };
    }else{
        
        $('#post_isempty').show();
    }
    
    lazyRepeat.refresh();
    
    if(postDatas.length == POST_VIEW_LIMIT){
    
        $('#post_next span').text('次の' + POST_VIEW_LIMIT + '件を表示する');
        $('#post_next')
            .attr('onclick','loadAdditionalPosts()')
            .show();
    }else{
        
        $('#post_next').hide();
    }
}

/**
 * 検索
 * @param curTabType タブ種別
 */
function search(curTabType){

    document.activeElement.blur();
    var keyword = $('input[type=search]').val();
    rebuildPostPage(curTabType,keyword);
}

/**
 * 検索イベント設定
 * @param curTabType タブ種別
 */
function setSearch(curTabType,curKeyword){
    
    $('.search_form')
            .off()
            .submit(function(event){
                
                event.preventDefault();
                search(curTabType);
            });
}

/**
 * ヘッダーを移動
 */
function moveHeader(){
    
    $('.header').insertAfter($('.toolbar + div + div.page__content'));
}

/**
 * いいねボタン
 * @param postID 投稿ID
 * @param isLike いいね済みフラグ
 */
function like(postID,isLike,buttonElement){
    
    //データソース
    var sourceIndex = document.getElementById(postID).sourceIndex;
    var lazyRepeat = document.getElementById('lazy_repeat');
    var sourceData = lazyRepeat.source[sourceIndex];
    
    //ボタン無効化
    $(buttonElement).off('click');
    sourceData.like_button_disabled = true;
    
    //いいね登録処理
    var operationType = isLike?"2":"1";
    var data = {
        "post_id":postID,
        "operation_type":operationType,
    };
    callAPI('POST','likes',data)
        .done(function(response){
            
            //データソース更新
            sourceData.islike = isLike?0:1;
            
            var newCnt = response.data.cur_like_cnt;
            if(newCnt == null){
                ons.notification.alert({
                            message:"いいね数が取得できませんでした",
                            title:"ERROR"
                            });
            }else{
                sourceData.cur_like_cnt = response.data.cur_like_cnt;
            }
            
            //ボタン有効化
            lazyRepeat.refresh();
        })
        .fail(function(){
            
            //ボタン有効化
            lazyRepeat.refresh();
        });
}

/**
 * いいねアイコン名取得
 * @param isLike いいね済みフラグ
 */
function getLikeIconName(isLike){
    
    return isLike?'thumbs-up':'thumbs-o-up';
}

/**
 * 投稿削除
 * @param postID 投稿ID
 */
function deletePost(postID){
    
    ons.notification.confirm({
        message: '投稿を削除しますか？',
        title:false,
    })
    .then(function(isOK){
        
        if(isOK){
            
            //モーダルstart
            fn.showModal();
            
            data = {};
            return callAPI('DELETE','posts/' + postID,data)
                        .then(function(response){
                            
                            var lazyRepeat = document.getElementById('lazy_repeat');
                            
                            //データソースから投稿データを削除
                            var sourceIndex = document.getElementById(postID).sourceIndex;
                            
                            lazyRepeat
                                .source
                                .splice(sourceIndex,1);
                            
                            $('#' + postID).remove();
                            ons.notification.alert({
                                            message:'投稿を削除しました',
                                            title:false
                                            });
                            
                            //画面更新
                            lazyRepeat.refresh();
                        })
                        //モーダルend
                        .then(fn.hideModal,fn.hideModal);   
        }
    });
}

/**
 * 投稿通報
 * @param postID 投稿ID
 */
function reportPost(postID){

    ons.notification.confirm({
        message: '通報者の情報も送信されます',
        title:'投稿を通報しますか？',
    })
    .then(function(isOK){
        
        if(isOK){
            
            //モーダルstart
            fn.showModal();
            
            data = {
                "post_id":postID,
            };
            return callAPI('POST','notices',data)
                        .then(function(response){
                            
                            ons.notification.alert({
                                            message:response.data.message,
                                            title:false
                                            });
                        })
                        //モーダルend
                        .then(fn.hideModal,fn.hideModal);   

        }
    });
}