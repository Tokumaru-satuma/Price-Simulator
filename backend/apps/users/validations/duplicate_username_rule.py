from django.contrib.auth import get_user_model

from apps.common.validations.rules.base_rule import BaseRule

User = get_user_model()


class DuplicateUsernameRule(BaseRule):
    """
    username重複チェック
    """

    def validate(
        self,
        *,
        data,
        instance=None,
        context=None,
    ):

        errors = {}

        username = data.get("username")

        if not username:
            return errors

        queryset = User.objects.filter(username=username)

        # update時除外
        if instance:
            queryset = queryset.exclude(pk=instance.pk)

        if queryset.exists():

            errors["username"] = "username already exists"

        return errors
