// OpenPGP 初始化函数
async function initOpenPGP() {
    console.log('开始初始化 OpenPGP');
    if (typeof openpgp === 'undefined') {
        console.error('OpenPGP 库未定义');
        throw new Error('OpenPGP.js 库未加载，请检查网络连接');
    }
    console.log('OpenPGP 库已加载');
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
const MAX_QR_BYTES = 2953; // 版本40，纠错级别M的最大字节数

// 计算字符串的字节长度
function getByteLength(str) {
    console.log('计算字节长度，输入字符串长度:', str?.length);
    const byteLength = new TextEncoder().encode(str).length;
    console.log('计算得到的字节长度:', byteLength);
    return byteLength;
}

// 在页面加载完成后检查库的状态
document.addEventListener('DOMContentLoaded', async () => {
    console.log('页面加载完成');
    console.log('QRCode 库状态:', typeof QRCode);
    console.log('OpenPGP 库状态:', typeof openpgp);
    try {
        await initOpenPGP();
        console.log('OpenPGP 初始化成功');
        
        // 添加文本输入监听
        const encryptText = document.getElementById('encryptText');
        if (encryptText) {
            encryptText.addEventListener('input', function() {
                const currentBytes = getByteLength(this.value);
                const remainingBytes = MAX_QR_BYTES - currentBytes;
                const charCounter = document.getElementById('charCount');
                
                charCounter.textContent = `${remainingBytes} 字节 (约 ${Math.floor(remainingBytes/3)} 个中文或 ${remainingBytes} 个英文)`;
                charCounter.style.color = remainingBytes < 0 ? 'red' : '';
            });
        }
    } catch (error) {
        console.error('初始化失败:', error);
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
            alert('请填写公钥和要加密的文本！');
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
        alert('加密失败：' + error.message);
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
            alert('请填写私钥和要解密的文本！');
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
        alert('解密失败：' + error.message);
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
            alert('请填写姓名和邮箱！');
            return;
        }

        // 显示加载提示
        const generateButton = document.querySelector('#generate button');
        generateButton.disabled = true;
        generateButton.textContent = '正在生成密钥对...';

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
        generateButton.textContent = '生成密钥对';

        alert('密钥对生成成功！' + (passphrase ? '请务必保存好私钥和密码。' : '请务必保存好私钥。'));
    } catch (error) {
        console.error('生成密钥对失败:', error);
        alert('生成密钥对失败：' + error.message);
        // 恢复按钮状态
        const generateButton = document.querySelector('#generate button');
        generateButton.disabled = false;
        generateButton.textContent = '生成密钥对';
    }
}

// 保存密钥到本地文件
function saveKey(type) {
    try {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        
        if (!name || !email) {
            alert('请确保已填写姓名和邮箱！');
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
            alert('没有可保存的密钥内容！');
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
        
        alert(`${type === 'public' ? '公钥' : '私钥'}已保存为：${filename}`);
    } catch (error) {
        alert('保存失败：' + error.message);
    }
}

// 复制文本功能
async function copyText(elementId) {
    try {
        const textarea = document.getElementById(elementId);
        const text = textarea.value;
        
        if (!text) {
            alert('没有可复制的内容！');
            return;
        }

        // 复制到剪贴板
        await navigator.clipboard.writeText(text);
        
        // 更新按钮状态
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = '已复制！';
        button.classList.add('success');
        
        // 2秒后恢复按钮状态
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('success');
        }, 2000);
        
    } catch (error) {
        alert('复制失败：' + error.message);
    }
}

// 生成二维码的函数
function generateQRCode(text, container) {
    console.log('开始生成二维码');
    // 使用 qrcode-generator 库
    const qr = qrcode(QR_VERSION, QR_ERROR_LEVEL);
    qr.addData(text);
    qr.make();
    
    // 生成 SVG
    const svgElement = qr.createSvgTag({
        cellSize: 4,
        margin: 4
    });
    
    container.innerHTML = svgElement;
    console.log('二维码生成完成');
    return container.querySelector('svg');
}

// 生成二维码
async function generateQR(sourceId) {
    console.log('开始生成二维码，sourceId:', sourceId);
    try {
        const text = document.getElementById(sourceId).value;
        console.log('获取到的文本长度:', text?.length);
        
        if (!text) {
            alert('没有可生成二维码的内容！');
            return;
        }
        
        const byteLength = getByteLength(text);
        console.log('文本字节长度:', byteLength);
        
        if (byteLength > MAX_QR_BYTES) {
            alert(`内容超过最大字节限制（${MAX_QR_BYTES}字节）！\n当前内容：${byteLength}字节`);
            return;
        }

        const qrContainer = document.getElementById('encryptQRCode');
        console.log('二维码容器:', qrContainer);
        qrContainer.innerHTML = '';

        // 生成二维码
        const svg = generateQRCode(text, qrContainer);
        
        // 创建下载链接
        const downloadLink = document.getElementById('qrDownload');
        // 将 SVG 转换为 Data URL
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
        downloadLink.href = URL.createObjectURL(svgBlob);
        downloadLink.download = 'qrcode.svg';
        downloadLink.style.display = 'block';

    } catch (error) {
        console.error('二维码生成详细错误:', error);
        console.error('错误堆栈:', error.stack);
        alert('生成二维码失败：' + error.message);
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
        alert('二维码扫描成功！');
    }, (errorMessage) => {
        // 保持静默，避免频繁报错
        console.log('扫描中...', errorMessage);
    })
    .catch(err => {
        console.error('扫描器初始化失败:', err);
        alert('初始化扫描器失败，请确保允许使用摄像头并使用 HTTPS 或本地服务器。');
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