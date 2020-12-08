export function Logo({color} = props) {
  return (
     <div style={{paddingTop: '5px'}}>
      <img src="/favicon.ico" height="40" width="40" className="inline-block mr-2" style={{paddingBottom: '5px'}}/>
      <span className={`text-2xl inline-block font-medium ${color === 'white' ? 'text-white' : 'text-black'}`}>DATAV</span>
     </div>
  )
}
