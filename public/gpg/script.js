// OpenPGP 初始化函数
async function initOpenPGP() {
    console.log('开始初始化 OpenPGP');
    if (typeof openpgp === 'undefined') {
        console.error('OpenPGP 库未定义');
        throw new Error('OpenPGP.js 库未加载，请检查网络连接');
    }
    console.log('OpenPGP 库已加载');
}

// 语言切换函数
function changeLanguage(lang) {
    if (i18n.setLanguage(lang)) {
        // 设置下拉框值
        document.getElementById('language-select').value = lang;
        // 更新字符计数
        const encryptText = document.getElementById('encryptText');
        if (encryptText) {
            updateCharCount(encryptText.value);
        }
    }
}

// 切换标签页
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        // 移除所有活动状态
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
        
        // 设置当前标签为活动状态
        button.classList.add('active');
        const tabId = button.getAttribute('data-tab');
        document.getElementById(tabId).style.display = 'block';
    });
});

// 二维码配置
const QR_VERSION = 40;
const QR_ERROR_LEVEL = 'M';
const MAX_QR_BYTES = 2953;
// 加密后文本膨胀系数（约为原文本的 2 倍）
const ENCRYPTION_EXPANSION_FACTOR = 2.0;
// 考虑膨胀后的安全系数（37%）
const SAFE_CAPACITY_FACTOR = 0.37;

// 计算字符串的字节长度
function getByteLength(str) {
    return new TextEncoder().encode(str).length;
}

// 更新字符计数显示
function updateCharCount(inputText) {
    console.log('开始更新字符计数');
    const maxSafeBytes = Math.floor(MAX_QR_BYTES * SAFE_CAPACITY_FACTOR);
    console.log('最大安全字节数:', maxSafeBytes);  // 应该是约 1329
    
    const currentBytes = getByteLength(inputText);
    console.log('当前输入字节数:', currentBytes);
    
    const remainingBytes = maxSafeBytes - currentBytes;
    console.log('剩余可用字节数:', remainingBytes);
    
    const charCounter = document.getElementById('charCount');
    console.log('找到计数器元素:', charCounter);
    
    if (charCounter) {
        charCounter.textContent = `${remainingBytes} ${i18n.t('bytes')} ` +
            `(${i18n.t('about')} ${Math.floor(remainingBytes/3)} ${i18n.t('chinese')} ${i18n.t('or')} ${remainingBytes} ${i18n.t('english')})`;
        console.log('更新后的计数器文本:', charCounter.textContent);
        
        // 更新颜色
        charCounter.style.color = currentBytes > maxSafeBytes ? 'red' : '';
        console.log('计数器颜色已更新:', charCounter.style.color);
    } else {
        console.error('未找到计数器元素!');
    }
}

// 在页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('页面加载完成，初始化应用');
    
    // 初始化语言
    const currentLang = i18n.getCurrentLanguage();
    document.getElementById('language-select').value = currentLang;
    document.getElementById('lang-label').textContent = i18n.t('langSwitchLabel');
    i18n.translatePage();
    
    console.log('页面初始化完成，当前语言:', currentLang);
    
    // 初始化计数器
    const charCounter = document.getElementById('charCount');
    console.log('初始计数器元素:', charCounter);
    
    if (charCounter) {
        const initialBytes = Math.floor(MAX_QR_BYTES * SAFE_CAPACITY_FACTOR);
        charCounter.textContent = `${initialBytes} ${i18n.t('bytes')} ` +
            `(${i18n.t('about')} ${Math.floor(initialBytes/3)} ${i18n.t('chinese')} ${i18n.t('or')} ${initialBytes} ${i18n.t('english')})`;
        console.log('计数器初始化完成:', charCounter.textContent);
    } else {
        console.error('初始化时未找到计数器元素!');
    }
    
    // 添加输入监听
    const encryptText = document.getElementById('encryptText');
    if (encryptText) {
        console.log('找到输入框元素');
        encryptText.addEventListener('input', function() {
            console.log('输入框内容变化，触发更新');
            updateCharCount(this.value);
        });
    } else {
        console.error('未找到输入框元素!');
    }
});

// 加密消息
async function encryptMessage() {
    console.log('开始加密过程');
    try {
        await initOpenPGP();
        console.log('OpenPGP 初始化完成');
        
        const publicKeyArmored = document.getElementById('publicKey').value;
        const textToEncrypt = document.getElementById('encryptText').value;
        console.log('获取到待加密文本长度:', textToEncrypt?.length);

        if (!publicKeyArmored || !textToEncrypt) {
            alert(i18n.t('fillPublicKeyAndText'));
            return;
        }

        console.log('开始读取公钥');
        const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });
        console.log('公钥读取完成');
        
        console.log('开始加密过程');
        const encrypted = await openpgp.encrypt({
            message: await openpgp.createMessage({ text: textToEncrypt }),
            encryptionKeys: publicKey
        });
        console.log('加密完成');

        document.getElementById('encryptResult').value = encrypted;
        console.log('加密结果已设置到文本框');
    } catch (error) {
        console.error('加密过程错误:', error);
        console.error('错误堆栈:', error.stack);
        alert(i18n.t('encryptFailed') + error.message);
    }
}

