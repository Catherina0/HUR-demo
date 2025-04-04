class OTPValidator {
    constructor() {
        console.log('初始化 OTPValidator');
        try {
            // 先初始化元素
            if (!this.initializeElements()) {
                throw new Error('元素初始化失败');
            }
            // 如果元素初始化成功，再绑定事件
            this.bindEvents();
            this.initializeScanner();
            this.startOTPUpdateTimer();
        } catch (error) {
            console.error('构造函数执行出错:', error);
            throw error; // 向上传递错误
        }
    }

    initializeElements() {
        try {
            // 获取所有必需的元素
            const requiredElements = {
                secretKeyInput: 'secretKey',
                generateOTPBtn: 'generateOTP',
                generateQRBtn: 'generateQR',
                otpCodeSpan: 'otpCode',
                qrCanvas: 'qrCanvas',
                generateRawSecretBtn: 'generateRawSecret',
                rawSecretDisplay: 'rawSecretDisplay',
                rawSecretSpan: 'rawSecret',
                copyRawSecretBtn: 'copyRawSecret',
                userString1Input: 'userString1',
                userString2Input: 'userString2',
                userKeyInput: 'userKey'
            };

            // 检查每个元素
            let allElementsFound = true;
            Object.entries(requiredElements).forEach(([prop, id]) => {
                this[prop] = document.getElementById(id);
                if (!this[prop]) {
                    console.error(`未找到元素: ${id}`);
                    allElementsFound = false;
                } else {
                    console.log(`成功获取元素: ${id}`);
                }
            });

            if (!allElementsFound) {
                console.error('一个或多个必需元素未找到');
                return false;
            }

            console.log('所有元素初始化成功');
            return true;

        } catch (error) {
            console.error('初始化元素时出错:', error);
            return false;
        }
    }

    bindEvents() {
        try {
            console.log('开始绑定事件');
            
            // 验证所有必需的元素都存在
            const requiredButtons = {
                'generateRawSecret': this.generateRawSecretBtn,
                'copyRawSecret': this.copyRawSecretBtn,
                'generateOTP': this.generateOTPBtn,
                'generateQR': this.generateQRBtn
            };

            // 检查所有按钮是否存在
            Object.entries(requiredButtons).forEach(([name, button]) => {
                if (!button) {
                    throw new Error(`缺少必需的按钮元素: ${name}`);
                }
            });
            
            // 绑定用户输入框变化事件
            if (this.userString1Input && this.userString2Input && this.userKeyInput) {
                const handleUserInputChange = () => {
                    // 检查是否有任何输入
                    const hasString1 = this.userString1Input.value.trim() !== '';
                    const hasString2 = this.userString2Input.value.trim() !== '';
                    const hasUserKey = this.userKeyInput.value.trim() !== '';
                    
                    // 如果至少有一个输入，更新按钮样式
                    if (hasString1 || hasString2 || hasUserKey) {
                        this.generateRawSecretBtn.textContent = '使用输入生成密钥';
                        this.generateRawSecretBtn.classList.add('ready');
                    } else {
                        this.generateRawSecretBtn.textContent = '生成原始密钥';
                        this.generateRawSecretBtn.classList.remove('ready');
                    }
                };
                
                this.userString1Input.addEventListener('input', handleUserInputChange);
                this.userString2Input.addEventListener('input', handleUserInputChange);
                this.userKeyInput.addEventListener('input', handleUserInputChange);
                console.log('成功绑定用户输入变化事件');
            }

            // 绑定原始密钥生成按钮
            this.generateRawSecretBtn.addEventListener('click', () => {
                console.log('点击生成原始密钥按钮');
                this.generateRawSecret();
            });
            console.log('成功绑定原始密钥生成按钮');

            // 绑定复制按钮
            this.copyRawSecretBtn.addEventListener('click', () => {
                console.log('点击复制原始密钥按钮');
                this.copyToClipboard(this.rawSecretSpan.textContent, this.copyRawSecretBtn);
            });
            console.log('成功绑定复制按钮');

            // 绑定 OTP 生成按钮
            this.generateOTPBtn.addEventListener('click', () => {
                console.log('点击生成 OTP 按钮');
                this.generateOTP();
            });
            console.log('成功绑定 OTP 生成按钮');

            // 绑定二维码生成按钮
            if (this.generateQRBtn) {
                this.generateQRBtn.addEventListener('click', () => {
                    console.log('点击生成二维码按钮');
                    // 先生成新的 OTP，然后生成二维码
                    this.generateOTP();
                    this.generateQRCode();
                });
                console.log('成功绑定二维码生成按钮');
            }

            console.log('所有事件绑定完成');
            return true;
        } catch (error) {
            console.error('绑定事件时出错:', error);
            throw error; // 向上传递错误
        }
    }

    copyToClipboard(text, button) {
        console.log('尝试复制文本:', text);
        if (!text) {
            console.error('没有要复制的文本');
            return;
        }

        navigator.clipboard.writeText(text).then(() => {
            console.log('复制成功');
            const originalText = button.textContent;
            button.textContent = '已复制！';
            setTimeout(() => {
                button.textContent = originalText;
                console.log('复制按钮文字已重置');
            }, 2000);
        }).catch(err => {
            console.error('复制失败:', err);
            alert('复制失败，请手动复制');
        });
    }

    generateSecret() {
        try {
            console.log('开始生成新的 OTP 密钥');
            
            // 生成 20 字节（160 位）的随机数据
            const randomBytes = new Uint8Array(20);
            window.crypto.getRandomValues(randomBytes);
            console.log('生成的随机字节:', randomBytes);

            // 将字节数组转换为 Base32
            const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
            let bits = '';
            let secret = '';

            // 将字节转换为二进制字符串
            randomBytes.forEach(byte => {
                bits += byte.toString(2).padStart(8, '0');
            });
            console.log('二进制字符串:', bits);

            // 每5位转换为一个Base32字符
            for (let i = 0; i + 5 <= bits.length; i += 5) {
                const chunk = bits.substr(i, 5);
                const index = parseInt(chunk, 2);
                secret += base32Chars[index];
                console.log(`转换二进制 ${chunk} 为字符 ${base32Chars[index]}`);
            }

            // 格式化密钥（每4个字符加空格）
            const formattedSecret = secret.match(/.{1,4}/g).join(' ');
            console.log('原始密钥:', secret);
            console.log('格式化后的密钥:', formattedSecret);
            
            // 更新显示
            this.secretDisplay.style.display = 'block';
            this.generatedSecret.textContent = formattedSecret;
            this.secretKeyInput.value = secret; // 注意这里使用未格式化的密钥
            
            console.log('密钥显示已更新');
            
            // 自动生成 OTP 和二维码
            console.log('开始生成 OTP 和二维码');
            this.generateOTPAndQR();
            
            return secret; // 返回未格式化的密钥
        } catch (error) {
            console.error('生成密钥时出错:', error);
            return null;
        }
    }

    generateOTPAndQR() {
        try {
            console.log('执行 generateOTPAndQR');
            console.log('当前密钥:', this.secretKeyInput.value);
            
            this.generateOTP();
            this.generateQRCode();
        } catch (error) {
            console.error('生成 OTP 和二维码时出错:', error);
        }
    }

    // 修改现有的 generateOTP 方法，添加更多日志
    generateOTP() {
        try {
            const secret = this.secretKeyInput.value;
            console.log('generateOTP - 使用的密钥:', secret);
            
            if (!secret) {
                console.error('generateOTP - 密钥为空');
                alert('请输入密钥！');
                return;
            }

            // 确保密钥长度为偶数
            let processedSecret = secret.replace(/\s/g, ''); // 移除所有空格
            if (processedSecret.length % 2 !== 0) {
                processedSecret = '0' + processedSecret;
                console.log('调整后的密钥:', processedSecret);
            }

            // 验证十六进制字符串
            if (!/^[0-9a-fA-F]+$/.test(processedSecret)) {
                console.error('密钥包含非十六进制字符');
                alert('密钥必须是十六进制字符（0-9, A-F）');
                return;
            }

            // 获取当前时间并向下取整到最近的10秒
            const currentTime = this.getCurrentTime();
            const epoch = Math.floor(currentTime / 1000);
            const timeBase = Math.floor(epoch / 10) * 10;
            const time = Math.floor(timeBase / 10);
            const timeHex = this.dec2hex(time);
            
            console.log('当前精确时间:', currentTime);
            console.log('当前时间戳:', epoch);
            console.log('校准后的时间戳:', timeBase);
            console.log('时间计数器:', time);
            console.log('十六进制时间:', timeHex);
            console.log('处理后的密钥:', processedSecret);

            try {
                // 使用 HMAC-SHA1 计算
                const shaObj = new jsSHA("SHA-1", "HEX");
                shaObj.setHMACKey(processedSecret, "HEX");
                shaObj.update(timeHex);
                const hmac = shaObj.getHMAC("HEX");
                console.log('HMAC 结果:', hmac);
                
                const offset = parseInt(hmac.substring(hmac.length - 1), 16);
                const otp = (parseInt(hmac.substr(offset * 2, 8), 16) & 0x7fffffff) % 1000000;
                
                this.otpCodeSpan.textContent = otp.toString().padStart(6, '0');
                console.log('生成的 OTP:', this.otpCodeSpan.textContent);

                // 自动更新二维码
                this.generateQRCode();
                
            } catch (error) {
                console.error('OTP 计算错误:', error);
                throw error;
            }
        } catch (error) {
            console.error('generateOTP 执行出错:', error);
        }
    }

    // 修改现有的 generateQRCode 方法，添加更多日志
    generateQRCode() {
        try {
            if (typeof QRCode === 'undefined') {
                console.error('QRCode 库未加载');
                throw new Error('QRCode 库未加载，请确保已引入 qrcode.min.js');
            }

            const otp = this.otpCodeSpan.textContent;
            console.log('generateQRCode - 使用的 OTP:', otp);
            
            if (!otp) {
                console.error('generateQRCode - OTP 为空');
                return;
            }

            // 检查 canvas 元素
            if (!this.qrCanvas) {
                console.error('找不到 QR 码 canvas 元素');
                return;
            }

            console.log('正在生成二维码，OTP:', otp);

            try {
                // 清除旧的内容
                this.qrCanvas.innerHTML = '';
                
                // 创建临时容器
                const tempDiv = document.createElement('div');
                tempDiv.style.display = 'none';
                document.body.appendChild(tempDiv);

                // 在临时容器中创建二维码
                const qrcode = new QRCode(tempDiv, {
                    text: otp,
                    width: 256,
                    height: 256,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.H
                });

                // 等待二维码生成完成
                setTimeout(() => {
                    try {
                        // 获取生成的图片
                        const qrImage = tempDiv.querySelector('img');
                        if (qrImage) {
                            console.log('二维码图片已生成，正在转移到目标容器');
                            
                            // 清除 canvas 中的旧内容
                            while (this.qrCanvas.firstChild) {
                                this.qrCanvas.removeChild(this.qrCanvas.firstChild);
                            }
                            
                            // 将图片添加到目标容器
                            this.qrCanvas.appendChild(qrImage);
                            
                            // 设置图片样式
                            qrImage.style.display = 'block';
                            qrImage.style.margin = 'auto';
                            qrImage.style.maxWidth = '100%';
                            
                            console.log('二维码显示完成');
                        } else {
                            console.error('未找到生成的二维码图片');
                        }
                        
                        // 清理临时容器
                        document.body.removeChild(tempDiv);
                    } catch (error) {
                        console.error('处理二维码图片时出错:', error);
                    }
                }, 100);

                console.log('二维码生成过程启动');
            } catch (error) {
                console.error('二维码生成失败:', error);
                console.error(error);
            }
        } catch (error) {
            console.error('generateQRCode 执行出错:', error);
        }
    }

    initializeScanner() {
        try {
            console.log('初始化扫描器');
            
            if (typeof Html5Qrcode === 'undefined') {
                console.error('Html5Qrcode 库未加载');
                return;
            }

            // 创建 HTML 结构
            const scannerSection = document.querySelector('.scanner-section');
            if (!scannerSection) {
                console.error('找不到扫描器容器');
                return;
            }

            // 添加扫描按钮
            const scanButton = document.createElement('button');
            scanButton.textContent = '开启扫描';
            scanButton.id = 'scanButton';
            scanButton.className = 'scan-button';
            scannerSection.insertBefore(scanButton, scannerSection.firstChild);

            // 创建扫描器实例
            this.html5QrCode = new Html5Qrcode("reader", { 
                verbose: true,
                experimentalFeatures: {
                    useBarCodeDetectorIfSupported: false
                }
            });

            // 记录扫描状态
            this.isScanning = false;
            this.lastResult = null;
            this.lastScanTime = null;
            this.scanStatusTimer = null;

            // 绑定扫描按钮事件
            scanButton.addEventListener('click', async () => {
                if (!this.isScanning) {
                    console.log('开始扫描');
                    await this.startScanning();
                } else {
                    console.log('停止扫描');
                    await this.stopScanning();
                }
            });

            console.log('扫描器初始化完成');
        } catch (error) {
            console.error('初始化扫描器时出错:', error);
        }
    }

    async startScanning() {
        try {
            console.log('开始扫描');
            if (!this.html5QrCode) {
                console.error('扫描器未初始化');
                return;
            }

            // 更改按钮状态
            const scanButton = document.getElementById('scanButton');
            if (scanButton) {
                scanButton.textContent = '关闭扫描';
                scanButton.classList.add('scanning');
            }

            // 显示扫描器
            const reader = document.getElementById('reader');
            if (reader) {
                reader.style.display = 'block';
            }

            // 创建或重置扫描结果显示
            let scanResult = document.getElementById('scanResult');
            if (!scanResult) {
                scanResult = document.createElement('div');
                scanResult.id = 'scanResult';
                scanResult.className = 'scan-result';
                document.querySelector('.scanner-section').appendChild(scanResult);
            }
            scanResult.textContent = '准备扫描...';
            scanResult.style.color = '#666';

            try {
                Html5Qrcode.getCameras().then(devices => {
                    if (devices && devices.length) {
                        const cameraId = devices[0].id;
                        console.log('使用相机:', cameraId);

                        // 启动频繁状态检查（每200毫秒）
                        this.scanStatusTimer = setInterval(this.checkScanStatus.bind(this), 200);

                        this.html5QrCode.start(
                            cameraId,
                            {
                                fps: 10,
                                aspectRatio: 1,
                                disableFlip: false,
                            },
                            (decodedText, decodedResult) => {
                                console.log('扫描结果:', decodedText);
                                this.lastResult = decodedText;
                                this.lastScanTime = Date.now();
                                this.handleScanResult(decodedText);
                            },
                            (errorMessage) => {
                                // 仅记录错误，状态更新由checkScanStatus处理
                                console.log('扫描错误或未检测到:', errorMessage);
                            }
                        ).catch(err => {
                            console.error('启动扫描器失败:', err);
                            scanResult.textContent = '启动相机失败，请检查权限设置';
                            scanResult.style.color = '#f44336';
                            scanResult.className = 'scan-result error';
                        });
                        
                        this.isScanning = true;
                        console.log('扫描器启动成功');
                    } else {
                        throw new Error('未找到可用的相机设备');
                    }
                }).catch(err => {
                    console.error('获取相机失败:', err);
                    scanResult.textContent = '无法访问相机，请检查权限设置';
                    scanResult.style.color = '#f44336';
                    scanResult.className = 'scan-result error';
                    this.resetScannerState();
                });
            } catch (error) {
                console.error('启动扫描器时出错:', error);
                this.resetScannerState();
                
                if (scanResult) {
                    scanResult.textContent = '启动扫描器失败: ' + error.message;
                    scanResult.style.color = '#f44336';
                    scanResult.className = 'scan-result error';
                }
            }
        } catch (error) {
            console.error('开始扫描时出错:', error);
            this.resetScannerState();
        }
    }

    async stopScanning() {
        try {
            console.log('停止扫描');
            if (this.html5QrCode) {
                await this.html5QrCode.stop();
                console.log('扫描器已停止');
                
                // 清除状态刷新定时器
                if (this.scanStatusTimer) {
                    clearInterval(this.scanStatusTimer);
                    this.scanStatusTimer = null;
                }
                
                // 隐藏扫描器
                const reader = document.getElementById('reader');
                if (reader) {
                    reader.style.display = 'none';
                }
            }
            this.isScanning = false;
            this.resetScannerState();
        } catch (error) {
            console.error('停止扫描时出错:', error);
        }
    }

    resetScannerState() {
        // 重置按钮状态
        const scanButton = document.getElementById('scanButton');
        if (scanButton) {
            scanButton.textContent = '开启扫描';
            scanButton.classList.remove('scanning');
        }
        
        // 清除扫描结果
        const scanResult = document.getElementById('scanResult');
        if (scanResult) {
            scanResult.textContent = '';
        }
        
        // 重置内部状态
        this.isScanning = false;
        this.lastResult = null;
        this.lastScanTime = null;
        this.lastScanSuccess = false;
        
        // 清除定时器
        if (this.scanStatusTimer) {
            clearInterval(this.scanStatusTimer);
            this.scanStatusTimer = null;
        }
    }

    handleScanResult(result) {
        try {
            console.log('处理扫描结果:', result);
            const scanResult = document.getElementById('scanResult');
            
            // 获取当前 OTP 码
            const currentOTP = this.otpCodeSpan.textContent;
            
            // 获取当前时间周期信息
            const currentTime = this.getCurrentTime();
            const secondsInPeriod = Math.floor((currentTime / 1000) % 10);
            
            // 验证扫描结果是否与当前 OTP 匹配
            if (result === currentOTP) {
                if (scanResult) {
                    scanResult.textContent = '验证成功！扫描结果与 OTP 码匹配';
                    scanResult.style.color = '#4CAF50';
                    scanResult.className = 'scan-result success';
                }
                this.lastScanSuccess = true;
                this.lastScanTime = Date.now();
                
                // 成功后设置更频繁的检查间隔（500毫秒）
                if (this.scanStatusTimer) {
                    clearInterval(this.scanStatusTimer);
                    this.scanStatusTimer = setInterval(this.checkScanStatus.bind(this), 500);
                }
            } else {
                // 如果在更新前1秒或更新后1秒内，且上次扫描是成功的
                if (this.lastScanSuccess && (secondsInPeriod >= 9 || secondsInPeriod <= 0)) {
                    // 保持成功状态
                    if (scanResult) {
                        scanResult.textContent = '验证成功！扫描结果与 OTP 码匹配';
                        scanResult.style.color = '#4CAF50';
                        scanResult.className = 'scan-result success';
                    }
                } else {
                    // 不在容差时间内，显示二维码不正确
                    if (scanResult) {
                        scanResult.textContent = '二维码不正确，请使用正确的 OTP 码';
                        scanResult.style.color = '#f44336';
                        scanResult.className = 'scan-result error';
                    }
                    this.lastScanSuccess = false;
                    
                    // 设置更频繁的检查（200毫秒）
                    if (this.scanStatusTimer) {
                        clearInterval(this.scanStatusTimer);
                        this.scanStatusTimer = setInterval(this.checkScanStatus.bind(this), 200);
                    }
                }
            }
            
        } catch (error) {
            console.error('处理扫描结果时出错:', error);
            this.lastScanSuccess = false;
        }
    }

    checkScanStatus() {
        try {
            const now = Date.now();
            const scanResult = document.getElementById('scanResult');
            
            // 如果上次扫描是成功的，检查是否需要更新状态
            if (this.lastScanSuccess && this.lastScanTime) {
                const timeSinceLastScan = now - this.lastScanTime;
                const currentTime = this.getCurrentTime();
                const secondsInPeriod = Math.floor((currentTime / 1000) % 10);
                
                // 如果已经超过2秒没有新的成功扫描，或者不在容差时间窗口内
                if (timeSinceLastScan > 1000 && !(secondsInPeriod >= 9 || secondsInPeriod <= 0)) {
                    // 更新为"未检测到"状态
                    if (scanResult) {
                        scanResult.textContent = '二维码已移开，请重新对准摄像头';
                        scanResult.style.color = '#f44336';
                        scanResult.className = 'scan-result warning';
                    }
                    this.lastScanSuccess = false;
                }
            } 
            // 如果上次扫描不成功或没有扫描记录
            else {
                // 如果超过200毫秒没有新扫描结果，显示未检测到
                if (!this.lastScanTime || (now - this.lastScanTime > 200)) {
                    if (scanResult) {
                        scanResult.textContent = '未检测到二维码，请对准摄像头';
                        scanResult.style.color = '#f44336';
                        scanResult.className = 'scan-result error';
                    }
                }
            }
        } catch (error) {
            console.error('检查扫描状态时出错:', error);
        }
    }

    // 添加新方法：检查是否在敏感时间窗口内
    isInSensitiveTimeWindow() {
        const now = new Date();
        const secondsInPeriod = now.getSeconds() % 10;  // 在 10 秒周期内的秒数
        
        // 如果在周期的最后 1 秒或开始 1 秒内
        return secondsInPeriod >= 9 || secondsInPeriod < 1;
    }

    // 辅助方法
    dec2hex(s) {
        let hex = Math.round(s).toString(16);
        // 确保长度为偶数
        if (hex.length % 2 !== 0) {
            hex = '0' + hex;
        }
        console.log('转换十进制到十六进制:', s, '->', hex);
        return hex;
    }

    isBase64(str) {
        try {
            return btoa(atob(str)) === str;
        } catch (err) {
            return false;
        }
    }

    base64ToBase32(base64) {
        // Base64 解码为字节数组
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        
        // 转换为二进制字符串
        let bits = '';
        bytes.forEach(byte => {
            bits += byte.toString(2).padStart(8, '0');
        });
        
        // 每5位转换为Base32字符
        const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let base32 = '';
        for (let i = 0; i + 5 <= bits.length; i += 5) {
            const chunk = bits.substr(i, 5);
            base32 += base32chars[parseInt(chunk, 2)];
        }
        
        console.log('Base64 转 Base32 结果:', base32);
        return base32;
    }

    base32ToHex(base32) {
        const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let bits = '';
        let hex = '';

        // 验证输入
        const invalidChars = base32.split('').filter(char => !base32chars.includes(char.toUpperCase()));
        if (invalidChars.length > 0) {
            console.error('发现无效字符:', invalidChars);
            throw new Error('密钥包含无效字符');
        }

        for (let i = 0; i < base32.length; i++) {
            const val = base32chars.indexOf(base32.charAt(i).toUpperCase());
            if (val === -1) continue;
            bits += val.toString(2).padStart(5, '0');
        }

        for (let i = 0; i + 4 <= bits.length; i += 4) {
            const chunk = bits.substr(i, 4);
            hex = hex + parseInt(chunk, 2).toString(16);
        }

        console.log('Base32 转十六进制结果:', hex);
        return hex;
    }

    generateRawSecret() {
        try {
            console.log('开始生成原始密钥');
            
            // 获取用户输入的字符串
            const userString1 = this.userString1Input.value || '';
            const userString2 = this.userString2Input.value || '';
            const userKey = this.userKeyInput.value || '';
            console.log('己方用户名:', userString1);
            console.log('对方用户名:', userString2);
            console.log('自定义密钥:', userKey);
            
            // 将用户输入的字符串转换为字节数组
            const encoder = new TextEncoder();
            
            // 使用Uint8Array合并所有输入
            let combinedInput = new Uint8Array(0);
            
            // 如果有自定义密钥，优先添加它
            if (userKey) {
                // 使用SHA-1哈希自定义密钥，确保它提供一个良好的熵源
                try {
                    const shaObj = new jsSHA("SHA-1", "TEXT");
                    shaObj.update(userKey);
                    const keyHash = shaObj.getHash("HEX");
                    console.log('自定义密钥哈希:', keyHash);
                    
                    // 将哈希转换为字节数组
                    const keyHashBytes = new Uint8Array(keyHash.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
                    console.log('自定义密钥哈希字节:', Array.from(keyHashBytes));
                    
                    // 合并到输入中
                    combinedInput = this.concatUint8Arrays(combinedInput, keyHashBytes);
                } catch (error) {
                    console.error('处理自定义密钥时出错:', error);
                    // 退回到原始输入
                    const userKeyBytes = encoder.encode(userKey);
                    combinedInput = this.concatUint8Arrays(combinedInput, userKeyBytes);
                }
            }
            
            // 处理用户名 - 改为顺序无关的方式
            if (userString1 || userString2) {
                try {
                    // 方法1：对两个用户名进行排序，确保相同的两个用户名总是以相同的顺序处理
                    let names = [userString1, userString2].filter(name => name); // 过滤空字符串
                    if (names.length > 0) {
                        // 按字母顺序排序用户名
                        names.sort();
                        console.log('排序后的用户名:', names);
                        
                        // 对每个用户名分别计算哈希，然后合并哈希结果
                        for (const name of names) {
                            const shaObj = new jsSHA("SHA-1", "TEXT");
                            shaObj.update(name);
                            const nameHash = shaObj.getHash("HEX");
                            console.log(`用户名 "${name}" 的哈希:`, nameHash);
                            
                            // 将哈希转换为字节数组
                            const nameHashBytes = new Uint8Array(nameHash.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
                            
                            // 使用异或(XOR)操作合并哈希，确保顺序无关
                            if (combinedInput.length === 0) {
                                combinedInput = nameHashBytes;
                            } else {
                                // 使用异或操作合并哈希
                                for (let i = 0; i < Math.min(combinedInput.length, nameHashBytes.length); i++) {
                                    combinedInput[i] ^= nameHashBytes[i]; 
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error('处理用户名时出错:', error);
                    // 回退到简单合并方式
                    const userBytes1 = encoder.encode(userString1);
                    const userBytes2 = encoder.encode(userString2);
                    
                    if (userString1) {
                        combinedInput = this.concatUint8Arrays(combinedInput, userBytes1);
                    }
                    if (userString2) {
                        combinedInput = this.concatUint8Arrays(combinedInput, userBytes2);
                    }
                }
            }
            
            console.log('合并的输入字节:', Array.from(combinedInput));
            
            // 如果没有任何输入，生成纯随机密钥
            let finalBytes;
            if (combinedInput.length === 0) {
                // 生成 20 字节（160 位）的随机数据
                finalBytes = new Uint8Array(20);
                window.crypto.getRandomValues(finalBytes);
                console.log('生成的完全随机字节:', Array.from(finalBytes));
            } else {
                // 使用SHA-1哈希合并的输入生成最终密钥
                try {
                    // 使用jsSHA库
                    const inputHex = Array.from(combinedInput)
                        .map(byte => byte.toString(16).padStart(2, '0'))
                        .join('');
                    
                    const shaObj = new jsSHA("SHA-1", "HEX");
                    shaObj.update(inputHex);
                    const hash = shaObj.getHash("HEX");
                    console.log('最终密钥哈希:', hash);
                    
                    // 将哈希转换为字节数组
                    finalBytes = new Uint8Array(hash.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
                } catch (error) {
                    console.error('生成最终密钥哈希时出错:', error);
                    
                    // 失败时使用备用方法
                    finalBytes = new Uint8Array(20);
                    
                    // 复制合并的输入，但不超过20字节
                    const bytesToCopy = Math.min(combinedInput.length, 20);
                    for (let i = 0; i < bytesToCopy; i++) {
                        finalBytes[i] = combinedInput[i];
                    }
                    
                    // 如果输入不足20字节，填充随机字节
                    if (bytesToCopy < 20) {
                        const randomFill = new Uint8Array(20 - bytesToCopy);
                        window.crypto.getRandomValues(randomFill);
                        for (let i = 0; i < randomFill.length; i++) {
                            finalBytes[bytesToCopy + i] = randomFill[i];
                        }
                    }
                }
            }
            
            console.log('最终字节(20):', Array.from(finalBytes));
            
            // 将字节数组转换为十六进制字符串
            const rawSecret = Array.from(finalBytes)
                .map(byte => byte.toString(16).padStart(2, '0'))
                .join('');
            
            console.log('生成的原始密钥:', rawSecret);
            console.log('密钥长度:', rawSecret.length);
            console.log('是否为偶数长度:', rawSecret.length % 2 === 0);

            // 显示原始密钥
            this.rawSecretDisplay.style.display = 'block';
            this.rawSecretSpan.textContent = rawSecret;
            this.secretKeyInput.value = rawSecret;

            // 自动生成 OTP
            this.generateOTP();

            return rawSecret;
        } catch (error) {
            console.error('生成原始密钥时出错:', error);
            return null;
        }
    }
    
    // 辅助方法：合并两个Uint8Array
    concatUint8Arrays(array1, array2) {
        const result = new Uint8Array(array1.length + array2.length);
        result.set(array1, 0);
        result.set(array2, array1.length);
        return result;
    }

    startOTPUpdateTimer() {
        try {
            console.log('启动 OTP 更新计时器');
            
            const updateOTP = () => {
                const currentTime = this.getCurrentTime();
                const secondsInMinute = Math.floor((currentTime / 1000) % 60); // 获取分钟内的秒数
                const currentPeriod = Math.floor(secondsInMinute / 10); // 当前10秒周期（0-5）
                const secondsInPeriod = secondsInMinute % 10; // 当前周期内的秒数
                const millisecondsInSecond = currentTime % 1000;
                
                // 计算到下一个10秒周期的精确延迟
                const delay = (10 - secondsInPeriod) * 1000 - millisecondsInSecond;
                
                console.log('当前分钟内秒数:', secondsInMinute);
                console.log('当前10秒周期:', currentPeriod);
                console.log('当前周期内秒数:', secondsInPeriod);
                console.log('当前毫秒数:', millisecondsInSecond);
                console.log('下次更新延迟:', delay);

                if (this.secretKeyInput.value) {
                    this.generateOTP();
                }

                // 设置下一次更新
                setTimeout(updateOTP, delay);
            };

            // 立即执行一次
            updateOTP();

            // 同步时间（如果尚未同步）
            if (!this.timeOffset) {
                this.syncTime().catch(error => {
                    console.error('时间同步失败:', error);
                });
            }

            // 更新倒计时的定时器（每0.1秒更新）
            this.countdownTimer = setInterval(() => {
                const currentTime = this.getCurrentTime();
                const secondsInMinute = Math.floor((currentTime / 1000) % 60);
                const secondsInPeriod = secondsInMinute % 10;
                
                // 计算剩余时间：10 - 当前周期内的秒数
                const remainingTime = 10 - secondsInPeriod;
                
                // 更新显示
                this.updateCountdown(remainingTime, currentTime);
            }, 100);

            console.log('OTP 更新计时器启动成功');
        } catch (error) {
            console.error('启动 OTP 更新计时器时出错:', error);
        }
    }

    updateCountdown(seconds, syncedTime) {
        try {
            // 获取或创建倒计时显示元素
            let countdownSpan = document.getElementById('otpCountdown');
            let timestampSpan = document.getElementById('otpTimestamp');
            
            if (!countdownSpan) {
                countdownSpan = document.createElement('span');
                countdownSpan.id = 'otpCountdown';
                this.otpCodeSpan.parentNode.appendChild(document.createTextNode(' ('));
                this.otpCodeSpan.parentNode.appendChild(countdownSpan);
                this.otpCodeSpan.parentNode.appendChild(document.createTextNode('s)'));
            }
            
            if (!timestampSpan) {
                timestampSpan = document.createElement('div');
                timestampSpan.id = 'otpTimestamp';
                timestampSpan.style.fontSize = '0.8em';
                timestampSpan.style.color = '#666';
                timestampSpan.style.marginTop = '5px';
                this.otpCodeSpan.parentNode.appendChild(timestampSpan);
            }
            
            // 更新倒计时显示
            countdownSpan.textContent = seconds;
            
            // 使用同步后的时间创建日期对象
            const syncedDate = new Date(syncedTime);
            
            // 使用同步后的时间更新时间戳显示
            const dateString = syncedDate.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
            const timeString = syncedDate.toLocaleTimeString('zh-CN', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit',
                hour12: false 
            });
            timestampSpan.textContent = `（北京时间）${dateString} ${timeString}`;
            
        } catch (error) {
            console.error('更新倒计时显示时出错:', error);
        }
    }

    // 修改销毁方法，清理所有定时器
    destroy() {
        try {
            console.log('清理资源');
            if (this.otpTimer) {
                clearInterval(this.otpTimer);
                this.otpTimer = null;
            }
            if (this.countdownTimer) {
                clearInterval(this.countdownTimer);
                this.countdownTimer = null;
            }
            if (this.scanStatusTimer) {
                clearInterval(this.scanStatusTimer);
                this.scanStatusTimer = null;
            }
            console.log('所有定时器已清理');
        } catch (error) {
            console.error('清理资源时出错:', error);
        }
    }

    async syncTime() {
        try {
            console.log('开始同步时间');
            
            // 使用多个时间服务器并行请求，确保获取准确的北京时间
            const timeServers = [
                {
                    url: 'https://worldtimeapi.org/api/timezone/Asia/Shanghai',
                    parser: async (response) => {
                        const data = await response.json();
                        return new Date(data.datetime).getTime();
                    }
                },
                {
                    url: 'https://quan.suning.com/getSysTime.do',
                    parser: async (response) => {
                        const data = await response.json();
                        return new Date(data.sysTime2).getTime();
                    }
                }
                // 可以添加更多备用服务器
            ];

            // 并行发送所有请求
            const timePromises = timeServers.map(async server => {
                const startTime = Date.now();
                try {
                    const response = await fetch(server.url);
                    const endTime = Date.now();
                    const networkDelay = Math.round((endTime - startTime) / 2);
                    const serverTime = await server.parser(response);
                    
                    return {
                        serverTime,
                        networkDelay,
                        offset: serverTime - (Date.now() - networkDelay)
                    };
                } catch (error) {
                    console.warn(`从服务器 ${server.url} 获取时间失败:`, error);
                    return null;
                }
            });

            // 等待所有请求完成
            const results = (await Promise.all(timePromises)).filter(result => result !== null);

            if (results.length === 0) {
                throw new Error('所有时间服务器同步失败');
            }

            // 计算平均偏移
            const totalOffset = results.reduce((sum, result) => sum + result.offset, 0);
            this.timeOffset = Math.round(totalOffset / results.length);

            // 存储时间偏移到 localStorage
            localStorage.setItem('timeOffset', this.timeOffset.toString());
            localStorage.setItem('lastSyncTime', Date.now().toString());

            console.log('时间同步成功');
            console.log('综合时间偏移:', this.timeOffset, 'ms');
            console.log('各服务器返回结果:', results);

            // 启动定期同步
            this.startPeriodicTimeSync();
            
            return true;
        } catch (error) {
            console.error('时间同步失败:', error);
            // 尝试从 localStorage 读取上次的时间偏移
            const savedOffset = localStorage.getItem('timeOffset');
            if (savedOffset) {
                this.timeOffset = parseInt(savedOffset);
                console.log('使用上次保存的时间偏移:', this.timeOffset);
            } else {
                this.timeOffset = 0;
            }
            return false;
        }
    }

    startPeriodicTimeSync() {
        // 每5分钟同步一次时间
        this.timeSyncInterval = setInterval(() => {
            this.syncTime().catch(error => {
                console.error('定期时间同步失败:', error);
            });
        }, 5 * 60 * 1000);
    }

    getCurrentTime() {
        const now = Date.now();
        const lastSync = parseInt(localStorage.getItem('lastSyncTime') || '0');
        const syncAge = now - lastSync;

        // 如果上次同步时间超过10分钟或者尚未同步，触发重新同步
        if (syncAge > 10 * 60 * 1000 || !this.timeOffset) {
            this.syncTime().catch(console.error);
        }

        return now + (this.timeOffset || 0);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('页面加载完成，准备初始化 OTPValidator');
    try {
        const validator = new OTPValidator();
        console.log('OTPValidator 初始化完成');
        
        // 在页面卸载时清理资源
        window.addEventListener('beforeunload', () => {
            console.log('页面即将卸载，清理资源');
            if (validator) {
                validator.destroy();
            }
        });
    } catch (error) {
        console.error('初始化 OTPValidator 时出错:', error);
        // 这里可以添加用户友好的错误提示
        alert('初始化失败，请刷新页面重试');
    }
}); 