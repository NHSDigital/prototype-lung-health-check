# Lung Health Check Prototype

A digital questionnaire prototype for lung health screening eligibility and risk assessment, built using the NHS prototype kit.

## About this prototype

This prototype tests a digital alternative to phone-based lung health check questionnaires. It allows members of the public to check their eligibility and complete a risk assessment questionnaire to determine if they need a lung health scan.

Currently, lung health check assessments are conducted over the phone, often taking over 30 minutes and involving personal questions. This prototype explores whether users would prefer to complete these assessments digitally, in their own time and privacy.

## Current status

**Version:** 1.0  
**Status:** Research prototype for user testing

### Key features at a glance
- Complete end-to-end user journey
- Age validation (55-74 years eligible)
- NHS design system patterns and components
- Responsive design following NHS accessibility standards

### Known limitations
- **Scoring system not implemented** - The prototype doesn't calculate weighted scores from answers in the background
- **Fixed outcome** - Currently shows high-risk result by default (with option to view low-risk alternative)
- **Research prototype only** - Not intended for clinical use

## User journey

The prototype guides users through:

1. **Eligibility checking** - Age and smoking history validation
2. **Risk assessment questionnaire** - Series of health and lifestyle questions
3. **Results** - Risk level determination and next steps

## Current status

**Version:** 1.0  
**Status:** Research prototype for user testing

### What works
- Complete end-to-end user journey
- Age validation (55-74 years eligible)
- NHS design system patterns and components
- Responsive design following NHS accessibility standards

### Known limitations
- **Scoring system not implemented** - The prototype doesn't calculate weighted scores from answers in the background
- **Fixed outcome** - Currently shows high-risk result by default (with option to view low-risk alternative)
- **Research prototype only** - Not intended for clinical use

## Research hypothesis

We hypothesize that most users will prefer completing lung health assessments digitally rather than over the phone, due to:
- Convenience of completing in their own time
- Privacy for answering personal questions
- Reduced time commitment

However, we expect some users will always prefer speaking to a healthcare professional.

## Design approach

This prototype has been developed in consultation with:
- Health Check Online team
- NHS 111
- Screening and Personalised Prevention teams

We've used NHS design patterns and components wherever possible to ensure consistency with existing NHS digital services.

## Future development

- Version 2.0 planned with improvements based on user research findings
- Design history will be maintained to track changes and decisions
- Further end-to-end testing with large number of participants

## Technical setup

Built with the latest NHS prototype kit. No additional setup required beyond standard NHS prototype kit installation.

### Running the prototype

```bash
npm install
npm run watch
```

The prototype will be available at `http://localhost:3000`

### Password

This prototype is password-protected as required for NHS research prototypes. Contact the team for access credentials.

## Research and testing

This prototype is designed for user research to understand preferences between digital and phone-based assessments. It should not be used for actual clinical decisions.

## Contributing

This is a research prototype. For questions or contributions, please contact the team or raise an issue in this repository.

## Licence

This prototype is built using the NHS prototype kit and follows the same licensing terms.