// 解密消息
async function decryptMessage() {
    console.log('开始解密过程');
    try {
        await initOpenPGP();
        console.log('OpenPGP 初始化完成');
        
        const privateKeyArmored = document.getElementById('privateKey').value;
        const passphrase = document.getElementById('passphrase').value;
        const encryptedText = document.getElementById('decryptText').value;

        if (!privateKeyArmored || !encryptedText) {
            alert(i18n.t('fillPrivateKeyAndText'));
            return;
        }

        console.log('开始读取私钥');
        let privateKey;
        try {
            // 尝试不使用密码读取私钥
            privateKey = await openpgp.readPrivateKey({ armoredKey: privateKeyArmored });
            
            // 如果提供了密码，则尝试解密私钥
            if (passphrase) {
                privateKey = await openpgp.decryptKey({
                    privateKey,
                    passphrase
                });
            }
        } catch (error) {
            console.error('读取私钥失败:', error);
            // 如果提供了密码但解密失败，给出具体提示
            if (passphrase) {
                throw new Error('私钥密码错误或私钥格式不正确');
            } else {
                throw new Error('私钥格式不正确或该私钥需要密码');
            }
        }

        console.log('私钥读取完成');

        const message = await openpgp.readMessage({
            armoredMessage: encryptedText
        });

        console.log('开始解密消息');
        const { data: decrypted } = await openpgp.decrypt({
            message,
            decryptionKeys: privateKey
        });
        console.log('解密完成');

        document.getElementById('decryptResult').value = decrypted;
    } catch (error) {
        console.error('解密过程错误:', error);
        alert(i18n.t('decryptFailed') + error.message);
    }
}

// 生成密钥对
async function generateKeyPair() {
    console.log('开始生成密钥对');
    try {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const passphrase = document.getElementById('genPassphrase').value;

        if (!name || !email) {
            alert(i18n.t('fillNameEmail'));
            return;
        }

        // 显示加载提示
        const generateButton = document.querySelector('#generate button');
        generateButton.disabled = true;
        generateButton.textContent = i18n.t('generating');

        // 构建密钥生成选项
        const options = {
            type: 'rsa',
            rsaBits: 4096,
            userIDs: [{ name, email }]
        };

        // 仅在设置了密码时添加密码选项
        if (passphrase) {
            options.passphrase = passphrase;
        }

        const { privateKey, publicKey } = await openpgp.generateKey(options);

        document.getElementById('generatedPublicKey').value = publicKey;
        document.getElementById('generatedPrivateKey').value = privateKey;

        // 恢复按钮状态
        generateButton.disabled = false;
        generateButton.textContent = i18n.t('generateKeyBtn');

        alert(i18n.t('keyGenSuccess') + ' ' + 
              (passphrase ? i18n.t('savePrivateKeyReminder') : i18n.t('savePrivateKeyReminderNoPass')));
    } catch (error) {
        console.error('生成密钥对失败:', error);
        alert(i18n.t('keyGenFailed') + error.message);
        // 恢复按钮状态
        const generateButton = document.querySelector('#generate button');
        generateButton.disabled = false;
        generateButton.textContent = i18n.t('generateKeyBtn');
    }
}

// 保存密钥到本地文件
function saveKey(type) {
    try {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        
        if (!name || !email) {
            alert(i18n.t('fillNameEmail'));
            return;
        }

        let content, filename;
        const timestamp = new Date().toISOString().slice(0,10);
        
        if (type === 'public') {
            content = document.getElementById('generatedPublicKey').value;
            filename = `${name}_${email}_public_${timestamp}.asc`;
        } else {
            content = document.getElementById('generatedPrivateKey').value;
            filename = `${name}_${email}_private_${timestamp}.asc`;
        }

        if (!content) {
            alert(i18n.t('noContent'));
            return;
        }

        // 创建Blob对象
        const blob = new Blob([content], { type: 'text/plain' });
        
        // 创建下载链接
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        
        // 触发下载
        document.body.appendChild(a);
        a.click();
        
        // 清理
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        alert(i18n.t('keySaved', [
            type === 'public' ? i18n.t('publicKeyText') : i18n.t('privateKeyText'),
            filename
        ]));
    } catch (error) {
        alert(i18n.t('saveFailed') + error.message);
    }
}

