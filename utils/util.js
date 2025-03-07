const formatTime = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return `${[year, month, day].map(formatNumber).join("/")} ${[
    hour,
    minute,
    second,
  ]
    .map(formatNumber)
    .join(":")}`;
};

const formatNumber = (n) => {
  n = n.toString();
  return n[1] ? n : `0${n}`;
};

// 在文件顶部定义辅助函数
function arrayBufferToString(buffer) {
  // 使用TextDecoder处理UTF-8编码
  try {
    // 如果支持TextDecoder（大多数现代环境）
    return new TextDecoder("utf-8").decode(buffer);
  } catch (e) {
    // 降级方案：手动处理UTF-8编码
    const bytes = new Uint8Array(buffer);
    let result = "";
    let i = 0;
    while (i < bytes.length) {
      if (bytes[i] < 128) {
        // ASCII字符
        result += String.fromCharCode(bytes[i]);
        i++;
      } else if (bytes[i] >= 192 && bytes[i] < 224) {
        // 2字节UTF-8
        if (i + 1 < bytes.length) {
          const codePoint = ((bytes[i] & 31) << 6) | (bytes[i + 1] & 63);
          result += String.fromCharCode(codePoint);
        }
        i += 2;
      } else if (bytes[i] >= 224 && bytes[i] < 240) {
        // 3字节UTF-8
        if (i + 2 < bytes.length) {
          const codePoint =
            ((bytes[i] & 15) << 12) |
            ((bytes[i + 1] & 63) << 6) |
            (bytes[i + 2] & 63);
          result += String.fromCharCode(codePoint);
        }
        i += 3;
      } else if (bytes[i] >= 240 && bytes[i] < 248) {
        // 4字节UTF-8（需要使用代理对）
        if (i + 3 < bytes.length) {
          const codePoint =
            ((bytes[i] & 7) << 18) |
            ((bytes[i + 1] & 63) << 12) |
            ((bytes[i + 2] & 63) << 6) |
            (bytes[i + 3] & 63);
          if (codePoint > 0xffff) {
            // 使用代理对
            const highSurrogate = 0xd800 + ((codePoint - 0x10000) >> 10);
            const lowSurrogate = 0xdc00 + ((codePoint - 0x10000) & 0x3ff);
            result += String.fromCharCode(highSurrogate, lowSurrogate);
          } else {
            result += String.fromCharCode(codePoint);
          }
        }
        i += 4;
      } else {
        // 未知字节，跳过
        i++;
      }
    }
    return result;
  }
}

module.exports = {
  formatTime,
  arrayBufferToString,
};
