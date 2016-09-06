/* eslint-disable no-shadow */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import debounce from 'lodash.debounce';

import {
  tweakAxisParameter,
  changeAxisEffect,
} from '../../actions';
import {
  otherAxisNameSelector,
  axisControlSelector,
} from '../../reducers/effects.reducer';
import effectDefaultOptions from '../../data/effect-default-options';

import Column from '../Column';
import Select from '../Select';
import Slider from '../Slider';


class AxisControls extends Component {
  constructor(props) {
    super(props);
    this.tweakAxisParameter = debounce(props.tweakAxisParameter, 500);
    this.handleChangeAxisEffect = this.handleChangeAxisEffect.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    const { effect, disabledEffect } = this.props;

    const sameOptions = effect.options === nextProps.effect.options;
    const sameEffectName = effect.name === nextProps.effect.name;
    const otherAxisChanged = disabledEffect === nextProps.disabledEffect;

    return !sameOptions || !sameEffectName || !otherAxisChanged;
  }

  handleChangeAxisEffect({ value }) {
    this.props.changeAxisEffect({
      axis: this.props.axis,
      effect: value,
    });
  }

  renderControls() {
    const {
      effect,
      axis,
    } = this.props;

    switch (effect.name) {
      case 'filter': {
        return (
          <div className="effect-controls">
            <h5>type</h5>
            <Select
              clearable={false}
              searchable={false}
              value={effect.options.filterType}
              className="axis-param-select"
              onChange={({ value }) => {
                // Debounce the actual action-dispatch since it's kinda
                // slow, and doesn't need to be low-latency.
                this.tweakAxisParameter({
                  axis,
                  options: { filterType: value },
                });
              }}
              options={[
                { value: 'lowpass', label: 'low pass' },
                { value: 'highpass', label: 'high pass' },
                { value: 'bandpass', label: 'band pass' },
                { value: 'allpass', label: 'all pass' },
                { value: 'notch', label: 'notch' },
              ]}
            />

            <h5>resonance (Q)</h5>
            <Slider
              min={0}
              max={50}
              step={0.1}
              value={effect.options.resonance}
              onChange={val => {
                // Debounce the actual action-dispatch since it's kinda
                // slow, and doesn't need to be low-latency.
                this.tweakAxisParameter({
                  axis,
                  options: { resonance: val },
                });
              }}
            />
          </div>
        );
      }
      case 'distortion': {
        return (
          <div className="effect-controls">
            <h5>oversampling</h5>
            <Slider
              min={0}
              max={4}
              step={2}
              value={effect.options.oversample}
              onChange={val => {
                // Debounce the actual action-dispatch since it's kinda
                // slow, and doesn't need to be low-latency.
                this.tweakAxisParameter({
                  axis,
                  options: { oversample: val },
                });
              }}
            />
          </div>
        );
      }
      case 'reverb': {
        return (
          <div className="effect-controls">
            <h5>length</h5>
            <Slider
              min={0}
              max={8}
              step={0.1}
              value={effect.options.time}
              onChange={val => {
                // Debounce the actual action-dispatch since it's kinda
                // slow, and doesn't need to be low-latency.
                this.tweakAxisParameter({
                  axis,
                  options: { time: val },
                });
              }}
            />

            <h5>filter cutoff</h5>
            <Slider
              min={0}
              max={20000}
              step={1}
              value={effect.options.cutoff}
              onChange={val => {
                // Debounce the actual action-dispatch since it's kinda
                // slow, and doesn't need to be low-latency.
                this.tweakAxisParameter({
                  axis,
                  options: { cutoff: val },
                });
              }}
            />
          </div>
        );
      }

      case 'phaser': {
        return (
          <div className="effect-controls">
            <h5>feedback</h5>
            <Slider
              min={0}
              max={1}
              step={0.1}
              value={effect.options.feedback}
              onChange={val => {
                this.tweakAxisParameter({
                  axis,
                  options: { feedback: val },
                });
              }}
            />

            <h5>rate</h5>
            <Slider
              min={0}
              max={100}
              step={0.1}
              value={effect.options.rate}
              onChange={val => {
                this.tweakAxisParameter({
                  axis,
                  options: { rate: val },
                });
              }}
            />

            <h5>stereo phase</h5>
            <Slider
              min={0}
              max={180}
              step={10}
              value={effect.options.stereoPhase}
              onChange={val => {
                this.tweakAxisParameter({
                  axis,
                  options: { stereoPhase: val },
                });
              }}
            />
          </div>
        );
      }

      default: return <div />;
    }
  }

  renderOptions() {
    const { disabledEffect } = this.props;
    const effectNames = Object.keys(effectDefaultOptions);

    return effectNames.map(name => ({
      value: name,
      label: name,
      disabled: name === disabledEffect,
    }));
  }

  render() {
    const {
      effect,
      axis,
    } = this.props;

    return (
      <Column className={`axis-controls pad-${axis}`}>
        <h4>{`${axis} axis`}</h4>
        <Select
          clearable={false}
          searchable={false}
          className="axis-control-select"
          value={effect.name}
          onChange={this.handleChangeAxisEffect}
          options={this.renderOptions()}
        />

        {this.renderControls()}
      </Column>
    );
  }
}

AxisControls.propTypes = {
  effect: PropTypes.shape({
    name: PropTypes.string,
    active: PropTypes.bool,
    amount: PropTypes.number,
    options: PropTypes.object,
  }),
  axis: PropTypes.oneOf(['x', 'y']),
  disabledEffect: PropTypes.string,
  tweakAxisParameter: PropTypes.func.isRequired,
  changeAxisEffect: PropTypes.func.isRequired,
};

const mapStateToProps = (state, { axis }) => {
  return {
    effect: axisControlSelector(state, axis),
    disabledEffect: otherAxisNameSelector(state, axis),
  };
};

export default connect(mapStateToProps, {
  tweakAxisParameter,
  changeAxisEffect,
})(AxisControls);