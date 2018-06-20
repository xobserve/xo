<script>

  /** 
  * 异步延迟 
  * @param {number} time 延迟的时间,单位毫秒 
  */  
  function sleep(time) {  
    return new Promise((resolve, reject) => {  
      setTimeout(() => {  
        resolve();  
      }, time);  
    })  
  };  



export default {
    sleep
}
</script>
