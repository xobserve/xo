import * as basic from './docs/metricsQL.md';
import * as functions from './docs/functions.md';
import * as examples from './docs/examples.md';
import * as motivation from './docs/motivation.md';

const getDocs = () => [
  {tab: "MetricsQL", content: basic.markdown, toc: basic.toc},
  {tab: "Functions", content: functions.markdown, toc: functions.toc},
  {tab: "Examples", content: examples.markdown, toc: examples.toc},
  {tab: "Motivation", content: motivation.markdown, toc: motivation.toc},
]

export default getDocs
