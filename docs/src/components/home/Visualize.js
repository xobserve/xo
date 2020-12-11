import { gradients } from '@/utils/gradients'
import React from 'react'
import { BigText, Caption, IconContainer, Paragraph } from './common'
import styles from './Hero.module.css'
import { ReactComponent as Icon } from '@/img/icons/home/constraint-based.svg'
import { Widont } from '../Widont'

export function Visualize({ isChinese } = props) {
    const pin = 'left'
    const tab = 'sizing'
    return (
        <>
            <div className="mb-0 ml-4">
                <IconContainer className={`${gradients.purple[0]}`}>
                    <Icon />
                </IconContainer>
            </div>
            <div style={{ marginBottom: '0px', marginTop: '-10px' }} className="ml-4">
                <Caption as="h2" className="text-purple-600 mb-4">
                    {isChinese === true ? '可视化' : 'Visualize'}
                </Caption>
                <BigText className="mb-8">
                    <Widont>{isChinese ? "全盘掌控和可视化你的数据" : 'Get full visibility into your data'}</Widont>
                </BigText>
                <Paragraph className="mb-10">
                  {isChinese ? 'Datav拥有直观的可视化数据接口、数量众多且优美的可视化图表组件，同时还具备丰富的特性帮助你创建可交互式的图表' : "Datav has an intuitive interface to visualize datasets, a wide array of beautiful visualizations to showcase your data, and powerful features to  create interactive dashboards，"}  
                </Paragraph>
            </div>

            <div className={`grid ${styles.layout}`} style={{ marginTop: '-10px' }}>
                <div
                    className={`col-start-1 col-end-2 sm:col-start-2 sm:col-end-3 lg:col-start-1 lg:col-span-full row-start-1 row-span-full xl:col-start-1 xl:col-end-5 xl:row-start-2 xl:row-end-5 lg:py-10 xl:py-16 flex ${pin === 'left' ? '-ml-8 pr-4 sm:ml-0 sm:pr-0' : '-mr-8 pl-4 sm:mr-0 sm:pl-0'
                        }`}
                >
                    <div className="bg-gray-100 w-full flex-none rounded-3xl" />
                    <div className="w-full flex-none -ml-full rounded-3xl transform shadow-lg bg-gradient-to-br from-fuchsia-500 to-purple-600 rotate-1 sm:rotate-1" />
                </div>
                <div
                    className={`relative col-start-1 col-end-2 sm:col-start-2 sm:col-end-3 lg:col-start-1 lg:col-span-full xl:col-start-2 xl:col-end-3 row-start-2 row-end-3 xl:row-start-3 xl:row-end-4 self-center ${pin === 'left' ? 'pr-8' : 'pl-8'
                        } sm:px-6 md:px-8 pb-6 md:pb-8 lg:px-0 lg:pb-0 -mt-6 sm:-mt-10 md:-mt-16 lg:-mt-32 xl:mt-0`}
                >
                    <div
                        className={`${styles.cardContainer} max-w-xl xl:max-w-none flex items-center justify-center`}
                    >
                        <div className="w-full flex-none">
                            <figure className="md:flex bg-purple-50 rounded-xl p-8 md:p-0">
                                <div className="pt-6 md:p-8 text-center md:text-left space-y-4">
                                    <blockquote>
                                        <p className="text-lg font-semibold text-purple-600">
                                            {isChinese === true ? "从热力图到分布图，从曲线图到地理信息图，Datav拥有众多美观的图表插件来帮助你理解自己的数据。" : 'From heatmaps to histograms. Graphs to geomaps. Datav has a plethora of visualization options to help you understand your data, beautifully.'}
                                        </p>
                                        <br />
                                        <p className="text-lg font-semibold text-purple-600">
                                            {isChinese === true ? "同时，Datav的图表非常具有交互性，你可以为图表添加点击事件： 前往页面、设置当前模版变量、设置当前事件等" : 'Also, datav has built-in interactivity for dashboard panels, you can add click event: such as go to a url, set current templating variable, set current time etc.'}
                                        </p>
                                    </blockquote>
                                    {/* <figcaption className="font-medium">
                                    <div className="text-cyan-600">
                                        Michal Sopor
                        </div>
                                    <div className="text-gray-500">
                                        Creator of datav
                        </div>
                                </figcaption> */}
                                </div>
                            </figure>
                        </div>
                    </div>
                </div>
                <div className="relative md:px-8 lg:px-0 col-start-1 col-span-full lg:col-start-1 xl:col-start-3 xl:col-end-4 row-start-1 row-end-2 xl:row-start-2 xl:row-end-5 self-center pt-8 lg:pt-0">
                    <div className="mx-auto lg:max-w-2xl xl:max-w-none ml-4">
                        <img src={require('@/img/visualize-image.jpg').default} style={{ height: '500px' }} className="rounded-xl" />
                    </div>
                </div>
            </div>
        </>
    )
}
