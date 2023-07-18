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
import { css } from '@emotion/css';
import classNames from 'classnames';
import { useExtraStyles } from 'hooks/useExtraTheme';
import React, { FC, RefCallback, useCallback, useEffect, useRef } from 'react';
import Scrollbars, { positionValues } from 'react-custom-scrollbars-2';




export type ScrollbarPosition = positionValues;

interface Props {
  className?: string;
  autoHide?: boolean;
  autoHideTimeout?: number;
  autoHeightMax?: string;
  hideTracksWhenNotNeeded?: boolean;
  hideHorizontalTrack?: boolean;
  hideVerticalTrack?: boolean;
  scrollRefCallback?: RefCallback<HTMLDivElement>;
  scrollTop?: number;
  setScrollTop?: (position: ScrollbarPosition) => void;
  autoHeightMin?: number | string;
  updateAfterMountMs?: number;
  children: any
}

/**
 * Wraps component into <Scrollbars> component from `react-custom-scrollbars`
 */
export const CustomScrollbar: FC<Props> = ({
  autoHide = false,
  autoHideTimeout = 200,
  setScrollTop,
  className,
  autoHeightMin = '0',
  autoHeightMax = '100%',
  hideTracksWhenNotNeeded = false,
  hideHorizontalTrack,
  hideVerticalTrack,
  scrollRefCallback,
  updateAfterMountMs,
  scrollTop,
  children,
}) => {
  const ref = useRef<Scrollbars & { view: HTMLDivElement }>(null);
  const styles = useExtraStyles(getStyles);

  useEffect(() => {
    if (ref.current && scrollRefCallback) {
      scrollRefCallback(ref.current.view);
    }
  }, [ref, scrollRefCallback]);

  useEffect(() => {
    if (ref.current && scrollTop != null) {
      ref.current.scrollTop(scrollTop);
    }
  }, [scrollTop]);

  /**
   * Special logic for doing a update a few milliseconds after mount to check for
   * updated height due to dynamic content
   */
  useEffect(() => {
    if (!updateAfterMountMs) {
      return;
    }
    setTimeout(() => {
      const scrollbar = ref.current as any;
      if (scrollbar?.update) {
        scrollbar.update();
      }
    }, updateAfterMountMs);
  }, [updateAfterMountMs]);

  function renderTrack(className: string, hideTrack: boolean | undefined, passedProps: any) {
    if (passedProps.style && hideTrack) {
      passedProps.style.display = 'none';
    }

    return <div {...passedProps} className={className} />;
  }

  const renderTrackHorizontal = useCallback(
    (passedProps: any) => {
      return renderTrack('track-horizontal', hideHorizontalTrack, passedProps);
    },
    [hideHorizontalTrack]
  );

  const renderTrackVertical = useCallback(
    (passedProps: any) => {
      return renderTrack('track-vertical', hideVerticalTrack, passedProps);
    },
    [hideVerticalTrack]
  );

  const renderThumbHorizontal = useCallback((passedProps: any) => {
    return <div {...passedProps} className="thumb-horizontal" />;
  }, []);

  const renderThumbVertical = useCallback((passedProps: any) => {
    return <div {...passedProps} className="thumb-vertical" />;
  }, []);

  const renderView = useCallback((passedProps: any) => {
    return <div {...passedProps} className="scrollbar-view" />;
  }, []);

  const onScrollStop = useCallback(() => {
    ref.current && setScrollTop && setScrollTop(ref.current.getValues());
  }, [setScrollTop]);

  return (
    // @ts-ignore
    <Scrollbars
      ref={ref}
      className={classNames(styles.customScrollbar, className)}
      onScrollStop={onScrollStop}
      autoHeight={true}
      autoHide={autoHide}
      autoHideTimeout={autoHideTimeout}
      hideTracksWhenNotNeeded={hideTracksWhenNotNeeded}
      // These autoHeightMin & autoHeightMax options affect firefox and chrome differently.
      // Before these where set to inherit but that caused problems with cut of legends in firefox
      autoHeightMax={autoHeightMax}
      autoHeightMin={autoHeightMin}
      renderTrackHorizontal={renderTrackHorizontal}
      renderTrackVertical={renderTrackVertical}
      renderThumbHorizontal={renderThumbHorizontal}
      renderThumbVertical={renderThumbVertical}
      renderView={renderView}
    >
      {children}
    </Scrollbars>
  );
};

export default CustomScrollbar;

const getStyles = (theme) => {
  return {
    customScrollbar: css`
      // Fix for Firefox. For some reason sometimes .view container gets a height of its content, but in order to
      // make scroll working it should fit outer container size (scroll appears only when inner container size is
      // greater than outer one).
      display: flex;
      flex-grow: 1;
      .scrollbar-view {
        display: flex;
        flex-grow: 1;
        flex-direction: column;
      }
      .track-vertical {
        width: 3px !important;
        right: 0px;
        bottom: 2px;
        top: 2px;
      }
      .track-horizontal {
        height: 3px !important;
        right: 2px;
        bottom: 2px;
        left: 2px;
      }
      .thumb-vertical {
        background: ${theme.colors.action.focus};
        opacity: 0;
      }
      .thumb-horizontal {
        background: ${theme.colors.action.focus};
        opacity: 0;
      }
      &:hover {
        .thumb-vertical,
        .thumb-horizontal {
          opacity: 1;
          transition: opacity 0.3s ease-in-out;
        }
      }
    `,
  };
};
