import en from 'src/core/library/locale/en'
import zh from 'src/core/library/locale/zh'
import _ from 'lodash'

/*--------define locale data here--------*/
const enData = {
    healthTips: 'Congrats, no alerts',
    maxItemTips: 'max alert items  allowed showing in panel',
    dashUidTips: 'filter by dashboard uid list, eg : u1dsf,1diisf',
    teamsTips: 'filter by teams',
    timeTips: 'whether using current time range'
}

const zhData = {
    healthTips: '恭喜，当前无任何告警',
    maxItemTips: '图表中允许显示的最大告警数量',
    dashUidTips: '使用dashboard uid列表来过滤告警，例如：u1dsf,1diisf',
    teamsTips: '通过团队来过滤告警',
    timeTips: '是否使用当前设置的时间范围',
}

/*--------end--------*/

_.forEach(zhData, (v,k) => {
    zh['alertsList.' + k] = v
})

_.forEach(enData, (v,k) => {
    en['alertsList.' + k] = v
})

