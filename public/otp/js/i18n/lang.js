// 语言配置
const i18n = {
    'zh-CN': {
        title: '实时OTP验证器',
        userString1: '己方用户名',
        userString2: '对方用户名',
        userKey: '密钥',
        generateSecretBtn: '生成密钥',
        generateOTPBtn: '生成 OTP',
        generateQRBtn: '生成二维码',
        otpDisplay: '当前 OTP',
        secretGenerated: '验证码已生成',
        scanBtn: '开启扫描',
        closeScanBtn: '关闭扫描',
        scanReady: '准备扫描...',
        scanSuccess: '验证成功！扫描结果与 OTP 码匹配',
        scanFailure: '二维码不正确，请使用正确的 OTP 码',
        scanMoved: '二维码已移开，请重新对准摄像头',
        scanNotDetected: '未检测到二维码，请对准摄像头',
        scanCameraFailed: '启动相机失败，请检查权限设置',
        scanCameraAccess: '无法访问相机，请检查权限设置',
        scannerFailed: '启动扫描器失败',
        beijingTime: '（北京时间）',
        keyWithNames: '用密钥和用户名生成',
        keyOnly: '使用密钥生成',
        namesOnly: '使用用户名生成',
        inputKey: '输入 Base32 格式的密钥'
    },
    'en-US': {
        title: 'Real-time OTP Validator',
        userString1: 'Your Username',
        userString2: 'Target Username',
        userKey: 'Secret Key',
        generateSecretBtn: 'Generate Secret',
        generateOTPBtn: 'Generate OTP',
        generateQRBtn: 'Generate QR Code',
        otpDisplay: 'Current OTP',
        secretGenerated: 'Secret Generated',
        scanBtn: 'Start Scanning',
        closeScanBtn: 'Stop Scanning',
        scanReady: 'Ready to scan...',
        scanSuccess: 'Verification successful! Scan matches OTP code',
        scanFailure: 'Invalid QR code, please use the correct OTP code',
        scanMoved: 'QR code moved away, please realign with camera',
        scanNotDetected: 'No QR code detected, please align with camera',
        scanCameraFailed: 'Failed to start camera, please check permissions',
        scanCameraAccess: 'Cannot access camera, please check permissions',
        scannerFailed: 'Failed to start scanner',
        beijingTime: '(Beijing Time)',
        keyWithNames: 'Generate with Key and Names',
        keyOnly: 'Generate with Key',
        namesOnly: 'Generate with Names',
        inputKey: 'Enter Base32 format secret'
    }
};

// 获取当前语言或默认为中文
function getCurrentLang() {
    return localStorage.getItem('appLanguage') || 'zh-CN';
}

// 设置语言
function setLanguage(lang) {
    localStorage.setItem('appLanguage', lang);
    updatePageLanguage();
}

// 获取翻译
function t(key) {
    const lang = getCurrentLang();
    return i18n[lang][key] || key;
}

// 更新页面语言
function updatePageLanguage() {
    const lang = getCurrentLang();
    document.documentElement.lang = lang;
    
    // 更新页面标题
    document.title = t('title');
    
    // 更新页面内所有带有 data-i18n 属性的元素
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (element.tagName === 'INPUT' && element.getAttribute('placeholder')) {
            element.setAttribute('placeholder', t(key));
        } else {
            element.textContent = t(key);
        }
    });
}

// 导出
window.i18n = {
    t: t,
    setLanguage: setLanguage,
    getCurrentLang: getCurrentLang,
    updatePageLanguage: updatePageLanguage
}; 