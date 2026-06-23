import React from 'react';
import { VehicleConfirmation } from '../../_forms/index.js';
import { MapWidget, StepperWidget } from '../ui/index.js';
import MapErrorBoundary from '../ui/map-error-boundary.jsx';

export default function SidebarFormLayout({ header, form, showMap = false }) {
  return (
    <>
      <div className={'flex flex-row gap-6 justify-center'}>
        <div className={`flex flex-col gap-6 w-full`}>
          <div
            className={
              'flex flex-row gap-6 justify-center [@media(max-width:500px)]:px-1'
            }
          >
            <div
              className={
                'flex flex-col gap-6 md:max-w-[690px] w-full flex-grow'
              }
            >
              <h1
                className={
                  'text-3xl font-bold leading-[38px] xs:max-w-xs header-custom'
                }
              >
                {header}
              </h1>
              {form}
            </div>
            <div
              className={`w-full max-w-[486px] hidden pt-[62px] lg:flex flex-col`}
            >
              <VehicleConfirmation
                showHeader={false}
                isSidebar={true}
                optionalClassName={'pb-6'}
              />
              <MapErrorBoundary>
                <MapWidget hidden={!showMap} />
              </MapErrorBoundary>
              <StepperWidget />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
