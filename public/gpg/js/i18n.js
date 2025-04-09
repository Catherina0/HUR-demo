// i18n.js - 国际化支持文件

// 支持的语言
const SUPPORTED_LANGUAGES = ['zh-CN', 'en'];

// 默认语言
let currentLanguage = 'zh-CN';

// 翻译字典
const translations = {
    'zh-CN': {
        'title': 'GPG 加密解密工具',
        'generateTab': '生成密钥',
        'encryptTab': '加密',
        'decryptTab': '解密',
        'generateKeyPair': '生成密钥对',
        'name': '姓名',
        'email': '电子邮件',
        'passphrase': '设置私钥密码（可选）',
        'generateKeyBtn': '生成密钥对',
        'publicKey': '公钥：',
        'privateKey': '私钥：',
        'savePublicKey': '保存公钥到本地',
        'savePrivateKey': '保存私钥到本地',
        'enterPublicKey': '请输入收件人的公钥...',
        'enterTextToEncrypt': '请输入要加密的文本...',
        'remainingChars': '（如需生成二维码）剩余可加密字符数：',
        'encryptBtn': '加密',
        'encryptResult': '加密结果...',
        'copyResult': '复制结果',
        'generateQR': '生成二维码',
        'saveQR': '保存二维码',
        'enterPrivateKey': '请输入您的私钥...',
        'enterPassphrase': '输入私钥密码（如果有）',
        'enterTextToDecrypt': '请输入要解密的文本...',
        'scanQR': '扫描二维码',
        'decryptBtn': '解密',
        'decryptResult': '解密结果...',
        'bytes': '字节',
        'chinese': '个中文',
        'english': '个英文',
        'keyGenSuccess': '密钥对生成成功！',
        'savePrivateKeyReminder': '请务必保存好私钥和密码。',
        'savePrivateKeyReminderNoPass': '请务必保存好私钥。',
        'fillNameEmail': '请填写姓名和邮箱！',
        'fillPublicKeyAndText': '请填写公钥和要加密的文本！',
        'fillPrivateKeyAndText': '请填写私钥和要解密的文本！',
        'generating': '正在生成密钥对...',
        'noContent': '没有可复制的内容！',
        'copied': '已复制！',
        'noQRContent': '没有可生成二维码的内容！',
        'textTooLong': '文本长度超过限制！',
        'currentLength': '当前长度：',
        'maxLimit': '最大限制：',
        'reduceText': '请减少文本内容后重试。',
        'qrScanSuccess': '二维码扫描成功！',
        'scanInitFailed': '初始化扫描器失败，请确保允许使用摄像头并使用 HTTPS 或本地服务器。',
        'langSwitchLabel': '语言：',
        'keySaved': '{0}已保存为：{1}',
        'publicKeyText': '公钥',
        'privateKeyText': '私钥',
        'decryptFailed': '解密失败：',
        'encryptFailed': '加密失败：',
        'keyGenFailed': '生成密钥对失败：',
        'saveFailed': '保存失败：',
        'copyFailed': '复制失败：',
        'qrGenFailed': '生成二维码失败：',
        'about': '约',
        'or': '或'
    },
    'en': {
        'title': 'GPG Encryption Tool',
        'generateTab': 'Generate Keys',
        'encryptTab': 'Encrypt',
        'decryptTab': 'Decrypt',
        'generateKeyPair': 'Generate Key Pair',
        'name': 'Name',
        'email': 'Email',
        'passphrase': 'Set Private Key Passphrase (Optional)',
        'generateKeyBtn': 'Generate Key Pair',
        'publicKey': 'Public Key:',
        'privateKey': 'Private Key:',
        'savePublicKey': 'Save Public Key',
        'savePrivateKey': 'Save Private Key',
        'enterPublicKey': 'Enter recipient\'s public key...',
        'enterTextToEncrypt': 'Enter text to encrypt...',
        'remainingChars': '(For QR code) Remaining characters:',
        'encryptBtn': 'Encrypt',
        'encryptResult': 'Encryption result...',
        'copyResult': 'Copy Result',
        'generateQR': 'Generate QR Code',
        'saveQR': 'Save QR Code',
        'enterPrivateKey': 'Enter your private key...',
        'enterPassphrase': 'Enter passphrase (if any)',
        'enterTextToDecrypt': 'Enter text to decrypt...',
        'scanQR': 'Scan QR Code',
        'decryptBtn': 'Decrypt',
        'decryptResult': 'Decryption result...',
        'bytes': 'bytes',
        'chinese': 'Chinese chars',
        'english': 'English chars',
        'keyGenSuccess': 'Key pair generated successfully!',
        'savePrivateKeyReminder': 'Please save your private key and passphrase securely.',
        'savePrivateKeyReminderNoPass': 'Please save your private key securely.',
        'fillNameEmail': 'Please fill in your name and email!',
        'fillPublicKeyAndText': 'Please fill in the public key and text to encrypt!',
        'fillPrivateKeyAndText': 'Please fill in the private key and text to decrypt!',
        'generating': 'Generating key pair...',
        'noContent': 'No content to copy!',
        'copied': 'Copied!',
        'noQRContent': 'No content to generate QR code!',
        'textTooLong': 'Text length exceeds the limit!',
        'currentLength': 'Current length:',
        'maxLimit': 'Maximum limit:',
        'reduceText': 'Please reduce the text and try again.',
        'qrScanSuccess': 'QR code scanned successfully!',
        'scanInitFailed': 'Failed to initialize scanner. Make sure you allow camera access and use HTTPS or localhost.',
        'langSwitchLabel': 'Language:',
        'keySaved': '{0} saved as: {1}',
        'publicKeyText': 'Public key',
        'privateKeyText': 'Private key',
        'decryptFailed': 'Decryption failed:',
        'encryptFailed': 'Encryption failed:',
        'keyGenFailed': 'Failed to generate key pair:',
        'saveFailed': 'Save failed:',
        'copyFailed': 'Copy failed:',
        'qrGenFailed': 'Failed to generate QR code:',
        'about': 'about',
        'or': 'or'
    }
};

