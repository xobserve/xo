import {markdown as basic, toc as basicToc} from './docs/basic.md';
import {markdown as operators, toc as operatorToc} from './docs/operators.md';


const docs = [
    {tab: "Basic", content: basic, toc:basicToc},
    {tab:"Operators", content: operators, toc: operatorToc}
]

const getPrometheusDocs = () => {
    return docs
}

export default getPrometheusDocs