// 复制文本功能
async function copyText(elementId) {
    try {
        const textarea = document.getElementById(elementId);
        const text = textarea.value;
        
        if (!text) {
            alert(i18n.t('noContent'));
            return;
        }

        // 复制到剪贴板
        await navigator.clipboard.writeText(text);
        
        // 更新按钮状态
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = i18n.t('copied');
        button.classList.add('success');
        
        // 2秒后恢复按钮状态
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('success');
        }, 2000);
        
    } catch (error) {
        alert(i18n.t('copyFailed') + error.message);
    }
}

// 生成二维码的函数
function generateQRCode(text, container) {
    console.log('开始生成二维码');
    try {
        // 检查 kjua 是否可用
        if (typeof kjua === 'undefined') {
            throw new Error('QRCode 库未正确加载');
        }
        
        console.log('生成二维码的文本长度:', text.length);
        
        // 清除容器内容
        container.innerHTML = '';
        
        // 使用 kjua 生成二维码
        const qrcode = kjua({
            text: text,
            size: 400,
            render: 'canvas',
            crisp: true,
            minVersion: 1,
            ecLevel: 'M',
            back: '#ffffff',
            fill: '#000000',
            quiet: 2,
            mode: 'plain'
        });

        // 添加到容器
        if (qrcode) {
            container.appendChild(qrcode);
            console.log('二维码已生成并添加到容器');
            return qrcode;
        } else {
            throw new Error('二维码生成失败');
        }
    } catch (error) {
        console.error('QRCode 生成错误:', error);
        throw error;
    }
}

// 生成二维码
async function generateQR(sourceId) {
    console.log('开始生成二维码，sourceId:', sourceId);
    try {
        const text = document.getElementById(sourceId).value;
        console.log('获取到的文本长度:', text?.length);
        
        if (!text) {
            alert(i18n.t('noQRContent'));
            return;
        }
        
        const byteLength = getByteLength(text);
        console.log('文本字节长度:', byteLength);
        
        if (byteLength > MAX_QR_BYTES) {
            alert(`${i18n.t('textTooLong')}\n` +
                  `${i18n.t('currentLength')} ${byteLength} ${i18n.t('bytes')}\n` +
                  `${i18n.t('maxLimit')} ${MAX_QR_BYTES} ${i18n.t('bytes')}\n` +
                  `${i18n.t('reduceText')}`);
            return;
        }

        const qrContainer = document.getElementById('encryptQRCode');
        console.log('二维码容器:', qrContainer);

        // 生成二维码
        const qrElement = generateQRCode(text, qrContainer);
        console.log('生成的二维码元素:', qrElement);
        
        // 创建下载链接
        if (qrElement) {
            const downloadLink = document.getElementById('qrDownload');
            downloadLink.href = qrElement.toDataURL('image/png');
            downloadLink.download = 'encrypted-qr.png';
            downloadLink.style.display = 'block';
            console.log('下载链接已创建');
        }

    } catch (error) {
        console.error('二维码生成详细错误:', error);
        console.error('错误堆栈:', error.stack);
        alert(i18n.t('qrGenFailed') + error.message);
    }
}

// 初始化二维码扫描器
let html5QrcodeScanner = null;

// 开始扫描二维码
function startQRScanner() {
    console.log('开始初始化扫描器');
    if (html5QrcodeScanner) {
        html5QrcodeScanner.clear();
    }

    const qrConfig = {
        fps: 10,
        qrbox: {
            width: 250,
            height: 250
        },
        aspectRatio: 1.0,
        formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE
        ],
        // 支持所有可能的格式
        experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
        },
        rememberLastUsedCamera: true,
        showTorchButtonIfSupported: true
    };

    html5QrcodeScanner = new Html5QrcodeScanner(
        "qrReader",
        qrConfig,
        /* verbose= */ false
    );

    html5QrcodeScanner.render((decodedText) => {
        // 扫描成功回调
        console.log('二维码扫描成功:', decodedText);
        document.getElementById('decryptText').value = decodedText;
        html5QrcodeScanner.clear();
        alert(i18n.t('qrScanSuccess'));
    }, (errorMessage) => {
        // 保持静默，避免频繁报错
        console.log('扫描中...', errorMessage);
    })
    .catch(err => {
        console.error('扫描器初始化失败:', err);
        alert(i18n.t('scanInitFailed'));
    });
}

// 在切换标签页时清理扫描器
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        if (html5QrcodeScanner) {
            html5QrcodeScanner.clear();
        }
    });
});

// 在页面加载完成后检查库是否正确加载
document.addEventListener('DOMContentLoaded', () => {
    console.log('检查库加载状态:');
    console.log('QRCode:', typeof QRCode);
    console.log('openpgp:', typeof openpgp);
    console.log('Html5QrcodeScanner:', typeof Html5QrcodeScanner);
});