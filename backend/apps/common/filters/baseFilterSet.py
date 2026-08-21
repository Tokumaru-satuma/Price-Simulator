import django_filters


class BaseFilterSet(django_filters.FilterSet):
    """
    共通Base FilterSet
    """

    is_deleted = django_filters.BooleanFilter()

    created_at_from = django_filters.DateTimeFilter(
        field_name="created_at",
        lookup_expr="gte",
    )

    created_at_to = django_filters.DateTimeFilter(
        field_name="created_at",
        lookup_expr="lte",
    )

    updated_at_from = django_filters.DateTimeFilter(
        field_name="updated_at",
        lookup_expr="gte",
    )

    updated_at_to = django_filters.DateTimeFilter(
        field_name="updated_at",
        lookup_expr="lte",
    )

    deleted_at_from = django_filters.DateTimeFilter(
        field_name="deleted_at",
        lookup_expr="gte",
    )

    deleted_at_to = django_filters.DateTimeFilter(
        field_name="deleted_at",
        lookup_expr="lte",
    )
