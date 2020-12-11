import { gradients } from '@/utils/gradients'
import React from 'react'
import { BigText, Caption, IconContainer, Paragraph } from './common'
import styles from './Hero.module.css'
import { ReactComponent as Icon } from '@/img/icons/home/customization.svg'
import { Widont } from '../Widont'

export function Customize({isChinese} = props) {
    const pin = 'left'
    return (
        <>
            <div className="mb-0 ml-4" style={{marginTop: '65px'}}>
                <IconContainer className={`${gradients.pink[0]}`}>
                    <Icon />
                </IconContainer>
            </div>
            <div style={{marginBottom: '0px',marginTop: '-10px'}} className="ml-4">
                <Caption as="h2" className="text-rose-600 mb-4">
                {isChinese === true ? '个性化' :"Customization"}
                </Caption>
                <BigText className="mb-8">
                    <Widont>{isChinese ? "定义自己的网站" : 'Customize your own website'}</Widont>
                </BigText>
                <Paragraph className="mb-4">
                  {isChinese ? 'Datav在很多方面都支持自定义，外观主题、阅读语言、菜单栏等，使用这些功能，你可以很轻松的打造出自己想要的网站效果，让数据平台不再枯燥单一' : "Datav supports customization in many aspects, such as appearance theme, reading language, menu nav, etc. Using these, you can easily create the website you want, so that the data platform is no longer boring and same"}  
                </Paragraph>
            </div>

            <div className={`grid ${styles.layout}`} style={{marginTop: '-10px'}}>
                <div
                    className={`col-start-1 col-end-2 sm:col-start-2 sm:col-end-3 lg:col-start-1 lg:col-span-full row-start-1 row-span-full xl:col-start-1 xl:col-end-5 xl:row-start-2 xl:row-end-5 lg:py-10 xl:py-16 flex ${pin === 'left' ? '-ml-8 pr-4 sm:ml-0 sm:pr-0' : '-mr-8 pl-4 sm:mr-0 sm:pl-0'
                        }`}
                >
                    <div className="bg-gray-100 w-full flex-none rounded-3xl" />
                    <div className="w-full flex-none -ml-full rounded-3xl transform shadow-lg bg-gradient-to-br from-pink-500 to-rose-400 -rotate-1 sm:-rotate-1" />
                </div>
                <div
                    className={`relative col-start-1 col-end-2 sm:col-start-2 sm:col-end-3 lg:col-start-1 lg:col-span-full xl:col-start-2 xl:col-end-3 row-start-2 row-end-3 xl:row-start-3 xl:row-end-4 self-center ${pin === 'left' ? 'pr-8' : 'pl-8'
                        } sm:px-6 md:px-8 pb-6 md:pb-8 lg:px-0 lg:pb-0 -mt-6 sm:-mt-10 md:-mt-16 lg:-mt-32 xl:mt-0`}
                >
                    <div
                        className={`${styles.cardContainer} max-w-xl xl:max-w-none flex items-center justify-center`}
                    >
                        <div className="w-full flex-none">
                            <figure className="md:flex bg-rose-50 rounded-xl p-8 md:p-0">
                                <div className="pt-6 md:p-8 text-center md:text-left space-y-4">
                                    <blockquote>
                                        <p className="text-lg font-semibold text-rose-500">
                                            {isChinese === true ? '不想像其它产品一样在半夜三更闪瞎用户的双眼？ 使用暗夜主题吧' :"Don’t want to be one of those websites that blinds people when they open it on their phone at 2am? Use dark theme."}
                                        </p>

                                        <p className="text-lg font-semibold text-rose-500 mt-2">
                                        {isChinese === true ? '中国用户再也不用担心英文的问题了，Datav原生对中文进行了支持'  :"Don’t want to be one of those websites that people can't understand? Use other language, such as chinese."}
                                        </p>

                                        <p className="text-lg font-semibold text-rose-500 mt-2">
                                        {isChinese === true ? '自定义导航菜单，把重要的页面放在导航菜单中，而不是搜索中'  :"Customize the navigation menu, link the important pages to the navigation menu instead of searching them"}
                                        </p>
                                    </blockquote>
                                </div>
                            </figure>
                        </div>
                    </div>
                </div>
                <div className="relative md:px-8 lg:px-0 col-start-1 col-span-full lg:col-start-1 xl:col-start-3 xl:col-end-4 row-start-1 row-end-2 xl:row-start-2 xl:row-end-5 self-center pt-8 lg:pt-0">
                    <div className="mx-auto lg:max-w-2xl xl:max-w-none ml-4">
                        <img src={require('@/img/customize-image.jpg').default} style={{ height: '500px' }} className="rounded-xl" />
                    </div>
                </div>
            </div>
        </>
    )
}
