import React from 'react';
import { CheckIcon } from './icons.jsx';
import edit from '../../assets/edit.svg';
import { useDispatch, useSelector } from 'react-redux';
import { setFormCurrentStep } from '../../_slices/form.slice.js';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

function renderItem(isNavbar, item, handleClick) {
  return (
    <>
      <div
        className={`${isNavbar ? 'p-6 border-t border-gray-200' : ''} w-full flex flex-row justify-between bg-white `}
      >
        <div className={'w-full flex flex-row gap-3'}>
          <CheckIcon
            className={`${isNavbar ? 'w-[18px] h-[18px]' : 'w-6 h-6'} text-[var(--brand-primary)] transition-opacity duration-300 ease-in-out`}
          />
          <span
            className={`${isNavbar ? 'text-base' : 'text-base'} font-medium`}
          >
            {item}
          </span>
        </div>
        <a onClick={handleClick}>
          <img
            src={edit}
            alt="Edit"
            width={isNavbar ? 18 : 24}
            height={isNavbar ? 18 : 24}
            className={`cursor-pointer transition-opacity duration-300 ease-in-out`}
          />
        </a>
      </div>
    </>
  );
}

export default function StepperWidget({ isNavbar = false }) {
  const currentStep = useSelector((state) => state.form.current_step);
  const dispatch = useDispatch();

  const handleClick = (step) => () => {
    dispatch(setFormCurrentStep(step));
  };

  const renderSteps = (
    <>
      {currentStep > 2 &&
        renderItem(isNavbar, 'Vehicle Selection', handleClick(1))}
      {currentStep > 3 &&
        renderItem(isNavbar, 'Damage Assessment', handleClick(3))}
      {currentStep > 4 && renderItem(isNavbar, 'Payment', handleClick(4))}
    </>
  );

  return isNavbar ? (
    <div className={'stepper-accordion'}>
      <Disclosure>
        {({ open }) => (
          <>
            <DisclosureButton className="w-full group flex items-center justify-between gap-2 p-6 bg-white">
              <h1 className="text-base font-bold">Edit My Details</h1>
              <ChevronDownIcon
                className={`w-5 transition-transform duration-300 ease-in-out ${
                  open ? 'rotate-180' : ''
                }`}
              />
            </DisclosureButton>
            <DisclosurePanel
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                open ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="flex flex-col border-1 border-gray-200">
                {renderSteps}
              </div>
            </DisclosurePanel>
          </>
        )}
      </Disclosure>
    </div>
  ) : (
    <div className="w-full flex flex-col gap-3 p-6 pb-12 bg-white">
      <h1 className="text-xl font-bold">Edit My Details</h1>
      {renderSteps}
    </div>
  );
}
