import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import NeonButton from '../NeonButton';

describe('NeonButton', () => {
  it('renders label and fires onPress', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <NeonButton label="Press Me" onPress={onPress} />
    );

    const button = getByText('Press Me');
    expect(button).toBeTruthy();
    fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <NeonButton label="Disabled" onPress={onPress} disabled />
    );

    const button = getByText('Disabled');
    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });
});

