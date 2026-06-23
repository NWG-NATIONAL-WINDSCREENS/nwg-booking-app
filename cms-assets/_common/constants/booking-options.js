import crack from '../../assets/crack.svg';
import chip from '../../assets/chip.svg';
import two_chips from '../../assets/2_chips.svg';
import three_chips from '../../assets/3_chips.svg';
import four_chips from '../../assets/4_chips.svg';
import bigger_than_two from '../../assets/bigger_than_2.svg';
import smaller_than_two from '../../assets/smaller_than_2.svg';

// Keys match the values stored in the HubDB `pricing_options.svg` column.
// When adding a new chip-option row in HubDB, add the matching key here so
// the booking app can resolve the asset.
export const svgMap = {
  crack,
  chip,
  two_chips,
  three_chips,
  four_chips,
};

export const DamageOptions = [
  { id: 'windscreen', value: 'Windscreen' },
  {
    id: 'right_side_window',
    value: 'Right side window (Driver side)',
  },
  {
    id: 'left_side_window',
    value: 'Left side window (Passenger side)',
  },
  { id: 'rear_window', value: 'Rear window' },
  { id: 'other', value: 'Other (Canopy, Sunroof, Multiple Windows etc)' },
];

export const ImpactOptions = [
  {
    id: 'smaller_than_2_coin',
    value: 'Smaller than a $2 coin',
    image: smaller_than_two,
  },
  {
    id: 'bigger_than_2_coin',
    value: 'Bigger than a $2 coin',
    image: bigger_than_two,
  },
];

export const ImpactLocationOptions = [
  { id: 'green_area', value: 'Green Area' },
  { id: 'white_area', value: 'White Area' },
];

export const IssueContactOptions = [
  { id: 'call_nwg', value: 'Call NWG to discuss' },
  { id: 'callback', value: 'Please call me back' },
];

export const OLD_PreferredCallTimeOptions = Array.from(
  { length: 6 }, // 6 intervals (8-10, 10-12, ..., 16-18)
  (_, index) => {
    const startHour = 8 + index * 2;
    const endHour = startHour + 2;
    const formattedTime = `${startHour}:00 - ${endHour}:00`;

    return {
      id: `${startHour}_${endHour}`, // e.g., "8_10", "10_12"
      value: formattedTime, // e.g., "8:00 - 10:00"
    };
  },
);

export const PreferredCallTimeOptions = [
  { id: 'ASAP', value: 'ASAP' },
  { id: 'Mornings', value: 'Mornings' },
  { id: 'Afternoons', value: 'Afternoons' },
  { id: 'Any time', value: 'Any time' },
];

export const PaymentTypeOptions = [
  { id: 'myself', value: 'Pay Myself' },
  { id: 'insurance', value: 'Insurance' },
];

