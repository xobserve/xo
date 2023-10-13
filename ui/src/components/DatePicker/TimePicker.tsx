// Copyright 2023 Datav.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import { Box, Button, Center, ChakraProvider, Flex, HStack, Input, Text, VStack } from '@chakra-ui/react'
import { useStore } from '@nanostores/react'
import {
    Calendar,
    CalendarDefaultTheme,
    CalendarControls,
    CalendarPrevButton,
    CalendarNextButton,
    CalendarMonths,
    CalendarMonth,
    CalendarMonthName,
    CalendarWeek,
    CalendarDays,
} from '@uselessdev/datepicker'
import { EditorInputItem } from 'src/components/editor/EditorItem'
import { subHours, subMinutes } from 'date-fns'
import { cloneDeep, includes, isDate, isEmpty } from 'lodash'
import moment from 'moment'
import React, { useMemo, useState } from 'react'
import { FaCalendarAlt, FaTimes } from 'react-icons/fa'
import { timePickerMsg } from 'src/i18n/locales/en'
import { systemDateFormats, TimeRange } from 'types/time'
import { dateTimeFormat } from 'utils/datetime/formatter'
import storage from 'utils/localStorage'
import { storeTimerange } from './DatePicker'
import { $time } from './store'


interface Props {
    onClose?: any
    onTimeChange: any

}

export const TimePickerKey = "time-picker"

const now = new Date()
export const initTimeRange = { start: subHours(now, 12), end: now, startRaw: 'now-12h', endRaw: 'now', sub: 12 * 60 }
// get newest time range from raw time
export const getNewestTimeRange = () => {
    const rawT = storage.get(TimePickerKey)
    let time;
    if (rawT) {
        const t = JSON.parse(rawT)
        if (t) {
            time = t
            time.start = dateTimeParse(time.startRaw).toDate()
            time.end = dateTimeParse(time.endRaw).toDate()
        }
    } else {
        time = initTimeRange
    }

    return time
}

// get current time range from local storage, this time range will change when select a new time or refresh page
export const getCurrentTimeRange = (fromStorage = false): TimeRange => {
    if (fromStorage) {
        const rawT = storage.get(TimePickerKey)
        let time;
        if (rawT) {
            const t = JSON.parse(rawT)
            if (t) {
                time = t
                time.start = new Date(time.start)
                time.end = new Date(time.end)
            }

        } else {
            time = initTimeRange
        }

        return time
    }
    
    const tr = $time.get()
    if (tr) {
        return tr
    }

    return initTimeRange

}

