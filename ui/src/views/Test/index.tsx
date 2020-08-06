import React from 'react';
import './index.less';
import { Card,Input} from 'antd';
import GridLayout from 'react-grid-layout';

const { Meta } = Card;

function Index(props: any) {
  const layout = [
    {i: 'a', x: 0, y: 0, w: 3, h: 3},
    {i: 'b', x: 3, y: 0, w: 3, h: 3},
    {i: 'c', x: 6, y: 0, w: 3, h: 3}
  ];
  const a = 'a'
  return (
    <div className="test">
      <input key="sss" defaultValue={a} onChange={(e) => {console.log(e.currentTarget.value)}}/>
       {/* <GridLayout className="layout" layout={layout} cols={12} width={1200}>
        <div key="a">
        <Card
        hoverable
        style={{ width: '100%',height:'100%' }}
        // cover={<img alt="example" src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png" />}
      >
        <Meta title="Europe Street beat" description="www.instagram.com" />
      </Card>
        </div>
        <div key="b">
        <Card
        hoverable
        style={{ width: '100%',height:'100%' }}
        // cover={<img alt="example" src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png" />}
      >
        <Meta title="Europe Street beat" description="www.instagram.com" />
      </Card>
        </div>
        <div key="c">
        <Card
        hoverable
        style={{ width: '100%',height:'100%' }}
        // cover={<img alt="example" src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png" />}
      >
        <Meta title="Europe Street beat" description="www.instagram.com" />
      </Card>
        </div>
      </GridLayout> */}

    </div>
  );
}

let Test = Index

export default Test;
