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

// 加密消息
async function encryptMessage() {
    try {
        const publicKeyArmored = document.getElementById('publicKey').value;
        const textToEncrypt = document.getElementById('encryptText').value;

        if (!publicKeyArmored || !textToEncrypt) {
            alert('请填写公钥和要加密的文本！');
            return;
        }

        const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });
        
        const encrypted = await openpgp.encrypt({
            message: await openpgp.createMessage({ text: textToEncrypt }),
            encryptionKeys: publicKey
        });

        document.getElementById('encryptResult').value = encrypted;
    } catch (error) {
        alert('加密失败：' + error.message);
    }
}

// 解密消息
async function decryptMessage() {
    try {
        const privateKeyArmored = document.getElementById('privateKey').value;
        const passphrase = document.getElementById('passphrase').value;
        const encryptedText = document.getElementById('decryptText').value;

        if (!privateKeyArmored || !encryptedText) {
            alert('请填写私钥和要解密的文本！');
            return;
        }

        const privateKey = await openpgp.decryptKey({
            privateKey: await openpgp.readPrivateKey({ armoredKey: privateKeyArmored }),
            passphrase
        });

        const message = await openpgp.readMessage({
            armoredMessage: encryptedText
        });

        const { data: decrypted } = await openpgp.decrypt({
            message,
            decryptionKeys: privateKey
        });

        document.getElementById('decryptResult').value = decrypted;
    } catch (error) {
        alert('解密失败：' + error.message);
    }
}

// 生成密钥对
async function generateKeyPair() {
    try {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const passphrase = document.getElementById('genPassphrase').value;

        if (!name || !email || !passphrase) {
            alert('请填写完整信息！');
            return;
        }

        // 显示加载提示
        const generateButton = document.querySelector('#generate button');
        generateButton.disabled = true;
        generateButton.textContent = '正在生成密钥对...';

        const { privateKey, publicKey } = await openpgp.generateKey({
            type: 'rsa',
            rsaBits: 4096,
            userIDs: [{ name, email }],
            passphrase
        });

        document.getElementById('generatedPublicKey').value = publicKey;
        document.getElementById('generatedPrivateKey').value = privateKey;

        // 恢复按钮状态
        generateButton.disabled = false;
        generateButton.textContent = '生成密钥对';

        alert('密钥对生成成功！请使用下方的保存按钮将公钥和私钥保存到本地。');
    } catch (error) {
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