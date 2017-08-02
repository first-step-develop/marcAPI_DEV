document.addEventListener("deviceready", function(){
    window.NCMB.monaca.setReceiptStatus(true);
});
document.addEventListener("init", function(event) {
    var page = event.target;
    if(page.id == "blank"){
        checkLogin();
    }
});

window.fn = {};
window.fn.open = function() {
  var menu = document.getElementById('menu');
  menu.open();
};
window.fn.load = function(page) {

    var content = document.getElementById('content');
    var menu = document.getElementById('menu');
    var promise =  content
                        .load(page)
                        .then(menu.close.bind(menu));
    
    return promise;
};
window.fn.showModal = function(){
    
    $('#modal').show();
};
window.fn.hideModal = function(){
    
    $('#modal').hide();
};

/**
 * API
 * @param type HTTPmethod 'GET'/'POST'/'PUT'/'DELETE'
 * @param url API呼び出し用URL（共通部分,拡張子を除く）
 * @param data リクエストデータ
 * @param errorAlert エラー時にアラートを表示するか（デフォルトはtrue） 
 * @param option ajaxのオプション設定
 */
function callAPI(type,url,data = {},errorAlert = true,option = {}){
    
    var ajaxProp = {
                type:type,
                url:API_URL + url + '.json',
                timeout:TIMEOUT,
                dataType:'json',
                beforeSend:function(xhr){
                    setAuthorizationHeader(xhr);
                },
                data:data,
                success:function(response){

                },
                error:function(response){
                
                    if(errorAlert){    
                        var statusCode = response.status;
                        var title = "ERROR " + statusCode;
                        var message = "";
                        if(statusCode == 0){
                            
                            message = CONNECT_ERROR_MESSAGE;
                        }else{
                            
                            var json;
                            try{
                                
                                json = $.parseJSON(response.responseText);
                            }catch(e){
                            
                                message = e.message;
                            }
                            message = "undefined error";
                            if(json != null){
                                
                                message = json.data.message;
                            }
                        }
                        ons.notification.alert({
                                                message:message,
                                                title:title
                                                })
                        .then(function(){
                            
                            if(statusCode == 401){
                                
                                logout();
                            }
                        });
                    }
                },
            };
    Object.assign(ajaxProp,option);
    
    return $.ajax(ajaxProp);
}

/**
 * ログアウト処理
 */
function logout(){
    
    //アクセストークン削除
    removeStorage('token');
    
    //ログイン画面へ遷移
    fn.load('login.html')
        .then(function(){

            $('ons-splitter-side').removeAttr('swipeable');
        });
}

/**
 * ログインチェック 
 */
function checkLogin(){
    
    var data = {
        "fields":["user_id"],
    };
    
    var token = getSavedToken();
    if(token){
    
        callAPI('GET','users',data,false)
            .done(function(){
                
                loadPost();
            })
            .fail(function(response){
            
                if(response.status == 401){
                    
                    logout();
                }else{
                    
                    loadPost();
                }
            });
    }else{
        
        logout();
    }
}

/**
 * web予約ページを開く
 */
function gotoReservation(shopID){
    
    fn.showModal();
    callAPI('GET','users/reservation/' + shopID)
        .done(function(response){
            
            var url = response.data.url;
            fn.hideModal();
            window.open(url,'_system');
        })
        .fail(fn.hideModal);

}

/**
 * ローカルストレージからアクセストークンを取得する
 */
function getSavedToken(){
    
    var strage = getStorage('token');
    
    var token = '';
    
    if(strage != null){
        
        token = strage.token;
    }
    
    return token;
};

/**
 * AuthorizationHeaderにtokenをセットする
 */
function setAuthorizationHeader(xhr){
    
    var token = getSavedToken();
    if(token != null && token != ''){
        xhr.setRequestHeader ("Authorization", "Bearer " + token);
    }
};


/**
 * 画像ポップアップ表示
 * @param imgElement 画像
 */
function showFullImg(imgElement){
    
    $('#fullImg .img_wrap')
        .children()
        .remove();
    
    var loading = ons._util.createElement('<ons-progress-circular class="fullImageLoading" indeterminate></ons-progress-circular>');
    
    $(loading).appendTo('#fullImg .img_wrap');
    
    $(imgElement)
        .clone()
        .width('100%')
        .height('auto')
        .hide()
        .appendTo('#fullImg .img_wrap')
        .on('load',function(){
            
            $('.fullImageLoading').hide();
            $(this).show();
        });
    
    $('#fullImg').show();
}