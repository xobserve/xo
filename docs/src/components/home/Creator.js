import React from 'react'
import { CodeWindow, getClassNameForToken} from '../CodeWindow'
import styles from './Hero.module.css'
import { tokenizeWithLines } from '../../macros/tokenize.macro'
import { AnimatePresence, motion } from 'framer-motion'

const tokens = {
    sizing: tokenizeWithLines.html(`# ./datav start`).lines
  }

export function Creator({isChinese} = props) {
    const pin = 'left'
    const tab = 'sizing'
    return (
        <div className={`grid ${styles.layout}`}>
            <div
                className={`col-start-1 col-end-2 sm:col-start-2 sm:col-end-3 lg:col-start-1 lg:col-span-full row-start-1 row-span-full xl:col-start-1 xl:col-end-5 xl:row-start-2 xl:row-end-5 lg:py-10 xl:py-16 flex ${pin === 'left' ? '-ml-8 pr-4 sm:ml-0 sm:pr-0' : '-mr-8 pl-4 sm:mr-0 sm:pl-0'
                    }`}
            >
                <div className="bg-gray-100 w-full flex-none rounded-3xl" />
                <div className="w-full flex-none -ml-full rounded-3xl transform shadow-lg bg-gradient-to-br from-cyan-400 to-light-blue-500 -rotate-1 sm:-rotate-1" />
            </div>
            <div
                className={`relative col-start-1 col-end-2 sm:col-start-2 sm:col-end-3 lg:col-start-1 lg:col-span-full xl:col-start-2 xl:col-end-3 row-start-2 row-end-3 xl:row-start-3 xl:row-end-4 self-center ${pin === 'left' ? 'pr-8' : 'pl-8'
                    } sm:px-6 md:px-8 pb-6 md:pb-8 lg:px-0 lg:pb-0 -mt-6 sm:-mt-10 md:-mt-16 lg:-mt-32 xl:mt-0`}
            >
                <div
                    className={`${styles.cardContainer} max-w-xl xl:max-w-none flex items-center justify-center`}
                >
                    <div className="w-full flex-none">
                        <figure className="md:flex bg-gray-100 rounded-xl p-8 md:p-0">
                            <img src={require('@/img/creator.jpg').default} alt="" style={{ height: '300px' }} className="rounded-xl"/>
                            <div className="pt-6 md:p-8 text-center md:text-left space-y-4">
                                <blockquote>
                                    <p className="text-lg font-semibold">
                                    {isChinese === true ? "我们想要寻找一款简单轻量但是又美观的数据可视化平台，但是市场上并没有非常合适的产品。" : "We want to find a simple and beautiful visualization platform, but we can't."}
                        </p>
                                    <p className="text-lg font-semibold mt-1">
                                       {isChinese === true ? `所以我们基于Grafana创建了Datav，它更轻量却同样强大"` : `So we build datav based on grafana, it is lightweight but as powerful as grafana"`} 
                        </p>
                                </blockquote>
                                <figcaption className="font-medium">
                                    <div className="text-cyan-600">
                                        Michal Sopor
                        </div>
                                    <div className="text-gray-500">
                                        {isChinese === true ?  "Datav创始人" :"Creator of datav"}
                        </div>
                                </figcaption>
                            </div>
                        </figure>
                    </div>
                </div>
            </div>
            <div className="relative md:px-8 lg:px-0 col-start-1 col-span-full lg:col-start-1 xl:col-start-3 xl:col-end-4 row-start-1 row-end-2 xl:row-start-2 xl:row-end-5 self-center pt-8 lg:pt-0">
                <div className="mx-auto lg:max-w-2xl xl:max-w-none">
                    <img src="/img/homepage-hero.png" style={{height: '500px'}} className="rounded-xl"/>
                    {/* <CodeWindow className="bg-light-blue-500">
                        <AnimatePresence initial={false} exitBeforeEnter>
                            <motion.div
                                key={tab}
                                className="w-full flex-auto flex min-h-0"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <CodeWindow.Code2 lines={tokens[tab].length}>
                                    {tokens[tab].map((tokens, lineIndex) => (
                                        <div key={lineIndex}>
                                            {tokens.map((token, tokenIndex) => {
                                                if (token.types[token.types.length - 1] === 'attr-value') {
                                                    return (
                                                        <span key={tokenIndex} className={getClassNameForToken(token)}>
                                                            {token.content.split(/\[([^\]]+)\]/).map((part, i) =>
                                                                i % 2 === 0 ? (
                                                                    part
                                                                ) : (
                                                                        <span key={i} className="code-highlight bg-code-highlight">
                                                                            {part}
                                                                        </span>
                                                                    )
                                                            )}
                                                        </span>
                                                    )
                                                }
                                                return (
                                                    <span key={tokenIndex} className={getClassNameForToken(token)}>
                                                        {token.content}
                                                    </span>
                                                )
                                            })}
                                        </div>
                                    ))}
                                </CodeWindow.Code2>
                            </motion.div>
                        </AnimatePresence>
                    </CodeWindow> */}
                </div>
            </div>
        </div>
    )
}
