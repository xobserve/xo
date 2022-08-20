import { Box, Button, Center, ChakraProvider, Flex, HStack, Input, Text, VStack } from '@chakra-ui/react'
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
import { subMinutes } from 'date-fns'
import { cloneDeep, includes, isDate, isEmpty } from 'lodash'
import moment from 'moment'
import {  useState } from 'react'
import { FaCalendarAlt, FaTimes } from 'react-icons/fa'
import { systemDateFormats } from 'types/time'
import storage from 'utils/localStorage'

export interface TimeRange {
    start: Date
    end: Date
    startRaw?: string
    endRaw?: string
    sub: number
}

interface Props {
    onClose?: any
    onTimeChange: any

}

export const TimePickerKey = "time-picker"
const now = new Date()
export const initTimeRange =  { start: subMinutes(now, 15), end: now, startRaw: 'now-15m', endRaw: 'now',sub: 15 }
export const getInitTimeRange = () => {
    const rawT = storage.get(TimePickerKey)
    let time;
    if (rawT) {
        const t = JSON.parse(rawT)
        if (t) {
            time = t
            time.start = dateTimeParse(time.startRaw).toDate()
            time.end = dateTimeParse(time.endRaw).toDate()
        }
    }  else {
       time = initTimeRange
    }

    return time
}

const TimePicker = ({onClose,onTimeChange} : Props) => {
   
    const [range, setRange] = useState<TimeRange>(getInitTimeRange())
    const [tempRange, setTempRange] = useState<TimeRange>(getInitTimeRange())
    const [error, setError] = useState({ start: null, end: null })
    const [displayCalender, setDisplayCalender] = useState(false)


    const handleSelectDate = (dates) => {
        const r = {
            start: dates.start,
            end: dates.end,
            startRaw: dates.start.toLocaleString(),
            endRaw: dates.end.toLocaleString(),
            sub: 0
        }
        setRange(r)
        setTempRange(r)
    }




    const setQuickTime = (o) => {
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
            err.start = 'format of from is invalid'
        }
        if (!r.to) {
            err.end = 'format of to is invalid'
        }
        tempRange.startRaw = from
        tempRange.endRaw = to

        if (r.from && r.from._isValid) {
            tempRange.start = r.from?.toDate()
        }
        if (r.to && r.to._isValid) {
            tempRange.end = r.to?.toDate()
        }

        tempRange.sub = 0
        setTempRange(cloneDeep(tempRange))


        if (r && !isEmpty(r.from) && !isEmpty(r.to) && r.from && r.from._isValid && r.to && r.to._isValid) {
            setRange(tempRange)
        } else {
            if (isEmpty(r.from) || !r.from._isValid) {
                err.start = 'format of from is invalid'
            }
            if (isEmpty(r.to) || !r.to._isValid) {
                err.end = 'format of to is invalid'
            }
        }

        setError(err)
    }

    const applyTimeRange = (r) => {
        storage.set(TimePickerKey, JSON.stringify(r))
        onTimeChange(r)
        onClose()
    }
    
    return (
        <>
        {tempRange && <HStack alignItems="top" spacing="6">
            {displayCalender  &&
                <Box>
                    <Flex justifyContent="space-between" alignItems="center" fontSize="lg" mb="2">
                        <Text>Select a date range</Text>
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
                <Text>Custom time range</Text>
                <Box>
                    <Text size="sm">From</Text>
                    <HStack>
                        <Input value={tempRange.startRaw} onChange={e => onRangeChange(e.currentTarget.value, tempRange.endRaw)} disabled={tempRange.startRaw.startsWith('now')} />
                        <FaCalendarAlt cursor="pointer" onClick={() => setDisplayCalender(!displayCalender)} />
                    </HStack>
                    {error.start && <Text mt="1" fontSize="sm" color="red">{error.start}</Text>}
                </Box>
                <Box>
                    <Text size="sm">To</Text>
                    <HStack>
                        <Input value={tempRange.endRaw} onChange={e => onRangeChange(tempRange.startRaw, e.currentTarget.value)} disabled={tempRange.endRaw.startsWith('now')} />
                        <FaCalendarAlt cursor="pointer" onClick={() => setDisplayCalender(!displayCalender)} />
                    </HStack>
                    {error.end && <Text mt="1" fontSize="sm" color="red">{error.end}</Text>}
                </Box>
                <Button onClick={() => applyTimeRange(range)}>Apply time range</Button>
            </VStack>
            <Box p="2">
                <Center><Text>Quick select</Text></Center>
                <VStack
                    spacing={4}
                    p={4}
                    alignItems="stretch"
                    borderEndRadius="md"
                    flex={1}
                >
                    {
                        quickOptions.map(o => <Button key={o.value} onClick={() => setQuickTime(o)} colorScheme="gray" variant={range.startRaw == o.raw && range.endRaw == "now" ? "solid" : "ghost"}  borderRadius="0">
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


const quickOptions = [{
    label: "Last 5 minutes",
    value: 5,
    raw: 'now-5m'
},
{
    label: "Last 15 minutes",
    value: 15,
    raw: 'now-15m'
}, {
    label: "Last 30 minutes",
    value: 30,
    raw: 'now-30m'
}, {
    label: "Last 1 hour",
    value: 60,
    raw: 'now-1h'
}, {
    label: "Last 3 hours",
    value: 3 * 60,
    raw: 'now-3h'

}, {
    label: "Last 12 hours",
    value: 12 * 60,
    raw: 'now-12h'
}, {
    label: "Last 1 day",
    value: 24 * 60,
    raw: 'now-1d'
}, {
    label: "Last 2 days",
    value: 2 * 24 * 60,
    raw: 'now-2d'
}, {
    label: "Last 7 days",
    value: 7 * 24 * 60,
    raw: 'now-7d'
}, {
    label: "Last 30 days",
    value: 30 * 24 * 60,
    raw: 'now-30d'
}]


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
 * It can also parse the Grafana quick date and time format, e.g. now-6h will be parsed as Date.now() - 6 hours and
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


    // switch (lowerCase(timeZone)) {
    //     case 'utc':
    //         return moment.utc(date) as DateTime;
    //     default:
    return moment(date);
    // }
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