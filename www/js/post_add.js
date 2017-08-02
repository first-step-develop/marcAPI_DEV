//新規投稿画面をロード
function loadPostAdd(){
    
    fn.showModal();
    
    $.when(getTdfList(),getCategoryList())
    .then(
        function(tdf,category){

            var tdfData = tdf[0].data;
            var categoryData = category[0].data;

            return fn.load('post_add.html')
                    .then(
                        function(){
                            
                            $('#upload').off('click');
                            $('#upload').on('click',function(){
                               
                               upload('POST','posts');
                            });
                            setTdfList(tdfData);
                            setCategoryList(categoryData);
                            fn.hideModal();
                        },
                        fn.hideModal
                    );
        },
        fn.hideModal
    );
}

//カメラ起動
function getPhotoByCamera () {
    
    var options = {
            destinationType: Camera.DestinationType.FILE_URI,
            encodingType: Camera.EncodingType.JPEG,
            correctOrientation:true,
            quality: 100,
        };
    
    getPhoto(options);
}

//アルバム起動
function getPhotoByAlbum () {
    
    var options = {
            destinationType: Camera.DestinationType.FILE_URI,
            encodingType: Camera.EncodingType.JPEG,
            correctOrientation:true,
            quality: 100,
            sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM,
        };
    
    getPhoto(options);
}

//画像取得
function getPhoto(options){
    
    if(getFileCnt() < MAX_FILE_CNT){
        navigator.camera.getPicture(
            function(imageDATA){
            
                var imageURI;
                if(imageDATA.indexOf('file://') == -1){
                    
                    imageURI = 'file://' + imageDATA;
                }else{
                    
                    imageURI = imageDATA;
                }
                
                var defer = $.Deferred();
                var promise = defer.promise();
                window.resolveLocalFileSystemURL(
                    imageURI,
                    function(entry){
                        entry.file(function(file){
                            
                            if(file.size > MAX_FILE_SIZE){
                                
                                var message = "写真のサイズが"+ (MAX_FILE_SIZE / 1000000) + "MBを超えています";
                                defer.reject(message);
                            }else{
                                
                                defer.resolve();
                            }
                        },
                        function(){
                            
                            defer.reject();
                        });
                    },
                    function(){
                            
                        defer.reject();
                    }
                );
                
                promise.done(function(){
                    
                    setImg(imageURI);
                })
                .fail(function(message){
                    console.log(message);
                    fileReadError(message);
                });
            },
            function(message){
                
                console.log('An error Occured: ' + message);
            }, 
            options
        );
    }else{
        ons.notification.alert({
                        message:"一度に投稿できる写真は"+ MAX_FILE_CNT + "枚までです",
                        title:"ERROR"
                    });
        return false;
    }
}

//画像配置
window.deleted = [];
function setImg(src,fullSrc = null,fileName = null){
    
    var isPosted = fileName != null;
    
    var img = $('<img>')
                    .attr('src',src)
                    .bind("load",function(){
                        
                        var thisImg = $(this);
                        if(thisImg.height() > thisImg.width()){
                            
                            thisImg.width('100%');
                            thisImg.height('auto');
                        }else{
                            
                            thisImg.width('auto');
                            thisImg.height('100%');
                        }
                    });
    
    if(isPosted){
        
        img.addClass('posted');
    }
    
    var cancelIcon = ons
                        ._util
                        .createElement('<ons-fab position="top right"><ons-icon icon="fa-times"></ons-icon></ons-fab>');
                        
    var cancelButton = $(cancelIcon)
                            .on('click',function(){
                                
                                $(this).parent('div').remove();
                                
                                if(isPosted){
                                    
                                    deleted.push(fileName);
                                }
                            });
    
    $('<div>')
        .addClass('trim')
        .on('click',function(){
            
            var fullImg;
            
            if(fullSrc == null){
                
                fullImg = $(this).find('img');
            }else{
                
                fullImg = $('<img>').attr('src',fullSrc);
            }

            showFullImg(fullImg);
        })
        .append(img)
        .append(cancelButton)
        .appendTo($('.image_view'));    
}

//画像数取得
function getFileCnt(){
    
    return $('.image_view img').length;
}

function fileReadError(message = null){
    
    if(message == null){
        
        message = "写真の読み込みに失敗しました";
    }
    ons.notification.alert({
            message:message,
            title:"ERROR"
        });
}

