/**
 * プッシュ通知設定画面読み込み
 * 
 */
function loadPushSetting() {
    
    // モーダル開始
    fn.showModal();
    
    // ページをロード
    fn.load('push_setting.html')
        //ロード完了後の処理
        .then(function() {
            
            // リクエストデータ作成
            var data = {};
            
            // 【API】ユーザー情報取得を実行
            callAPI('GET', 'users', data)
            // 成功時
            .then(function(response) {
                
                // 画面表示
                showPushSettings(response); 
            })
            // モーダルend
            .then(
                fn.hideModal,
                function() {
                    fn.hideModal();
            });
        });
}


/**
 * プッシュ通知設定を表示する
 * 
 * @param response ユーザー情報
 */
function showPushSettings(response) {
    
    // 通知許可フラグ取得
    var allowPushFlg = response.data.user_data[0].allow_push_flg;
    
    // キャンペーン通知受信フラグ取得
    var campaignReceptFlg = response.data.user_data[0].campaign_recept_flg;
    
    // スイッチON/OFF設定
    // 通知許可
    if(allowPushFlg == 0) {
        // 0のとき：OFF
        document.getElementById('switch_allow_push').checked = false;
        // 通知種別行の非表示
        $('#push_type_header').hide();
        $('#push_type_body').hide();
    } else {
        // 1のとき：ON
        document.getElementById('switch_allow_push').checked = true;
    }
    
    // キャンペーン
    if(campaignReceptFlg == 0) {
        // 0のとき：OFF
        document.getElementById('switch_campaign').checked = false;
    } else {
        // 1のとき：ON
        document.getElementById('switch_campaign').checked = true;
    }
    
    // 通知許可スイッチにイベントリスナー追加
    document.getElementById('switch_allow_push')
            .addEventListener('change', function(e) {
                getPushTypeRowStatus();
            });
    
    // 画面表示
    $('#push_setting_template').show();
}


/**
 * プッシュ通知設定変更処理
 * 
 */
function changePush() {
    
    // モーダル開始
    fn.showModal();
    
    // 通知許可フラグ取得
    var allowPushFlg = Number(document.getElementById('switch_allow_push').checked);
    
    // 受信フラグ取得
    // キャンペーン
    var campaignReceptFlg = Number(document.getElementById('switch_campaign').checked);
    
    // リクエストパラメータ初期化
    var data = {};
    
    if(allowPushFlg){
        
        // 通知許可がONの場合 (種別数が変更された場合、ここを編集@)
        if(campaignReceptFlg == 1 || campaignReceptFlg == 1) {
            
            // 通知種別フラグが1つでもONだった場合
            data = {
            "allow_push_flg": allowPushFlg,
            "campaign_recept_flg": campaignReceptFlg,
            };
        } else {
            
            // 通知種別フラグが全てOFFだった場合：通知許可もOFFに
            data = {
            "allow_push_flg": 0,
            "campaign_recept_flg": 0,
            };
        }
        
    } else {
        
        // 通知許可がOFFの場合：全ての受信フラグを0に設定
        data = {
            "allow_push_flg": allowPushFlg,
            "campaign_recept_flg": 0,
        };
    }
    
    // ユーザー情報変更実行
    callAPI('PUT', 'users', data)
    // 成功時
    .done(function(response) {
        
        // アラート表示
        ons.notification.alert({
            message:"プッシュ通知受信設定を変更しました",
            title:false
        });
        
        // 画面表示
        loadPushSetting();
    })
    // モーダルend
    .fail(fn.hideModal,fn.hideModal);
}


/**
 * 受信端末変更処理
 * 
 */
function changeDevice() {
    
    // モーダル開始
    fn.showModal();
    
    // installation登録成功時のコールバック関数
    var successCallback = function () {
        
        // installationより端末ID取得
        window.NCMB.monaca.getInstallationId(
        function(id) {
            
            // リクエストパラメータデータ生成
            var data = {
                "device_id": id,
            };
            
            // 端末ID変更処理実行
            callAPI('PUT', 'users', data)
            // 成功時
            .done(function(response) {
                // アラート表示
                ons.notification.alert({
                    message:"プッシュ通知受信端末を変更しました",
                    title:false
                });
                
                // 画面表示
                loadPushSetting();
            })
            // モーダルend
            .fail(fn.hideModal);
        });
    };
    
    // installation登録失敗時のコールバック関数
    var errorCallback = function (err) {
        
        ons.notification.alert({
            message:"端末の登録に失敗しました",
            title:false
        });
        
        fn.hideModal();
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
 * 通知種別行の表示/非表示処理
 * 
 */
function getPushTypeRowStatus() {
    
    // 通知許可フラグ
    var allowPushFlg = document.getElementById('switch_allow_push');
        
    if(allowPushFlg.checked) {
        
        // 通知許可フラグON：通知種別行の表示
        $('#push_type_header').show();
        $('#push_type_body').show();
    } else {
        
        // 通知許可フラグOFF：通知種別行の非表示
        $('#push_type_header').hide();
        $('#push_type_body').hide();   
    }
}