// 设置当前语言
function setLanguage(lang) {
    if (SUPPORTED_LANGUAGES.includes(lang)) {
        currentLanguage = lang;
        localStorage.setItem('gpg-tool-language', lang);
        translatePage();
        return true;
    }
    return false;
}

// 获取当前语言的翻译
function t(key, params = []) {
    let text = translations[currentLanguage][key] || key;
    
    // 替换参数 {0}, {1}, ...
    if (params.length > 0) {
        params.forEach((param, index) => {
            text = text.replace(`{${index}}`, param);
        });
    }
    
    return text;
}

// 翻译页面上的所有元素
function translatePage() {
    // 翻译标题
    document.title = t('title');
    document.querySelector('h1').textContent = t('title');
    
    // 翻译标签页按钮
    document.querySelector('[data-tab="generate"]').textContent = t('generateTab');
    document.querySelector('[data-tab="encrypt"]').textContent = t('encryptTab');
    document.querySelector('[data-tab="decrypt"]').textContent = t('decryptTab');
    
    // 翻译生成密钥标签页
    document.querySelector('#generate h2').textContent = t('generateKeyPair');
    document.querySelector('#name').placeholder = t('name');
    document.querySelector('#email').placeholder = t('email');
    document.querySelector('#genPassphrase').placeholder = t('passphrase');
    document.querySelector('#generate button').textContent = t('generateKeyBtn');
    document.querySelectorAll('#generate h3')[0].textContent = t('publicKey');
    document.querySelectorAll('#generate h3')[1].textContent = t('privateKey');
    document.querySelector('#generatedPublicKey').placeholder = t('publicKey');
    document.querySelector('#generatedPrivateKey').placeholder = t('privateKey');
    document.querySelector('button[onclick="saveKey(\'public\')"]').textContent = t('savePublicKey');
    document.querySelector('button[onclick="saveKey(\'private\')"]').textContent = t('savePrivateKey');
    
    // 翻译加密标签页
    document.querySelector('#encrypt h2').textContent = t('encryptTab');
    document.querySelector('#publicKey').placeholder = t('enterPublicKey');
    document.querySelector('#encryptText').placeholder = t('enterTextToEncrypt');
    document.querySelector('.char-counter').textContent = t('remainingChars') + ' ' + document.getElementById('charCount').textContent;
    document.querySelector('#encrypt button[onclick="encryptMessage()"]').textContent = t('encryptBtn');
    document.querySelector('#encryptResult').placeholder = t('encryptResult');
    document.querySelector('button[onclick="copyText(\'encryptResult\')"]').textContent = t('copyResult');
    document.querySelector('button[onclick="generateQR(\'encryptResult\')"]').textContent = t('generateQR');
    document.querySelector('#qrDownload button').textContent = t('saveQR');
    
    // 翻译解密标签页
    document.querySelector('#decrypt h2').textContent = t('decryptTab');
    document.querySelector('#privateKey').placeholder = t('enterPrivateKey');
    document.querySelector('#passphrase').placeholder = t('enterPassphrase');
    document.querySelector('#decryptText').placeholder = t('enterTextToDecrypt');
    document.querySelector('button[onclick="startQRScanner()"]').textContent = t('scanQR');
    document.querySelector('#decrypt button[onclick="decryptMessage()"]').textContent = t('decryptBtn');
    document.querySelector('#decryptResult').placeholder = t('decryptResult');
    document.querySelector('button[onclick="copyText(\'decryptResult\')"]').textContent = t('copyResult');
}

// 初始化语言
function initLanguage() {
    // 从本地存储中获取语言设置，如果没有则使用浏览器语言
    const savedLang = localStorage.getItem('gpg-tool-language');
    const browserLang = navigator.language;
    
    if (savedLang && SUPPORTED_LANGUAGES.includes(savedLang)) {
        currentLanguage = savedLang;
    } else if (SUPPORTED_LANGUAGES.includes(browserLang)) {
        currentLanguage = browserLang;
    } else if (browserLang.startsWith('zh')) {
        currentLanguage = 'zh-CN';
    } else {
        currentLanguage = 'en';
    }
    
    console.log('当前语言设置为:', currentLanguage);
}

// 导出函数
window.i18n = {
    t,
    setLanguage,
    getCurrentLanguage: () => currentLanguage,
    getSupportedLanguages: () => SUPPORTED_LANGUAGES,
    translatePage
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initLanguage();
}); 