const TimePicker = ({ onClose, onTimeChange }: Props) => {
    const t1 = useStore(timePickerMsg)
    const [range, setRange] = useState<TimeRange>(getNewestTimeRange())
    const [tempRange, setTempRange] = useState<TimeRange>(getNewestTimeRange())
    const [error, setError] = useState({ start: null, end: null })
    const [displayCalender, setDisplayCalender] = useState(false)



    const handleSelectDate = (dates) => {
        const r = {
            start: dates.start,
            end: dates.end,
            startRaw: dates.start.getTime(),
            endRaw: dates.end.getTime(),
            sub: 0
        }
        setRange(r)
        setTempRange(r)
    }




    const setQuickTime = (o) => {
        const now = new Date()
        const r = {
            start: subMinutes(now, o.value),
            end: now,
            startRaw: o.raw,
            endRaw: 'now',
            sub: o.value
        }
        setRange(r)
        setTempRange(r)
        applyTimeRange(r)

    }

    const onRangeChange = (from, to) => {
        const err = { start: null, end: null }
        const r = convertRawToRange(from, to)
        if (!r.from) {
            err.start = t1.fromInvalid
        }
        if (!r.to) {
            err.end = t1.toInvalid
        }
        tempRange.startRaw = from
        tempRange.endRaw = to

        if (r.from && r.from._isValid) {
            tempRange.start = r.from?.toDate()
        }
        if (r.to && r.to._isValid) {
            tempRange.end = r.to?.toDate()
        }

        if (from.startsWith('now') && to.startsWith('now')) {
            tempRange.sub = r.to.diff(r.from) / 60000
        } else {
            tempRange.sub = 0
        }

        setTempRange(cloneDeep(tempRange))


        if (r && !isEmpty(r.from) && !isEmpty(r.to) && r.from && r.from._isValid && r.to && r.to._isValid) {
            setRange(tempRange)
        } else {
            if (isEmpty(r.from) || !r.from._isValid) {
                err.start = t1.fromInvalid
            }
            if (isEmpty(r.to) || !r.to._isValid) {
                err.end = t1.toInvalid
            }
        }

        setError(err)
    }

    const applyTimeRange = (tr: TimeRange) => {
        storeTimerange(tr)
        onTimeChange(tr)
        onClose()
    }

    const quickOptions = useMemo(() => [{
        label: t1.lastMinutes({ name: "5" }),
        value: 5,
        raw: 'now-5m'
    },
    {
        label: t1.lastMinutes({ name: "15" }),
        value: 15,
        raw: 'now-15m'
    }, {
        label: t1.lastMinutes({ name: "30" }),
        value: 30,
        raw: 'now-30m'
    }, {
        label: t1.lastHours({ name: "1" }),
        value: 60,
        raw: 'now-1h'
    }, {
        label: t1.lastHours({ name: "3" }),
        value: 3 * 60,
        raw: 'now-3h'

    }, {
        label: t1.lastHours({ name: "6" }),
        value: 6 * 60,
        raw: 'now-6h'

    }, {
        label: t1.lastHours({ name: "12" }),
        value: 12 * 60,
        raw: 'now-12h'
    }, {
        label: t1.lastDays({ name: "1" }),
        value: 24 * 60,
        raw: 'now-1d'
    }, {
        label: t1.lastDays({ name: "2" }),
        value: 2 * 24 * 60,
        raw: 'now-2d'
    }, {
        label: t1.lastDays({ name: "7" }),
        value: 7 * 24 * 60,
        raw: 'now-7d'
    }, {
        label: t1.lastDays({ name: "30" }),
        value: 30 * 24 * 60,
        raw: 'now-30d'
    }], [t1])

    return (
        <>
            {tempRange && <HStack alignItems="top" spacing="6">
                {displayCalender &&
                    <Box>
                        <Flex justifyContent="space-between" alignItems="center" fontSize="lg" mb="2">
                            <Text>{t1.selectTime}</Text>
                            <FaTimes cursor="pointer" onClick={() => setDisplayCalender(false)} />
                        </Flex>
                        <ChakraProvider theme={CalendarDefaultTheme}>
                            <Calendar value={range} onSelectDate={handleSelectDate}>
                                <Box position="relative">
                                    <CalendarControls>
                                        <CalendarPrevButton />
                                        <CalendarNextButton />
                                    </CalendarControls>

                                    <CalendarMonths>
                                        <CalendarMonth>
                                            <CalendarMonthName />
                                            <CalendarWeek />
                                            <CalendarDays />
                                        </CalendarMonth>
                                    </CalendarMonths>
                                </Box>
                            </Calendar>
                        </ChakraProvider>
                    </Box>
                }
                <VStack alignItems="left" spacing={4}>
                    <Text>{t1.customTime}</Text>
                    <Box>
                        <Text size="sm">{t1.from}</Text>
                        <HStack>
                            <EditorInputItem
                                key={tempRange.startRaw}
                                value={tempRange.startRaw.toString().startsWith('now-') ? tempRange.startRaw : dateTimeFormat(tempRange.start)}
                                onChange={v => onRangeChange(v, tempRange.endRaw)}
                            // disabled={tempRange.startRaw.toString().startsWith('now')}
                            />
                            <FaCalendarAlt cursor="pointer" onClick={() => setDisplayCalender(!displayCalender)} />
                        </HStack>
                        {error.start && <Text mt="1" fontSize="sm" color="red">{error.start}</Text>}
                    </Box>
                    <Box>
                        <Text size="sm">{t1.to}</Text>
                        <HStack>
                            <EditorInputItem
                                key={tempRange.endRaw}
                                value={tempRange.endRaw.toString().startsWith('now') ? tempRange.endRaw : dateTimeFormat(tempRange.end)}
                                onChange={v => onRangeChange(tempRange.startRaw, v)}
                            // disabled={tempRange.endRaw.toString().startsWith('now')}
                            />
                            <FaCalendarAlt cursor="pointer" onClick={() => setDisplayCalender(!displayCalender)} />
                        </HStack>
                        {error.end && <Text mt="1" fontSize="sm" color="red">{error.end}</Text>}
                    </Box>
                    <Button onClick={() => applyTimeRange(tempRange)}>{t1.apply}</Button>
                </VStack>
                <Box p="2">
                    <Center><Text>{t1.quickSelect}</Text></Center>
                    <VStack
                        spacing={4}
                        p={4}
                        alignItems="stretch"
                        borderEndRadius="md"
                        flex={1}
                    >
                        {
                            quickOptions.map(o => <Button key={o.value} onClick={() => setQuickTime(o)} colorScheme="gray" variant={range.startRaw == o.raw && range.endRaw == "now" ? "solid" : "ghost"} borderRadius="0">
                                {o.label}
                            </Button>)
                        }

                    </VStack>
                </Box>



            </HStack>}
        </>
    )
}

