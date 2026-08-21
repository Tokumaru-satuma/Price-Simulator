import django_filters

from apps.common.filters import BaseFilterSet

from apps.users.models import User


class UserFilter(BaseFilterSet):
    """
    UserFilter
    """

    username = django_filters.CharFilter(lookup_expr="icontains")
    email = django_filters.CharFilter(lookup_expr="icontains")
    name = django_filters.CharFilter(lookup_expr="icontains")
    role = django_filters.CharFilter(lookup_expr="exact")
    is_active = django_filters.BooleanFilter()

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "name",
            "role",
            "is_active",
            "is_deleted",
        ]
