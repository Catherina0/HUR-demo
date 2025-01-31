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
                copyRawSecretBtn: 'copyRawSecret'
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

            const epoch = Math.floor(Date.now() / 1000);
            // OTP时间间隔 10 秒
            const time = Math.floor(epoch / 10);
            const timeHex = this.dec2hex(time);
            
            console.log('当前时间戳:', epoch);
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

            try {
                const devices = await Html5Qrcode.getCameras();
                if (devices && devices.length) {
                    const cameraId = devices[0].id;
                    console.log('使用相机:', cameraId);

                    // 启动快速状态刷新定时器（0.2秒）
                    this.scanStatusTimer = setInterval(() => {
                        const now = Date.now();
                        const scanResult = document.getElementById('scanResult');
                        
                        if (this.lastScanTime) {
                            const timeSinceLastScan = now - this.lastScanTime;
                            
                            if (this.lastScanSuccess) {
                                if (timeSinceLastScan > 2000) {
                                    if (scanResult) {
                                        scanResult.textContent = '未检测到二维码，请对准摄像头';
                                        scanResult.style.color = '#f44336';
                                    }
                                    this.lastResult = null;
                                    this.lastScanTime = null;
                                    this.lastScanSuccess = false;
                                    
                                    if (this.scanStatusTimer) {
                                        clearInterval(this.scanStatusTimer);
                                        this.scanStatusTimer = setInterval(this.checkScanStatus.bind(this), 200);
                                    }
                                }
                            } else {
                                if (timeSinceLastScan > 200) {
                                    if (scanResult) {
                                        scanResult.textContent = '未检测到二维码，请对准摄像头';
                                        scanResult.style.color = '#f44336';
                                    }
                                }
                            }
                        }
                    }, 200);

                    await this.html5QrCode.start(
                        cameraId,
                        {
                            fps: 10,
                            // 移除 qrbox 配置，使用完整视图
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
                            // 错误处理保持不变
                        }
                    );
                    this.isScanning = true;
                    console.log('扫描器启动成功');
                } else {
                    throw new Error('未找到可用的相机设备');
                }
            } catch (error) {
                console.error('启动扫描器时出错:', error);
                this.resetScannerState();
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
            
            // 检查是否在 OTP 更新的敏感时间段
            if (this.isInSensitiveTimeWindow()) {
                if (scanResult) {
                    scanResult.textContent = '请等待新的 OTP 生成后再次扫描';
                    scanResult.style.color = '#f44336';
                }
                this.lastScanSuccess = false;
                return;
            }

            // 获取当前 OTP 码
            const currentOTP = this.otpCodeSpan.textContent;
            
            // 验证扫描结果是否与当前 OTP 匹配
            if (result === currentOTP) {
                if (scanResult) {
                    scanResult.textContent = '验证成功！扫描结果与 OTP 码匹配';
                    scanResult.style.color = '#4CAF50';
                }
                this.lastScanSuccess = true;
                
                // 验证成功后切换到慢速刷新模式
                if (this.scanStatusTimer) {
                    clearInterval(this.scanStatusTimer);
                    this.scanStatusTimer = setInterval(this.checkScanStatus.bind(this), 2000);
                }
            } else {
                if (scanResult) {
                    scanResult.textContent = '验证失败！扫描结果与 OTP 码不匹配';
                    scanResult.style.color = '#f44336';
                }
                this.lastScanSuccess = false;
            }
            
        } catch (error) {
            console.error('处理扫描结果时出错:', error);
            this.lastScanSuccess = false;
        }
    }

    checkScanStatus() {
        const now = Date.now();
        const scanResult = document.getElementById('scanResult');
        
        if (this.lastScanTime) {
            const timeSinceLastScan = now - this.lastScanTime;
            const timeThreshold = this.lastScanSuccess ? 2000 : 200;
            
            if (timeSinceLastScan > timeThreshold) {
                if (scanResult) {
                    scanResult.textContent = '未检测到二维码，请将二维码对准摄像头';
                    scanResult.style.color = '#f44336';
                }
                this.lastResult = null;
                this.lastScanTime = null;
                this.lastScanSuccess = false;
                
                // 重置为快速刷新模式
                if (this.scanStatusTimer) {
                    clearInterval(this.scanStatusTimer);
                    this.scanStatusTimer = setInterval(this.checkScanStatus.bind(this), 200);
                }
            }
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
            
            // 生成 20 字节（160 位）的随机数据
            const randomBytes = new Uint8Array(20);
            window.crypto.getRandomValues(randomBytes);
            console.log('生成的随机字节:', Array.from(randomBytes));

            // 将随机字节转换为十六进制字符串
            const rawSecret = Array.from(randomBytes)
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

    startOTPUpdateTimer() {
        try {
            console.log('启动 OTP 更新计时器');
            
            // 立即生成一次 OTP
            if (this.secretKeyInput.value) {
                this.generateOTP();
            }

            // 计算到下一个整10秒的延迟
            const now = new Date();
            const delay = 10000 - (now.getSeconds() % 10) * 1000 - now.getMilliseconds();
            
            // 设置首次更新的定时器
            setTimeout(() => {
                // 在整10秒时更新 OTP
                if (this.secretKeyInput.value) {
                    this.generateOTP();
                }
                
                // 之后每10秒更新一次
                this.otpTimer = setInterval(() => {
                    if (this.secretKeyInput.value) {
                        this.generateOTP();
                    }
                }, 10000);
            }, delay);

            // 更新倒计时的定时器（每秒更新）
            this.countdownTimer = setInterval(() => {
                const now = new Date();
                const remaining = 10 - (now.getSeconds() % 10);
                this.updateCountdown(remaining);
            }, 1000);

            console.log('OTP 更新计时器启动成功');
        } catch (error) {
            console.error('启动 OTP 更新计时器时出错:', error);
        }
    }

    updateCountdown(seconds) {
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
            
            // 更新时间戳显示
            const now = new Date();
            const dateString = now.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
            const timeString = now.toLocaleTimeString('zh-CN', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit',
                hour12: false 
            });
            timestampSpan.textContent = `（东8区）${dateString} ${timeString}`;
            
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
                console.log('OTP 更新计时器已清理');
            }
            if (this.countdownTimer) {
                clearInterval(this.countdownTimer);
                this.countdownTimer = null;
                console.log('倒计时定时器已清理');
            }
            // ... 其他清理代码 ...
        } catch (error) {
            console.error('清理资源时出错:', error);
        }
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