/**
 * プッシュ画面読み込み
 * 
 */
function loadPush() {
    // モーダル開始
    fn.showModal();
    
    // ページをロード
    fn.load('push.html')
        //ロード完了後の処理
        .then(function() {
            // 1.【API】通知取得を実行し、プッシュ通知の内容を取得
            
            // リクエストデータ作成
            var data = {};
            
            // 【API】通知取得を実行
            callAPI('GET', 'pushes', data)
                // 成功時
                .then(function(response) {
                    // プッシュ配列取得
                    var pushes_list = response.data;
                    
                    // 2.画面表示
                    showPushes(response);
                    
                })
                //モーダルend
                .then(
                    fn.hideModal,
                    function() {
                        fn.hideModal();
                        // $('.reload').show();
                });  
        });
}


/**
 * 受信したプッシュを表示する
 * @param pushes プッシュ通知データ
 */
function showPushes(pushes) {
    
    // プッシュ通信データ
	var pushDatas = pushes.data;

	var lazyPushes = document.getElementById('lazy_pushes');
    lazyPushes.source = pushDatas;

	// 通知が1つでもある場合
	if(pushDatas.length > 0) {
		$('#push_isempty').hide();
        
		var pushTemplate = $('#push_template');

		// デリゲート
		lazyPushes.delegate = {
			createItemContent: function(i) {
                
				var pushData = lazyPushes.source[i];
                
				var newPush = pushTemplate.clone();
                newPush[0].sourceIndex = i;
                
                // プッシュID
				var pushID = pushData.push_id;
				newPush
					.attr('id', pushID);
                    
				// 店舗名
				var shopNmj = pushData.shop_nmj;
                // alert("店舗名：" + shop_nmj);
				newPush
					.find('.shop-nmj')
					.html(shopNmj);
                
                // リンク
                var shopId = pushData.shop_id;
                newPush
                    .find('.shop-link')
                    .html(
                        '<a href="#" onclick="gotoReservation(' + shopId + ');">店舗のページへ</a>'
                        );
                
                // プッシュタイトル
                var pushTitle = pushData.title;
				newPush
					.find('.push-title')
					.html(pushTitle);
                
				// プッシュ本文
				var pushBody = pushData.body.replace(/\r?\n/g, '<br>');
				newPush
					.find('.push-body')
					.html(pushBody);
                    
                // プッシュ画像
                var attachmentImg = pushData.file_url;
                if(attachmentImg){
                    newPush
                        .find('.push-img')
                        .attr('src', attachmentImg)
                        .on('click',function(){
                                var fullImg = $('<img>').attr('src',attachmentImg);
                                showFullImg(fullImg);
                            });
                } else {
                    newPush
                        .find('.push-img')
                        .remove();
                }
                
                // 削除ボタン
                newPush
                    .find('.btn-delete')
                    .on('click',function(){
                        // ダイアログ表示
                        ons.notification.confirm({
                            message: 'プッシュ通知を削除しますか？',
                            title:false,
                        })
                        .then(function(isOK) {
                            if(isOK) {
                                // プッシュ削除
                                deletePush(pushID);
                            }
                        }); 
                    });
                
                return newPush[0];
			},
			countItems: function() {
				// 総数
				return lazyPushes.source.length;
			}
		};
	} else {
        $('#push_isempty').show();
	}
}


/**
 * プッシュ削除
 * @param pushID プッシュID
 */
function deletePush(pushID) {
    // リクエストデータ生成
    var data = {
        "push_id": pushID,
    };
    
    // 【API】通知削除を実行
    callAPI('DELETE', 'pushes/' + pushID, data)
        // 成功時
        .done(function(response) {
            
            // 画面再読み込み
            loadPush();
        })
        // 失敗時
        .fail(function() {
        });
}