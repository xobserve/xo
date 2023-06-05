import { useRouter } from 'next/router';
import { useState, useEffect, useLayoutEffect } from 'react';

export default function App() {
  const router = useRouter()
  console.log(router.query.a)

  useEffect(() => {
    setTimeout(() => {
      router.push(router.asPath + "?a=1")
    },5000)
    }, [])

    return (<>

    </>)
  }

