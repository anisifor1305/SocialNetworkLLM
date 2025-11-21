
from rest_framework import permissions

class IsAuthorOrReadOnly(permissions.BasePermission):
    """
    Пользовательское правило:
    - Разрешает читать всем (GET, HEAD, OPTIONS).
    - Разрешает изменять/удалять (PUT, DELETE) только автору объекта.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user


class IsProfileOwnerOrReadOnly(permissions.BasePermission):
    """
    Разрешает читать всем.
    Разрешает менять только ВЛАДЕЛЬЦУ профиля.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user