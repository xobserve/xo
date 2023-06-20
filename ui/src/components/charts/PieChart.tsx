// import * as echarts from 'echarts/core';

// // Import bar charts, all suffixed with Chart
// import { PieChart } from 'echarts/charts';

// // Import the tooltip, title, rectangular coordinate system, dataset and transform components
// import {
//     TitleComponent,
//     TooltipComponent,
//     GridComponent,
//     DatasetComponent,
//     TransformComponent
// } from 'echarts/components';

// // Features like Universal Transition and Label Layout
// import { LabelLayout, UniversalTransition } from 'echarts/features';

// // Import the Canvas renderer
// // Note that including the CanvasRenderer or SVGRenderer is a required step
// import { CanvasRenderer } from 'echarts/renderers';
import ChartComponent from './Chart';
// Register the required components
// echarts.use([
//     PieChart,
//     TitleComponent,
//     TooltipComponent,
//     GridComponent,
//     DatasetComponent,
//     TransformComponent,
//     LabelLayout,
//     UniversalTransition,
//     CanvasRenderer
//   ]);


const PieChartComponent = (props) => {
    return (<ChartComponent {...props}/>)
}

export default PieChartComponent