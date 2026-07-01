import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  applicationFormSteps,
  applicationDqCopy,
  APPLICATION_FORM_STORAGE_KEY,
  emptyApplicationFormData,
  isDisqualifiedLead,
  type ApplicationFormData,
  type ApplicationStep,
} from '../data/applicationForm';
import { socialLinks } from '../data/social';
import { submitApplication } from '../lib/submitApplication';
import { isValidEmail, isValidPhone } from '../lib/validators';
import './ApplicationForm.css';

const AUTO_ADVANCE_DELAY_MS = 500;

function getStepValue(data: ApplicationFormData, step: ApplicationStep): string | string[] {
  if (step.id === 'contact') {
    return [data.email, data.phone];
  }
  return data[step.id as keyof ApplicationFormData] as string | string[];
}

function getContactFieldErrors(data: ApplicationFormData): {
  email?: string;
  phone?: string;
} {
  const errors: { email?: string; phone?: string } = {};
  const email = data.email.trim();
  const phone = data.phone.trim();

  if (!email) {
    errors.email = 'Please enter your email address.';
  } else if (!isValidEmail(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!phone) {
    errors.phone = 'Please enter your phone number.';
  } else if (!isValidPhone(phone)) {
    errors.phone = 'Please enter a valid phone number.';
  }

  return errors;
}

function getStepValidationError(
  data: ApplicationFormData,
  step: ApplicationStep,
): string | null {
  if (!step.required) {
    return null;
  }

  switch (step.type) {
    case 'text':
    case 'textarea': {
      const value = data[step.id as keyof ApplicationFormData] as string;
      if (value.trim().length === 0) {
        return 'Please complete this question to continue.';
      }
      return null;
    }
    case 'yesno':
      if (data.isJewish !== 'yes' && data.isJewish !== 'no') {
        return 'Please complete this question to continue.';
      }
      return null;
    case 'single': {
      const value = data[step.id as keyof ApplicationFormData] as string;
      if (value.length === 0) {
        return 'Please complete this question to continue.';
      }
      return null;
    }
    case 'multi':
      if (data.goals.length !== (step.maxSelections ?? 1)) {
        return `Choose exactly ${step.maxSelections} options to continue.`;
      }
      return null;
    case 'contact': {
      const fieldErrors = getContactFieldErrors(data);
      return fieldErrors.email ?? fieldErrors.phone ?? null;
    }
    default:
      return null;
  }
}

function isStepValid(data: ApplicationFormData, step: ApplicationStep): boolean {
  return getStepValidationError(data, step) === null;
}

function isChoiceStep(step: ApplicationStep): boolean {
  return step.type === 'yesno' || step.type === 'single' || step.type === 'multi';
}

function OptionCheckmark() {
  return (
    <span className="application-form-option-check" aria-hidden="true">
      <svg viewBox="0 0 16 16" width="12" height="12" fill="none">
        <path
          d="M3 8.5 6.5 12 13 4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function ApplicationForm() {
  const navigate = useNavigate();
  const advanceTimeoutRef = useRef<number | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'forward' | 'back'>('forward');
  const [data, setData] = useState<ApplicationFormData>(emptyApplicationFormData);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; phone?: string }>({});
  const [confirmedOption, setConfirmedOption] = useState<string | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDqSlide, setShowDqSlide] = useState(false);

  const step = applicationFormSteps[stepIndex];
  const isLastStep = stepIndex === applicationFormSteps.length - 1;
  const progress = showDqSlide
    ? 100
    : ((stepIndex + 1) / applicationFormSteps.length) * 100;
  const autoAdvanceStep = isChoiceStep(step);

  useEffect(() => {
    return () => {
      if (advanceTimeoutRef.current) {
        window.clearTimeout(advanceTimeoutRef.current);
      }
    };
  }, []);

  const clearAdvanceTimeout = () => {
    if (advanceTimeoutRef.current) {
      window.clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
  };

  const updateField = <K extends keyof ApplicationFormData>(key: K, value: ApplicationFormData[K]) => {
    setData((current) => ({ ...current, [key]: value }));
    setError('');
    if (key === 'email' || key === 'phone') {
      setFieldErrors((current) => ({ ...current, [key]: undefined }));
    }
  };

  const completeApplication = async (formData: ApplicationFormData) => {
    setIsSubmitting(true);
    setError('');

    try {
      await submitApplication(formData);
      sessionStorage.setItem(APPLICATION_FORM_STORAGE_KEY, JSON.stringify(formData));

      if (isDisqualifiedLead(formData)) {
        setShowDqSlide(true);
      } else {
        navigate('/booking');
      }
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : 'Something went wrong submitting your application. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
      setIsAdvancing(false);
      setConfirmedOption(null);
    }
  };

  const goToNextStep = (formData: ApplicationFormData = data) => {
    if (isLastStep) {
      void completeApplication(formData);
      return;
    }

    setSlideDirection('forward');
    setStepIndex((current) => current + 1);
    setConfirmedOption(null);
    setIsAdvancing(false);
    setError('');
  };

  const scheduleAutoAdvance = (optionId: string, formData?: ApplicationFormData) => {
    clearAdvanceTimeout();
    setConfirmedOption(optionId);
    setIsAdvancing(true);
    setError('');

    advanceTimeoutRef.current = window.setTimeout(() => {
      goToNextStep(formData);
    }, AUTO_ADVANCE_DELAY_MS);
  };

  const handleYesNoSelect = (value: 'yes' | 'no') => {
    if (isAdvancing) {
      return;
    }

    const nextData = { ...data, isJewish: value };
    setData(nextData);
    scheduleAutoAdvance(value, nextData);
  };

  const handleSingleSelect = (optionId: string) => {
    if (isAdvancing) {
      return;
    }

    const nextData = { ...data, [step.id]: optionId } as ApplicationFormData;
    setData(nextData);
    scheduleAutoAdvance(optionId, nextData);
  };

  const handleGoalToggle = (goalId: string) => {
    if (isAdvancing) {
      return;
    }

    const selected = data.goals.includes(goalId);
    if (selected) {
      setData((current) => ({
        ...current,
        goals: current.goals.filter((id) => id !== goalId),
      }));
      setError('');
      return;
    }

    if (data.goals.length >= (step.maxSelections ?? 3)) {
      return;
    }

    const nextGoals = [...data.goals, goalId];
    const nextData = { ...data, goals: nextGoals };
    setData(nextData);
    setError('');

    if (nextGoals.length === (step.maxSelections ?? 3)) {
      scheduleAutoAdvance(goalId, nextData);
    }
  };

  const handleNext = () => {
    if (step.type === 'contact') {
      const contactErrors = getContactFieldErrors(data);
      if (contactErrors.email || contactErrors.phone) {
        setFieldErrors(contactErrors);
        return;
      }

      setFieldErrors({});
      goToNextStep();
      return;
    }

    const validationError = getStepValidationError(data, step);
    if (validationError) {
      setError(validationError);
      return;
    }

    goToNextStep();
  };

  const handleBack = () => {
    if (stepIndex === 0 || isAdvancing || isSubmitting || showDqSlide) {
      return;
    }

    clearAdvanceTimeout();
    setConfirmedOption(null);
    setIsAdvancing(false);
    setSlideDirection('back');
    setStepIndex((current) => current - 1);
    setError('');
    setFieldErrors({});
  };

  const getOptionClassName = (optionId: string, selected: boolean) => {
    const classes = ['application-form-option'];
    if (selected) {
      classes.push('application-form-option--selected');
    }
    if (confirmedOption === optionId) {
      classes.push('application-form-option--confirmed');
    }
    return classes.join(' ');
  };

  const renderField = () => {
    switch (step.type) {
      case 'text':
        return (
          <input
            id={`application-${step.id}`}
            className="application-form-input"
            type="text"
            value={data[step.id as keyof ApplicationFormData] as string}
            placeholder={step.placeholder}
            onChange={(event) =>
              updateField(step.id as keyof ApplicationFormData, event.target.value)
            }
          />
        );
      case 'textarea':
        return (
          <textarea
            id={`application-${step.id}`}
            className="application-form-textarea"
            value={data.idealOutcome}
            placeholder={step.placeholder}
            onChange={(event) => updateField('idealOutcome', event.target.value)}
          />
        );
      case 'yesno':
        return (
          <div className="application-form-yesno" role="group" aria-label={step.prompt}>
            {(['yes', 'no'] as const).map((value) => {
              const selected = data.isJewish === value;
              const confirmed = confirmedOption === value;
              return (
                <button
                  key={value}
                  type="button"
                  disabled={isAdvancing && !confirmed}
                  className={getOptionClassName(value, selected)}
                  onClick={() => handleYesNoSelect(value)}
                >
                  {confirmed && <OptionCheckmark />}
                  <span className="application-form-option-label">
                    {value === 'yes' ? 'Yes' : 'No'}
                  </span>
                </button>
              );
            })}
          </div>
        );
      case 'single':
        return (
          <div className="application-form-options">
            {step.options?.map((option) => {
              const selected = getStepValue(data, step) === option.id;
              const confirmed = confirmedOption === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={isAdvancing && !confirmed}
                  className={getOptionClassName(option.id, selected)}
                  onClick={() => handleSingleSelect(option.id)}
                >
                  {confirmed ? <OptionCheckmark /> : <span className="application-form-option-key">{option.id}</span>}
                  <span className="application-form-option-label">{option.label}</span>
                </button>
              );
            })}
          </div>
        );
      case 'multi':
        return (
          <>
            <p className="application-form-hint">
              Choose {step.maxSelections} ({data.goals.length}/{step.maxSelections} selected)
            </p>
            <div className="application-form-options" role="group" aria-label={step.prompt}>
              {step.options?.map((option) => {
                const selected = data.goals.includes(option.id);
                const confirmed = confirmedOption === option.id;
                const maxed = !selected && data.goals.length >= (step.maxSelections ?? 3);
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={selected}
                    className={`${getOptionClassName(option.id, selected)}${
                      maxed ? ' application-form-option--disabled' : ''
                    }`}
                    onClick={() => handleGoalToggle(option.id)}
                    disabled={maxed || (isAdvancing && !confirmed)}
                  >
                    {confirmed ? (
                      <OptionCheckmark />
                    ) : (
                      <span className="application-form-option-key">{option.id}</span>
                    )}
                    <span className="application-form-option-label">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </>
        );
      case 'contact':
        return (
          <div className="application-form-contact-fields">
            <div className="application-form-contact-field">
              <input
                id="application-email"
                className={`application-form-input${
                  fieldErrors.email ? ' application-form-input--error' : ''
                }`}
                type="email"
                value={data.email}
                placeholder="Best email"
                required
                aria-required="true"
                aria-invalid={fieldErrors.email ? true : undefined}
                aria-describedby={fieldErrors.email ? 'application-email-error' : undefined}
                onChange={(event) => updateField('email', event.target.value)}
              />
              {fieldErrors.email && (
                <p
                  id="application-email-error"
                  className="application-form-field-error"
                  role="alert"
                >
                  {fieldErrors.email}
                </p>
              )}
            </div>
            <div className="application-form-contact-field">
              <input
                id="application-phone"
                className={`application-form-input${
                  fieldErrors.phone ? ' application-form-input--error' : ''
                }`}
                type="tel"
                value={data.phone}
                placeholder="Best phone number"
                required
                aria-required="true"
                aria-invalid={fieldErrors.phone ? true : undefined}
                aria-describedby={fieldErrors.phone ? 'application-phone-error' : undefined}
                onChange={(event) => updateField('phone', event.target.value)}
              />
              {fieldErrors.phone && (
                <p
                  id="application-phone-error"
                  className="application-form-field-error"
                  role="alert"
                >
                  {fieldErrors.phone}
                </p>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section
      id="application-form"
      className="application-form"
      aria-labelledby="application-form-title"
    >
      <div className="application-form-header">
        <h2 id="application-form-title" className="application-form-title">
          {showDqSlide ? 'Thanks For Stopping By' : 'Start Your Transformation'}
        </h2>
        {!showDqSlide && (
          <span className="application-form-progress">
            {stepIndex + 1} / {applicationFormSteps.length}
          </span>
        )}
      </div>

      <div
        className="application-form-progress-bar"
        role="progressbar"
        aria-valuenow={showDqSlide ? applicationFormSteps.length : stepIndex + 1}
        aria-valuemin={1}
        aria-valuemax={applicationFormSteps.length}
        aria-label="Application progress"
      >
        <div className="application-form-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="application-form-step-panel">
        {showDqSlide ? (
          <div className="application-form-step-content application-form-dq">
            <p className="application-form-dq-headline">{applicationDqCopy.headline}</p>
            <p className="application-form-dq-subhead">{applicationDqCopy.subhead}</p>
            <div className="application-form-resources">
              {socialLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="application-form-resource-link"
                >
                  {link.displayLabel}
                </a>
              ))}
            </div>
          </div>
        ) : (
          <div
            key={stepIndex}
            className={`application-form-step-content${
              slideDirection === 'back' ? ' application-form-step-content--back' : ''
            }`}
          >
            <p className="application-form-question" id={`application-question-${step.id}`}>
              {step.prompt}
              {step.required && <span aria-hidden="true"> *</span>}
            </p>

            <div
              className="application-form-field"
              role={step.type === 'single' ? 'radiogroup' : undefined}
              aria-labelledby={`application-question-${step.id}`}
            >
              {renderField()}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="application-form-error" role="alert">
          {error}
        </p>
      )}

      {!showDqSlide && (
        <div className="application-form-actions">
          {stepIndex > 0 && (
            <button
              type="button"
              className="application-form-back"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              Back
            </button>
          )}
          {!autoAdvanceStep && (
            <button
              type="button"
              className="application-form-next"
              onClick={handleNext}
              disabled={isSubmitting || (!isLastStep && step.required && !isStepValid(data, step))}
            >
              {isSubmitting ? 'Submitting...' : isLastStep ? 'Submit Application' : 'Continue'}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