export default TimePicker





export const convertRawToRange = (from0, to0) => {
    const from = dateTimeParse(from0, { roundUp: false });
    const to = dateTimeParse(to0, { roundUp: true });

    return { from, to }
};


export function isMathString(text): boolean {
    if (!text) {
        return false;
    }

    if (typeof text === 'string' && (text.substring(0, 3) === 'now' || text.includes('||'))) {
        return true;
    } else {
        return false;
    }
}

/**
 * Helper function to parse a number, text or Date to a DateTime value. If a timeZone is supplied the incoming value
 * is parsed with that timeZone as a base. The only exception to this is if the passed value is in a UTC-based
 * format. Then it will use UTC as the base. If no format is specified the current system format will be assumed.
 *
 * It can also parse the quick date and time format, e.g. now-6h will be parsed as Date.now() - 6 hours and
 * returned as a valid DateTime value.
 *
 * If no options are supplied, then default values are used. For more details please see {@link DateTimeOptions}.
 *
 * @param value - should be a parsable date and time value
 * @param options
 *
 * @public
 */
export const dateTimeParse = (value, options?) => {
    if (isDateTime(value)) {
        return value;
    }

    if (typeof value === 'string') {
        return parseString(value, options);
    }

    return parseOthers(value, options);
};

const parseString = (value: string, options?) => {
    if (value.indexOf('now') !== -1) {
        if (!isValid(value)) {
            return null;
        }

        const parsed = parse(value, options?.roundUp, options?.fiscalYearStartMonth);
        return parsed || null;
    }






    return moment(value, systemDateFormats.fullDate)

};

const parseOthers = (value, options?) => {
    const date = value;


    return moment(date);
};


export const ISO_8601 = moment.ISO_8601;
export function parse(
    text?: string | Date | null,
    roundUp?: boolean,
    fiscalYearStartMonth?: number
) {
    if (!text) {
        return undefined;
    }

    if (typeof text !== 'string') {
        if (isDateTime(text)) {
            return text;
        }
        if (isDate(text)) {
            return dateTime(text);
        }
        // We got some non string which is not a moment nor Date. TS should be able to check for that but not always.
        return undefined;
    } else {
        let time;
        let mathString = '';
        let index;
        let parseString;

        if (text.substring(0, 3) === 'now') {
            time = dateTimeForTimeZone();
            mathString = text.substring('now'.length);
        } else {
            index = text.indexOf('||');
            if (index === -1) {
                parseString = text;
                mathString = ''; // nothing else
            } else {
                parseString = text.substring(0, index);
                mathString = text.substring(index + 2);
            }
            // We're going to just require ISO8601 timestamps, k?
            time = dateTime(parseString, ISO_8601);
        }

        if (!mathString.length) {
            return time;
        }

        return parseDateMath(mathString, time, roundUp, fiscalYearStartMonth);
    }
}

