import { useState,useEffect} from 'react'
import { Switch } from '@headlessui/react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/router'

export const LangKey = 'datav-docs-lang'

export function useChinese() {
  const [isChinese, setIsChinese] = useState(false)
  useEffect(() => {
    let chinese = window.localStorage.getItem(LangKey)
    let ischinese = false
    if (chinese === 'true') {
      ischinese = true
    }

    setIsChinese(ischinese)
  }, [])

  return isChinese
}

export function LangSwitch() {
  const router = useRouter()
  const [isChinese, setIsChinese] = useState(false)
  useEffect(() => {
    let chinese = window.localStorage.getItem(LangKey)
    let ischinese = false
    if (chinese === 'true') {
      ischinese = true
    }

    setIsChinese(ischinese)
  }, [])


 


  const onChangeLang = (v) => {
    setIsChinese(v)
    window.localStorage.setItem(LangKey,v)
    let url 
    if (v) {
      url = router.pathname.replace("/docs", "/docs-cn")
    } else {
      url = router.pathname.replace("/docs-cn", "/docs")
    }

    
    location.href = url
  }

  return (
    <div className="flex items-center space-x-4 text-xs">
      EN
      <Switch
        checked={isChinese}
        onChange={onChangeLang}
        className={`inline-flex items-center px-0.5 rounded-full w-12 h-6 ml-1 mr-1 ${
          isChinese ? 'justify-end' : ''
        }`}
        style={{ backgroundColor: isChinese ? 'rgb(6, 182, 212)' : 'rgb(6, 182, 212)' }}
      >
        <span className="sr-only">Enable dark mode</span>
        <motion.span
          layout
          className="bg-white rounded-full w-6 h-6"
          style={{ boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05), 0 1px 1px rgba(0, 0, 0, 0.1)' }}
        />
      </Switch>
      中文
    </div>
  )
}
