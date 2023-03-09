export function prettyJson(code: any) {
    try {
      for (const key in code) {
        if (typeof code[key] === 'function') {
          let str = code[key];
          str = str.toString();
          code[key] = str.replace(/\n/g, '<br/>');
        }
      }
      // 设置缩进为2个空格
      let str = JSON.stringify(code, null, 2);
      str = str
        .replace(/&/g, '&')
        .replace(/</g, '<')
        .replace(/>/g, '>');
      // str = str.replace(/\n/g, '/r')
      return str;
    } catch (e) {
      console.error('异常信息:' + e);
      return '';
    }
  }