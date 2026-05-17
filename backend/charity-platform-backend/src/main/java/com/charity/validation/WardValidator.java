package com.charity.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class WardValidator implements ConstraintValidator<ValidWard, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        // Null/blank handled by @NotBlank on the same field
        if (value == null || value.isBlank()) return true;
        return WardConstants.VALID_WARDS.contains(value);
    }
}
