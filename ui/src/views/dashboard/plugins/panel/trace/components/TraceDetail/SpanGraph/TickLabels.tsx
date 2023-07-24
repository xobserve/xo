// Copyright (c) 2017 Uber Technologies, Inc.
//
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

import React from 'react';


import { formatDuration } from 'utils/date';

type TickLabelsProps = {
  numTicks: number;
  duration: number;
};

export default function TickLabels(props: TickLabelsProps) {
  const { numTicks, duration } = props;

  const ticks = [];
  for (let i = 0; i < numTicks + 1; i++) {
    const portion = i / numTicks;
    const style: any = {
      color: '#717171',
      fontSize: '0.7rem',
      position: 'absolute',
      userSelect: 'none'
    }

    portion === 1 ? style.right = "0%" : style.left = `${portion * 100}%`
    ticks.push(
      <div key={portion} className="TickLabels--label" style={style} data-test="tick">
        {formatDuration(duration * portion)}
      </div>
    );
  }

  return <div className="TickLabels" style={{
    height: '1rem',
    position: 'relative'
  }}>{ticks}</div>;
}
