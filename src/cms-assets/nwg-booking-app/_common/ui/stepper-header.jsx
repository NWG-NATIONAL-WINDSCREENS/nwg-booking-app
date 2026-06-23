import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export default function StepperHeader() {
  const { steps, current_step } = useSelector((state) => state.form);
  const { skip_to_confirmation, user_details } = useSelector(
    (state) => state.booking,
  );
  const [header, setHeader] = useState('');

  useEffect(() => {
    if (steps) {
      const label = steps.find((step) => step.id === current_step)?.name;

      if (
        current_step === 7 &&
        skip_to_confirmation &&
        user_details.issue_contact === 'call_nwg'
      ) {
        setHeader('You’ll Call Us Confirmation');
      } else if (
        current_step === 7 &&
        skip_to_confirmation &&
        user_details.issue_contact === 'callback'
      ) {
        setHeader('Callback Request Confirmation');
      } else {
        setHeader(label);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps, current_step]);

  return (
    <h1 id="stepper-header" className={'text-center text-3xl font-bold'}>
      {header}
    </h1>
  );
}