//投稿
function upload(method,url){
    
    //モーダルstart
    fn.showModal();
    
    var formData = new FormData();
    
    var isError = false;
    
    //コメント
    var comment = $('.comment textarea').val().replace(/\r?\n/g, '\n');
    //文字数チェック
    var commentLength = comment.length;
    
    if(commentLength > 256){
        
        $('.comment .error')
            .text('文字数が制限を超えています ' + commentLength + '/256 （改行含む）')
            .show();
        $('.comment .list_title').css('color','red');
        isError = true;
    }else{
        $('.comment .error').hide();
        $('.comment .list_title').css('color','black');
    }
    formData.append('comment',comment);
    
    //カテゴリ
    var category = $('#category').val();
    //選択済みチェック
    if(category == ''){
        
        $('.category .error').show();
        $('.cateogry .list_title').css('color','red');
        isError = true;
    }else{
        $('.category .error').hide();
        $('message,.cateogry .list_title').css('color','black');
    }
    formData.append('category_id',category);
    
    //都道府県
    var tdf = $('#tdf').val();
    //選択済みチェック
    if(tdf == ''){
        
        $('.tdf .error').show();
        $('.tdf .list_title').css('color','red');
        isError = true;
    }else{
        
        $('.tdf .error').hide();
        $('.tdf .list_title').css('color','black');
    }
    formData.append('tdf_id',tdf);
    
    var tasks = [];
    
    //写真数チェック
    var photoCnt = getFileCnt();
    if(photoCnt == 0){
        
        $('.photo .error').show();
        $('.photo .list_title').css('color','red');
        isError = true;
    }else if(photoCnt > 5){
        
        $('.photo .error').show();
        $('.photo .list_title').css('color','red');
        isError = true;
    }else{
        
        $('.photo .error').hide();
        $('.photo .list_title').css('color','black');
    }
    
    if(isError){
        
        fn.hideModal();
        ons.notification.alert({
                            message:"投稿内容に不備があります",
                            title:false
        })
        return false;
    }
    
    //削除した写真名
    formData.append("del_photo_name",window.deleted);
    
    //アップロード準備
    var photoImages = $('.image_view img').not('.posted');
    photoImages.each(function(key,val){
        
        var defer = $.Deferred();
        tasks.push(defer.promise());
        
        var src = $(val).attr('src');
    
        window.resolveLocalFileSystemURL(
            src,
            function(entry){
                
                entry.file(
                    function(file) {
                        
                        if(file.type != 'image/jpeg'){
                            defer.reject();
                        }
                        
                        if(file.size > MAX_FILE_SIZE){
                            defer.reject();
                        }
                        
                        var reader = new FileReader();
                        reader
                            .onloadend = function(evt) {
                                
                                            var blob =  new Blob([evt.target.result],{"type":file.type});

                                            formData.append("photos[]",blob);
                                            defer.resolve();
                                        };
                        reader.readAsArrayBuffer(file);
                    },
                    function(error){
                        defer.reject();
                    }
                );
            },
            function(error){
                defer.reject();
            }
        );
    });

    $.when.apply($,tasks)
    .done(function(){
            
            var option = {
                "contentType":false,
                "processData":false,
            };
            
            callAPI(method,url,formData,true,option)
                .done(function(){
            
                    fn.hideModal();
                    ons.notification.alert({
                                        message:"写真を投稿しました",
                                        title:false
                    })
                    .then(function(){
                        
                        loadPost();
                    });
                })
                .fail(fn.hideModal);
    })
    .fail(function(){

        fn.hideModal();
        ons.notification.alert({
                            message:"投稿できない写真が含まれています",
                            title:"ERROR"
        });
    });
}

/**
 * カテゴリ一覧をセットする
 */
function setCategoryList(categoryList,selected = null){
    
    var options = toSelectOptions(categoryList,'category_id','category_nmj');
    var categorySelect = $('#category select');
    
    for(var i = 0; i < options.length; i++){
        
        categorySelect.append(options[i]);
    }
    
    if(selected != null){
        
        categorySelect.val(selected);
    }
}

/**
 * 都道府県一覧をセットする
 */
function setTdfList(tdfList,selected = null){
    
    var options = toSelectOptions(tdfList,'tdf_id','tdf_nmj');
    var tdfSelect = $('#tdf select');
    
    for(var i = 0; i < options.length; i++){
        
        tdfSelect.append(options[i]);
    }
    
    if(selected != null){
        
        tdfSelect.val(selected);
    }
}

/**
 * カテゴリ一覧を取得する
 */
function getCategoryList(){
    
    return callAPI('GET','categories');
}

/**
 * 都道府県一覧を取得する
 */
function getTdfList(){
    
    return callAPI('GET','tdfs');
}

/**
 * 連想配列をoption要素に変換する
 * @param array 連想配列
 */
function toSelectOptions(array,valueField,textField){
    
    var selectOptions = [];
    
    for(var i = 0; i < array.length; i++){
        
        var data = array[i];
        var option = $('<option>')
                                .text(data[textField])
                                .val(data[valueField]);
        selectOptions.push(option);
    }
    
    return selectOptions;
}