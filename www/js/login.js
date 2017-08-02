/**
 * ログイン処理
 */
function login() {
    
    // エラーフラグ初期化
    var isError = false;
    // 会員ID
    var memberId       = document.getElementById('userid').value;
    // パスワード
    var memberPassword = document.getElementById('password').value;
    // 店舗ID（現状1のみ）
    var shopId = 1;

    // (1)入力値チェック
    // 会員ID
    if(memberId == "") {
        // エラー表示
        $('.member_id .error')
            .text('会員NOが入力されていません')
            .css('color','red')
            .show();
            
        isError = true;
    } else {
        $('.member_id .error').hide();
    }
    
    // パスワード
    if(memberPassword == "") {
        // エラー表示
        $('.password .error')
            .text('パスワードが入力されていません')
            .css('color','red')
            .show();
            
        isError = true;
    } else {
        $('.password .error').hide();
    }
    
    // エラーでない場合、ログイン認証を実行
    if(isError) {
        
        ons.notification.alert({
            message:"入力内容に不備があります",
            title:false
        });
        return false;
    }
    
    // モーダル開始
    fn.showModal();
    
    // リクエストデータ生成
    var data = {
        "member_id": memberId,
        "member_password": memberPassword,
        "shop_id": shopId,
    };
    
    // ログイン認証を実行
    callAPI('POST', 'members/auth', data)
        // 成功時
        .then(function(response) {
            // 成功時：アクセストークンをローカルストレージに保存
            
            // アクセストークンオブジェクト作成
            var objToken = { token: response.data.token };
            
            // alert(response.data.token);
            
            // ローカルストレージに登録
            setStorage("token", objToken);
            
            // 端末IDの取得
            if(response.data.isfirst == true) {
                
                // 初回ログイン時：mBaaSにInstallation登録する
                registInstallation();     
                
            } else {
                
                // 2回目以降ログイン時：端末IDを取得
                
                // リクエストパラメータデータ生成
                var data = {
                    "fields": "device_id",
                };
                
                // ユーザー情報取得を実行
                callAPI('GET', 'users', data)
                    .then(function(response) {
                        
                        // 端末ID取得
                        var deviceId = response.data.user_data[0].device_id;
                        
                        // 取得した端末IDチェック
                        if(deviceId == null) {
                            
                            // 端末IDがNULLの場合：再度installation登録
                            registInstallation();
                            
                        } else if(deviceId.length == 16) {
                            
                            fn.hideModal();
                            
                            // 取得した端末IDが16桁の場合：投稿閲覧画面へ遷移
                            loadPost();
                            
                        } else {
                            
                            // 取得した端末IDが16桁でない場合：再度installation登録
                            registInstallation();
                        }
                        
                    });
            }
        })
        .then(
            fn.hideModal,
            function() {
                fn.hideModal();
                // $('.reload').show();
        });  
}


/**
 * installation登録
 * 
 */
function registInstallation() {
    
    // mBaaSにInstallation登録する
    // alert("mBaaSにInstallation登録します");
    
    // プッシュ通知受信時のコールバックを登録します
    window.NCMB.monaca.setHandler
    (
        function(jsonData) {
            // 送信時に指定したJSONが引数として渡されます 
            console.log("callback :::" + JSON.stringify(jsonData));
        }
    );
    
    // installation登録成功時のコールバック関数
    var successCallback = function () {
        
        // installationから端末IDを取得しユーザー情報を変更し画面遷移
        changeDeviceId();
    };
    
    // installation登録失敗時のコールバック関数
    var errorCallback = function (err) {
        // alert("installation登録エラー：" + err.message);
        
        // installationから端末IDを取得しユーザー情報を変更し画面遷移
        changeDeviceId();
    };
    
    // デバイストークンを取得してinstallation登録が行われます
    window.NCMB.monaca.setDeviceToken(
        // アプリケーションキー
        APP_KEY,
        // クライアントキー
        CLIENT_KEY,
        // SENDER ID
        SENDER_ID,
        successCallback,
        errorCallback
    );
}


/**
 * 端末IDを取得しユーザー情報変更実施
 * 
 */
function changeDeviceId() {
    // 登録されたinstallationの端末IDを取得
    window.NCMB.monaca.getInstallationId(
        function(id) {
            // alert("端末ID: " + id);
            
            // 【API】ユーザー情報変更実行し、端末IDを変更
            // リクエストパラメータデータ生成
            var data = {
                "device_id": id,
            };
        
            // 【API】ユーザー情報変更実行
            callAPI('PUT', 'users', data)
            // 成功時
            .then(function(response) {
                
                fn.hideModal();
                
                // (5)投稿閲覧画面へ遷移
                loadPost();
            });
    }); 
}


/**
 * ローカルストレージへデータ登録
 * @param  key   データのキー (token)
 * @param  obj   登録するJavaScriptオブジェクト
 */
function setStorage(key, obj) {
    localStorage.setItem(key, JSON.stringify(obj));
}


/**
 * ローカルストレージからデータ取得
 * @param  key   データのキー (token)
 * @return obj   JavaScriptオブジェクト
 */
function getStorage(key) {
    var item = localStorage.getItem(key);
    var obj = JSON.parse(item);
    // console.log(obj);
    return obj;
}

/**
 * ローカルストレージのデータ削除
 * @param  key   データのキー (token)
 */
function removeStorage(key) {
    localStorage.removeItem(key);
}


/**
 * 外部リンク移動
 * 
 */
function gotoWebRegister() {
    // モーダル表示
    fn.showModal();
    // URL取得
    var url = MARCH_WEB_REGISTER;
    // モーダルend
    fn.hideModal();
    
    // ブラウザ起動し外部サイトへ移動
    window.open(url,'_system');
}
