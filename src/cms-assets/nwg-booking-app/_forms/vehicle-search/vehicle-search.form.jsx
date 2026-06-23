import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { LinkField } from '../../_common/ui/index.js';
import {
  VehicleSearchManualForm,
  VehicleSearchRegistrationForm,
} from '../index.js';

function VehicleSearchForm({
  header,
  subheader,
  invertHeaderColor,
  manualCarSelection,
}) {
  // Toggles the search form between registration and manual
  const [searchByRegistration, setSearchByRegistration] = useState(true);
  const overlay = useSelector((state) => state.booking.overlay);

  return (
    <>
      {!overlay && (
        <div className="flex flex-col">
          <h1
            className={`text-3xl font-bold leading-[38px] ${invertHeaderColor ? 'text-white' : 'text-black'}`}
          >
            {header}
          </h1>
          {subheader && (
            <h2
              className={`text-base font-bold ${invertHeaderColor ? 'text-white' : 'text-black'}`}
            >
              {subheader}
            </h2>
          )}
        </div>
      )}

      <section className={'flex flex-col gap-6'}>
        <div
          className={`flex gap-6 flex-col w-full items-center justify-center  ${overlay ? 'py-5' : 'py-12 bg-white'} px-6`}
        >
          <div
            className={`flex gap-3 flex-col w-full justify-center ${overlay ? '' : 'bg-white'}`}
          >
            {searchByRegistration ? (
              <VehicleSearchRegistrationForm />
            ) : (
              <VehicleSearchManualForm />
            )}
            {manualCarSelection ? (
              <LinkField
                className={'m-auto'}
                onClick={() => {
                  setSearchByRegistration(!searchByRegistration);
                }}
              >
                {searchByRegistration
                  ? 'Enter your car manually'
                  : 'Search by registration'}
              </LinkField>
            ) : (
              ''
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default VehicleSearchForm;
