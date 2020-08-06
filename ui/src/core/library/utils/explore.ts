export const safeStringifyValue = (value: any, space?: number) => {
    if (!value) {
      return '';
    }
  
    try {
      return JSON.stringify(value, null, space);
    } catch (error) {
      console.error(error);
    }
  
    return '';
  };