function loadPostEdit(postID){
    
    fn.showModal();
    
    $.when(getTdfList(),getCategoryList(),getSelectedPost(postID))
    .then(
        function(tdf,category,postData){

            var tdfData = tdf[0].data;
            var categoryData = category[0].data;
            var postData = postData[0].data[0];

            if(postData.post_id == null){
                
                return $.Deferred().reject().promise();
            }
            return fn.load('post_edit.html')
                    .then(
                        function(){
                            window.deleted = [];
                            
                            $('#upload').on('click',function(){
                               
                               upload('POST','posts/' + postData.post_id);
                            });
                            setTdfList(tdfData,postData.tdf_id);
                            setCategoryList(categoryData,postData.category_id);
                            setComment(postData.comment);
                            setPhotos(postData.photos);
                            fn.hideModal();
                        },
                        fn.hideModal
                    );
        },
        fn.hideModal
    )
    .fail(function(){
        fn.hideModal();
        ons.notification.alert({
            message:"投稿内容が取得できませんでした",
            title:"ERROR"
            });    
    });
}

function getSelectedPost(postID){
    
    var data = {
        "order_type":"0",
    };
    return callAPI('GET','posts/' + postID,data);
}

function setComment(comment){
    
    $('.comment textarea').val(comment);
}

function setPhotos(photos){
    
    for(var i = 0; i < photos.length; i++){
        
        var src = photos[i].thum_url;
        var fullImg = photos[i].file_url;
        var fileName = photos[i].file_name;
        
        setImg(src,fullImg,fileName);
    }
}