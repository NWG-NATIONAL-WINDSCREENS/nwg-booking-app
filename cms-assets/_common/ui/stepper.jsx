import React from 'react';
import { CheckIcon } from '@heroicons/react/20/solid';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Stepper({ steps }) {
  return (
    <nav aria-label="Progress" className={'flex justify-center items-center'}>
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li
            key={step.name}
            className={classNames(
              stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : '',
              'relative',
            )}
          >
            {step.status === 'complete' ? (
              <>
                <div
                  aria-hidden="true"
                  className="absolute inset-0 flex items-center"
                >
                  <div className="h-0.5 w-full bg-[var(--stepper-bg)]" />
                </div>
                <a className="cursor-pointer relative flex size-8 items-center justify-center rounded-full bg-[var(--stepper-bg)] hover:bg-[var(--stepper-bg-hovered)]">
                  <CheckIcon aria-hidden="true" className="size-5 text-white" />
                  <span className="sr-only">{step.name}</span>
                </a>
              </>
            ) : step.status === 'current' ? (
              <>
                <div
                  aria-hidden="true"
                  className="absolute inset-0 flex items-center"
                >
                  <div className="h-0.5 w-full bg-gray-200" />
                </div>
                <a
                  aria-current="step"
                  className="cursor-pointer relative flex size-8 items-center justify-center rounded-full border-2 border-[var(--stepper-bg)] bg-white"
                >
                  <span
                    aria-hidden="true"
                    className="size-2.5 rounded-full bg-[var(--stepper-bg)]"
                  />
                  <span className="sr-only">{step.name}</span>
                </a>
              </>
            ) : (
              <>
                <div
                  aria-hidden="true"
                  className="absolute inset-0 flex items-center"
                >
                  <div className="h-0.5 w-full bg-gray-200" />
                </div>
                <a className="cursor-pointer group relative flex size-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white hover:border-gray-400">
                  <span
                    aria-hidden="true"
                    className="size-2.5 rounded-full bg-transparent group-hover:bg-gray-300"
                  />
                  <span className="sr-only">{step.name}</span>
                </a>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
