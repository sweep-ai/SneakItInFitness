import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import './PhoneField.css';

interface PhoneFieldProps {
  id: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

export function PhoneField({ id, value, error, onChange }: PhoneFieldProps) {
  return (
    <div className="application-form-contact-field">
      <PhoneInput
        id={id}
        className={`application-phone-input${error ? ' application-phone-input--error' : ''}`}
        value={value || undefined}
        defaultCountry="US"
        international
        countryCallingCodeEditable={false}
        addInternationalOption={false}
        limitMaxLength
        smartCaret
        numberInputProps={{
          className: `application-form-input${error ? ' application-form-input--error' : ''}`,
          required: true,
          'aria-required': true,
          'aria-invalid': error ? true : undefined,
          'aria-describedby': error ? `${id}-error` : undefined,
          autoComplete: 'tel',
          placeholder: 'Phone number',
        }}
        countrySelectProps={{
          'aria-label': 'Country code',
        }}
        onChange={(nextValue) => onChange(nextValue ?? '')}
      />
      {error && (
        <p id={`${id}-error`} className="application-form-field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
