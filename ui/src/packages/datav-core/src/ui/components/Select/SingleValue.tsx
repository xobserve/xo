import React from 'react';

// Ignoring because I couldn't get @types/react-select work wih Torkel's fork
// @ts-ignore
import { components } from '@torkelo/react-select';
import { useDelayedSwitch } from '../../utils/useDelayedSwitch';
import { SlideOutTransition } from '../Transitions/SlideOutTransition';
import { FadeTransition } from '../Transitions/FadeTransition';
import { Spinner } from '../Spinner/Spinner';


type Props = {
  children: React.ReactNode;
  data: {
    imgUrl?: string;
    loading?: boolean;
    hideText?: boolean;
  };
};

export const SingleValue = (props: Props) => {
  const { children, data } = props;

  const loading = useDelayedSwitch(data.loading || false, { delay: 250, duration: 750 });

  return (
    <components.SingleValue {...props}>
      <div
        className={'select-single-value'}
      >
        {data.imgUrl ? (
          <FadeWithImage loading={loading} imgUrl={data.imgUrl} />
        ) : (
          <SlideOutTransition horizontal size={16} visible={loading} duration={150}>
            <div className={'select-single-value-container'}>
              <Spinner className={'select-single-value-item'} inline />
            </div>
          </SlideOutTransition>
        )}
        {!data.hideText && children}
      </div>
    </components.SingleValue>
  );
};

const FadeWithImage = (props: { loading: boolean; imgUrl: string }) => {
  return (
    <div className={'select-single-value-container'}>
      <FadeTransition duration={150} visible={props.loading}>
        <Spinner className={'select-single-value-item'} inline />
      </FadeTransition>
      <FadeTransition duration={150} visible={!props.loading}>
        <img className={'select-single-value-item'} src={props.imgUrl} />
      </FadeTransition>
    </div>
  );
};
