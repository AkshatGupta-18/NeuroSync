from django.http import JsonResponse


def test_api(request):
    return JsonResponse({
        "message": "NeuroSync Backend is working!"
    })