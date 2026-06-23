import React from 'react';
import { FieldLayout } from '../../_common/layout';
import { useSelector } from 'react-redux';
import { useFormValidation } from '../../_hooks/form-validation.hook';
import { ButtonField, DropdownField, TextField } from '../../_common/ui';
import { useGetVehicleDetailMutation } from '../../_services/vehicle.api.js';

const manualForm = {
  year: {
    required: true,
    label: 'Year',
    id: 'year',
  },
  make: {
    required: true,
    label: 'Make',
    id: 'make',
  },
  model: {
    required: true,
    label: 'Model',
    id: 'model',
  },
  variant: {
    required: true,
    label: 'Variant',
    id: 'variant',
  },
  location: {
    required: true,
    label: 'Postcode or Suburb',
    id: 'location',
  },
};

export default function VehicleSearchManualForm() {
  const data = useSelector((state) => state.booking) || {};
  const { errors, validateAllFields, handleEvent } = useFormValidation();

  // Gets the vehicle detail through mutation
  const [getVehicleDetail, { isLoading }] = useGetVehicleDetailMutation();

  // TODO: Update this once vehicle options are provided
  const handleSubmit = async (e) => {
    e.preventDefault();

    const fieldsToValidate = Object.keys(manualForm).map((key) => ({
      prop: manualForm[key].id,
      value: data[manualForm[key].id],
      required: manualForm[key].required,
    }));

    if (!validateAllFields(fieldsToValidate)) {
      console.error('Form invalid', errors);
      return;
    }

    try {
      await getVehicleDetail({
        plate: data['registration_number'],
        state: data['state'],
      }).unwrap();
    } catch (err) {
      console.error('Failed to get the auth token: ', err);
    }
  };

  return (
    <>
      {data && (
        <>
          <div
            className={'flex gap-3 flex-col w-full justify-center bg-white '}
          >
            <div className={'flex gap-3'}>
              <FieldLayout
                id={manualForm.year.id}
                label={manualForm.year.label}
                error={errors[manualForm.year.id]}
              >
                <TextField
                  id={manualForm.year.id}
                  value={data[manualForm.year.id]}
                  onBlur={(e) =>
                    handleEvent(e, manualForm.year.id, manualForm.year.required)
                  }
                  onChange={(e) =>
                    handleEvent(e, manualForm.year.id, manualForm.year.required)
                  }
                  className={errors[manualForm.year.id] ? 'field--error' : ''}
                ></TextField>
              </FieldLayout>
              <FieldLayout
                id={manualForm.make.id}
                label={manualForm.make.label}
                error={errors[manualForm.make.id]}
              >
                <DropdownField
                  id={manualForm.make.id}
                  value={data[manualForm.make.id]}
                  onBlur={(e) =>
                    handleEvent(e, manualForm.make.id, manualForm.make.required)
                  }
                  onChange={(e) =>
                    handleEvent(e, manualForm.make.id, manualForm.make.required)
                  }
                  className={errors[manualForm.make.id] ? 'field--error' : ''}
                ></DropdownField>
              </FieldLayout>
            </div>
            <div className={'flex gap-3'}>
              <FieldLayout
                id={manualForm.model.id}
                label={manualForm.model.label}
                error={errors[manualForm.model.id]}
              >
                <DropdownField
                  id={manualForm.model.id}
                  value={data[manualForm.model.id]}
                  onBlur={(e) =>
                    handleEvent(
                      e,
                      manualForm.model.id,
                      manualForm.model.required,
                    )
                  }
                  onChange={(e) =>
                    handleEvent(
                      e,
                      manualForm.model.id,
                      manualForm.model.required,
                    )
                  }
                  className={errors[manualForm.model.id] ? 'field--error' : ''}
                ></DropdownField>
              </FieldLayout>
              <FieldLayout
                id={manualForm.variant.id}
                label={manualForm.variant.label}
                error={errors[manualForm.variant.id]}
              >
                <DropdownField
                  id={manualForm.variant.id}
                  value={data[manualForm.variant.id]}
                  onBlur={(e) =>
                    handleEvent(
                      e,
                      manualForm.variant.id,
                      manualForm.variant.required,
                    )
                  }
                  onChange={(e) =>
                    handleEvent(
                      e,
                      manualForm.variant.id,
                      manualForm.variant.required,
                    )
                  }
                  className={
                    errors[manualForm.variant.id] ? 'field--error' : ''
                  }
                ></DropdownField>
              </FieldLayout>
            </div>
            <div>
              <FieldLayout
                id={manualForm.location.id}
                label={manualForm.location.label}
                error={errors[manualForm.location.id]}
              >
                <TextField
                  id={manualForm.location.id}
                  value={data[manualForm.location.id]}
                  onBlur={(e) =>
                    handleEvent(
                      e,
                      manualForm.location.id,
                      manualForm.location.required,
                    )
                  }
                  onChange={(e) =>
                    handleEvent(
                      e,
                      manualForm.location.id,
                      manualForm.location.required,
                    )
                  }
                  className={
                    errors[manualForm.location.id] ? 'field--error' : ''
                  }
                ></TextField>
              </FieldLayout>
            </div>
            <ButtonField
              className="w-full"
              variant="quote"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              Get Quote
            </ButtonField>
          </div>
        </>
      )}
    </>
  );
}
