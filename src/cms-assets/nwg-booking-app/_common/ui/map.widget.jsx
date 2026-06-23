import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import primary from '../../assets/primary.svg';
import secondary from '../../assets/secondary.svg';
import { useFormValidation } from '../../_hooks/form-validation.hook.js';
import { handleMapEventChange } from '../../_utils/location-util.js';

function MapController({ center }) {
  const map = useMap();

  useEffect(() => {
    if (map && center) {
      map.panTo(center);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, center?.lat, center?.lng]);

  return null;
}

function MapWidget({ hidden, isMobile, isExpanded, topOffset = 0 }) {
  const { handleEventV2 } = useFormValidation();
  const dispatch = useDispatch();

  // region Local State
  const [center, setCenter] = useState(null);
  // endregion
  // region Redux States
  const {
    user_booking,
    repairers_results,
    booking_form,
    repairer_displayed_data_key,
  } = useSelector((state) => state.booking);
  const { destinations } = repairers_results;
  const { service_location, service_appointment, has_booked } = user_booking;
  const { service_appointment: field } = booking_form.fields;
  // endregion
  // region Functions
  const computeCenter = (points, latitude, longitude) => {
    const pixelOffset = topOffset;
    if (latitude && longitude) {
      return {
        lat: parseFloat(latitude) + pixelOffset,
        lng: parseFloat(longitude),
      };
    } else {
      const [lat, lng] = points[0].coordinates.split(',').map(Number);
      return {
        lat: lat + pixelOffset,
        lng,
      };
    }
  };
  const handleClick = (current) => {
    if (has_booked) {
      return;
    }
    void handleMapEventChange(
      dispatch,
      handleEventV2,
      repairer_displayed_data_key,
      service_location,
      field,
      repairers_results.branches,
      current,
    );
    // const options = repairers_results.branches;
    // const currentBranchIndex = options.findIndex(
    //   (option) => option.repairer_id === current,
    // );
    // let pageIndex = 0;
    // const date = getSucceedingDate();
    // let detail =
    //   options[currentBranchIndex][repairer_displayed_data_key][pageIndex];
    // let dayIndex = detail.week.findIndex((day) => day.date === date);
    //
    // // If it can't find date on current page, increment another page
    // if (dayIndex === -1) {
    //   pageIndex++;
    //   detail =
    //     options[currentBranchIndex][repairer_displayed_data_key][pageIndex];
    //   dayIndex = detail.week.findIndex((day) => day.date === date);
    // }
    //
    // const currentSelectedAppointment = options[currentBranchIndex][
    //   repairer_displayed_data_key
    // ][pageIndex].week[dayIndex].options.find(
    //   (option) => option.service_location === service_location,
    // );
    //
    // const parsedDate = parseDate(currentSelectedAppointment.value);
    //
    // dispatch(
    //   setSelectedAppointmentDateTime({
    //     service_appointment_date: parsedDate,
    //     service_appointment_date_time_branch_index: currentBranchIndex,
    //     service_appointment_date_time_page_index: pageIndex,
    //     service_appointment_date_time_day_index: dayIndex,
    //   }),
    // );
    //
    // handleEventV2({
    //   event: currentSelectedAppointment,
    //   field,
    //   form: 'booking_form',
    // });
  };
  // endregion
  //   region Hook - Use Effect

  useEffect(() => {
    const latitude = service_appointment?.latitude;
    const longitude = service_appointment?.longitude;
    if (latitude && longitude) {
      const current = computeCenter(destinations, latitude, longitude);
      setCenter(current);
    } else {
      if (destinations) {
        const [lat, lng] = destinations[0].coordinates.split(',').map(Number);
        const current = computeCenter(destinations, lat, lng);
        setCenter(current);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service_appointment, destinations]);
  //endregion

  const renderAdvanceMarkers = (destination, index) => (
    <>
      <div className="relative">
        <img
          src={
            destination.repairer_id === service_appointment?.repairer_id
              ? primary
              : secondary
          }
          alt={`marker-${destination.repairer_id}`}
          style={{
            width: '50px',
            height: '50px',
          }}
        />
        <a
          style={{
            color: '#ffffff',
            fontSize: '20px',
            fontWeight: 'bold',
            textAlign: 'center',
            position: 'absolute',
            top: '15%',
            left: '50%',
            transform: 'translateX(-50%)',
            cursor: 'pointer',
          }}
          onClick={() => {
            handleClick(destination.repairer_id);
          }}
        >
          {index + 1}
        </a>
      </div>
    </>
  );

  return (
    <div
      className={`
      w-full relative  
      transition-all duration-300 ease-in-out 
      ${
        hidden
          ? 'h-0 invisible pointer-events-none'
          : isExpanded
            ? 'h-[1000px] visible pointer-events-auto'
            : isMobile
              ? 'h-[600px] visible pointer-events-auto'
              : 'h-[280px] visible pointer-events-auto'
      }
      ${hidden ? '' : 'pb-6'}
  `}
    >
      <Map
        defaultCenter={center}
        defaultZoom={8.7}
        mapId="MAP_WIDGET"
        zoomControl={false}
        cameraControl={false}
        scaleControl={false}
        streetViewControl={false}
        rotateControl={false}
        fullscreenControl={false}
        mapTypeControl={false}
        style={{ height: '100%', width: '100%' }}
      >
        <MapController center={center} />
        {destinations
          ?.filter((dest, index) => {
            if (service_location === 'service_centre') {
              return true;
            } else {
              return index === 0;
            }
          })
          .map((destination, index) => {
            const [lat, lng] = destination.coordinates.split(',').map(Number);
            return (
              <AdvancedMarker
                key={destination.repairer_id}
                position={{ lat, lng }}
              >
                {renderAdvanceMarkers(destination, index)}
              </AdvancedMarker>
            );
          })}
      </Map>
    </div>
  );
}

export default MapWidget;
