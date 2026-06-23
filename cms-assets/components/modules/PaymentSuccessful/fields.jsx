import React from 'react';
import { ModuleFields, TextField } from '@hubspot/cms-components/fields';

export const fields = (
  <ModuleFields>
    <TextField
      name="header"
      label="Header"
      default="Thanks! Your payment was successful"
      required
    />
  </ModuleFields>
);
