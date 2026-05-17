package com.charity.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Validates that the annotated field is a recognised Nairobi County ward.
 * Null values pass — combine with {@code @NotBlank} to reject nulls/blanks.
 */
@Documented
@Constraint(validatedBy = WardValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidWard {

    String message() default "Invalid ward. Must be a recognised Nairobi County ward or sub-county";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
