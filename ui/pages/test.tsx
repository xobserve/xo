import { useRouter } from 'next/router';
import { useState, useEffect,useLayoutEffect } from 'react';

export default function App() {
  const router = useRouter()
  const a = router.query.a

  console.log("heree11111:",router,a)
  return ( <>
  {a && <A a={a}/>}
  </>)
}

const A = ({a}) => {
  const [b, setB] = useState(0)
  useEffect(() => {
    setB(1)
  },[a])

  console.log("here222:",a, b)
  return ( <>
    </>)
}