//ajax通信のタイムアウト(ms)
const TIMEOUT = 180000;
//接続エラー時のメッセージ
const CONNECT_ERROR_MESSAGE = "インターネット接続を確認してください";
//一度の通信で取得する投稿の最大件数
const POST_VIEW_LIMIT = 50;
//投稿できる画像の最大容量（1ファイル毎）
const MAX_FILE_SIZE = 6000000;
//投稿1件に添付できる画像の枚数
const MAX_FILE_CNT = 5;

/**
 * 開発環境
 */

//APIの基底URL
const API_URL = "http://siriusplus.dip.jp:2008/app_march/api/";
//会員登録
const MARCH_WEB_REGISTER = "http://siriusplus.dip.jp:2087/web/reserve/register";

//mBaaS用
//アプリケーションキー
const APP_KEY = "0a807473b6c0c149080eea5631859ee284ba4d831b2bfff59612f4649511c799";
//クライアントキー
const CLIENT_KEY = "747f8eb73b2858d70304d388bba79e7e7f070f7cd7f1eb769e3cfddca3568236";
//センダーID
const SENDER_ID = "187043505077";
 
/**
 * 本番環境
 */
/* 
//APIの基底URL
const API_URL = "http://153.122.44.176/api/";
//会員登録
const MARCH_WEB_REGISTER = "http://www.nailsalon-march.com/~www/web/reserve/register";

//mBaaS用
//アプリケーションキー
const APP_KEY = "6c773aec73fc63252147c7b099e5f5c173447edae5d5889bc5a233a2e337fe91";
//クライアントキー
const CLIENT_KEY = "454b2f0f8e4740ddb96b032bce2c77c144e03150793ceda86d61f64784c52aed";
//センダーID
const SENDER_ID = "835840322074";
*/