export const dateTimeForTimeZone = (
    timezone?,
    input?,
    formatInput?
) => {
    if (timezone === 'utc') {
        return toUtc(input, formatInput);
    }

    return dateTime(input, formatInput);
};


/**
 * Checks if text is a valid date which in this context means that it is either a Moment instance or it can be parsed
 * by parse function. See parse function to see what is considered acceptable.
 * @param text
 */
export function isValid(text): boolean {
    const date = parse(text);
    if (!date) {
        return false;
    }

    if (isDateTime(date)) {
        return date.isValid();
    }

    return false;
}


export const isDateTime = (value: any) => {
    return moment.isMoment(value);
};


const units = ['y', 'M', 'w', 'd', 'h', 'm', 's', 'Q'];


export function parseDateMath(
    mathString: string,
    time: any,
    roundUp?: boolean,
    fiscalYearStartMonth = 0
) {
    const strippedMathString = mathString.replace(/\s/g, '');
    const dateTime = time;
    let i = 0;
    const len = strippedMathString.length;

    while (i < len) {
        const c = strippedMathString.charAt(i++);
        let type;
        let num;
        let unit;
        let isFiscal = false;

        if (c === '/') {
            type = 0;
        } else if (c === '+') {
            type = 1;
        } else if (c === '-') {
            type = 2;
        } else {
            return undefined;
        }

        if (isNaN(parseInt(strippedMathString.charAt(i), 10))) {
            num = 1;
        } else if (strippedMathString.length === 2) {
            num = parseInt(strippedMathString.charAt(i), 10);
        } else {
            const numFrom = i;
            while (!isNaN(parseInt(strippedMathString.charAt(i), 10))) {
                i++;
                if (i > 10) {
                    return undefined;
                }
            }
            num = parseInt(strippedMathString.substring(numFrom, i), 10);
        }

        if (type === 0) {
            // rounding is only allowed on whole, single, units (eg M or 1M, not 0.5M or 2M)
            if (num !== 1) {
                return undefined;
            }
        }
        unit = strippedMathString.charAt(i++);

        if (unit === 'f') {
            unit = strippedMathString.charAt(i++);
            isFiscal = true;
        }

        if (!includes(units, unit)) {
            return undefined;
        } else {
            if (type === 0) {
                if (roundUp) {
                    if (isFiscal) {
                        roundToFiscal(fiscalYearStartMonth, dateTime, unit, roundUp);
                    } else {
                        dateTime.endOf(unit);
                    }
                } else {
                    if (isFiscal) {
                        roundToFiscal(fiscalYearStartMonth, dateTime, unit, roundUp);
                    } else {
                        dateTime.startOf(unit);
                    }
                }
            } else if (type === 1) {
                dateTime.add(num, unit);
            } else if (type === 2) {
                dateTime.subtract(num, unit);
            }
        }
    }
    return dateTime;
}


export function roundToFiscal(fyStartMonth: number, dateTime: any, unit: string, roundUp: boolean | undefined) {
    switch (unit) {
        case 'y':
            if (roundUp) {
                roundToFiscal(fyStartMonth, dateTime, unit, false).add(11, 'M').endOf('M');
            } else {
                dateTime.subtract((dateTime.month() - fyStartMonth + 12) % 12, 'M').startOf('M');
            }
            return dateTime;
        case 'Q':
            if (roundUp) {
                roundToFiscal(fyStartMonth, dateTime, unit, false).add(2, 'M').endOf('M');
            } else {
                dateTime.subtract((dateTime.month() - fyStartMonth + 3) % 3, 'M').startOf('M');
            }
            return dateTime;
        default:
            return undefined;
    }
}


export const dateTime = (input?, formatInput?) => {
    return moment(input, formatInput);
};



export const toUtc = (input?, formatInput?) => {
    return moment.utc(input, formatInput);
};