// Copyright 2023 xObserve.io Team

import { css, cx } from '@emotion/css'
import classNames from 'classnames'
import React, { useEffect, useRef, useState } from 'react'

import { useExtraStyles } from 'hooks/useExtraTheme'
import { FaAngleDown, FaAngleUp, FaArrowDown } from 'react-icons/fa'

export const ScrollIndicators = ({ children }: React.PropsWithChildren<{}>) => {
  const [showScrollTopIndicator, setShowTopScrollIndicator] = useState(false)
  const [showScrollBottomIndicator, setShowBottomScrollIndicator] =
    useState(false)
  const scrollTopMarker = useRef<HTMLDivElement>(null)
  const scrollBottomMarker = useRef<HTMLDivElement>(null)
  const styles = useExtraStyles(getStyles)

  // Here we observe the top and bottom markers to determine if we should show the scroll indicators
  useEffect(() => {
    const intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === scrollTopMarker.current) {
          setShowTopScrollIndicator(!entry.isIntersecting)
        } else if (entry.target === scrollBottomMarker.current) {
          setShowBottomScrollIndicator(!entry.isIntersecting)
        }
      })
    })
    ;[scrollTopMarker, scrollBottomMarker].forEach((ref) => {
      if (ref.current) {
        intersectionObserver.observe(ref.current)
      }
    })
    return () => intersectionObserver.disconnect()
  }, [])

  return (
    <>
      <div
        className={cx(styles.scrollIndicator, styles.scrollTopIndicator, {
          [styles.scrollIndicatorVisible]: showScrollTopIndicator,
        })}
      >
        <FaAngleUp
          className={classNames(styles.scrollIcon, styles.scrollTopIcon)}
        />
      </div>
      <div className={styles.scrollContent}>
        <div ref={scrollTopMarker} />
        {children}
        <div ref={scrollBottomMarker} />
      </div>
      <div
        className={cx(styles.scrollIndicator, styles.scrollBottomIndicator, {
          [styles.scrollIndicatorVisible]: showScrollBottomIndicator,
        })}
      >
        <FaAngleDown
          className={classNames(styles.scrollIcon, styles.scrollBottomIcon)}
        />
      </div>
    </>
  )
}

const getStyles = (theme) => {
  return {
    scrollContent: css({
      flex: 1,
      position: 'relative',
    }),
    scrollIndicator: css({
      height: '48px',
      left: 0,
      opacity: 0,
      pointerEvents: 'none',
      position: 'absolute',
      right: 0,
      transition: 'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
      zIndex: 1,
    }),
    scrollTopIndicator: css({
      background: `linear-gradient(0deg, transparent, ${theme.colors.background.canvas})`,
      top: 0,
    }),
    scrollBottomIndicator: css({
      background: `linear-gradient(180deg, transparent, ${theme.colors.background.canvas})`,
      bottom: 0,
    }),
    scrollIndicatorVisible: css({
      opacity: 1,
    }),
    scrollIcon: css({
      left: '50%',
      position: 'absolute',
      transform: 'translateX(-50%)',
    }),
    scrollTopIcon: css({
      top: 0,
    }),
    scrollBottomIcon: css({
      bottom: 0,
    }),
  }
}
