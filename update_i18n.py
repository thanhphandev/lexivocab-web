import json
import os

langs = {
    'en.json': {
        "GENERIC_ERROR": "An unknown error occurred. Please try again later.",
        "INTERNAL_SERVER_ERROR": "Internal server error. We've been notified.",
        "VALIDATION_FAILED": "Validation failed. Please check your input.",
        "UNAUTHORIZED": "Please log in to continue.",
        "RESOURCE_NOT_FOUND": "Requested resource was not found.",
        "AUTH_INVALID_CREDENTIALS": "Incorrect email or password.",
        "AUTH_EMAIL_ALREADY_EXISTS": "This email is already registered. Please log in.",
        "AUTH_EMAIL_NOT_VERIFIED": "Please verify your email address.",
        "AUTH_ACCOUNT_LOCKED": "Your account has been locked due to too many failed login attempts.",
        "AUTH_ACCOUNT_DISABLED": "Your account has been disabled.",
        "AUTH_SOCIAL_LOGIN_CONFLICT": "Please log in using your linked social account.",
        "AUTH_INVALID_TOKEN": "Invalid session.",
        "AUTH_TOKEN_EXPIRED": "Your session has expired.",
        "AUTH_REFRESH_TOKEN_INVALID": "Could not refresh your session.",
        "AUTH_GOOGLE_TOKEN_INVALID": "Google login failed.",
        "AUTH_PASSWORD_TOO_WEAK": "Password is too weak.",
        "AUTH_VERIFICATION_CODE_INVALID": "Invalid verification code.",
        "AUTH_VERIFICATION_CODE_EXPIRED": "Verification code expired.",
        "AUTH_SESSION_EXPIRED": "Session expired.",
        "VOCAB_NOT_FOUND": "Vocabulary word not found.",
        "VOCAB_ALREADY_EXISTS": "You have already saved this word.",
        "VOCAB_QUOTA_EXCEEDED": "You have reached your vocabulary limit.",
        "TAG_NOT_FOUND": "Tag not found.",
        "TAG_ALREADY_EXISTS": "This tag already exists.",
        "RATE_LIMIT_EXCEEDED": "Too many requests. Please slow down.",
        "AI_QUOTA_EXCEEDED": "AI quota reached. Upgrade to Pro for unlimited access.",
        "AUTHZ_INSUFFICIENT_PERMISSIONS": "Insufficient permissions. Upgrade to Pro."
    },
    'vi.json': {
        "GENERIC_ERROR": "Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.",
        "INTERNAL_SERVER_ERROR": "Hệ thống gặp sự cố. Chúng tôi đã ghi nhận và đang xử lý.",
        "VALIDATION_FAILED": "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
        "UNAUTHORIZED": "Vui lòng đăng nhập để tiếp tục.",
        "RESOURCE_NOT_FOUND": "Không tìm thấy dữ liệu yêu cầu.",
        "AUTH_INVALID_CREDENTIALS": "Email hoặc mật khẩu không chính xác.",
        "AUTH_EMAIL_ALREADY_EXISTS": "Email này đã được đăng ký. Vui lòng đăng nhập.",
        "AUTH_EMAIL_NOT_VERIFIED": "Vui lòng xác minh địa chỉ email của bạn.",
        "AUTH_ACCOUNT_LOCKED": "Tài khoản của bạn đã bị khóa do đăng nhập sai quá nhiều.",
        "AUTH_ACCOUNT_DISABLED": "Tài khoản của bạn đã bị vô hiệu hóa.",
        "AUTH_SOCIAL_LOGIN_CONFLICT": "Vui lòng đăng nhập bằng tài khoản mạng xã hội đã liên kết.",
        "AUTH_INVALID_TOKEN": "Phiên đăng nhập không hợp lệ.",
        "AUTH_TOKEN_EXPIRED": "Phiên đăng nhập đã hết hạn.",
        "AUTH_REFRESH_TOKEN_INVALID": "Không thể làm mới phiên đăng nhập.",
        "AUTH_GOOGLE_TOKEN_INVALID": "Đăng nhập Google thất bại.",
        "AUTH_PASSWORD_TOO_WEAK": "Mật khẩu quá yếu.",
        "AUTH_VERIFICATION_CODE_INVALID": "Mã xác minh không đúng.",
        "AUTH_VERIFICATION_CODE_EXPIRED": "Mã xác minh đã hết hạn.",
        "AUTH_SESSION_EXPIRED": "Phiên đăng nhập đã hết hạn.",
        "VOCAB_NOT_FOUND": "Không tìm thấy từ vựng.",
        "VOCAB_ALREADY_EXISTS": "Bạn đã lưu từ vựng này rồi.",
        "VOCAB_QUOTA_EXCEEDED": "Bạn đã đạt giới hạn từ vựng.",
        "TAG_NOT_FOUND": "Không tìm thấy bộ từ vựng.",
        "TAG_ALREADY_EXISTS": "Bộ từ vựng này đã tồn tại.",
        "RATE_LIMIT_EXCEEDED": "Bạn thử quá nhiều lần. Vui lòng chậm lại.",
        "AI_QUOTA_EXCEEDED": "Hết lượt dùng AI. Vui lòng nâng cấp gói Pro.",
        "AUTHZ_INSUFFICIENT_PERMISSIONS": "Bạn không có quyền thực hiện. Vui lòng nâng cấp Pro."
    },
    'ja.json': {
        "GENERIC_ERROR": "不明なエラーが発生しました。後でもう一度お試しください。",
        "INTERNAL_SERVER_ERROR": "サーバー内部エラーが発生しました。",
        "VALIDATION_FAILED": "入力内容を確認してください。",
        "UNAUTHORIZED": "続行するにはログインしてください。",
        "RESOURCE_NOT_FOUND": "リクエストされたリソースが見つかりませんでした。",
        "AUTH_INVALID_CREDENTIALS": "メールアドレスまたはパスワードが間違っています。",
        "AUTH_EMAIL_ALREADY_EXISTS": "このメールはすでに登録されています。",
        "AUTH_EMAIL_NOT_VERIFIED": "メールアドレスを確認してください。",
        "AUTH_ACCOUNT_LOCKED": "アカウントはロックされました。",
        "AUTH_ACCOUNT_DISABLED": "アカウントは無効になっています。",
        "AUTH_SOCIAL_LOGIN_CONFLICT": "リンクされたソーシャルアカウントでログインしてください。",
        "AUTH_INVALID_TOKEN": "セッションが無効です。",
        "AUTH_TOKEN_EXPIRED": "セッションの有効期限が切れました。",
        "AUTH_REFRESH_TOKEN_INVALID": "セッションを更新できませんでした。",
        "AUTH_GOOGLE_TOKEN_INVALID": "Googleログインに失敗しました。",
        "AUTH_PASSWORD_TOO_WEAK": "より強力なパスワードを選択してください。",
        "AUTH_VERIFICATION_CODE_INVALID": "確認コードが間違っています。",
        "AUTH_VERIFICATION_CODE_EXPIRED": "確認コードの有効期限が切れました。",
        "AUTH_SESSION_EXPIRED": "セッションの有効期限が切れました。",
        "VOCAB_NOT_FOUND": "単語が見つかりませんでした。",
        "VOCAB_ALREADY_EXISTS": "この単語はすでに保存されています。",
        "VOCAB_QUOTA_EXCEEDED": "保存できる単語の制限に達しました。",
        "TAG_NOT_FOUND": "タグが見つかりませんでした。",
        "TAG_ALREADY_EXISTS": "このタグはすでに存在します。",
        "RATE_LIMIT_EXCEEDED": "リクエストが多すぎます。後でお試しください。",
        "AI_QUOTA_EXCEEDED": "AIの利用制限に達しました。Proにアップグレードしてください。",
        "AUTHZ_INSUFFICIENT_PERMISSIONS": "権限がありません。Proにアップグレードしてください。"
    },
    'zh.json': {
        "GENERIC_ERROR": "发生未知错误，请稍后再试。",
        "INTERNAL_SERVER_ERROR": "发生内部服务器错误。",
        "VALIDATION_FAILED": "请检查您的输入并重试。",
        "UNAUTHORIZED": "请登录以继续。",
        "RESOURCE_NOT_FOUND": "未找到请求的资源。",
        "AUTH_INVALID_CREDENTIALS": "电子邮件或密码不正确。",
        "AUTH_EMAIL_ALREADY_EXISTS": "此电子邮件已注册，请直接登录。",
        "AUTH_EMAIL_NOT_VERIFIED": "请验证您的电子邮件地址以继续。",
        "AUTH_ACCOUNT_LOCKED": "您的帐户由于登录失败次数过多而被锁定。",
        "AUTH_ACCOUNT_DISABLED": "您的帐户已被停用。",
        "AUTH_SOCIAL_LOGIN_CONFLICT": "请使用链接的社交帐户登录。",
        "AUTH_INVALID_TOKEN": "您的会话无效，请重新登录。",
        "AUTH_TOKEN_EXPIRED": "您的会话已过期，请重新登录。",
        "AUTH_REFRESH_TOKEN_INVALID": "无法刷新您的会话，请重新登录。",
        "AUTH_GOOGLE_TOKEN_INVALID": "Google登录失败，请重试。",
        "AUTH_PASSWORD_TOO_WEAK": "请选择一个较强的密码。",
        "AUTH_VERIFICATION_CODE_INVALID": "验证码不正确。",
        "AUTH_VERIFICATION_CODE_EXPIRED": "验证码已过期，请请求新的验证码。",
        "AUTH_SESSION_EXPIRED": "您的会话已过期。",
        "VOCAB_NOT_FOUND": "找不到词汇。",
        "VOCAB_ALREADY_EXISTS": "您已经保存了该单词。",
        "VOCAB_QUOTA_EXCEEDED": "您已达到单词数限制，请升级订阅。",
        "TAG_NOT_FOUND": "找不到指定的标签。",
        "TAG_ALREADY_EXISTS": "具有此名称的标签已存在。",
        "RATE_LIMIT_EXCEEDED": "请求太多，请稍后再试。",
        "AI_QUOTA_EXCEEDED": "AI使用额度已达上限。请升级至Pro版。",
        "AUTHZ_INSUFFICIENT_PERMISSIONS": "权限不足。请升级至Pro版。"
    }
}

base_dir = r"e:\lexivocab-ex\lexivocab-webapp\messages"

for filename, errors in langs.items():
    filepath = os.path.join(base_dir, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    data["errors"] = errors
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

print("Finished updating i18n JSON files.")
