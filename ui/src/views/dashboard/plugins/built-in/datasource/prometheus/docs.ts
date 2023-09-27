import * as basic from './docs/basic.md';
import * as operators from './docs/operators.md';
import * as functions from './docs/functions.md';
import * as examples from './docs/examples.md';

const docs = [
    {tab: "Basic", content: basic.markdown, toc:basic.toc},
    {tab:"Operators", content: operators.markdown, toc: operators.toc},
    {tab:"Functions", content: functions.markdown, toc: functions.toc},
    {tab:"Examples", content: examples.markdown, toc: examples.toc},
]

const getPrometheusDocs = () => {
    return docs
}

export default getPrometheusDocs
