import { Box, Button } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useState, useEffect, useLayoutEffect } from 'react';
import { useImmer } from 'use-immer';

export default function App() {
  const [t, setT] = useImmer([{key:1}, {key:2}, {key:3},{key:4}, {key:5}])

  const onRemove = id => {
    setT(t => {
      return t.filter(i => i.key !== id)
    })
  }

  return (<>
    {
      t.map(id => <Box><A id={id.key} onClick={() => onRemove(id.key)} /></Box>)
    }
  </>)
}


const A = ({ id, onClick }) => {
  useEffect(() => {
    console.log("created: ", id)
    return () => {
      console.log("destroyed:",id)
    }
  }, [])
  console.log("rendered:",id)
  return (<Button onClick={onClick}>
    {id}
  </Button>)
}