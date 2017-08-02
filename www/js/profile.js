/**
 * プロフィール設定画面読み込み
 *
 */
function loadProfile() {
    
    // モーダル開始
    fn.showModal();
    
    // ページをロード
    fn.load('profile.html')
    // ロード完了後の処理
    .then(function() {
        // ユーザー情報取得
        
        // リクエストパラメータデータ生成
        var data = {};
        
        // 【API】ユーザー情報取得を実行
        callAPI('GET', 'users', data)
        .then(function(response) {
            
            // ニックネーム取得
            var nickname = response.data.user_data[0].nickname;
            // 自己紹介取得
            var self_introduction = response.data.user_data[0].self_introduction;
            
            document.getElementById("txt_nickname").defaultValue = nickname;
            document.getElementById("txt_self_introduction").defaultValue = self_introduction;
        })
        //モーダルend
        .then(fn.hideModal,fn.hideModal);   
    });   
}


/**
 * プロフィール情報変更処理
 *
 */
function edit_profile() {
    // (1)入力値チェック
    
    // エラーフラグ初期化
    var isError = false;
    
    // ニックネーム
    var nickname = document.getElementById('txt_nickname').value;
    // 文字数取得
    var nicknameLength = nickname.length;
    
    // 入力値チェック (ニックネーム)
    if(nicknameLength > 16 || !nickname.match(/\S/g)) {
        // 文字数チェック
        if(nicknameLength > 16) {
            // エラー表示
            $('.nickname .error')
                .text('名前（ニックネーム）は16文字までです')
                .css('color','red')
                .show();
        }
        
        // 空白チェック
        if (!nickname.match(/\S/g)) {
            // エラー表示
            $('.nickname .error')
                .text('空白やスペースのみを登録することはできません')
                .css('color','red')
                .show();                
        }
        
        isError = true;
    } else {
        $('.nickname .error').hide();
    }
        
    // 自己紹介 (改行変換)
    var selfIntroduction = $('#txt_self_introduction').val().replace(/\r?\n/g, '\n');    
    // 文字数取得
    var selfIntroductionLength = selfIntroduction.length;
    
    // 文字数チェック
    if(selfIntroductionLength > 128) {
        // エラー表示
        $('.self_introduvtion .error')
            .text('自己紹介は128文字までです')
            .css('color','red')
            .show();
            
        isError = true;
    } else {
        $('.self_introduvtion .error').hide();
    }
    
    if(isError) {
        
        ons.notification.alert({
            message:"内容に不備があります",
            title:false
        });
        return false;
    }
    
    // (2)【API】ユーザー情報変更実行し、変更内容を更新
    
    // リクエストパラメータデータ生成
    var data = {
        "nickname": nickname,
        "self_introduction": selfIntroduction,
    };
    
    // 【API】ユーザー情報変更実行
    callAPI('PUT', 'users', data)
    // 成功時
    .then(function(response) {
        loadProfile();
        
        /*
        // アラート表示
        ons.notification.alert({
            message:"プロフィールを変更しました",
            title:false
        });
        */
    });
}