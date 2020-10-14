import logfmtParser from 'logfmt/lib/logfmt_parser';
export function convTagsLogfmt(tags) {
    if (!tags) {
      return null;
    }
    const data = logfmtParser.parse(tags);
    Object.keys(data).forEach(key => {
      const value = data[key];
      // make sure all values are strings
      // https://github.com/jaegertracing/jaeger/issues/550#issuecomment-352850811
      if (typeof value !== 'string') {
        data[key] = String(value);
      }
    });
    return JSON.stringify(data);
  } 