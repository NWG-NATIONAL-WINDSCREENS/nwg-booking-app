import React from 'react';
import ButtonField from '../ui/button.field';
import logo from '../../assets/nwg.png';

export default function Toolbar() {
  return (
    <header className="flex h-[var(--header-height)] items-center justify-between bg-[var(--header-bg)] px-6">
      <div>
        <img src={logo} width={179} height={78} alt="logo" />
      </div>
      <div>
        <ButtonField className="w-40" variant="quote">
          Get Quote
        </ButtonField>
      </div>
    </header>
  );
}
