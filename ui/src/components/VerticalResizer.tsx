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

import * as React from 'react';
import cx from 'classnames';

import { TNil } from 'types/misc'
import DraggableManager, { DraggableBounds, DraggingUpdate } from 'utils/DraggableManager';

import './VerticalResizer.css';
import { Box } from '@chakra-ui/react';

type VerticalResizerProps = {
    max: number;
    min: number;
    onChange: (newSize: number) => void;
    position: number;
    rightSide?: boolean;
};

type VerticalResizerState = {
    dragPosition: number | TNil;
};

export default class VerticalResizer extends React.PureComponent<VerticalResizerProps, VerticalResizerState> {
    //@ts-ignore 
    state: VerticalResizerState;

    _dragManager: DraggableManager;
    _rootElm: Element | TNil;

    constructor(props: VerticalResizerProps) {
        super(props);
        this._dragManager = new DraggableManager({
            getBounds: this._getDraggingBounds,
            onDragEnd: this._handleDragEnd,
            onDragMove: this._handleDragUpdate,
            onDragStart: this._handleDragUpdate,
        });
        this._rootElm = undefined;
        this.state = {
            dragPosition: null,
        };
    }

    componentWillUnmount() {
        this._dragManager.dispose();
    }

    _setRootElm = (elm: Element | TNil) => {
        this._rootElm = elm;
    };

    _getDraggingBounds = (): DraggableBounds => {
        if (!this._rootElm) {
            throw new Error('invalid state');
        }
        const { left: clientXLeft, width } = this._rootElm.getBoundingClientRect();
        const { rightSide } = this.props;
        let { min, max } = this.props;
        if (rightSide) [min, max] = [1 - max, 1 - min];
        return {
            clientXLeft,
            width,
            maxValue: max,
            minValue: min,
        };
    };

    _handleDragUpdate = ({ value }: DraggingUpdate) => {
        const dragPosition = this.props.rightSide ? 1 - value : value;
        this.setState({ dragPosition });
    };

    _handleDragEnd = ({ manager, value }: DraggingUpdate) => {
        manager.resetBounds();
        this.setState({ dragPosition: null });
        const dragPosition = this.props.rightSide ? 1 - value : value;
        this.props.onChange(dragPosition);
    };

    render() {
        let left;
        let draggerStyle;
        let isDraggingCls = '';
        const { position, rightSide } = this.props;
        const { dragPosition } = this.state;
        left = `${position * 100}%`;
        const gripStyle = { left };

        if (this._dragManager.isDragging() && this._rootElm && dragPosition != null) {
            isDraggingCls = cx({
                isDraggingLeft: dragPosition < position,
                isDraggingRight: dragPosition > position,
            });
            left = `${dragPosition * 100}%`;
            // Draw a highlight from the current dragged position back to the original
            // position, e.g. highlight the change. Draw the highlight via `left` and
            // `right` css styles (simpler than using `width`).
            const draggerLeft = `${Math.min(position, dragPosition) * 100}%`;
            // subtract 1px for draggerRight to deal with the right border being off
            // by 1px when dragging left
            const draggerRight = `calc(${(1 - Math.max(position, dragPosition)) * 100}% - 1px)`;
            draggerStyle = { left: draggerLeft, right: draggerRight };
        } else {
            draggerStyle = gripStyle;
        }
        return (
            <Box sx={{cssStyles}}>
                <div
                    className={`VerticalResizer ${isDraggingCls} ${rightSide ? 'is-flipped' : ''}`}
                    ref={this._setRootElm}
                >
                    <div className="VerticalResizer--gripIcon" style={gripStyle} />
                    <div
                        aria-hidden
                        className="VerticalResizer--dragger"
                        onMouseDown={this._dragManager.handleMouseDown}
                        style={draggerStyle}
                    />
                </div>
            </Box>
        );
    }
}


const cssStyles = {{
    .VerticalResizer {
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
}
      
      .VerticalResizer.is - flipped {
    transform: scaleX(-1);
}
      
      .VerticalResizer--wrapper {
    bottom: 0;
    position: absolute;
    top: 0;
}
      
      .VerticalResizer--dragger {
    border - left: 2px solid transparent;
    cursor: col - resize;
    height: calc(100vh - var(--nav - height));
    margin - left: -1px;
    position: absolute;
    top: 0;
    width: 1px;
}
      
      .VerticalResizer--dragger:hover {
    border - left: 2px solid rgba(0, 0, 0, 0.3);
}
      
      .VerticalResizer.isDraggingLeft > .VerticalResizer--dragger,
      .VerticalResizer.isDraggingRight > .VerticalResizer--dragger {
    background: rgba(136, 0, 136, 0.05);
    width: unset;
}
      
      .VerticalResizer.isDraggingLeft > .VerticalResizer--dragger {
    border - left: 2px solid #808;
    border - right: 1px solid #999;
}
      
      .VerticalResizer.isDraggingRight > .VerticalResizer--dragger {
    border - left: 1px solid #999;
    border - right: 2px solid #808;
}
      
      .VerticalResizer--dragger::before {
    position: absolute;
    top: 0;
    bottom: 0;
    left: -8px;
    right: 0;
    content: ' ';
}
      
      .VerticalResizer.isDraggingLeft > .VerticalResizer--dragger:: before,
      .VerticalResizer.isDraggingRight > .VerticalResizer--dragger::before {
    left: -2000px;
    right: -2000px;
}
      
      .VerticalResizer--gripIcon {
    position: absolute;
    top: 0;
    bottom: 0;
}
      
      .VerticalResizer--gripIcon:: before,
      .VerticalResizer--gripIcon::after {
    border - right: 1px solid #ccc;
    content: ' ';
    height: 9px;
    position: absolute;
    right: 9px;
    top: 25px;
}
      
      .VerticalResizer--gripIcon::after {
    right: 5px;
}
      
      .VerticalResizer.isDraggingLeft > .VerticalResizer--gripIcon:: before,
      .VerticalResizer.isDraggingRight > .VerticalResizer--gripIcon:: before,
      .VerticalResizer.isDraggingLeft > .VerticalResizer--gripIcon:: after,
      .VerticalResizer.isDraggingRight > .VerticalResizer--gripIcon::after {
    border - right: 1px solid rgba(136, 0, 136, 0.5);
}
}}