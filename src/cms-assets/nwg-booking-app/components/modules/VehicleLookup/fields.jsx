import React from 'react';
import {
  ModuleFields,
  TextField,
  BooleanField,
} from '@hubspot/cms-components/fields';

export const fields = (
  <ModuleFields>
    <TextField
      name="header"
      label="Header"
      default="Vehicles Back To Their Best"
      required
    />
    <TextField
      name="subheader"
      label="Subheader"
      default="Let’s fix it fast — get a quote today and get back on the road."
      required
    />
    <BooleanField
      name="invert_header_color"
      label="Invert Header Color"
      default={true}
      required
    />
    <BooleanField
      label="Enable car manual selection"
      name="manual_car_selection"
      default={false}
    />
    <TextField
      name="redirect_to"
      label="Redirect To"
      default="https://nwg.com.au/book-online"
      required
    />
  </ModuleFields>
);