// export const InsurerOptions = [
//   { id: 'aami', value: 'AAMI' },
//   { id: 'aant', value: 'AANT' },
//   { id: 'ai_car_insurance', value: 'AI Car Insurance' },
//   { id: 'allianz', value: 'Allianz' },
//   { id: 'anz', value: 'ANZ' },
//   { id: 'apia', value: 'Apia' },
//   { id: 'australia_post', value: 'Australia Post' },
//   { id: 'australian_seniors', value: 'Australian Seniors Insurance Agency' },
//   { id: 'australian_unity', value: 'Australian Unity' },
//   { id: 'banksa', value: 'BankSA' },
//   { id: 'bankwest', value: 'Bankwest' },
//   { id: 'bendigo_bank', value: 'Bendigo Bank' },
//   { id: 'bingle', value: 'Bingle Car Insurance' },
//   { id: 'bmw', value: 'BMW' },
//   { id: 'boq', value: 'BOQ (Bank of Queensland)' },
//   { id: 'budget_direct', value: 'Budget Direct' },
//   { id: 'bupa', value: 'Bupa' },
//   { id: 'commbank', value: 'CommBank' },
//   { id: 'cgu', value: 'CGU' },
//   { id: 'dodo', value: 'Dodo' },
//   { id: 'elders', value: 'Elders Insurance' },
//   { id: 'eric', value: 'eric' },
//   { id: 'famous', value: 'Famous Insurance' },
//   { id: 'gio', value: 'GIO' },
//   { id: 'guild', value: 'Guild Insurance' },
//   { id: 'hsbc', value: 'HSBC' },
//   { id: 'huddle', value: 'Huddle Insurance' },
//   { id: 'hume_bank', value: 'Hume Bank' },
//   { id: 'ing', value: 'ING' },
//   { id: 'kogan', value: 'Kogan Insurance' },
//   { id: 'latitude', value: 'Latitude Financial Services' },
//   { id: 'lumley', value: 'Lumley Special Vehicles' },
//   { id: 'mb_insurance', value: 'MB Insurance' },
//   { id: 'nab', value: 'NAB' },
//   { id: 'national_seniors', value: 'National Seniors Australia' },
//   { id: 'nrma', value: 'NRMA' },
//   { id: 'over_fifty', value: 'Over Fifty' },
//   { id: 'ozicare', value: 'Ozicare' },
//   { id: 'pd_insurance', value: 'PD Insurance' },
//   { id: 'peoples_choice', value: "People's Choice" },
//   { id: 'poncho', value: 'Poncho' },
//   { id: 'qantas_car_insurance', value: 'Qantas Insurance Car Insurance' },
//   { id: 'qbe', value: 'QBE' },
//   { id: 'raa', value: 'RAA' },
//   { id: 'rac', value: 'RAC' },
//   { id: 'racq', value: 'RACQ' },
//   { id: 'ract', value: 'RACT' },
//   { id: 'racv', value: 'RACV' },
//   { id: 'real_insurance', value: 'Real Insurance' },
//   { id: 'ryno', value: 'Ryno Insurance' },
//   { id: 'sgic', value: 'SGIC' },
//   { id: 'sgio', value: 'SGIO' },
//   { id: 'shannons', value: 'Shannons' },
//   { id: 'st_george', value: 'St.George Bank' },
//   { id: 'suncorp', value: 'Suncorp' },
//   { id: 'tio', value: 'TIO' },
//   { id: 'toyota', value: 'Toyota' },
//   { id: 'vero', value: 'Vero' },
//   { id: 'virgin_money', value: 'Virgin Money' },
//   { id: 'westpac', value: 'Westpac' },
//   { id: 'wfi', value: 'WFI' },
//   { id: 'woolworths', value: 'Woolworths' },
//   { id: 'trade_self_insured', value: 'Trade - Self Insured' },
// ];
export const InsurerOptions = [
  { id: 'aami', value: 'AAMI' },
  { id: 'affinity', value: 'Affinity Insurance' },
  { id: 'allianz', value: 'Allianz' },
  { id: 'apia', value: 'Apia' },
  { id: 'auto_and_general', value: 'Auto & General' },
  { id: 'bingle', value: 'Bingle' },
  { id: 'budget_direct', value: 'Budget Direct' },
  { id: 'cgu', value: 'CGU' },
  { id: 'coles', value: 'Coles Insurance' },
  { id: 'dodo', value: 'Dodo Insurance' },
  { id: 'gio', value: 'GIO' },
  { id: 'guild', value: 'Guild Insurance' },
  { id: 'huddle', value: 'Huddle' },
  { id: 'hollard', value: 'Hollard Insurance' },
  { id: 'ing', value: 'ING' },
  { id: 'nrma', value: 'NRMA Insurance' },
  { id: 'progressive', value: 'Progressive' },
  { id: 'qbe', value: 'QBE' },
  { id: 'raa', value: 'RAA' },
  { id: 'rac', value: 'RAC' },
  { id: 'racq', value: 'RACQ' },
  { id: 'racv', value: 'RACV' },
  { id: 'real_insurance', value: 'Real Insurance' },
  { id: 'sgic', value: 'SGIC' },
  { id: 'sgio', value: 'SGIO' },
  { id: 'shannons', value: 'Shannons' },
  { id: 'st_george', value: 'St.George' },
  { id: 'suncorp', value: 'Suncorp' },
  { id: 'virgin_money', value: 'Virgin Money Car Insurance' },
  { id: 'westpac', value: 'Westpac' },
  { id: 'woolworths', value: 'Woolworths Insurance' },
  { id: 'youi', value: 'Youi' },
  { id: 'zurich', value: 'Zurich' },
  { id: 'anz_car_insurance', value: 'ANZ Car Insurance' },
  {
    id: 'bank_of_melbourne_car_insurance',
    value: 'Bank of Melbourne Car Insurance',
  },
  { id: 'banksa_car_insurance', value: 'BankSA Car Insurance' },
  { id: 'commbank_insurance', value: 'CommBank Insurance (CBA)' },
  { id: 'cua_insurance', value: 'CUA (Great Southern Bank) Insurance' },
  { id: 'peoples_choice_insurance', value: 'People’s Choice Insurance' },
  { id: 'bendigo_bank_insurance', value: 'Bendigo Bank Insurance' },
  { id: 'nti', value: 'NTI (National Transport Insurance)' },
  { id: 'ken_tame_associates', value: 'Ken Tame & Associates' },
  { id: 'trade_specific_brokers', value: 'Trade-specific brokers' },
  { id: 'aig', value: 'AIG' },
  { id: 'blue_badge', value: 'Blue Badge' },
  { id: 'cba_insurance', value: 'CBA Insurance' },
  { id: 'goget', value: 'GoGet' },
  { id: 'nissan_companycars', value: 'Nissan Company Cars' },
  { id: 'nrma_windscreenplus', value: 'NRMA WindscreenPlus' },
  { id: 'qantas_insurance', value: 'QANTAS Insurance' },
  { id: 'thrifty', value: 'Thrifty' },
  { id: 'vallar', value: 'Vallar' },
];

export const CauseOfDamageOptions = [
  { id: 'road_debris', value: 'Road debris' },
  { id: 'temperature_fluctuations', value: 'Temperature fluctuations' },
  { id: 'bad_weather', value: 'Bad weather' },
  { id: 'collision', value: 'Collision' },
  { id: 'other', value: 'Other' },
];
export const ServiceLocationOptions = [
  { id: 'service_centre', value: 'At a Branch / Repairer' },
  { id: 'at_home', value: 'At your location' },
];

export const OperatingHourOptions = Array.from({ length: 18 }, (_, i) => {
  const totalMinutes = 8 * 60 + i * 30;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  return { id: (i + 1).toString(), value: time };
});

