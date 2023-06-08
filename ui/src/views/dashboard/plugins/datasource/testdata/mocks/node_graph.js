
export const nodeGraphData = {
    nodes: [
      {
        id: 'A',
        label: 'Service A',
        // the attributes for drawing donut
        donutAttrs: {
          'success': 1000,
          'error': 300,
        },
        icon: {
          show: true,
          width: 20,
          height: 20,
          //  img: 'https://gw.alipayobjects.com/zos/basement_prod/012bcf4f-423b-4922-8c24-32a89f8c41ce.svg',
        }
      },
      {
        id: 'B',
        label: 'Service B',
        donutAttrs: {
          'success': 500,
          'error': 500,
        },
        icon: {
          show: true,
          width: 20,
          height: 20,
          //  img: 'https://gw.alipayobjects.com/zos/basement_prod/012bcf4f-423b-4922-8c24-32a89f8c41ce.svg',
        }
      },
      {
        id: 'C',
        label: 'Service C',
        donutAttrs: {
          'success': 400,
          'error': 0,
        },
        icon: {
          show: true,
          width: 20,
          height: 20,
          //  img: 'https://gw.alipayobjects.com/zos/basement_prod/012bcf4f-423b-4922-8c24-32a89f8c41ce.svg',
        }
      },
      {
        id: 'D',
        label: 'Service D',
        donutAttrs: {
          'success': 700,
          'error': 1000,
        },
        icon: {
          show: true,
          width: 20,
          height: 20,
          //  img: 'https://gw.alipayobjects.com/zos/basement_prod/012bcf4f-423b-4922-8c24-32a89f8c41ce.svg',
        }
      },
      {
        id: 'E',
        label: 'Service E',
        donutAttrs: {
          'success': 800,
          'error': 0,
        },
        icon: {
          show: true,
          width: 20,
          height: 20,
          //  img: 'https://gw.alipayobjects.com/zos/basement_prod/012bcf4f-423b-4922-8c24-32a89f8c41ce.svg',
        }
      },
      {
        id: 'F',
        label: 'Service F',
        donutAttrs: {
          'success': 20000,
          'error': 5,
        },
        icon: {
          show: true,
          width: 20,
          height: 20,
          //  img: 'https://gw.alipayobjects.com/zos/basement_prod/012bcf4f-423b-4922-8c24-32a89f8c41ce.svg',
        }
      },
    ],
    edges: [
      { source: 'C', target: 'F', label: '30' },
      { source: 'B', target: 'A', label: '60' },
      { source: 'D', target: 'E', label: '80' },
      { source: 'D', target: 'C', label: '20' },
      { source: 'B', target: 'C', label: '100' },
      { source: 'A', target: 'C', label: '32' },
      { source: 'C', target: 'A', label: '45' },
      { source: 'F', target: 'F', label: '45' },
    ]
  };