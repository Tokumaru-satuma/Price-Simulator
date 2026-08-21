from rest_framework.exceptions import ValidationError

from apps.common.validations import (
    ValidationService,
)


class ValidationMixin:
    """
    共通 Validation Mixin
    """

    validation_model_name = None

    def get_validation_model_name(self):

        if self.validation_model_name:
            return self.validation_model_name

        queryset = getattr(self, "queryset", None)

        if queryset is not None:
            return queryset.model.__name__.lower()

        return self.__class__.__name__.lower()

    def validate_business_rules(
        self,
        *,
        data,
        instance=None,
        context=None,
        model_name=None,
    ):

        return ValidationService.validate(
            model_name=model_name or self.get_validation_model_name(),
            data=data,
            instance=instance,
            context=context,
        )

    def validate_or_raise(
        self,
        *,
        data,
        instance=None,
        context=None,
        model_name=None,
    ):

        result = self.validate_business_rules(
            data=data,
            instance=instance,
            context=context,
            model_name=model_name,
        )

        if not result.is_valid:

            raise ValidationError(result.errors)

        return result
