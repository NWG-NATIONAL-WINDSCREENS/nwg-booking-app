import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setPropValue } from '../_slices/booking.slice';

/**
 * Custom hook for form validation and state management.
 * Handles field validation, state updates, and Redux state synchronization.
 */
export function useFormValidation() {
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});

  /**
   * Sets the dictionary with form prop and values.
   * @param {object} form - The form being validated.
   * @param {object} data - The data that stores the state managed values.
   */
  const fieldsToValidate = (form, data) => {
    return Object.keys(form).map((key) => {
      const field = form[key];
      return {
        prop: field.id,
        value: field.object_name
          ? data[field.object_name]?.[field.id]
          : data[field.id],
        required: field.required,
        patterns: field.patterns,
      };
    });
  };

  /**
   * Handles field changes from events.
   * Validates the field and updates the Redux store.
   * @param {Event|any} event - The event object or direct value change.
   * @param {string} prop - The field name.
   * @param {boolean} required - Indicates if the field is required.
   * @param {string} objectName - The object name where to set the value.
   * @param {string[]} patterns - A list of  regex patterns for text field validation.
   * @param {string} form - The form name to identify form metadata on store.   */
  const handleEvent = ({
    event,
    prop,
    required,
    objectName = null,
    patterns = null,
    form = null,
  }) => {
    const value = event.target ? event.target.value : event;
    validateField(prop, value, required, patterns);
    dispatch(setPropValue({ prop, value, objectName, form }));
  };

  /**
   * Handles field changes from events.
   * Validates the field and updates the Redux store.
   * @param {Event|any} event - The event object or direct value change.
   * @param {object} field - The field metadata.
   * @param {string} form - The form name to identify form metadata on store.   */
  const handleEventV2 = ({ event, field, form = null }) => {
    const value = event.target ? event.target.value : event;
    dispatch(setPropValue({ value, field, form }));
  };

  /**
   * Validates a single field.
   * @param {string} prop - The name of the field being validated.
   * @param {any} value - The current value of the field.
   * @param {boolean} required - Indicates if the field is required.
   * @param {string[]} patterns - A list of regex patterns for validation.
   * @param {boolean} [updateErrorState=false] - Identifier to toggle error state updates
   * @returns {boolean} - Returns true if the field is valid, otherwise false.
   */
  const validateField = (
    prop,
    value,
    required,
    patterns,
    updateErrorState = true,
  ) => {
    let errorMessage = '';
    if (required && (value === null || value === undefined || value === '')) {
      errorMessage = 'This field is required.';
    } else if (Array.isArray(patterns) && patterns.length > 0 && value) {
      const isPatternValid = patterns.some((pattern) =>
        new RegExp(pattern).test(value),
      );

      if (!isPatternValid) {
        errorMessage =
          'Invalid format. Please enter a valid mobile number or email.';
      }
    }

    if (updateErrorState) {
      // Update the error state
      setErrors((prevErrors) => ({
        ...prevErrors,
        [prop]: errorMessage,
      }));
    }
    return errorMessage;
  };

  /**
   * Validates all required fields at once, including pattern validation.
   * @param {object} form - The form being validated.
   * @param {object} data - The data that stores the state managed values.
   * @returns {boolean} - Returns true if all required fields are valid, otherwise false.
   */
  const validateAllFields = (form, data) => {
    let isValid = true;
    let updatedErrors = {};

    const fields = Object.keys(form).map((key) => {
      const field = form[key];
      return {
        prop: field.id,
        value: field.object_name
          ? data[field.object_name]?.[field.id]
          : data[field.id],
        required: field.required,
        patterns: field.patterns,
      };
    });

    fields.forEach(({ prop, value, required, patterns }) => {
      const errorMessage = validateField(
        prop,
        value,
        required,
        patterns,
        false,
      );

      if (errorMessage) {
        updatedErrors[prop] = errorMessage;
        isValid = false;
      }
    });

    setErrors(updatedErrors);

    console.warn('Errors', updatedErrors);
    return isValid;
  };

  return {
    errors,
    fieldsToValidate,
    handleEvent,
    handleEventV2,
    validateAllFields,
    setErrors,
  };
}
